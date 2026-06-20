import Fastify from 'fastify'
import cors from '@fastify/cors'
import { swaggerPlugin } from './shared/plugins/swaggerPlugin'
import { dbPlugin } from './shared/plugins/dbPlugin'
import { jwtPlugin } from './shared/plugins/jwtPlugin'
import { authRoutes } from './routes/authRoutes'
import { userRoutes } from './routes/userRoutes'
import { albumRoutes } from './routes/albumRoutes'
import { catalogRoutes } from './routes/catalogRoutes'
import { reviewRoutes } from './routes/reviewRoutes'
import { listRoutes } from './routes/listRoutes'
import { waitlistRoutes } from './routes/waitlistRoutes'
import { AppError } from './shared/errors/AppError'
import { env } from './config/env'

export async function buildApp() {
  const app = Fastify({ logger: true })

  const allowedOrigins = env.FRONTEND_URLS.split(',').map((s) => s.trim()).filter(Boolean)

  await app.register(cors, {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
  await app.register(swaggerPlugin)
  await app.register(dbPlugin)
  await app.register(jwtPlugin)

  // healthcheck — usado pelo Render pra validar o deploy
  app.get('/health', async () => ({ status: 'ok', uptime: process.uptime() }))

  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(userRoutes, { prefix: '/users' })
  await app.register(albumRoutes, { prefix: '/albums' })
  await app.register(catalogRoutes, { prefix: '/catalog' })
  await app.register(reviewRoutes, { prefix: '/catalog' })
  await app.register(listRoutes, { prefix: '/lists' })
  await app.register(waitlistRoutes, { prefix: '/waitlist' })

  app.setErrorHandler((error: unknown, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name,
        message: error.message,
      })
    }
    if (error instanceof Error && 'validation' in error) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message,
      })
    }
    app.log.error(error)
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Erro interno do servidor',
    })
  })

  return app
}
