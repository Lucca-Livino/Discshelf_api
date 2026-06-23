import { eq, and, isNull } from 'drizzle-orm'
import { db } from '../db/index'
import { albums, catalogEntries } from '../db/schema'
import type { AlbumDTO } from '../models/albumModel'

export const albumRepository = {
  async findNullGenreByCatalogUser(userId: string) {
    return db
      .select({
        id:       albums.id,
        spotifyId: albums.spotifyId,
        title:    albums.title,
        artist:   albums.artist,
        year:     albums.year,
        coverUrl: albums.coverUrl,
        genre:    albums.genre,
      })
      .from(catalogEntries)
      .innerJoin(albums, eq(catalogEntries.albumId, albums.id))
      .where(and(eq(catalogEntries.userId, userId), isNull(albums.genre)))
  },

  async findBySpotifyId(spotifyId: string) {
    const result = await db.select().from(albums).where(eq(albums.spotifyId, spotifyId)).limit(1)
    return result[0] ?? null
  },

  async upsert(data: Omit<AlbumDTO, 'id'>) {
    const result = await db
      .insert(albums)
      .values(data)
      .onConflictDoUpdate({
        target: albums.spotifyId,
        set: {
          title:    data.title,
          artist:   data.artist,
          year:     data.year,
          coverUrl: data.coverUrl,
          genre:    data.genre,
        },
      })
      .returning()
    return result[0]!
  },
}
