import { relations } from 'drizzle-orm'
import { users } from './users'
import { albums } from './albums'
import { catalogEntries } from './catalog'
import { reviews } from './reviews'
import { favoriteTracks } from './favoriteTracks'
import { lists } from './lists'
import { listAlbums } from './listAlbums'
import { waitlist } from './waitlist'

export * from './users'
export * from './albums'
export * from './catalog'
export * from './reviews'
export * from './favoriteTracks'
export * from './lists'
export * from './listAlbums'
export * from './waitlist'

export const waitlistRelations = relations(waitlist, ({ one }) => ({
  user:  one(users,  { fields: [waitlist.userId],  references: [users.id] }),
  album: one(albums, { fields: [waitlist.albumId], references: [albums.id] }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  catalogEntries: many(catalogEntries),
  lists:          many(lists),
  reviews:        many(reviews),
  favoriteTracks: many(favoriteTracks),
  waitlist:       many(waitlist),
}))

export const albumsRelations = relations(albums, ({ many }) => ({
  catalogEntries: many(catalogEntries),
  listAlbums:     many(listAlbums),
  reviews:        many(reviews),
  favoriteTracks: many(favoriteTracks),
}))

export const catalogEntriesRelations = relations(catalogEntries, ({ one }) => ({
  user:   one(users,  { fields: [catalogEntries.userId],  references: [users.id] }),
  album:  one(albums, { fields: [catalogEntries.albumId], references: [albums.id] }),
  review: one(reviews),
}))

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user:           one(users,          { fields: [reviews.userId],         references: [users.id] }),
  album:          one(albums,         { fields: [reviews.albumId],        references: [albums.id] }),
  catalogEntry:   one(catalogEntries, { fields: [reviews.catalogEntryId], references: [catalogEntries.id] }),
  favoriteTracks: many(favoriteTracks),
}))

export const favoriteTracksRelations = relations(favoriteTracks, ({ one }) => ({
  user:   one(users,   { fields: [favoriteTracks.userId],   references: [users.id] }),
  album:  one(albums,  { fields: [favoriteTracks.albumId],  references: [albums.id] }),
  review: one(reviews, { fields: [favoriteTracks.reviewId], references: [reviews.id] }),
}))

export const listsRelations = relations(lists, ({ one, many }) => ({
  user:       one(users, { fields: [lists.userId], references: [users.id] }),
  listAlbums: many(listAlbums),
}))

export const listAlbumsRelations = relations(listAlbums, ({ one }) => ({
  list:  one(lists,  { fields: [listAlbums.listId],  references: [lists.id] }),
  album: one(albums, { fields: [listAlbums.albumId], references: [albums.id] }),
}))
