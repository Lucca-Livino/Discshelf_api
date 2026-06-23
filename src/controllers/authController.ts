import { z } from 'zod'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../services/AuthService'

const registerSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string(),
})

export async function registerHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = registerSchema.parse(request.body)
  const service = new AuthService(request.server)
  const user = await service.register(body)
  return reply.status(201).send(user)
}

export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = loginSchema.parse(request.body)
  const service = new AuthService(request.server)
  const result = await service.login(body)
  return reply.status(200).send(result)
}
