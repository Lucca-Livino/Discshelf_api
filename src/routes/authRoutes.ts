import type { FastifyInstance } from 'fastify'
import { registerHandler, loginHandler } from '../controllers/authController'
import { S } from '../shared/swagger/schemas'

// rate limit apertado nas rotas sensíveis — anti brute-force
const authRateLimit = {
  rateLimit: { max: 5, timeWindow: '1 minute' },
}

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', {
    config: authRateLimit,
    schema: {
      tags: ['Auth'],
      summary: 'Cadastrar novo usuário',
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name:     { type: 'string', minLength: 2 },
          email:    { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
      },
      response: {
        201: S.userPublic,
        409: S.error,
      },
    },
  }, registerHandler)

  fastify.post('/login', {
    config: authRateLimit,
    schema: {
      tags: ['Auth'],
      summary: 'Login — retorna JWT',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: { token: { type: 'string' } },
        },
        401: S.error,
      },
    },
  }, loginHandler)

  fastify.post('/logout', {
    schema: {
      tags: ['Auth'],
      summary: 'Logout (token invalidado no cliente)',
      security: S.bearer,
      response: {
        200: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({ message: 'Logout realizado' })
  })
}
