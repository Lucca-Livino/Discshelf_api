// ── Reusable JSON Schema objects for Swagger route definitions ──

export const S = {
  // ── Primitives ──────────────────────────────────────────────
  string:   { type: 'string' } as const,
  number:   { type: 'number' } as const,
  boolean:  { type: 'boolean' } as const,
  nullableString: { type: 'string', nullable: true } as const,

  // ── Common responses ────────────────────────────────────────
  noContent: { type: 'null', description: 'No content' } as const,

  error: {
    type: 'object',
    properties: {
      statusCode: { type: 'number' },
      error:      { type: 'string' },
      message:    { type: 'string' },
    },
  } as const,

  // ── Domain objects ──────────────────────────────────────────
  userPublic: {
    type: 'object',
    properties: {
      id:        { type: 'string', format: 'uuid' },
      name:      { type: 'string' },
      email:     { type: 'string', format: 'email' },
      role:      { type: 'string', enum: ['USER', 'ADMIN'] },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  } as const,

  album: {
    type: 'object',
    properties: {
      id:        { type: 'string', format: 'uuid' },
      spotifyId: { type: 'string' },
      title:     { type: 'string' },
      artist:    { type: 'string' },
      year:      { type: 'number' },
      coverUrl:  { type: 'string' },
      genre:     { type: 'string', nullable: true },
    },
  } as const,

  catalogEntry: {
    type: 'object',
    properties: {
      id:        { type: 'string', format: 'uuid' },
      albumId:   { type: 'string', format: 'uuid' },
      album:     {
        type: 'object',
        properties: {
          id:        { type: 'string', format: 'uuid' },
          spotifyId: { type: 'string' },
          title:     { type: 'string' },
          artist:    { type: 'string' },
          year:      { type: 'number' },
          coverUrl:  { type: 'string' },
          genre:     { type: 'string', nullable: true },
        },
      },
      addedAt:   { type: 'string', format: 'date-time' },
      hasReview: { type: 'boolean' },
    },
  } as const,

  favoriteTrack: {
    type: 'object',
    properties: {
      trackId:   { type: 'string' },
      trackName: { type: 'string' },
    },
  } as const,

  review: {
    type: 'object',
    properties: {
      id:             { type: 'string', format: 'uuid' },
      reviewText:     { type: 'string', nullable: true },
      monthListened:  { type: 'string', format: 'date-time' },
      recommendedBy:  { type: 'string', nullable: true },
      favoriteTracks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            trackId:   { type: 'string' },
            trackName: { type: 'string' },
          },
        },
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  } as const,

  list: {
    type: 'object',
    properties: {
      id:          { type: 'string', format: 'uuid' },
      name:        { type: 'string' },
      description: { type: 'string', nullable: true },
      createdAt:   { type: 'string', format: 'date-time' },
      updatedAt:   { type: 'string', format: 'date-time' },
    },
  } as const,

  listSummary: {
    type: 'object',
    properties: {
      id:          { type: 'string', format: 'uuid' },
      name:        { type: 'string' },
      description: { type: 'string', nullable: true },
      albumCount:  { type: 'number' },
      albums: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            coverUrl: { type: 'string' },
            title:    { type: 'string' },
          },
        },
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  } as const,

  listDetail: {
    type: 'object',
    properties: {
      id:          { type: 'string', format: 'uuid' },
      name:        { type: 'string' },
      description: { type: 'string', nullable: true },
      albumCount:  { type: 'number' },
      albums: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            spotifyId: { type: 'string' },
            title:     { type: 'string' },
            artist:    { type: 'string' },
            year:      { type: 'number' },
            coverUrl:  { type: 'string' },
            genre:     { type: 'string', nullable: true },
          },
        },
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  } as const,

  // ── Pagination ──────────────────────────────────────────────
  paginationQuery: {
    type: 'object',
    properties: {
      page:  { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
    },
  } as const,

  paginated: (items: object) => ({
    type: 'object',
    properties: {
      data:  { type: 'array', items },
      total: { type: 'number' },
      page:  { type: 'number' },
      limit: { type: 'number' },
    },
  }),

  // ── Security ─────────────────────────────────────────────────
  bearer: [{ bearerAuth: [] }] as const,
}
