import { eq } from 'drizzle-orm'
import { db } from '../db/index'
import { users } from '../db/schema'

export const authRepository = {
  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
    return result[0] ?? null
  },

  async createUser(data: { name: string; email: string; password: string }) {
    const result = await db.insert(users).values(data).returning()
    return result[0]!
  },
}
