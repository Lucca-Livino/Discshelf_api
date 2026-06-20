# Discshelf API# 

API REST para catalogação pessoal de álbuns musicais. Permite que usuários cataloguem álbuns, escrevam reviews, marquem músicas favoritas e organizem álbuns em listas personalizadas. Suporta até 25 usuários.

**Stack:** Node.js · TypeScript · Fastify · Drizzle ORM · PostgreSQL · Spotify API · MusicBrainz API

---

## Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 14
- Conta no [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

---

## Instalação

```bash
git clone https://github.com/Lucca-Livino/album-catalog-api.git
cd album-catalog-api
npm install
```

---

## Configuração das Variáveis de Ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env
```

| Variável | Descrição | Como obter |
|---|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT | Qualquer string longa e aleatória |
| `JWT_EXPIRES_IN` | Expiração do token (default: `7d`) | Ex: `1d`, `12h`, `7d` |
| `SPOTIFY_CLIENT_ID` | Client ID do app Spotify | [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → Create App |
| `SPOTIFY_CLIENT_SECRET` | Client Secret do app Spotify | Mesmo local acima |
| `PORT` | Porta do servidor (default: `3333`) | Qualquer porta disponível |

---

## Banco de Dados e Migrations

```bash
# Gerar arquivos de migration a partir dos schemas
npm run db:generate

# Aplicar migrations no banco
npm run db:migrate
```

---

## Rodando o Projeto

```bash
# Desenvolvimento (hot reload)
npm run dev

# Build de produção
npm run build

# Produção
npm start
```

---

## Endpoints

### Auth
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/auth/register` | Cadastrar usuário | — |
| POST | `/auth/login` | Login, retorna JWT | — |
| POST | `/auth/logout` | Logout (invalida no cliente) | — |

### Users
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/users/me` | Perfil do usuário logado | JWT |
| PATCH | `/users/me` | Atualizar nome/email/senha | JWT |
| DELETE | `/users/me` | Deletar própria conta | JWT |
| GET | `/users` | Listar todos os usuários | JWT + ADMIN |
| GET | `/users/:id` | Buscar usuário por ID | JWT + ADMIN |
| PATCH | `/users/:id` | Atualizar qualquer usuário | JWT + ADMIN |
| DELETE | `/users/:id` | Deletar qualquer usuário | JWT + ADMIN |

### Albums
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/albums/search?q=` | Buscar álbuns no Spotify com gênero (MusicBrainz) | JWT |
| GET | `/albums/:spotifyId` | Detalhes do álbum (cache local) | JWT |

### Catalog
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/catalog` | Listar catálogo pessoal paginado | JWT |
| POST | `/catalog` | Adicionar álbum ao catálogo `{ spotifyId }` | JWT |
| DELETE | `/catalog/:albumId` | Remover álbum do catálogo (cascata: review + tracks) | JWT |

### Reviews e Músicas Favoritas
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/catalog/:albumId/review` | Buscar review do álbum | JWT |
| POST | `/catalog/:albumId/review` | Criar review com favoriteTracks | JWT |
| PATCH | `/catalog/:albumId/review` | Atualizar review (substitui favoriteTracks) | JWT |
| DELETE | `/catalog/:albumId/review` | Deletar review | JWT |

### Listas
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/lists` | Listar todas as listas | JWT |
| POST | `/lists` | Criar lista `{ name }` | JWT |
| PATCH | `/lists/:id` | Renomear lista | JWT |
| DELETE | `/lists/:id` | Deletar lista e seus álbuns | JWT |
| GET | `/lists/:id/albums` | Álbuns da lista (paginado) | JWT |
| POST | `/lists/:id/albums` | Adicionar álbum à lista `{ spotifyId }` | JWT |
| DELETE | `/lists/:id/albums/:albumId` | Remover álbum da lista | JWT |

---

## Scripts Disponíveis

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `npm run dev` | Servidor em modo desenvolvimento com hot reload |
| `build` | `npm run build` | Compilar TypeScript para `dist/` |
| `start` | `npm start` | Rodar build de produção |
| `db:generate` | `npm run db:generate` | Gerar migrations a partir dos schemas |
| `db:migrate` | `npm run db:migrate` | Aplicar migrations no banco |
