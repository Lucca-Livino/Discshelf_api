import { eq, count } from 'drizzle-orm'
import { db } from '../db/index'
import { users } from '../db/schema'

export const authRepository = {
  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
    return result[0] ?? null
  },

  async countUsers() {
    const result = await db.select({ count: count() }).from(users)
    return result[0]?.count ?? 0
  },

  async createUser(data: { name: string; email: string; password: string }) {
    const result = await db.insert(users).values(data).returning()
    return result[0]!
  },
}
