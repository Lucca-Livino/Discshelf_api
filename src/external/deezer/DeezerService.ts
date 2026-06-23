const DEEZER_API_BASE = 'https://api.deezer.com'

interface DeezerAlbumSearchResult {
  data: Array<{ id: number; title: string; artist: { name: string } }>
}

interface DeezerAlbum {
  genres?: { data: Array<{ name: string }> }
}

export class DeezerService {
  private async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${DEEZER_API_BASE}${endpoint}`)
    if (!res.ok) throw new Error(`Deezer API error: ${res.status} ${endpoint}`)
    return res.json() as Promise<T>
  }

  async getGenre(albumTitle: string, artistName: string): Promise<string | null> {
    try {
      // busca precisa primeiro (artist + album)
      const strictQ = encodeURIComponent(`artist:"${artistName}" album:"${albumTitle}"`)
      let search = await this.get<DeezerAlbumSearchResult>(`/search/album?q=${strictQ}&limit=1`)

      // fallback: busca livre
      if (!search.data?.[0]) {
        const looseQ = encodeURIComponent(`${albumTitle} ${artistName}`)
        search = await this.get<DeezerAlbumSearchResult>(`/search/album?q=${looseQ}&limit=1`)
      }

      const match = search.data?.[0]
      if (!match) return null

      const album = await this.get<DeezerAlbum>(`/album/${match.id}`)
      return album.genres?.data?.[0]?.name ?? null
    } catch {
      return null
    }
  }
}
