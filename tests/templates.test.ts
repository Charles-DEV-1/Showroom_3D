import test from 'node:test'
import assert from 'node:assert/strict'
import { createTemplate, templateParts, templates } from '../src/data/templates.ts'
import { validateProduct } from '../server/validation.ts'
import type { Part, ProductInput } from '../src/types/product.ts'

function halfSize(part: Part): [number, number, number] {
  if (part.shape === 'box') return [part.size[0] / 2, part.size[1] / 2, part.size[2] / 2]
  if (part.shape === 'cylinder') return [part.size[0], part.size[1] / 2, part.size[0]]
  return [part.size[0], part.size[0], part.size[0]]
}

function close(actual: number, expected: number) {
  assert.ok(Math.abs(actual - expected) < 1e-8, `Expected ${actual} to match ${expected}`)
}

for (const template of templates) {
  test(`${template.id} parts validate and fit their overall dimensions, including extreme aspect ratios`, () => {
    const variants: ProductInput['dimensionsCm'][] = [
      template.dimensions, [10, 10, 10], [1000, 1000, 1000],
      [10, 1000, 10], [1000, 10, 10], [10, 10, 1000],
    ]
    for (const dimensionsCm of variants) {
      const draft = { ...createTemplate(template.id), dimensionsCm, parts: templateParts(template.id, dimensionsCm), whatsapp: '2348012345678' }
      assert.deepEqual(validateProduct(draft, 'https://test.supabase.co').parts, draft.parts)
      const minimum = [Infinity, Infinity, Infinity]
      const maximum = [-Infinity, -Infinity, -Infinity]
      for (const part of draft.parts) {
        const half = halfSize(part)
        for (let axis = 0; axis < 3; axis++) {
          minimum[axis] = Math.min(minimum[axis], part.position[axis] - half[axis])
          maximum[axis] = Math.max(maximum[axis], part.position[axis] + half[axis])
        }
      }
      close(minimum[0], -dimensionsCm[0] / 2)
      close(maximum[0], dimensionsCm[0] / 2)
      close(minimum[1], 0)
      close(maximum[1], dimensionsCm[1])
      close(minimum[2], -dimensionsCm[2] / 2)
      close(maximum[2], dimensionsCm[2] / 2)
      assert.equal(new Set(draft.parts.map((part) => part.id)).size, draft.parts.length)
      assert.deepEqual(new Set(draft.parts.map((part) => part.slot)), new Set(['primary', 'secondary']))
    }
  })
}

test('fresh template drafts cannot mutate another draft or the preset definitions', () => {
  const draft = createTemplate('chair')
  draft.dimensionsCm[0] = 123
  draft.parts[0].size[0] = 321
  draft.finishes[0].name = 'Changed by artisan'
  draft.finishes[0].priceModifier = 999
  const fresh = createTemplate('chair')
  assert.deepEqual(fresh.dimensionsCm, [55, 90, 55])
  assert.equal(fresh.parts[0].size[0], 55)
  assert.equal(fresh.finishes[0].name, 'Sand linen')
  assert.equal(fresh.finishes[0].priceModifier, 0)
  assert.equal(fresh.photoUrl, null)
  assert.equal(fresh.modelUrl, null)
  assert.equal(fresh.whatsapp, '')
})
