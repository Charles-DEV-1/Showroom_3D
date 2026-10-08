import type { Finish, Part, ProductInput } from '../types/product.ts'
import { formatDimensions } from '../lib/configuration.ts'

export type TemplateId = 'table' | 'chair' | 'shelf' | 'bed' | 'sofa' | 'coffee-table' | 'desk'
type Dimensions = ProductInput['dimensionsCm']

// Preset geometry stays in centimeters. Price/finishes are editable draft defaults.
export function tableParts([width, height, depth]: Dimensions): Part[] {
  const thickness = Math.min(4, height / 4)
  const legHeight = height - thickness
  const radius = Math.min(4, width / 12, depth / 12)
  const inset = Math.min(10, width / 6, depth / 6)
  const x = width / 2 - inset
  const z = depth / 2 - inset
  return [
    { id: 'top', shape: 'box', size: [width, thickness, depth], position: [0, height - thickness / 2, 0], slot: 'primary' },
    ...([[-x, z], [x, z], [-x, -z], [x, -z]] as [number, number][]).map(([legX, legZ], index): Part => ({
      id: `leg-${index + 1}`, shape: 'cylinder', size: [radius, legHeight], position: [legX, legHeight / 2, legZ], slot: 'secondary',
    })),
  ]
}

export function chairParts([width, height, depth]: Dimensions): Part[] {
  const thickness = Math.min(4, width / 12, depth / 12, height * 0.06)
  const seatY = height * 0.5
  const legHeight = seatY - thickness / 2
  const backBottom = seatY + thickness / 2
  const backHeight = height - backBottom
  const backY = backBottom + backHeight / 2
  const backZ = -depth / 2 + thickness / 2
  const radius = Math.min(2, width / 20, depth / 20, height / 40)
  const x = width / 2 - radius * 2
  const z = depth / 2 - radius * 2
  return [
    { id: 'seat', shape: 'box', size: [width, thickness, depth], position: [0, seatY, 0], slot: 'primary' },
    { id: 'back', shape: 'box', size: [width - thickness * 2, backHeight, thickness], position: [0, backY, backZ], slot: 'primary' },
    { id: 'back-left', shape: 'box', size: [thickness, backHeight, thickness], position: [-width / 2 + thickness / 2, backY, backZ], slot: 'secondary' },
    { id: 'back-right', shape: 'box', size: [thickness, backHeight, thickness], position: [width / 2 - thickness / 2, backY, backZ], slot: 'secondary' },
    ...([[-x, z], [x, z], [-x, -z], [x, -z]] as [number, number][]).map(([legX, legZ], index): Part => ({
      id: `leg-${index + 1}`, shape: 'cylinder', size: [radius, legHeight], position: [legX, legHeight / 2, legZ], slot: 'secondary',
    })),
  ]
}

export function shelfParts([width, height, depth]: Dimensions): Part[] {
  const thickness = Math.min(3, width / 12, height / 30, depth / 8)
  return [
    { id: 'side-left', shape: 'box', size: [thickness, height, depth], position: [-width / 2 + thickness / 2, height / 2, 0], slot: 'primary' },
    { id: 'side-right', shape: 'box', size: [thickness, height, depth], position: [width / 2 - thickness / 2, height / 2, 0], slot: 'primary' },
    { id: 'back', shape: 'box', size: [width - thickness * 2, height, thickness], position: [0, height / 2, -depth / 2 + thickness / 2], slot: 'secondary' },
    ...Array.from({ length: 5 }, (_, index): Part => ({
      id: `shelf-${index + 1}`, shape: 'box', size: [width - thickness * 2, thickness, depth - thickness],
      position: [0, thickness / 2 + (height - thickness) * index / 4, thickness / 2], slot: 'primary',
    })),
  ]
}

