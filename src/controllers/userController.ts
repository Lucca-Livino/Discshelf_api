import { z } from 'zod'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { UserService } from '../services/UserService'

const updateMeSchema = z.object({
  name:     z.string().min(2).optional(),
  email:    z.string().email().optional(),
  password: z.string().min(6).optional(),
})

const paginationSchema = z.object({
  page:  z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

const service = new UserService()

export async function getMeHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = await service.getMe(request.user.sub)
  return reply.send(user)
}

export async function updateMeHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = updateMeSchema.parse(request.body)
  const user = await service.updateMe(request.user.sub, body)
  return reply.send(user)
}

export async function deleteMeHandler(request: FastifyRequest, reply: FastifyReply) {
  await service.deleteMe(request.user.sub)
  return reply.status(204).send()
}

export async function listAllHandler(request: FastifyRequest, reply: FastifyReply) {
  const { page, limit } = paginationSchema.parse(request.query)
  const result = await service.listAll({ page, limit })
  return reply.send(result)
}

export async function getByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const user = await service.getById(request.params.id)
  return reply.send(user)
}

export async function updateByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const body = updateMeSchema.parse(request.body)
  const user = await service.updateById(request.params.id, body)
  return reply.send(user)
}

export async function deleteByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  await service.deleteById(request.params.id)
  return reply.status(204).send()
}
