import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './seed/seed.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { CouponsModule } from './coupons/coupons.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      retryAttempts: 10,
      retryDelay: 5000,
      autoLoadEntities: true,
      ssl: { rejectUnauthorized: false },
      extra: {
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 20000,
      },
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    AdminModule,
    SeedModule,
    OrdersModule,
    CartModule,
    ReviewsModule,
    WishlistsModule,
    CouponsModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}