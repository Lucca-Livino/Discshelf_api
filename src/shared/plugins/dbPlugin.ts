import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { db } from '../../db/index'
import type { DB } from '../../db/index'

declare module 'fastify' {
  interface FastifyInstance {
    db: DB
  }
}

export const dbPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.decorate('db', db)
})
