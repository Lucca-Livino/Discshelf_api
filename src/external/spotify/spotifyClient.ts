import { env } from '../../config/env'

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_BASE  = 'https://api.spotify.com'

export class SpotifyClient {
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0

  async getToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    const credentials = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64')

    const res = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!res.ok) {
      throw new Error(`Spotify auth failed: ${res.status}`)
    }

    const data = await res.json() as { access_token: string; expires_in: number }
    this.accessToken = data.access_token
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000
    return this.accessToken
  }

  async get<T>(endpoint: string): Promise<T> {
    const token = await this.getToken()
    const res = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      throw new Error(`Spotify API error: ${res.status} ${endpoint}`)
    }
    return res.json() as Promise<T>
  }
}
