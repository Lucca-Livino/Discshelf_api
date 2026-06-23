import bcrypt from 'bcrypt'
import { AppError } from '../shared/errors/AppError'
import { userRepository } from '../repositories/userRepository'
import type { UpdateUserDTO } from '../models/userModel'

export class UserService {
  async getMe(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) throw new AppError('Usuário não encontrado', 404)
    return user
  }

  async updateMe(userId: string, data: UpdateUserDTO) {
    return this._updateUser(userId, data)
  }

  async deleteMe(userId: string) {
    await userRepository.delete(userId)
  }

  async listAll({ page, limit }: { page: number; limit: number }) {
    const offset = (page - 1) * limit
    const [data, total] = await Promise.all([
      userRepository.findAll({ offset, limit }),
      userRepository.countAll(),
    ])
    return { data, total, page, limit }
  }

  async getById(id: string) {
    const user = await userRepository.findById(id)
    if (!user) throw new AppError('Usuário não encontrado', 404)
    return user
  }

  async updateById(id: string, data: UpdateUserDTO) {
    return this._updateUser(id, data)
  }

  async deleteById(id: string) {
    await userRepository.delete(id)
  }

  private async _updateUser(id: string, data: UpdateUserDTO) {
    if (data.email) {
      const existing = await userRepository.findByEmail(data.email)
      if (existing && existing.id !== id) throw new AppError('E-mail já em uso', 409)
    }

    const payload: UpdateUserDTO & { updatedAt: Date } = { ...data, updatedAt: new Date() }

    if (data.password) {
      payload.password = await bcrypt.hash(data.password, 10)
    }

    const updated = await userRepository.update(id, payload)
    if (!updated) throw new AppError('Usuário não encontrado', 404)
    return updated
  }
}
