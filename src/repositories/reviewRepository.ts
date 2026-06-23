import { eq, and } from 'drizzle-orm'
import { db } from '../db/index'
import { reviews, favoriteTracks } from '../db/schema'
import type { FavoriteTrackDTO } from '../models/reviewModel'

export const reviewRepository = {
  async findByUserAndAlbum(userId: string, albumId: string) {
    return db.query.reviews.findFirst({
      where: and(eq(reviews.userId, userId), eq(reviews.albumId, albumId)),
      with: { favoriteTracks: true },
    })
  },

  async create(data: {
    userId: string
    albumId: string
    catalogEntryId: string
    reviewText?: string | null
    monthListened: Date
    recommendedBy?: string | null
  }) {
    const result = await db.insert(reviews).values(data).returning()
    return result[0]!
  },

  async update(id: string, data: Partial<{
    reviewText: string | null
    monthListened: Date
    recommendedBy: string | null
    updatedAt: Date
  }>) {
    const result = await db.update(reviews).set(data).where(eq(reviews.id, id)).returning()
    return result[0]!
  },

  async delete(id: string) {
    await db.delete(reviews).where(eq(reviews.id, id))
  },

  async replaceFavoriteTracks(
    reviewId: string,
    userId: string,
    albumId: string,
    tracks: FavoriteTrackDTO[],
  ) {
    await db.transaction(async (tx) => {
      await tx.delete(favoriteTracks).where(eq(favoriteTracks.reviewId, reviewId))
      if (tracks.length > 0) {
        await tx.insert(favoriteTracks).values(
          tracks.map(t => ({ reviewId, userId, albumId, trackId: t.trackId, trackName: t.trackName })),
        )
      }
    })
  },
}
