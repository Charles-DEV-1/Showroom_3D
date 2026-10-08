import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { calculatePrice, configurationUrl, formatPrice, selectedFinishes, selectionFromSearch } from '../src/lib/configuration.ts'
import { whatsappOrderUrl } from '../src/lib/whatsapp.ts'
import { validateProduct } from '../server/validation.ts'
import { MAX_IMAGE_BYTES } from '../src/lib/uploadRules.ts'
import type { FinishSelection, Product } from '../src/types/product.ts'

// Read-only rehearsal: no products/uploads are created and no messages are sent.
try {
  const index = process.argv.indexOf('--base-url')
  const origin = new URL(index < 0 ? 'http://localhost:5173' : process.argv[index + 1])
  assert.ok(['http:', 'https:'].includes(origin.protocol), 'Use an HTTP or HTTPS app URL.')
  assert.equal(origin.pathname, '/', '--base-url must be the app origin, without a page path.')
  const plan = JSON.parse(await readFile(new URL('./demo-products.json', import.meta.url), 'utf8')) as {
    main: string; supporting: string[]; selection: FinishSelection
  }
  const projectUrl = process.env.SUPABASE_URL
  assert.ok(projectUrl, 'Load .env.local before running this check.')
  const inspectedImages = new Set<string>()
  for (const id of [plan.main, ...plan.supporting]) {
    const response = await fetch(new URL(`/api/products/${id}`, origin), { signal: AbortSignal.timeout(15000) })
    assert.equal(response.status, 200, `Saved demo ${id} could not be fetched. Start npm run dev and check Supabase.`)
    const product = await response.json() as Product
    assert.equal(product.id, id)
    assert.ok(!('owner_id' in product) && !('ownerId' in product), 'Public demo must not expose internal ownership.')
    // The create validator rejects server-assigned identity fields. Validate
    // only the input contract while retaining the fetched ID for link checks.
    const input = Object.fromEntries(Object.entries(product).filter(([key]) => key !== 'id' && key !== 'createdAt'))
    validateProduct(input, projectUrl)
    const selection = id === plan.main ? plan.selection : selectionFromSearch(product, '')
    const config = configurationUrl(product, selection, origin.origin)
    assert.deepEqual(selectionFromSearch(product, new URL(config).search), selection)
    const message = new URL(whatsappOrderUrl(product, selection, origin.origin)).searchParams.get('text')!
    for (const text of [product.name, product.dimensions, formatPrice(calculatePrice(product, selection)), config,
      ...selectedFinishes(product, selection).map((finish) => finish.name)]) {
      assert.ok(message.includes(text), 'Order message does not match the configuration.')
    }
    if (id === plan.main) {
      assert.equal(product.price, 150000)
      assert.equal(calculatePrice(product, selection), 175000)
      assert.ok(product.photoUrl, 'The main demo needs a reference photo.')
      assert.ok(product.finishes.find((finish) => finish.id === selection.primary)?.textureUrl, 'The main demo needs its marble texture.')
    }
    for (const url of [product.photoUrl, ...product.finishes.map((finish) => finish.textureUrl)]) {
      if (!url || inspectedImages.has(url)) continue
      const image = await fetch(url, { signal: AbortSignal.timeout(15000) })
      assert.equal(image.status, 200, 'A saved demo image is unavailable.')
      assert.ok(['image/jpeg', 'image/png', 'image/webp'].includes(image.headers.get('content-type')?.split(';')[0] ?? ''))
      const bytes = (await image.arrayBuffer()).byteLength
      assert.ok(bytes > 0 && bytes <= MAX_IMAGE_BYTES, 'A demo image exceeds the upload limit.')
      inspectedImages.add(url)
    }
    console.log(`${id === plan.main ? 'MAIN' : 'SUPPORTING'}: ${product.name} — ${formatPrice(calculatePrice(product, selection))}`)
    console.log(config)
  }
  console.log('Saved products, public images, finish URLs, prices and order messages: passed.')
  console.log('Next: rehearse on the real phone and confirm WhatsApp opens with the message. Nothing was sent.')
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Demo verification failed.')
  process.exitCode = 1
}
