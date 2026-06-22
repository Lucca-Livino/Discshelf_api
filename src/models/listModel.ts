import type { AlbumDTO } from './albumModel'

export interface ListDTO {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ListSummaryDTO extends ListDTO {
  albumCount: number
  albums: { coverUrl: string; title: string }[]
}

export interface ListDetailDTO extends ListDTO {
  albumCount: number
  albums: AlbumDTO[]
}
