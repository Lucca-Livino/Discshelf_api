import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import type { FastifyInstance } from 'fastify'

export const swaggerPlugin = fp(async (fastify: FastifyInstance) => {
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Discshelf API',
        description: 'API REST para catalogação pessoal de álbuns musicais',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Token JWT obtido em POST /auth/login',
          },
        },
      },
      tags: [
        { name: 'Auth',    description: 'Autenticação e autorização' },
        { name: 'Users',   description: 'Gerenciamento de usuários' },
        { name: 'Albums',  description: 'Busca e cache de álbuns (Spotify + Deezer)' },
        { name: 'Catalog', description: 'Catálogo pessoal de álbuns' },
        { name: 'Reviews', description: 'Reviews e músicas favoritas' },
        { name: 'Lists',   description: 'Listas personalizadas de álbuns' },
      ],
    },
  })

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
    },
  })
})
