import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';

@Injectable()
export class ReviewAdvancedService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async createReview(reviewData: {
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }) {
    try {
      const review = this.reviewRepository.create({
        ...reviewData,
        isApproved: false, // Default to not approved for moderation
        isVerifiedPurchase: false,
        helpfulCount: 0,
      });

      const savedReview = await this.reviewRepository.save(review);
      return { success: true, review: savedReview };
    } catch (error) {
      console.error('Error creating review:', error);
      return { success: false, error: error.message };
    }
  }

  async getProductReviews(productId: string, options: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest' | 'highest' | 'lowest';
  } = {}) {
    const { page = 1, limit = 10, sort = 'newest' } = options;
    
    try {
      const queryBuilder = this.reviewRepository
        .createQueryBuilder('review')
        .where('review.productId = :productId', { productId })
        .andWhere('review.status = :status', { status: 'active' });

      // Apply sorting
      switch (sort) {
        case 'newest':
          queryBuilder.orderBy('review.createdAt', 'DESC');
          break;
        case 'oldest':
          queryBuilder.orderBy('review.createdAt', 'ASC');
          break;
        case 'highest':
          queryBuilder.orderBy('review.rating', 'DESC');
          break;
        case 'lowest':
          queryBuilder.orderBy('review.rating', 'ASC');
          break;
      }

      const [reviews, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        reviews,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error getting product reviews:', error);
      throw error;
    }
  }

  async getProductRatingStats(productId: string) {
    try {
      const stats = await this.reviewRepository
        .createQueryBuilder('review')
        .select([
          'AVG(review.rating) as averageRating',
          'COUNT(*) as totalReviews',
          'COUNT(CASE WHEN review.rating = 5 THEN 1 END) as rating5',
          'COUNT(CASE WHEN review.rating = 4 THEN 1 END) as rating4',
          'COUNT(CASE WHEN review.rating = 3 THEN 1 END) as rating3',
          'COUNT(CASE WHEN review.rating = 2 THEN 1 END) as rating2',
          'COUNT(CASE WHEN review.rating = 1 THEN 1 END) as rating1'
        ])
        .where('review.productId = :productId', { productId })
        .andWhere('review.status = :status', { status: 'active' })
        .getRawOne();

      const ratingDistribution = {
        5: parseInt(stats.rating5) || 0,
        4: parseInt(stats.rating4) || 0,
        3: parseInt(stats.rating3) || 0,
        2: parseInt(stats.rating2) || 0,
        1: parseInt(stats.rating1) || 0
      };

      return {
        averageRating: parseFloat(stats.averageRating) || 0,
        totalReviews: parseInt(stats.totalReviews) || 0,
        ratingDistribution
      };
    } catch (error) {
      console.error('Error getting rating stats:', error);
      throw error;
    }
  }

  async markHelpful(reviewId: string, userId: string) {
    try {
      const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
      if (!review) {
        return { success: false, message: 'Review not found' };
      }

      // Increment helpful count
      await this.reviewRepository.update(reviewId, {
        helpfulCount: review.helpfulCount + 1
      });

      return { success: true, message: 'Review marked as helpful' };
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      return { success: false, error: error.message };
    }
  }

  async addResponse(reviewId: string, responseData: {
    userId: string;
    userName: string;
    comment: string;
  }) {
    try {
      const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
      if (!review) {
        return { success: false, message: 'Review not found' };
      }

      // For now, we'll store the response as part of the review comment
      // In a more complex system, you might have a separate responses table
      const currentReview = await this.reviewRepository.findOne({ where: { id: reviewId } });
      if (!currentReview) {
        return { success: false, message: 'Review not found' };
      }
      
      const updatedComment = `${currentReview.comment}\n\n--- Response from ${responseData.userName} ---\n${responseData.comment}`;
      
      await this.reviewRepository.update(reviewId, {
        comment: updatedComment,
      });

      return { success: true, message: 'Response added successfully' };
    } catch (error) {
      console.error('Error adding response:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserReviews(userId: string, options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 10 } = options;
    
    try {
      const [reviews, total] = await this.reviewRepository
        .createQueryBuilder('review')
        .where('review.userId = :userId', { userId })
        .orderBy('review.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        reviews,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error getting user reviews:', error);
      throw error;
    }
  }

  async getTopReviews(limit: number = 10) {
    try {
      const reviews = await this.reviewRepository
        .createQueryBuilder('review')
        .where('review.status = :status', { status: 'active' })
        .orderBy('review.helpfulCount', 'DESC')
        .addOrderBy('review.rating', 'DESC')
        .take(limit)
        .getMany();

      return reviews;
    } catch (error) {
      console.error('Error getting top reviews:', error);
      throw error;
    }
  }

  async getReviewAnalytics() {
    try {
      const analytics = await this.reviewRepository
        .createQueryBuilder('review')
        .select([
          'AVG(review.rating) as averageRating',
          'COUNT(*) as totalReviews',
          'COUNT(CASE WHEN review.status = "active" THEN 1 END) as activeReviews',
          'COUNT(CASE WHEN review.status = "pending" THEN 1 END) as pendingReviews',
          'COUNT(CASE WHEN review.isVerified = true THEN 1 END) as verifiedReviews'
        ])
        .getRawOne();

      return {
        averageRating: parseFloat(analytics.averageRating) || 0,
        totalReviews: parseInt(analytics.totalReviews) || 0,
        activeReviews: parseInt(analytics.activeReviews) || 0,
        pendingReviews: parseInt(analytics.pendingReviews) || 0,
        verifiedReviews: parseInt(analytics.verifiedReviews) || 0
      };
    } catch (error) {
      console.error('Error getting review analytics:', error);
      throw error;
    }
  }

  async moderateReview(reviewId: string, action: 'approve' | 'reject', moderatorId: string) {
    try {
      const status = action === 'approve' ? 'active' : 'rejected';
      
      await this.reviewRepository.update(reviewId, {
        isApproved: status === 'active',
        updatedAt: new Date()
      });

      return { success: true, message: `Review ${action}d successfully` };
    } catch (error) {
      console.error('Error moderating review:', error);
      return { success: false, error: error.message };
    }
  }
}
