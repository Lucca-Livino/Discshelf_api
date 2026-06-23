import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../shared/middlewares/authMiddleware'
import { searchAlbumsHandler, getAlbumBySpotifyIdHandler, getAlbumTracksHandler } from '../controllers/albumController'
import { S } from '../shared/swagger/schemas'

export async function albumRoutes(fastify: FastifyInstance) {
  fastify.get('/search', {
    schema: {
      tags: ['Albums'],
      summary: 'Buscar álbuns no Spotify (com gênero via Deezer)',
      security: S.bearer,
      querystring: {
        type: 'object',
        required: ['q'],
        properties: { q: { type: 'string', minLength: 1 } },
      },
      response: {
        200: { type: 'array', items: S.album },
      },
    },
    preHandler: [authMiddleware],
  }, searchAlbumsHandler)

  fastify.get<{ Params: { spotifyId: string } }>('/:spotifyId/tracks', {
    schema: {
      tags: ['Albums'],
      summary: 'Listar faixas de um álbum (busca no Spotify, paginação automática)',
      security: S.bearer,
      params: {
        type: 'object',
        properties: { spotifyId: { type: 'string' } },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              trackId:     { type: 'string' },
              trackNumber: { type: 'number' },
              trackName:   { type: 'string' },
              durationMs:  { type: 'number' },
            },
          },
        },
        404: S.error,
        502: S.error,
      },
    },
    preHandler: [authMiddleware],
  }, getAlbumTracksHandler)

  fastify.get<{ Params: { spotifyId: string } }>('/:spotifyId', {
    schema: {
      tags: ['Albums'],
      summary: 'Detalhes do álbum (cache local, busca no Spotify se necessário)',
      security: S.bearer,
      params: {
        type: 'object',
        properties: { spotifyId: { type: 'string' } },
      },
      response: {
        200: S.album,
        404: S.error,
      },
    },
    preHandler: [authMiddleware],
  }, getAlbumBySpotifyIdHandler)
}
