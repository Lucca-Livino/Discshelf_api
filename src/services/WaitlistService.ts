import { AppError } from '../shared/errors/AppError'
import { waitlistRepository } from '../repositories/waitlistRepository'
import { AlbumService } from './AlbumService'

const albumService = new AlbumService()

export class WaitlistService {
  async listWaitlist(userId: string) {
    const rows = await waitlistRepository.findAllByUser(userId)
    return rows.map((r) => ({
      id:            r.id,
      albumId:       r.albumId,
      recommendedBy: r.recommendedBy,
      addedAt:       r.addedAt,
      album:         r.album,
    }))
  }

  async addToWaitlist(userId: string, spotifyId: string, recommendedBy?: string) {
    const album = await albumService.getAlbumBySpotifyId(spotifyId)

    const existing = await waitlistRepository.findByUserAndAlbum(userId, album.id)
    if (existing) throw new AppError('Álbum já está na lista de espera', 409)

    return waitlistRepository.create({ userId, albumId: album.id, recommendedBy: recommendedBy ?? null })
  }

  async removeFromWaitlist(userId: string, albumId: string) {
    const entry = await waitlistRepository.findByUserAndAlbum(userId, albumId)
    if (!entry) throw new AppError('Álbum não encontrado na lista de espera', 404)
    await waitlistRepository.delete(entry.id)
  }
}
