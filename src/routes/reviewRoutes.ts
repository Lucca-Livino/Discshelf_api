import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../shared/middlewares/authMiddleware'
import {
  getReviewHandler,
  createReviewHandler,
  updateReviewHandler,
  deleteReviewHandler,
} from '../controllers/reviewController'
import { S } from '../shared/swagger/schemas'

type AlbumParams = { Params: { albumId: string } }

const albumIdParam = {
  type: 'object',
  properties: { albumId: { type: 'string', format: 'uuid' } },
}

const reviewBody = {
  type: 'object',
  properties: {
    reviewText:    { type: 'string' },
    monthListened: { type: 'string', pattern: '^\\d{4}-\\d{2}$', description: 'Formato YYYY-MM, ex: 2024-03' },
    recommendedBy: { type: 'string' },
    favoriteTracks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['trackId', 'trackName'],
        properties: {
          trackId:   { type: 'string' },
          trackName: { type: 'string' },
        },
      },
    },
  },
}

export async function reviewRoutes(fastify: FastifyInstance) {
  fastify.get<AlbumParams>('/:albumId/review', {
    schema: {
      tags: ['Reviews'],
      summary: 'Buscar review do álbum',
      security: S.bearer,
      params: albumIdParam,
      response: { 200: S.review, 404: S.error },
    },
    preHandler: [authMiddleware],
  }, getReviewHandler)

  fastify.post<AlbumParams>('/:albumId/review', {
    schema: {
      tags: ['Reviews'],
      summary: 'Criar review com músicas favoritas',
      security: S.bearer,
      params: albumIdParam,
      body: reviewBody,
      response: { 201: S.review, 404: S.error, 409: S.error },
    },
    preHandler: [authMiddleware],
  }, createReviewHandler)

  fastify.patch<AlbumParams>('/:albumId/review', {
    schema: {
      tags: ['Reviews'],
      summary: 'Atualizar review (substitui favoriteTracks completamente)',
      security: S.bearer,
      params: albumIdParam,
      body: reviewBody,
      response: { 200: S.review, 403: S.error, 404: S.error },
    },
    preHandler: [authMiddleware],
  }, updateReviewHandler)

  fastify.delete<AlbumParams>('/:albumId/review', {
    schema: {
      tags: ['Reviews'],
      summary: 'Deletar review',
      security: S.bearer,
      params: albumIdParam,
      response: { 204: S.noContent, 403: S.error, 404: S.error },
    },
    preHandler: [authMiddleware],
  }, deleteReviewHandler)
}
