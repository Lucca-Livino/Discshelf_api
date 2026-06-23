import bcrypt from 'bcrypt'
import type { FastifyInstance } from 'fastify'
import { AppError } from '../shared/errors/AppError'
import { authRepository } from '../repositories/authRepository'
import { env } from '../config/env'

export class AuthService {
  constructor(private readonly fastify: FastifyInstance) {}

  async register(data: { name: string; email: string; password: string }) {
    const existing = await authRepository.findByEmail(data.email)
    if (existing) throw new AppError('E-mail já cadastrado', 409)

    const hash = await bcrypt.hash(data.password, 10)
    const user = await authRepository.createUser({ ...data, password: hash })

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  async login(data: { email: string; password: string }) {
    const user = await authRepository.findByEmail(data.email)
    if (!user) throw new AppError('Credenciais inválidas', 401)

    const valid = await bcrypt.compare(data.password, user.password)
    if (!valid) throw new AppError('Credenciais inválidas', 401)

    const token = this.fastify.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: env.JWT_EXPIRES_IN },
    )

    return { token }
  }
}
