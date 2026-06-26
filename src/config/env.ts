import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV:              z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL:          z.string().min(1),
  JWT_SECRET:            z.string().min(1),
  JWT_EXPIRES_IN:        z.string().default('7d'),
  SPOTIFY_CLIENT_ID:     z.string().min(1),
  SPOTIFY_CLIENT_SECRET: z.string().min(1),
  PORT:                  z.coerce.number().default(3333),
  // URLs do frontend liberadas no CORS (separadas por vírgula). Ex: https://app.vercel.app
  FRONTEND_URLS:         z.string().default('http://localhost:3000,http://127.0.0.1:3000'),
  // Teto de contas que podem se registrar (0 = sem limite)
  MAX_USERS:             z.coerce.number().min(0).default(25),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const missing = parsed.error.issues.map(e => e.path.map(String).join('.')).join(', ')
  throw new Error(`Missing or invalid environment variables: ${missing}`)
}

export const env = parsed.data