export function bedParts([width, height, depth]: Dimensions): Part[] {
  const headThickness = Math.min(4, width / 20, depth / 25, height / 20)
  const platformThickness = Math.min(height * 0.06, width / 30, depth / 30)
  const platformTop = height * 0.35
  const legHeight = platformTop - platformThickness
  const platformDepth = depth - headThickness
  const centerZ = headThickness / 2
  const mattressThickness = Math.min(height * 0.18, 22)
  const mattressDepth = platformDepth * 0.94
  const pillowWidth = width * 0.36
  const pillowHeight = mattressThickness * 0.55
  const pillowDepth = mattressDepth * 0.16
  const pillowY = platformTop + mattressThickness + pillowHeight / 2
  const pillowZ = centerZ - mattressDepth / 2 + pillowDepth / 2 + mattressDepth * 0.04
  const radius = Math.min(4, width / 20, depth / 20, height / 15)
  const x = width / 2 - radius * 2
  const z = platformDepth / 2 - radius * 2
  return [
    { id: 'headboard', shape: 'box', size: [width, height, headThickness], position: [0, height / 2, -depth / 2 + headThickness / 2], slot: 'secondary' },
    { id: 'platform', shape: 'box', size: [width, platformThickness, platformDepth], position: [0, platformTop - platformThickness / 2, centerZ], slot: 'secondary' },
    { id: 'mattress', shape: 'box', size: [width * 0.94, mattressThickness, mattressDepth], position: [0, platformTop + mattressThickness / 2, centerZ], slot: 'primary' },
    { id: 'pillow-left', shape: 'box', size: [pillowWidth, pillowHeight, pillowDepth], position: [-width * 0.23, pillowY, pillowZ], slot: 'primary' },
    { id: 'pillow-right', shape: 'box', size: [pillowWidth, pillowHeight, pillowDepth], position: [width * 0.23, pillowY, pillowZ], slot: 'primary' },
    ...([[-x, z], [x, z], [-x, -z], [x, -z]] as [number, number][]).map(([legX, legZ], index): Part => ({
      id: `leg-${index + 1}`, shape: 'cylinder', size: [radius, legHeight], position: [legX, legHeight / 2, centerZ + legZ], slot: 'secondary',
    })),
  ]
}

export function sofaParts([width, height, depth]: Dimensions): Part[] {
  const backThickness = Math.min(width * 0.08, depth * 0.14, height * 0.16)
  const armWidth = Math.min(width * 0.1, depth * 0.16)
  const seatThickness = height * 0.18
  const seatY = height * 0.46
  const baseTop = seatY - seatThickness / 2
  const baseThickness = height * 0.2
  const legHeight = baseTop - baseThickness
  const gap = width * 0.01
  const seatWidth = (width - armWidth * 2 - gap) / 2
  const armHeight = height * 0.68 - baseTop
  const radius = Math.min(3, width / 40, depth / 15, height / 30)
  const x = width / 2 - radius * 2
  const z = depth / 2 - radius * 2
  return [
    { id: 'base', shape: 'box', size: [width, baseThickness, depth], position: [0, baseTop - baseThickness / 2, 0], slot: 'secondary' },
    { id: 'back', shape: 'box', size: [width, height - baseTop, backThickness], position: [0, baseTop + (height - baseTop) / 2, -depth / 2 + backThickness / 2], slot: 'primary' },
    ...([-1, 1] as const).flatMap((side): Part[] => [
      { id: `seat-${side === -1 ? 'left' : 'right'}`, shape: 'box', size: [seatWidth, seatThickness, depth - backThickness], position: [side * (seatWidth + gap) / 2, seatY, backThickness / 2], slot: 'primary' },
      { id: `arm-${side === -1 ? 'left' : 'right'}`, shape: 'box', size: [armWidth, armHeight, depth - backThickness], position: [side * (width / 2 - armWidth / 2), baseTop + armHeight / 2, backThickness / 2], slot: 'primary' },
    ]),
    ...([[-x, z], [x, z], [-x, -z], [x, -z]] as [number, number][]).map(([legX, legZ], index): Part => ({
      id: `leg-${index + 1}`, shape: 'cylinder', size: [radius, legHeight], position: [legX, legHeight / 2, legZ], slot: 'secondary',
    })),
  ]
}

