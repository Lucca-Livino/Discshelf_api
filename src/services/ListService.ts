import { AlbumService } from './AlbumService'
import { AppError } from '../shared/errors/AppError'
import { listRepository } from '../repositories/listRepository'
import type { AlbumDTO } from '../models/albumModel'

const albumService = new AlbumService()

export class ListService {
  async listAll(userId: string) {
    return listRepository.findAllByUser(userId)
  }

  async createList(userId: string, name: string, description?: string) {
    return listRepository.create({ userId, name, description })
  }

  async getList(userId: string, listId: string) {
    const list = await listRepository.findByIdWithAlbums(listId)
    if (!list) throw new AppError('Lista não encontrada', 404)
    if (list.userId !== userId) throw new AppError('Sem permissão para acessar esta lista', 403)
    return list
  }

  async updateList(userId: string, listId: string, data: { name?: string; description?: string | null }) {
    const list = await this._requireOwned(userId, listId)
    return listRepository.update(list.id, data)
  }

  async deleteList(userId: string, listId: string): Promise<void> {
    await this._requireOwned(userId, listId)
    await listRepository.delete(listId)
  }

  async addAlbumToList(userId: string, listId: string, spotifyId: string): Promise<void> {
    await this._requireOwned(userId, listId)

    const album = await albumService.getAlbumBySpotifyId(spotifyId)

    const exists = await listRepository.albumExistsInList(listId, album.id)
    if (exists) throw new AppError('Álbum já está nesta lista', 409)

    await listRepository.addAlbum(listId, album.id)
  }

  async removeAlbumFromList(userId: string, listId: string, albumId: string): Promise<void> {
    await this._requireOwned(userId, listId)

    const exists = await listRepository.albumExistsInList(listId, albumId)
    if (!exists) throw new AppError('Álbum não encontrado nesta lista', 404)

    await listRepository.removeAlbum(listId, albumId)
  }

  async getListAlbums(
    userId: string,
    listId: string,
    { page, limit }: { page: number; limit: number },
  ): Promise<{ data: AlbumDTO[]; total: number; page: number; limit: number }> {
    await this._requireOwned(userId, listId)

    const offset = (page - 1) * limit
    const [data, total] = await Promise.all([
      listRepository.findAlbums(listId, { offset, limit }),
      listRepository.countAlbums(listId),
    ])

    return { data, total, page, limit }
  }

  private async _requireOwned(userId: string, listId: string) {
    const list = await listRepository.findById(listId)
    if (!list) throw new AppError('Lista não encontrada', 404)
    if (list.userId !== userId) throw new AppError('Sem permissão para acessar esta lista', 403)
    return list
  }
}
