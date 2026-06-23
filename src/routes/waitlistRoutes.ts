import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../shared/middlewares/authMiddleware'
import {
  listWaitlistHandler,
  addToWaitlistHandler,
  removeFromWaitlistHandler,
} from '../controllers/waitlistController'

export async function waitlistRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: [authMiddleware] }, listWaitlistHandler)

  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['spotifyId'],
        properties: {
          spotifyId:     { type: 'string' },
          recommendedBy: { type: 'string' },
        },
      },
    },
    preHandler: [authMiddleware],
  }, addToWaitlistHandler)

  fastify.delete<{ Params: { albumId: string } }>('/:albumId', {
    preHandler: [authMiddleware],
  }, removeFromWaitlistHandler)
}
