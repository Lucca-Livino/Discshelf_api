import { z } from 'zod'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { ReviewService } from '../services/ReviewService'

const reviewBodySchema = z.object({
  reviewText:     z.string().optional(),
  monthListened:  z.string().regex(/^\d{4}-\d{2}$/).optional(),
  recommendedBy:  z.string().optional(),
  favoriteTracks: z.array(z.object({
    trackId:   z.string(),
    trackName: z.string(),
  })).optional(),
})

type AlbumParams = { Params: { albumId: string } }

const service = new ReviewService()

export async function getReviewHandler(
  request: FastifyRequest<AlbumParams>,
  reply: FastifyReply,
) {
  const review = await service.getReview(request.user.sub, request.params.albumId)
  return reply.send(review)
}

export async function createReviewHandler(
  request: FastifyRequest<AlbumParams>,
  reply: FastifyReply,
) {
  const body = reviewBodySchema.parse(request.body)
  const review = await service.createReview(request.user.sub, request.params.albumId, body)
  return reply.status(201).send(review)
}

export async function updateReviewHandler(
  request: FastifyRequest<AlbumParams>,
  reply: FastifyReply,
) {
  const body = reviewBodySchema.parse(request.body)
  const review = await service.updateReview(request.user.sub, request.params.albumId, body)
  return reply.send(review)
}

export async function deleteReviewHandler(
  request: FastifyRequest<AlbumParams>,
  reply: FastifyReply,
) {
  await service.deleteReview(request.user.sub, request.params.albumId)
  return reply.status(204).send()
}