export function coffeeTableParts(dimensions: Dimensions): Part[] {
  const [width, height, depth] = dimensions
  const inset = Math.min(10, width / 6, depth / 6)
  return [
    ...tableParts(dimensions),
    { id: 'lower-shelf', shape: 'box', size: [width - inset * 2, Math.min(3, height * 0.06), depth - inset * 2], position: [0, height * 0.28, 0], slot: 'primary' },
  ]
}

export function deskParts([width, height, depth]: Dimensions): Part[] {
  const topThickness = Math.min(4, height / 4)
  const panel = Math.min(4, width / 30, depth / 20, height / 20)
  const supportHeight = height - topThickness
  const pedestalWidth = width * 0.26
  const pedestalDepth = depth * 0.75
  const pedestalHeight = height * 0.45
  const drawerX = -width / 2 + panel + pedestalWidth / 2
  return [
    { id: 'top', shape: 'box', size: [width, topThickness, depth], position: [0, height - topThickness / 2, 0], slot: 'primary' },
    { id: 'side-left', shape: 'box', size: [panel, supportHeight, depth * 0.88], position: [-width / 2 + panel / 2, supportHeight / 2, 0], slot: 'secondary' },
    { id: 'side-right', shape: 'box', size: [panel, supportHeight, depth * 0.88], position: [width / 2 - panel / 2, supportHeight / 2, 0], slot: 'secondary' },
    { id: 'back-panel', shape: 'box', size: [width - panel * 2, height * 0.4, panel], position: [0, supportHeight - height * 0.25, -depth / 2 + panel / 2], slot: 'secondary' },
    { id: 'pedestal', shape: 'box', size: [pedestalWidth, pedestalHeight, pedestalDepth], position: [drawerX, supportHeight - pedestalHeight / 2, 0], slot: 'secondary' },
    ...Array.from({ length: 3 }, (_, index): Part[] => {
      const y = supportHeight - height * 0.06 - index * height * 0.13
      return [
        { id: `drawer-${index + 1}`, shape: 'box', size: [pedestalWidth - panel, height * 0.12, panel], position: [drawerX, y, pedestalDepth / 2 + panel / 2], slot: 'primary' },
        { id: `handle-${index + 1}`, shape: 'box', size: [pedestalWidth * 0.25, panel * 0.35, panel * 0.75], position: [drawerX, y, pedestalDepth / 2 + panel + panel * 0.75 / 2], slot: 'secondary' },
      ]
    }).flat(),
  ]
}

interface Template {
  id: TemplateId
  label: string
  name: string
  dimensions: Dimensions
  price: number
  parts: (dimensions: Dimensions) => Part[]
  finishes: Finish[]
}

