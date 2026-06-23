import { eq, and, count, desc } from 'drizzle-orm'
import { db } from '../db/index'
import { catalogEntries, albums, reviews } from '../db/schema'

export const catalogRepository = {
  async findAllByUser(userId: string, { offset, limit }: { offset: number; limit: number }) {
    return db
      .select({
        id:      catalogEntries.id,
        albumId: catalogEntries.albumId,
        addedAt: catalogEntries.addedAt,
        album: {
          id:        albums.id,
          spotifyId: albums.spotifyId,
          title:     albums.title,
          artist:    albums.artist,
          year:      albums.year,
          coverUrl:  albums.coverUrl,
          genre:     albums.genre,
        },
        reviewId: reviews.id,
      })
      .from(catalogEntries)
      .innerJoin(albums, eq(catalogEntries.albumId, albums.id))
      .leftJoin(reviews, eq(reviews.catalogEntryId, catalogEntries.id))
      .where(eq(catalogEntries.userId, userId))
      .orderBy(desc(catalogEntries.addedAt))
      .limit(limit)
      .offset(offset)
  },

  async findByUserAndAlbum(userId: string, albumId: string) {
    const result = await db
      .select()
      .from(catalogEntries)
      .where(and(eq(catalogEntries.userId, userId), eq(catalogEntries.albumId, albumId)))
      .limit(1)
    return result[0] ?? null
  },

  async findById(id: string) {
    const result = await db.select().from(catalogEntries).where(eq(catalogEntries.id, id)).limit(1)
    return result[0] ?? null
  },

  async create(data: { userId: string; albumId: string }) {
    const result = await db.insert(catalogEntries).values(data).returning()
    return result[0]!
  },

  async delete(id: string) {
    await db.delete(catalogEntries).where(eq(catalogEntries.id, id))
  },

  async countByUser(userId: string) {
    const result = await db
      .select({ count: count() })
      .from(catalogEntries)
      .where(eq(catalogEntries.userId, userId))
    return result[0]?.count ?? 0
  },
}
