import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Review } from './review.entity';
import { ReviewHelpfulness } from './review-helpfulness.entity';
import { CreateReviewDto, UpdateReviewDto, MarkHelpfulDto } from './dto/review.dto';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewHelpfulness)
    private reviewHelpfulnessRepository: Repository<ReviewHelpfulness>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review | null> {
    try {
      // Verify user and product exist
      const user = await this.userRepository.findOne({ where: { id: createReviewDto.userId } });
      const product = await this.productRepository.findOne({ where: { id: createReviewDto.productId } });
      
      if (!user || !product) return null;

      // Check if user already reviewed this product
      const existingReview = await this.reviewRepository.findOne({
        where: {
          userId: createReviewDto.userId,
          productId: createReviewDto.productId,
        },
      });

      if (existingReview) return null;

      // Check if user has purchased this product (for verified purchase)
      const hasPurchased = await this.orderItemRepository
        .createQueryBuilder('orderItem')
        .innerJoin('orderItem.order', 'order')
        .where('order.userId = :userId', { userId: createReviewDto.userId })
        .andWhere('orderItem.productId = :productId', { productId: createReviewDto.productId })
        .andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: 'paid' })
        .getOne();

      const review = this.reviewRepository.create({
        ...createReviewDto,
        isVerifiedPurchase: !!hasPurchased,
      });

      return await this.reviewRepository.save(review);
    } catch (err) {
      console.error('Error creating review:', err);
      return null;
    }
  }

  async findAll(
    options: IPaginationOptions,
    productId?: string,
    rating?: number,
    isApproved?: boolean,
    isVerifiedPurchase?: boolean
  ): Promise<Pagination<Review> | null> {
    try {
      const queryBuilder = this.reviewRepository.createQueryBuilder('review');
      queryBuilder.leftJoinAndSelect('review.user', 'user');
      queryBuilder.leftJoinAndSelect('review.product', 'product');

      if (productId) {
        queryBuilder.andWhere('review.productId = :productId', { productId });
      }

      if (rating !== undefined) {
        queryBuilder.andWhere('review.rating = :rating', { rating });
      }

      if (isApproved !== undefined) {
        queryBuilder.andWhere('review.isApproved = :isApproved', { isApproved });
      }

      if (isVerifiedPurchase !== undefined) {
        queryBuilder.andWhere('review.isVerifiedPurchase = :isVerifiedPurchase', { isVerifiedPurchase });
      }

      queryBuilder.orderBy('review.createdAt', 'DESC');

      return await paginate<Review>(queryBuilder, options);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      return null;
    }
  }

  async findOne(id: string): Promise<Review | null> {
    try {
      return await this.reviewRepository.findOne({
        where: { id },
        relations: ['user', 'product'],
      });
    } catch (err) {
      console.error('Error fetching review:', err);
      return null;
    }
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review | null> {
    try {
      const review = await this.findOne(id);
      if (!review) return null;

      Object.assign(review, updateReviewDto);
      return await this.reviewRepository.save(review);
    } catch (err) {
      console.error('Error updating review:', err);
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const result = await this.reviewRepository.delete(id);
      return (result.affected || 0) > 0;
    } catch (err) {
      console.error('Error deleting review:', err);
      return false;
    }
  }

  async markHelpful(reviewId: string, markHelpfulDto: MarkHelpfulDto): Promise<boolean> {
    try {
      // Check if user already marked this review
      const existing = await this.reviewHelpfulnessRepository.findOne({
        where: {
          userId: markHelpfulDto.userId,
          reviewId: reviewId,
        },
      });

      if (existing) {
        // Update existing record
        existing.isHelpful = markHelpfulDto.isHelpful;
        await this.reviewHelpfulnessRepository.save(existing);
      } else {
        // Create new record
        const helpfulness = this.reviewHelpfulnessRepository.create({
          userId: markHelpfulDto.userId,
          reviewId: reviewId,
          isHelpful: markHelpfulDto.isHelpful,
        });
        await this.reviewHelpfulnessRepository.save(helpfulness);
      }

      // Update helpful count in review
      await this.updateHelpfulCount(reviewId);
      return true;
    } catch (err) {
      console.error('Error marking review helpful:', err);
      return false;
    }
  }

  async getProductRatingStats(productId: string): Promise<any> {
    try {
      const stats = await this.reviewRepository
        .createQueryBuilder('review')
        .select([
          'AVG(review.rating) as averageRating',
          'COUNT(review.id) as totalReviews',
          'COUNT(CASE WHEN review.rating = 5 THEN 1 END) as fiveStars',
          'COUNT(CASE WHEN review.rating = 4 THEN 1 END) as fourStars',
          'COUNT(CASE WHEN review.rating = 3 THEN 1 END) as threeStars',
          'COUNT(CASE WHEN review.rating = 2 THEN 1 END) as twoStars',
          'COUNT(CASE WHEN review.rating = 1 THEN 1 END) as oneStar',
        ])
        .where('review.productId = :productId', { productId })
        .andWhere('review.isApproved = :isApproved', { isApproved: true })
        .getRawOne();

      return {
        averageRating: parseFloat(stats.averageRating || '0'),
        totalReviews: parseInt(stats.totalReviews || '0'),
        ratingDistribution: {
          5: parseInt(stats.fiveStars || '0'),
          4: parseInt(stats.fourStars || '0'),
          3: parseInt(stats.threeStars || '0'),
          2: parseInt(stats.twoStars || '0'),
          1: parseInt(stats.oneStar || '0'),
        },
      };
    } catch (err) {
      console.error('Error getting product rating stats:', err);
      return null;
    }
  }

  async getUserReviews(userId: string, options: IPaginationOptions): Promise<Pagination<Review> | null> {
    try {
      const queryBuilder = this.reviewRepository.createQueryBuilder('review');
      queryBuilder.leftJoinAndSelect('review.product', 'product');
      queryBuilder.where('review.userId = :userId', { userId });
      queryBuilder.orderBy('review.createdAt', 'DESC');

      return await paginate<Review>(queryBuilder, options);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      return null;
    }
  }

  private async updateHelpfulCount(reviewId: string): Promise<void> {
    try {
      const count = await this.reviewHelpfulnessRepository.count({
        where: { reviewId, isHelpful: true },
      });

      await this.reviewRepository.update(reviewId, { helpfulCount: count });
    } catch (err) {
      console.error('Error updating helpful count:', err);
    }
  }
}
