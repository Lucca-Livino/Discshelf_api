import type { FastifyRequest, FastifyReply } from 'fastify'
import { statsRepository } from '../repositories/statsRepository'
import { AlbumService } from '../services/AlbumService'

const albumService = new AlbumService()

export async function getStatsHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.sub
  const stats = await statsRepository.getStatsByUser(userId)
  albumService.fillMissingGenresForUser(userId).catch(() => {})
  return reply.send(stats)
}
