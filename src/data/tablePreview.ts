import type { FinishSelection, ProductInput } from '../types/product.ts'

// A local template fixture for Milestone 2, not a saved artisan product.
export const tablePreview: ProductInput = {
  name: 'Minimalist dining table',
  photoUrl: null,
  modelUrl: null,
  dimensionsCm: [180, 75, 90],
  dimensions: '180cm x 90cm x 75cm',
  price: 150000,
  whatsapp: '', // A real artisan number is required before saving in Milestone 3.
  parts: [
    { id: 'top', shape: 'box', size: [180, 4, 90], position: [0, 73, 0], slot: 'primary' },
    { id: 'leg-front-left', shape: 'cylinder', size: [4, 71], position: [-80, 35.5, 35], slot: 'secondary' },
    { id: 'leg-front-right', shape: 'cylinder', size: [4, 71], position: [80, 35.5, 35], slot: 'secondary' },
    { id: 'leg-back-left', shape: 'cylinder', size: [4, 71], position: [-80, 35.5, -35], slot: 'secondary' },
    { id: 'leg-back-right', shape: 'cylinder', size: [4, 71], position: [80, 35.5, -35], slot: 'secondary' },
  ],
  finishes: [
    { id: 'walnut', slot: 'primary', name: 'Walnut', color: '#825333', priceModifier: 0 },
    { id: 'charcoal', slot: 'secondary', name: 'Charcoal', color: '#343C38', priceModifier: 0 },
  ],
}

export const tablePreviewSelection: FinishSelection = {
  primary: 'walnut',
  secondary: 'charcoal',
}
