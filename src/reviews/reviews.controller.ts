import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto, MarkHelpfulDto } from './dto/review.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
    const review = await this.reviewsService.create(createReviewDto);
    if (!review) {
      throw new BadRequestException('Failed to create review. User may have already reviewed this product.');
    }
    return new SuccessResponseDto('Review created successfully', review);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('productId') productId?: string,
    @Query('rating') rating?: string,
    @Query('isApproved') isApproved?: string,
    @Query('isVerifiedPurchase') isVerifiedPurchase?: string,
  ) {
    const ratingNum = rating ? parseInt(rating) : undefined;
    const isApprovedBool = isApproved === 'false' ? false : isApproved === 'true' ? true : undefined;
    const isVerifiedBool = isVerifiedPurchase === 'false' ? false : isVerifiedPurchase === 'true' ? true : undefined;

    const result = await this.reviewsService.findAll(
      { page, limit },
      productId,
      ratingNum,
      isApprovedBool,
      isVerifiedBool
    );

    if (!result) {
      throw new InternalServerErrorException('Could not retrieve reviews');
    }

    return new SuccessResponseDto('Reviews retrieved successfully', result);
  }

  @Get('product/:productId/stats')
  async getProductRatingStats(@Param('productId') productId: string) {
    const stats = await this.reviewsService.getProductRatingStats(productId);
    if (!stats) {
      throw new InternalServerErrorException('Could not retrieve product rating statistics');
    }
    return new SuccessResponseDto('Product rating statistics retrieved successfully', stats);
  }

  @Get('user/:userId')
  async getUserReviews(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const result = await this.reviewsService.getUserReviews(userId, { page, limit });
    if (!result) {
      throw new InternalServerErrorException('Could not retrieve user reviews');
    }
    return new SuccessResponseDto('User reviews retrieved successfully', result);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const review = await this.reviewsService.findOne(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return new SuccessResponseDto('Review retrieved successfully', review);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    const review = await this.reviewsService.update(id, updateReviewDto);
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return new SuccessResponseDto('Review updated successfully', review);
  }

  @Put(':id/helpful')
  async markHelpful(@Param('id') id: string, @Body() markHelpfulDto: MarkHelpfulDto) {
    const success = await this.reviewsService.markHelpful(id, markHelpfulDto);
    if (!success) {
      throw new BadRequestException('Failed to mark review as helpful');
    }
    return new SuccessResponseDto('Review helpfulness updated successfully', null);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const success = await this.reviewsService.remove(id);
    if (!success) {
      throw new NotFoundException('Review not found');
    }
    return new SuccessResponseDto('Review deleted successfully', null);
  }
}
