import type { FastifyRequest, FastifyReply } from 'fastify'
import { AppError } from '../errors/AppError'

export async function adminMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  if (request.user.role !== 'ADMIN') {
    throw new AppError('Acesso restrito a administradores', 403)
  }
}
