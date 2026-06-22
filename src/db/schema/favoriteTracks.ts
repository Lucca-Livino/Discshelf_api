import { pgTable, text, uuid, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { albums } from './albums'
import { reviews } from './reviews'

export const favoriteTracks = pgTable('favorite_tracks', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id,    { onDelete: 'cascade' }),
  albumId:   uuid('album_id').notNull().references(() => albums.id,  { onDelete: 'cascade' }),
  reviewId:  uuid('review_id').notNull().references(() => reviews.id, { onDelete: 'cascade' }),
  trackId:   text('track_id').notNull(),
  trackName: text('track_name').notNull(),
}, (t) => [unique().on(t.userId, t.albumId, t.trackId)])
