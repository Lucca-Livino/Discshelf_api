import { pgTable, timestamp, uuid, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { albums } from './albums'

export const catalogEntries = pgTable('catalog_entries', {
  id:      uuid('id').primaryKey().defaultRandom(),
  userId:  uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  albumId: uuid('album_id').notNull().references(() => albums.id, { onDelete: 'cascade' }),
  addedAt: timestamp('added_at').defaultNow().notNull(),
}, (t) => [unique().on(t.userId, t.albumId)])
