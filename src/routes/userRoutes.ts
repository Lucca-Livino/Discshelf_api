import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../shared/middlewares/authMiddleware'
import { adminMiddleware } from '../shared/middlewares/adminMiddleware'
import {
  getMeHandler,
  updateMeHandler,
  deleteMeHandler,
  listAllHandler,
  getByIdHandler,
  updateByIdHandler,
  deleteByIdHandler,
} from '../controllers/userController'
import { S } from '../shared/swagger/schemas'

const updateBody = {
  type: 'object',
  properties: {
    name:     { type: 'string', minLength: 2 },
    email:    { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
  },
}

const idParam = {
  type: 'object',
  properties: { id: { type: 'string', format: 'uuid' } },
}

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/me', {
    schema: {
      tags: ['Users'], summary: 'Meu perfil',
      security: S.bearer,
      response: { 200: S.userPublic },
    },
    preHandler: [authMiddleware],
  }, getMeHandler)

  fastify.patch('/me', {
    schema: {
      tags: ['Users'], summary: 'Atualizar meu perfil',
      security: S.bearer,
      body: updateBody,
      response: { 200: S.userPublic, 409: S.error },
    },
    preHandler: [authMiddleware],
  }, updateMeHandler)

  fastify.delete('/me', {
    schema: {
      tags: ['Users'], summary: 'Deletar minha conta',
      security: S.bearer,
      response: { 204: S.noContent },
    },
    preHandler: [authMiddleware],
  }, deleteMeHandler)

  fastify.get('/', {
    schema: {
      tags: ['Users'], summary: 'Listar todos os usuários (ADMIN)',
      security: S.bearer,
      querystring: S.paginationQuery,
      response: { 200: S.paginated(S.userPublic) },
    },
    preHandler: [authMiddleware, adminMiddleware],
  }, listAllHandler)

  fastify.get<{ Params: { id: string } }>('/:id', {
    schema: {
      tags: ['Users'], summary: 'Buscar usuário por ID (ADMIN)',
      security: S.bearer,
      params: idParam,
      response: { 200: S.userPublic, 404: S.error },
    },
    preHandler: [authMiddleware, adminMiddleware],
  }, getByIdHandler)

  fastify.patch<{ Params: { id: string } }>('/:id', {
    schema: {
      tags: ['Users'], summary: 'Atualizar usuário (ADMIN)',
      security: S.bearer,
      params: idParam,
      body: updateBody,
      response: { 200: S.userPublic, 409: S.error },
    },
    preHandler: [authMiddleware, adminMiddleware],
  }, updateByIdHandler)

  fastify.delete<{ Params: { id: string } }>('/:id', {
    schema: {
      tags: ['Users'], summary: 'Deletar usuário (ADMIN)',
      security: S.bearer,
      params: idParam,
      response: { 204: S.noContent },
    },
    preHandler: [authMiddleware, adminMiddleware],
  }, deleteByIdHandler)
}
