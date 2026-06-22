import { pgTable, pgEnum, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['USER', 'ADMIN'])

export const users = pgTable('users', {
  id:        uuid('id').primaryKey().defaultRandom(),
  name:      text('name').notNull(),
  email:     text('email').notNull().unique(),
  password:  text('password').notNull(),
  role:      roleEnum('role').default('USER').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