export const templates: Template[] = [
  {
    id: 'table', label: 'Dining table', name: 'Minimalist dining table', dimensions: [180, 75, 90], price: 150000, parts: tableParts,
    finishes: [
      { id: 'walnut', slot: 'primary', name: 'Walnut', color: '#825333', priceModifier: 0 },
      { id: 'marble', slot: 'primary', name: 'Carrara Marble', color: '#F0F0F0', priceModifier: 25000 },
      { id: 'charcoal', slot: 'secondary', name: 'Charcoal', color: '#343C38', priceModifier: 0 },
    ],
  },
  {
    id: 'chair', label: 'Chair', name: 'Modern lounge chair', dimensions: [55, 90, 55], price: 65000, parts: chairParts,
    finishes: [
      { id: 'sand', slot: 'primary', name: 'Sand linen', color: '#CBBBA1', priceModifier: 0 },
      { id: 'forest', slot: 'primary', name: 'Forest velvet', color: '#294B3E', priceModifier: 10000 },
      { id: 'oak', slot: 'secondary', name: 'Natural oak', color: '#B78C5B', priceModifier: 0 },
      { id: 'walnut', slot: 'secondary', name: 'Walnut', color: '#7B4A2E', priceModifier: 5000 },
    ],
  },
  {
    id: 'shelf', label: 'Shelf', name: 'Open display shelf', dimensions: [100, 180, 35], price: 95000, parts: shelfParts,
    finishes: [
      { id: 'oak', slot: 'primary', name: 'Natural oak', color: '#B78C5B', priceModifier: 0 },
      { id: 'walnut', slot: 'primary', name: 'Walnut', color: '#7B4A2E', priceModifier: 10000 },
      { id: 'white', slot: 'secondary', name: 'Warm white', color: '#F5F2E8', priceModifier: 0 },
      { id: 'charcoal', slot: 'secondary', name: 'Charcoal', color: '#343C38', priceModifier: 5000 },
    ],
  },
  {
    id: 'bed', label: 'Bed', name: 'Platform bed', dimensions: [160, 100, 210], price: 220000, parts: bedParts,
    finishes: [
      { id: 'ivory', slot: 'primary', name: 'Ivory linen', color: '#EEE8DA', priceModifier: 0 },
      { id: 'sage', slot: 'primary', name: 'Sage linen', color: '#94A58B', priceModifier: 15000 },
      { id: 'walnut', slot: 'secondary', name: 'Walnut', color: '#7B4A2E', priceModifier: 0 },
      { id: 'oak', slot: 'secondary', name: 'Natural oak', color: '#B78C5B', priceModifier: 10000 },
    ],
  },
  {
    id: 'sofa', label: 'Sofa', name: 'Two-seat sofa', dimensions: [210, 85, 90], price: 180000, parts: sofaParts,
    finishes: [
      { id: 'sand', slot: 'primary', name: 'Sand linen', color: '#CBBBA1', priceModifier: 0 },
      { id: 'forest', slot: 'primary', name: 'Forest velvet', color: '#294B3E', priceModifier: 20000 },
      { id: 'walnut', slot: 'secondary', name: 'Walnut', color: '#7B4A2E', priceModifier: 0 },
      { id: 'charcoal', slot: 'secondary', name: 'Charcoal', color: '#343C38', priceModifier: 5000 },
    ],
  },
  {
    id: 'coffee-table', label: 'Coffee table', name: 'Coffee table with lower shelf', dimensions: [100, 45, 60], price: 45000, parts: coffeeTableParts,
    finishes: [
      { id: 'walnut', slot: 'primary', name: 'Walnut', color: '#825333', priceModifier: 0 },
      { id: 'marble', slot: 'primary', name: 'Carrara Marble', color: '#F0F0F0', priceModifier: 15000 },
      { id: 'charcoal', slot: 'secondary', name: 'Charcoal', color: '#343C38', priceModifier: 0 },
      { id: 'oak', slot: 'secondary', name: 'Natural oak', color: '#B78C5B', priceModifier: 5000 },
    ],
  },
  {
    id: 'desk', label: 'Office desk', name: 'Office desk with drawers', dimensions: [140, 75, 65], price: 95000, parts: deskParts,
    finishes: [
      { id: 'walnut', slot: 'primary', name: 'Walnut', color: '#825333', priceModifier: 0 },
      { id: 'oak', slot: 'primary', name: 'Natural oak', color: '#B78C5B', priceModifier: 5000 },
      { id: 'white', slot: 'secondary', name: 'Warm white', color: '#F5F2E8', priceModifier: 0 },
      { id: 'charcoal', slot: 'secondary', name: 'Charcoal', color: '#343C38', priceModifier: 5000 },
    ],
  },
]

export function templateParts(id: TemplateId, dimensions: Dimensions): Part[] {
  const template = templates.find((template) => template.id === id)
  if (!template) throw new Error('Unknown furniture template.')
  return template.parts(dimensions)
}

export function createTemplate(id: TemplateId): ProductInput {
  const template = templates.find((template) => template.id === id)
  if (!template) throw new Error('Unknown furniture template.')
  const dimensionsCm = [...template.dimensions] as Dimensions
  return {
    name: template.name, photoUrl: null, modelUrl: null,
    parts: template.parts(dimensionsCm), finishes: structuredClone(template.finishes),
    price: template.price, dimensionsCm, dimensions: formatDimensions(dimensionsCm), whatsapp: '',
  }
}

export function tableTemplate(): ProductInput { return createTemplate('table') }
