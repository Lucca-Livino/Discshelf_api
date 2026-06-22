import type { FastifyRequest, FastifyReply } from 'fastify'
import { AppError } from '../errors/AppError'

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    throw new AppError('Token inválido ou ausente', 401)
  }
}
