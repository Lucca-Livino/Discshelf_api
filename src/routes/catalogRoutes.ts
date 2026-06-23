import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../shared/middlewares/authMiddleware'
import {
  listCatalogHandler,
  addToCatalogHandler,
  removeFromCatalogHandler,
} from '../controllers/catalogController'
import { getStatsHandler } from '../controllers/statsController'
import { S } from '../shared/swagger/schemas'

export async function catalogRoutes(fastify: FastifyInstance) {
  fastify.get('/stats', {
    schema: { tags: ['Catalog'], summary: 'Estatísticas do catálogo', security: S.bearer },
    preHandler: [authMiddleware],
  }, getStatsHandler)

  fastify.get('/', {
    schema: {
      tags: ['Catalog'],
      summary: 'Listar catálogo pessoal',
      security: S.bearer,
      querystring: S.paginationQuery,
      response: {
        200: S.paginated(S.catalogEntry),
      },
    },
    preHandler: [authMiddleware],
  }, listCatalogHandler)

  fastify.post('/', {
    schema: {
      tags: ['Catalog'],
      summary: 'Adicionar álbum ao catálogo',
      security: S.bearer,
      body: {
        type: 'object',
        required: ['spotifyId'],
        properties: {
          spotifyId: { type: 'string' },
        },
      },
      response: {
        201: S.catalogEntry,
        409: S.error,
      },
    },
    preHandler: [authMiddleware],
  }, addToCatalogHandler)

  fastify.delete<{ Params: { albumId: string } }>('/:albumId', {
    schema: {
      tags: ['Catalog'],
      summary: 'Remover álbum do catálogo (cascata: review + músicas favoritas)',
      security: S.bearer,
      params: {
        type: 'object',
        properties: { albumId: { type: 'string', format: 'uuid' } },
      },
      response: {
        204: S.noContent,
        404: S.error,
      },
    },
    preHandler: [authMiddleware],
  }, removeFromCatalogHandler)
}
