import { AlbumService } from './AlbumService'
import { AppError } from '../shared/errors/AppError'
import { catalogRepository } from '../repositories/catalogRepository'
import { waitlistRepository } from '../repositories/waitlistRepository'
import type { CatalogEntryDTO } from '../models/catalogModel'

const albumService = new AlbumService()

export class CatalogService {
  async listCatalog(userId: string, { page, limit }: { page: number; limit: number }) {
    const offset = (page - 1) * limit
    const [rows, total] = await Promise.all([
      catalogRepository.findAllByUser(userId, { offset, limit }),
      catalogRepository.countByUser(userId),
    ])

    const data: CatalogEntryDTO[] = rows.map(row => ({
      id:        row.id,
      albumId:   row.albumId,
      album:     row.album,
      addedAt:   row.addedAt,
      hasReview: row.reviewId !== null,
    }))

    return { data, total, page, limit }
  }

  async addToCatalog(userId: string, spotifyId: string): Promise<CatalogEntryDTO> {
    const album = await albumService.getAlbumBySpotifyId(spotifyId)

    const existing = await catalogRepository.findByUserAndAlbum(userId, album.id)
    if (existing) throw new AppError('Álbum já está no catálogo', 409)

    const entry = await catalogRepository.create({ userId, albumId: album.id })

    // remove da waitlist se estiver lá
    waitlistRepository.deleteByUserAndAlbum(userId, album.id).catch(() => {})

    return {
      id:        entry.id,
      albumId:   entry.albumId,
      album,
      addedAt:   entry.addedAt,
      hasReview: false,
    }
  }

  async removeFromCatalog(userId: string, albumId: string): Promise<void> {
    const entry = await catalogRepository.findByUserAndAlbum(userId, albumId)
    if (!entry) throw new AppError('Álbum não encontrado no catálogo', 404)
    await catalogRepository.delete(entry.id)
  }
}
