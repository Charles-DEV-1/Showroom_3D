export interface ArtisanProfile {
  displayName: string
  whatsapp: string
  updatedAt: string
}

export type ProfileInput = Pick<ArtisanProfile, 'displayName' | 'whatsapp'>
