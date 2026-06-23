import { eq, sql, count, and, isNotNull } from 'drizzle-orm'
import { db } from '../db/index'
import { catalogEntries, reviews, albums } from '../db/schema'

export const statsRepository = {
  async getStatsByUser(userId: string) {
    const [
      totalAlbums,
      totalReviews,
      byMonth,
      byGenre,
      byArtist,
      byRecommender,
    ] = await Promise.all([
      // total álbuns no catálogo
      db
        .select({ count: count() })
        .from(catalogEntries)
        .where(eq(catalogEntries.userId, userId))
        .then((r) => r[0]?.count ?? 0),

      // total de reviews escritas
      db
        .select({ count: count() })
        .from(reviews)
        .where(eq(reviews.userId, userId))
        .then((r) => r[0]?.count ?? 0),

      // álbuns por mês (de monthListened)
      db
        .select({
          month: sql<string>`to_char(${reviews.monthListened}, 'YYYY-MM')`,
          count: count(),
        })
        .from(reviews)
        .where(eq(reviews.userId, userId))
        .groupBy(sql`to_char(${reviews.monthListened}, 'YYYY-MM')`)
        .orderBy(sql`to_char(${reviews.monthListened}, 'YYYY-MM')`),

      // gêneros mais escutados (álbuns no catálogo com genre preenchido)
      db
        .select({
          genre: albums.genre,
          count: count(),
        })
        .from(catalogEntries)
        .innerJoin(albums, eq(catalogEntries.albumId, albums.id))
        .where(and(eq(catalogEntries.userId, userId), isNotNull(albums.genre)))
        .groupBy(albums.genre)
        .orderBy(sql`count(*) desc`)
        .limit(8),

      // artistas mais escutados (álbuns no catálogo)
      db
        .select({
          artist: albums.artist,
          count: count(),
        })
        .from(catalogEntries)
        .innerJoin(albums, eq(catalogEntries.albumId, albums.id))
        .where(eq(catalogEntries.userId, userId))
        .groupBy(albums.artist)
        .orderBy(sql`count(*) desc`)
        .limit(8),

      // quem mais recomendou (de reviews com recommendedBy preenchido)
      db
        .select({
          name: reviews.recommendedBy,
          count: count(),
        })
        .from(reviews)
        .where(and(eq(reviews.userId, userId), isNotNull(reviews.recommendedBy)))
        .groupBy(reviews.recommendedBy)
        .orderBy(sql`count(*) desc`)
        .limit(8),
    ])

    return {
      totalAlbums,
      totalReviews,
      byMonth: byMonth.map((r) => ({ month: r.month, count: Number(r.count) })),
      byGenre: byGenre
        .filter((r) => r.genre)
        .map((r) => ({ genre: r.genre!, count: Number(r.count) })),
      byArtist: byArtist
        .filter((r) => r.artist)
        .map((r) => ({ artist: r.artist!, count: Number(r.count) })),
      byRecommender: byRecommender
        .filter((r) => r.name)
        .map((r) => ({ name: r.name!, count: Number(r.count) })),
    }
  },
}
