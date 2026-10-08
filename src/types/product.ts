// JSON uses centimeters; only the Viewer converts centimeters to meters.
export type Vector3Cm = [number, number, number]
export type MaterialSlot = 'primary' | 'secondary'

type PartBase = {
  id: string
  position: Vector3Cm // Center position: [x, y, z]; y points upward.
  slot: MaterialSlot
}

export type Part = PartBase & (
  | { shape: 'box'; size: [width: number, height: number, depth: number] }
  | { shape: 'cylinder'; size: [radius: number, height: number] }
  | { shape: 'sphere'; size: [radius: number] }
)

export interface Finish {
  id: string
  slot: MaterialSlot
  name: string
  color: string // #RRGGBB; also serves as the fallback for a texture.
  textureUrl?: string | null
  priceModifier: number // Whole Nigerian naira, charged once per selected slot.
}

export interface ProductInput {
  name: string
  photoUrl: string | null
  modelUrl: string | null // Remains null until the optional GLB milestone.
  parts: Part[]
  finishes: Finish[]
  price: number // Whole Nigerian naira.
  dimensionsCm: [width: number, height: number, depth: number]
  dimensions: string // Generated as width cm x depth cm x height cm.
  whatsapp: string // International country code + number, digits only.
}

export interface Product extends ProductInput {
  id: string // Supabase-generated UUID.
  createdAt: string // ISO timestamp; API maps database created_at to createdAt.
}

export type ProductSummary = Pick<Product, 'id' | 'name' | 'photoUrl' | 'price' | 'dimensions' | 'createdAt'>

// One selected finish ID per slot. Slots without finishes use neutral material.
export type FinishSelection = Partial<Record<MaterialSlot, string>>

export interface ViewerProps {
  product: ProductInput
  selection: FinishSelection
}
