import { pgTable, timestamp, uuid, unique } from 'drizzle-orm/pg-core'
import { lists } from './lists'
import { albums } from './albums'

export const listAlbums = pgTable('list_albums', {
  id:      uuid('id').primaryKey().defaultRandom(),
  listId:  uuid('list_id').notNull().references(() => lists.id,   { onDelete: 'cascade' }),
  albumId: uuid('album_id').notNull().references(() => albums.id, { onDelete: 'cascade' }),
  addedAt: timestamp('added_at').defaultNow().notNull(),
}, (t) => [unique().on(t.listId, t.albumId)])
