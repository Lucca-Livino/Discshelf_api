import { z } from 'zod'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { AlbumService } from '../services/AlbumService'

const searchSchema = z.object({ q: z.string().min(1) })

const service = new AlbumService()

export async function searchAlbumsHandler(request: FastifyRequest, reply: FastifyReply) {
  const { q } = searchSchema.parse(request.query)
  const albums = await service.searchAlbums(q)
  return reply.send(albums)
}

export async function getAlbumBySpotifyIdHandler(
  request: FastifyRequest<{ Params: { spotifyId: string } }>,
  reply: FastifyReply,
) {
  const album = await service.getAlbumBySpotifyId(request.params.spotifyId)
  return reply.send(album)
}

export async function getAlbumTracksHandler(
  request: FastifyRequest<{ Params: { spotifyId: string } }>,
  reply: FastifyReply,
) {
  const tracks = await service.getAlbumTracks(request.params.spotifyId)
  return reply.send(tracks)
}
