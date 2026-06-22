import { pgTable, text, integer, uuid } from 'drizzle-orm/pg-core'

export const albums = pgTable('albums', {
  id:        uuid('id').primaryKey().defaultRandom(),
  spotifyId: text('spotify_id').notNull().unique(),
  title:     text('title').notNull(),
  artist:    text('artist').notNull(),
  year:      integer('year').notNull(),
  coverUrl:  text('cover_url').notNull(),
  genre:     text('genre'),
})
