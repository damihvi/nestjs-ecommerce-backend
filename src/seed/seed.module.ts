import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Product } from '../products/product.entity';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Category, Product]),
    // MongoDB schemas removed - using PostgreSQL only for seed data
  ],
  controllers: [SeedController],
  providers: [SeedService, UsersService, CategoriesService, ProductsService],
  exports: [SeedService],
})
export class SeedModule {}