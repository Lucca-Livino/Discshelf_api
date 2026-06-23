import type { FastifyInstance } from 'fastify'
import { registerHandler, loginHandler } from '../controllers/authController'
import { S } from '../shared/swagger/schemas'

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Cadastrar novo usuário',
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name:     { type: 'string', minLength: 2 },
          email:    { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      response: {
        201: S.userPublic,
        409: S.error,
      },
    },
  }, registerHandler)

  fastify.post('/login', {
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
