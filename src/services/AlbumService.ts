import { SpotifyClient } from '../external/spotify/spotifyClient'
import { SpotifyService } from '../external/spotify/SpotifyService'
import { DeezerService } from '../external/deezer/DeezerService'
import { albumRepository } from '../repositories/albumRepository'
import { AppError } from '../shared/errors/AppError'
import type { AlbumDTO } from '../models/albumModel'
import type { SpotifyAlbum, SpotifyTrack } from '../external/spotify/SpotifyService'

const spotifyClient  = new SpotifyClient()
const spotifyService = new SpotifyService(spotifyClient)
const deezerService  = new DeezerService()

function pickLargestImage(images: SpotifyAlbum['images']): string {
  if (!images || images.length === 0) return ''
  return images.reduce((a, b) => (b.width > a.width ? b : a)).url
}

function extractYear(releaseDate: string): number {
  return parseInt(releaseDate.split('-')[0] ?? '0', 10)
}

function toAlbumDTO(album: SpotifyAlbum, genre: string | null, id?: string): Omit<AlbumDTO, 'id'> & { id?: string } {
  return {
    ...(id ? { id } : {}),
    spotifyId: album.id,
    title:     album.name,
    artist:    album.artists[0]?.name ?? '',
    year:      extractYear(album.release_date),
    coverUrl:  pickLargestImage(album.images),
    genre,
  }
}

export class AlbumService {
  async searchAlbums(query: string): Promise<AlbumDTO[]> {
    const spotifyAlbums = await spotifyService.searchAlbums(query)
    const seen = new Set<string>()
    const results: AlbumDTO[] = []
    for (const album of spotifyAlbums) {
      const key = `${album.name.toLowerCase().trim()}|${album.artists[0]?.name.toLowerCase().trim() ?? ''}`
      if (seen.has(key)) continue
      seen.add(key)
      results.push({ id: '', ...toAlbumDTO(album, null) })
    }
    return results
  }

  async getAlbumBySpotifyId(spotifyId: string): Promise<AlbumDTO> {
    const cached = await albumRepository.findBySpotifyId(spotifyId)
    if (cached?.genre) return cached

    // monta DTO base (do cache se existir, senão busca no Spotify)
    const dto = cached
      ? { ...cached }
      : toAlbumDTO(await spotifyService.getAlbumById(spotifyId), null)

    // resolve gênero pelo Deezer de forma síncrona — disponível imediatamente
    const genre = await deezerService.getGenre(dto.title, dto.artist)

    return albumRepository.upsert({ ...dto, genre })
  }

  async fillMissingGenresForUser(userId: string): Promise<void> {
    const nullGenreAlbums = await albumRepository.findNullGenreByCatalogUser(userId)
    // Deezer não tem rate-limit — pode resolver em paralelo
    await Promise.all(
      nullGenreAlbums.map(async (album) => {
        const genre = await deezerService.getGenre(album.title, album.artist)
        if (genre) await albumRepository.upsert({ ...album, genre })
      }),
    )
  }

  async getAlbumTracks(spotifyId: string): Promise<SpotifyTrack[]> {
    try {
      return await spotifyService.getAlbumTracks(spotifyId)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('404')) throw new AppError('Álbum não encontrado', 404)
      throw new AppError('Erro ao buscar faixas', 502)
    }
  }
}
