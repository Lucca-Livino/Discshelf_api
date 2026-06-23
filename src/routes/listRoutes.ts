import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../shared/middlewares/authMiddleware'
import {
  listAllHandler,
  createListHandler,
  getListHandler,
  updateListHandler,
  deleteListHandler,
  addAlbumToListHandler,
  removeAlbumFromListHandler,
  getListAlbumsHandler,
} from '../controllers/listController'
import { S } from '../shared/swagger/schemas'

type LP  = { Params: { id: string } }
type LAP = { Params: { id: string; albumId: string } }

const listIdParam = {
  type: 'object',
  properties: { id: { type: 'string', format: 'uuid' } },
}

const listAlbumParams = {
  type: 'object',
  properties: {
    id:      { type: 'string', format: 'uuid' },
    albumId: { type: 'string', format: 'uuid' },
  },
}

export async function listRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    schema: {
      tags: ['Lists'], summary: 'Listar todas as listas',
      security: S.bearer,
      response: {
        200: {
          type: 'object',
          properties: { data: { type: 'array', items: S.listSummary } },
        },
      },
    },
    preHandler: [authMiddleware],
  }, listAllHandler)

  fastify.post('/', {
    schema: {
      tags: ['Lists'], summary: 'Criar lista',
      security: S.bearer,
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name:        { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
        },
      },
      response: { 201: S.list },
    },
    preHandler: [authMiddleware],
  }, createListHandler)

  fastify.get<LP>('/:id', {
    schema: {
      tags: ['Lists'], summary: 'Buscar lista com álbuns',
      security: S.bearer,
      params: listIdParam,
      response: {
        200: {
          type: 'object',
          properties: { list: S.listDetail },
        },
        403: S.error, 404: S.error,
      },
    },
    preHandler: [authMiddleware],
  }, getListHandler)

  fastify.patch<LP>('/:id', {
    schema: {
      tags: ['Lists'], summary: 'Atualizar lista',
      security: S.bearer,
      params: listIdParam,
      body: {
        type: 'object',
        properties: {
          name:        { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500, nullable: true },
        },
      },
      response: { 200: S.list, 403: S.error, 404: S.error },
    },
    preHandler: [authMiddleware],
  }, updateListHandler)

  fastify.delete<LP>('/:id', {
    schema: {
      tags: ['Lists'], summary: 'Deletar lista e todos os álbuns',
      security: S.bearer,
      params: listIdParam,
      response: { 204: S.noContent, 403: S.error, 404: S.error },
    },
    preHandler: [authMiddleware],
  }, deleteListHandler)

  fastify.post<LP>('/:id/albums', {
    schema: {
      tags: ['Lists'], summary: 'Adicionar álbum à lista',
      security: S.bearer,
      params: listIdParam,
      body: {
        type: 'object',
        required: ['spotifyId'],
        properties: { spotifyId: { type: 'string' } },
      },
      response: { 201: S.noContent, 403: S.error, 404: S.error, 409: S.error },
    },
    preHandler: [authMiddleware],
  }, addAlbumToListHandler)

  fastify.get<LP>('/:id/albums', {
    schema: {
      tags: ['Lists'], summary: 'Listar álbuns da lista (paginado)',
      security: S.bearer,
      params: listIdParam,
      querystring: S.paginationQuery,
      response: { 200: S.paginated(S.album), 403: S.error, 404: S.error },
    },
    preHandler: [authMiddleware],
  }, getListAlbumsHandler)

  fastify.delete<LAP>('/:id/albums/:albumId', {
    schema: {
      tags: ['Lists'], summary: 'Remover álbum da lista',
      security: S.bearer,
      params: listAlbumParams,
      response: { 204: S.noContent, 403: S.error, 404: S.error },
    },
    preHandler: [authMiddleware],
  }, removeAlbumFromListHandler)
}
