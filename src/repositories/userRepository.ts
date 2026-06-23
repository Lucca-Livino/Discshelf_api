import { eq, count, getTableColumns } from 'drizzle-orm'
import { db } from '../db/index'
import { users } from '../db/schema'
import type { UpdateUserDTO } from '../models/userModel'

const { password: _pw, ...publicColumns } = getTableColumns(users)

export const userRepository = {
  async findById(id: string) {
    const result = await db.select(publicColumns).from(users).where(eq(users.id, id)).limit(1)
    return result[0] ?? null
  },

  async findByEmail(email: string) {
    const result = await db.select(publicColumns).from(users).where(eq(users.email, email)).limit(1)
    return result[0] ?? null
  },

  async findAll({ offset, limit }: { offset: number; limit: number }) {
    return db.select(publicColumns).from(users).limit(limit).offset(offset)
  },

  async countAll() {
    const result = await db.select({ count: count() }).from(users)
    return result[0]?.count ?? 0
  },

  async update(id: string, data: UpdateUserDTO & { updatedAt: Date }) {
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning()
    const updated = result[0]
    if (!updated) return null
    const { password: _, ...pub } = updated
    return pub
  },

  async delete(id: string) {
    await db.delete(users).where(eq(users.id, id))
  },
}
