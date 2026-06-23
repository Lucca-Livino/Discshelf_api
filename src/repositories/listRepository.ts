import { eq, and, count } from 'drizzle-orm'
import { db } from '../db/index'
import { lists, listAlbums, albums } from '../db/schema'

export const listRepository = {
  async findAllByUser(userId: string) {
    const rows = await db
      .select({
        id:          lists.id,
        userId:      lists.userId,
        name:        lists.name,
        description: lists.description,
        albumCount:  count(listAlbums.id),
        createdAt:   lists.createdAt,
        updatedAt:   lists.updatedAt,
      })
      .from(lists)
      .leftJoin(listAlbums, eq(listAlbums.listId, lists.id))
      .where(eq(lists.userId, userId))
      .groupBy(lists.id)

    return Promise.all(
      rows.map(async (row) => {
        const covers = await db
          .select({ coverUrl: albums.coverUrl, title: albums.title })
          .from(listAlbums)
          .innerJoin(albums, eq(listAlbums.albumId, albums.id))
          .where(eq(listAlbums.listId, row.id))
          .limit(4)
        return { ...row, albums: covers }
      }),
    )
  },

  async findById(id: string) {
    const result = await db.select().from(lists).where(eq(lists.id, id)).limit(1)
    return result[0] ?? null
  },

  async findByIdWithAlbums(id: string) {
    const listRow = await db.select().from(lists).where(eq(lists.id, id)).limit(1)
    if (!listRow[0]) return null

    const albumRows = await db
      .select({
        id:        albums.id,
        spotifyId: albums.spotifyId,
        title:     albums.title,
        artist:    albums.artist,
        year:      albums.year,
        coverUrl:  albums.coverUrl,
        genre:     albums.genre,
      })
      .from(listAlbums)
      .innerJoin(albums, eq(listAlbums.albumId, albums.id))
      .where(eq(listAlbums.listId, id))

    return { ...listRow[0], albums: albumRows, albumCount: albumRows.length }
  },

  async create(data: { userId: string; name: string; description?: string }) {
    const result = await db.insert(lists).values(data).returning()
    return result[0]!
  },

  async update(id: string, data: { name?: string; description?: string | null }) {
    const result = await db
      .update(lists)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(lists.id, id))
      .returning()
    return result[0]!
  },

  async delete(id: string) {
    await db.delete(lists).where(eq(lists.id, id))
  },

  async addAlbum(listId: string, albumId: string) {
    await db.insert(listAlbums).values({ listId, albumId })
  },

  async removeAlbum(listId: string, albumId: string) {
    await db.delete(listAlbums).where(
      and(eq(listAlbums.listId, listId), eq(listAlbums.albumId, albumId)),
    )
  },

  async findAlbums(listId: string, { offset, limit }: { offset: number; limit: number }) {
    return db
      .select({
        id:        albums.id,
        spotifyId: albums.spotifyId,
        title:     albums.title,
        artist:    albums.artist,
        year:      albums.year,
        coverUrl:  albums.coverUrl,
        genre:     albums.genre,
      })
      .from(listAlbums)
      .innerJoin(albums, eq(listAlbums.albumId, albums.id))
      .where(eq(listAlbums.listId, listId))
      .limit(limit)
      .offset(offset)
  },

  async countAlbums(listId: string) {
    const result = await db
      .select({ count: count() })
      .from(listAlbums)
      .where(eq(listAlbums.listId, listId))
    return result[0]?.count ?? 0
  },

  async albumExistsInList(listId: string, albumId: string) {
    const result = await db
      .select({ id: listAlbums.id })
      .from(listAlbums)
      .where(and(eq(listAlbums.listId, listId), eq(listAlbums.albumId, albumId)))
      .limit(1)
    return result.length > 0
  },
}
