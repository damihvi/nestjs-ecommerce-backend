import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReviewAdvancedService } from './review-advanced.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('reviews-advanced')
export class ReviewAdvancedController {
  constructor(private readonly reviewAdvancedService: ReviewAdvancedService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReview(@Body() reviewData: any, @GetUser() user: any) {
    return this.reviewAdvancedService.createReview({
      ...reviewData,
      userId: user.id,
      userName: user.firstName + ' ' + user.lastName
    });
  }

  @Get('product/:productId')
  async getProductReviews(
    @Param('productId') productId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    return this.reviewAdvancedService.getProductReviews(productId, {
      page: pageNumber,
      limit: limitNumber
    });
  }

  @Get('product/:productId/stats')
  async getProductRatingStats(@Param('productId') productId: string) {
    return this.reviewAdvancedService.getProductRatingStats(productId);
  }

  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  async markHelpful(@Param('id') reviewId: string, @GetUser() user: any) {
    return this.reviewAdvancedService.markHelpful(reviewId, user.id);
  }

  @Post(':id/response')
  @UseGuards(JwtAuthGuard)
  async addResponse(
    @Param('id') reviewId: string,
    @Body() responseData: { message: string },
    @GetUser() user: any
  ) {
    return this.reviewAdvancedService.addResponse(reviewId, {
      userName: user.name || 'Anonymous',
      userId: user.id,
      comment: responseData.message,
    });
  }

  @Get('user/my-reviews')
  @UseGuards(JwtAuthGuard)
  async getUserReviews(
    @GetUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    return this.reviewAdvancedService.getUserReviews(user.id, {
      page: pageNumber,
      limit: limitNumber
    });
  }

  @Get('top')
  async getTopReviews(@Query('limit') limit: string = '10') {
    const limitNumber = Number(limit) || 10;
    return this.reviewAdvancedService.getTopReviews(limitNumber);
  }

  @Get('analytics')
  async getReviewAnalytics() {
    return this.reviewAdvancedService.getReviewAnalytics();
  }

  @Post(':id/moderate')
  @UseGuards(JwtAuthGuard)
  async moderateReview(
    @Param('id') reviewId: string,
    @Body() moderationData: { action: 'approve' | 'reject', notes?: string }
  ) {
    return this.reviewAdvancedService.moderateReview(
      reviewId, 
      moderationData.action, 
      moderationData.notes || 'No notes provided'
    );
  }
}
