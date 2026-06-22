export interface FavoriteTrackDTO {
  trackId: string
  trackName: string
}

export interface ReviewDTO {
  id: string
  reviewText: string | null
  monthListened: Date
  recommendedBy: string | null
  favoriteTracks: FavoriteTrackDTO[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateReviewDTO {
  reviewText?: string
  monthListened?: string
  recommendedBy?: string
  favoriteTracks?: FavoriteTrackDTO[]
}
