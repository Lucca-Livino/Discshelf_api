import { AppError } from '../shared/errors/AppError'
import { catalogRepository } from '../repositories/catalogRepository'
import { reviewRepository } from '../repositories/reviewRepository'
import type { CreateReviewDTO, ReviewDTO, FavoriteTrackDTO } from '../models/reviewModel'

function parseMonthListened(value?: string): Date {
  if (!value) {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }
  const [year, month] = value.split('-').map(Number)
  return new Date(year!, month! - 1, 1)
}

function toReviewDTO(review: {
  id: string
  reviewText: string | null
  monthListened: Date
  recommendedBy: string | null
  createdAt: Date
  updatedAt: Date
  favoriteTracks: Array<{ trackId: string; trackName: string }>
}): ReviewDTO {
  return {
    id:             review.id,
    reviewText:     review.reviewText,
    monthListened:  review.monthListened,
    recommendedBy:  review.recommendedBy,
    favoriteTracks: review.favoriteTracks.map(t => ({ trackId: t.trackId, trackName: t.trackName })),
    createdAt:      review.createdAt,
    updatedAt:      review.updatedAt,
  }
}

export class ReviewService {
  async getReview(userId: string, albumId: string): Promise<ReviewDTO> {
    const review = await reviewRepository.findByUserAndAlbum(userId, albumId)
    if (!review) throw new AppError('Review não encontrada', 404)
    return toReviewDTO(review)
  }

  async createReview(userId: string, albumId: string, data: CreateReviewDTO): Promise<ReviewDTO> {
    const entry = await catalogRepository.findByUserAndAlbum(userId, albumId)
    if (!entry) throw new AppError('Álbum não encontrado no catálogo', 404)

    const existing = await reviewRepository.findByUserAndAlbum(userId, albumId)
    if (existing) throw new AppError('Review já existe para este álbum', 409)

    const monthListened = parseMonthListened(data.monthListened)

    const created = await reviewRepository.create({
      userId,
      albumId,
      catalogEntryId: entry.id,
      reviewText:     data.reviewText ?? null,
      monthListened,
      recommendedBy:  data.recommendedBy ?? null,
    })

    const tracks: FavoriteTrackDTO[] = data.favoriteTracks ?? []
    if (tracks.length > 0) {
      await reviewRepository.replaceFavoriteTracks(created.id, userId, albumId, tracks)
    }

    const full = await reviewRepository.findByUserAndAlbum(userId, albumId)
    return toReviewDTO(full!)
  }

  async updateReview(userId: string, albumId: string, data: CreateReviewDTO): Promise<ReviewDTO> {
    const review = await reviewRepository.findByUserAndAlbum(userId, albumId)
    if (!review) throw new AppError('Review não encontrada', 404)
    if (review.userId !== userId) throw new AppError('Sem permissão para editar esta review', 403)

    const updatePayload: Parameters<typeof reviewRepository.update>[1] = {
      updatedAt: new Date(),
    }
    if (data.reviewText    !== undefined) updatePayload.reviewText    = data.reviewText ?? null
    if (data.recommendedBy !== undefined) updatePayload.recommendedBy = data.recommendedBy ?? null
    if (data.monthListened !== undefined) updatePayload.monthListened = parseMonthListened(data.monthListened)

    await reviewRepository.update(review.id, updatePayload)

    if (data.favoriteTracks !== undefined) {
      await reviewRepository.replaceFavoriteTracks(review.id, userId, albumId, data.favoriteTracks)
    }

    const full = await reviewRepository.findByUserAndAlbum(userId, albumId)
    return toReviewDTO(full!)
  }

  async deleteReview(userId: string, albumId: string): Promise<void> {
    const review = await reviewRepository.findByUserAndAlbum(userId, albumId)
    if (!review) throw new AppError('Review não encontrada', 404)
    if (review.userId !== userId) throw new AppError('Sem permissão para deletar esta review', 403)
    await reviewRepository.delete(review.id)
  }
}
