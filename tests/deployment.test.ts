import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

test('compiled API handlers resolve their JavaScript dependencies and reject invalid requests', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const artifactRoot = resolve(root, 'artifacts/deployment-tests')
  await mkdir(artifactRoot, { recursive: true })
  const output = await mkdtemp(join(artifactRoot, 'compiled-'))
  // Vercel reads the root config; the Vite project references are not followed.
  const config = ts.readConfigFile(join(root, 'tsconfig.json'), ts.sys.readFile)
  assert.equal(config.error, undefined)
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
  const endpoints = [
    { file: 'api/products/[id].ts', path: '/api/products/invalid-id', method: 'GET', status: 400 },
    { file: 'api/products/index.ts', path: '/api/products', method: 'POST', status: 401 },
    { file: 'api/uploads.ts', path: '/api/uploads', method: 'POST', status: 401 },
    { file: 'api/me/products.ts', path: '/api/me/products', method: 'GET', status: 401 },
    { file: 'api/profile.ts', path: '/api/profile', method: 'GET', status: 401 },
  ]
  try {
    const program = ts.createProgram({
      rootNames: endpoints.map(endpoint => join(root, endpoint.file)),
      options: {
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        ...parsed.options,
        rootDir: root, outDir: output, noEmit: false, noCheck: true,
        declaration: false, composite: false, incremental: false,
      },
    })
    assert.equal(program.emit().emitSkipped, false, 'API JavaScript must be emitted')
    for (const endpoint of endpoints) {
      const filename = join(output, endpoint.file.replace(/\.ts$/, '.js'))
      // Import the emitted graph, not the .ts source Node normally strips in tests.
      // A retained .ts import reproduces the deployed ERR_MODULE_NOT_FOUND failure.
      const { default: handler } = await import(pathToFileURL(filename).href) as {
        default: { fetch(request: Request): Promise<Response> }
      }
      const response = await handler.fetch(new Request(`https://app.test${endpoint.path}`, { method: endpoint.method }))
      assert.equal(response.status, endpoint.status, endpoint.file)
      assert.match(response.headers.get('content-type') ?? '', /application\/json/)
    }
  } finally {
    // Check the exact target before deleting only this test's generated directory.
    const target = resolve(output)
    assert.ok(target.startsWith(artifactRoot + sep) && dirname(target) === artifactRoot,
      `Unexpected compilation directory: ${relative(root, target)}`)
    await rm(target, { recursive: true, force: true })
  }
})
