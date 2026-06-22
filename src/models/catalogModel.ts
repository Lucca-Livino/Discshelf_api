import type { AlbumDTO } from './albumModel'

export interface CatalogEntryDTO {
  id: string
  albumId: string
  album: AlbumDTO
  addedAt: Date
  hasReview: boolean
}
