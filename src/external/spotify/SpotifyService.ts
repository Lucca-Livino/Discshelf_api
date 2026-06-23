import type { SpotifyClient } from './spotifyClient'

export interface SpotifyAlbum {
  id: string
  name: string
  artists: Array<{ id: string; name: string }>
  release_date: string
  images: Array<{ url: string; width: number }>
}

interface SpotifySearchResponse {
  albums: {
    items: SpotifyAlbum[]
  }
}

interface SpotifyTracksPage {
  items: Array<{
    id: string
    track_number: number
    name: string
    duration_ms: number
  }>
  next: string | null
}

export interface SpotifyTrack {
  trackId: string
  trackNumber: number
  trackName: string
  durationMs: number
}

export class SpotifyService {
  constructor(private client: SpotifyClient) {}

  async searchAlbums(query: string): Promise<SpotifyAlbum[]> {
    const q = encodeURIComponent(query)
    const data = await this.client.get<SpotifySearchResponse>(
      `/v1/search?q=${q}&type=album&limit=10`,
    )
    return data.albums.items
  }

  async getAlbumById(spotifyId: string): Promise<SpotifyAlbum> {
    return this.client.get<SpotifyAlbum>(`/v1/albums/${spotifyId}`)
  }

  async getAlbumTracks(spotifyId: string): Promise<SpotifyTrack[]> {
    const tracks: SpotifyTrack[] = []
    let offset = 0
    const limit = 50

    while (true) {
      const page = await this.client.get<SpotifyTracksPage>(
        `/v1/albums/${spotifyId}/tracks?limit=${limit}&offset=${offset}`,
      )
      for (const item of page.items) {
        tracks.push({
          trackId:     item.id,
          trackNumber: item.track_number,
          trackName:   item.name,
          durationMs:  item.duration_ms,
        })
      }
      if (!page.next) break
      offset += limit
    }

    return tracks.sort((a, b) => a.trackNumber - b.trackNumber)
  }
}
