import { z } from 'zod'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { CatalogService } from '../services/CatalogService'

const addSchema        = z.object({ spotifyId: z.string().min(1) })
const paginationSchema = z.object({
  page:  z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

const service = new CatalogService()

export async function listCatalogHandler(request: FastifyRequest, reply: FastifyReply) {
  const { page, limit } = paginationSchema.parse(request.query)
  const result = await service.listCatalog(request.user.sub, { page, limit })
  return reply.send(result)
}

export async function addToCatalogHandler(request: FastifyRequest, reply: FastifyReply) {
  const { spotifyId } = addSchema.parse(request.body)
  const entry = await service.addToCatalog(request.user.sub, spotifyId)
  return reply.status(201).send(entry)
}

export async function removeFromCatalogHandler(
  request: FastifyRequest<{ Params: { albumId: string } }>,
  reply: FastifyReply,
) {
  await service.removeFromCatalog(request.user.sub, request.params.albumId)
  return reply.status(204).send()
}
