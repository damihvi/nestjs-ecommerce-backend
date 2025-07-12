import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';

@Module({
  imports: [
    // PostgreSQL
    TypeOrmModule.forFeature([Product, Category]),
    // MongoDB schemas removed - using PostgreSQL only for products
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
