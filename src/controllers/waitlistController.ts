import { z } from 'zod'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { WaitlistService } from '../services/WaitlistService'

const addSchema = z.object({
  spotifyId:     z.string().min(1),
  recommendedBy: z.string().optional(),
})

const service = new WaitlistService()

export async function listWaitlistHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = await service.listWaitlist(request.user.sub)
  return reply.send(data)
}

export async function addToWaitlistHandler(request: FastifyRequest, reply: FastifyReply) {
  const { spotifyId, recommendedBy } = addSchema.parse(request.body)
  const entry = await service.addToWaitlist(request.user.sub, spotifyId, recommendedBy)
  return reply.status(201).send(entry)
}

export async function removeFromWaitlistHandler(
  request: FastifyRequest<{ Params: { albumId: string } }>,
  reply: FastifyReply,
) {
  await service.removeFromWaitlist(request.user.sub, request.params.albumId)
  return reply.status(204).send()
}
