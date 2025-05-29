import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './review.entity';
import { ReviewHelpfulness } from './review-helpfulness.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewHelpfulness, Product, User, Order, OrderItem])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
