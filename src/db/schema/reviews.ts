import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'
import { albums } from './albums'
import { catalogEntries } from './catalog'

export const reviews = pgTable('reviews', {
  id:             uuid('id').primaryKey().defaultRandom(),
  userId:         uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  albumId:        uuid('album_id').notNull().references(() => albums.id, { onDelete: 'cascade' }),
  catalogEntryId: uuid('catalog_entry_id').notNull().unique().references(() => catalogEntries.id, { onDelete: 'cascade' }),
  reviewText:     text('review_text'),
  monthListened:  timestamp('month_listened').notNull(),
  recommendedBy:  text('recommended_by'),
  createdAt:      timestamp('created_at').defaultNow().notNull(),
  updatedAt:      timestamp('updated_at').defaultNow().notNull(),
})
