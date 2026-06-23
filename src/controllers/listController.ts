import { z } from 'zod'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { ListService } from '../services/ListService'

const createListSchema = z.object({
  name:        z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

const updateListSchema = z.object({
  name:        z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
})

const addAlbumSchema   = z.object({ spotifyId: z.string() })
const paginationSchema = z.object({
  page:  z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

type ListParams      = { Params: { id: string } }
type ListAlbumParams = { Params: { id: string; albumId: string } }

const service = new ListService()

export async function listAllHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = await service.listAll(request.user.sub)
  return reply.send({ data })
}

export async function createListHandler(request: FastifyRequest, reply: FastifyReply) {
  const { name, description } = createListSchema.parse(request.body)
  const list = await service.createList(request.user.sub, name, description)
  return reply.status(201).send(list)
}

export async function getListHandler(
  request: FastifyRequest<ListParams>,
  reply: FastifyReply,
) {
  const list = await service.getList(request.user.sub, request.params.id)
  return reply.send({ list })
}

export async function updateListHandler(
  request: FastifyRequest<ListParams>,
  reply: FastifyReply,
) {
  const data = updateListSchema.parse(request.body)
  const list = await service.updateList(request.user.sub, request.params.id, data)
  return reply.send(list)
}

export async function deleteListHandler(
  request: FastifyRequest<ListParams>,
  reply: FastifyReply,
) {
  await service.deleteList(request.user.sub, request.params.id)
  return reply.status(204).send()
}

export async function addAlbumToListHandler(
  request: FastifyRequest<ListParams>,
  reply: FastifyReply,
) {
  const { spotifyId } = addAlbumSchema.parse(request.body)
  await service.addAlbumToList(request.user.sub, request.params.id, spotifyId)
  return reply.status(201).send()
}

export async function removeAlbumFromListHandler(
  request: FastifyRequest<ListAlbumParams>,
  reply: FastifyReply,
) {
  await service.removeAlbumFromList(request.user.sub, request.params.id, request.params.albumId)
  return reply.status(204).send()
}

export async function getListAlbumsHandler(
  request: FastifyRequest<ListParams>,
  reply: FastifyReply,
) {
  const { page, limit } = paginationSchema.parse(request.query)
  const result = await service.getListAlbums(request.user.sub, request.params.id, { page, limit })
  return reply.send(result)
}
