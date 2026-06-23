import { eq, and, count } from 'drizzle-orm'
import { db } from '../db/index'
import { waitlist, albums } from '../db/schema'

export const waitlistRepository = {
  async findAllByUser(userId: string) {
    return db
      .select({
        id:            waitlist.id,
        albumId:       waitlist.albumId,
        recommendedBy: waitlist.recommendedBy,
        addedAt:       waitlist.addedAt,
        album: {
          id:        albums.id,
          spotifyId: albums.spotifyId,
          title:     albums.title,
          artist:    albums.artist,
          year:      albums.year,
          coverUrl:  albums.coverUrl,
          genre:     albums.genre,
        },
      })
      .from(waitlist)
      .innerJoin(albums, eq(waitlist.albumId, albums.id))
      .where(eq(waitlist.userId, userId))
      .orderBy(waitlist.addedAt)
  },

  async findByUserAndAlbum(userId: string, albumId: string) {
    const result = await db
      .select()
      .from(waitlist)
      .where(and(eq(waitlist.userId, userId), eq(waitlist.albumId, albumId)))
      .limit(1)
    return result[0] ?? null
  },

  async create(data: { userId: string; albumId: string; recommendedBy?: string | null }) {
    const result = await db.insert(waitlist).values(data).returning()
    return result[0]!
  },

  async delete(id: string) {
    await db.delete(waitlist).where(eq(waitlist.id, id))
  },

  async deleteByUserAndAlbum(userId: string, albumId: string) {
    await db.delete(waitlist).where(and(eq(waitlist.userId, userId), eq(waitlist.albumId, albumId)))
  },
}
