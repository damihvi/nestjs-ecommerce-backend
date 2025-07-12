import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { DashboardModule } from './dashboard/dashboard.module';
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
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EmailModule } from './email/email.module';
import { FilesModule } from './files/files.module';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [    
    ConfigModule.forRoot({ isGlobal: true }),
    
    // PostgreSQL Connection
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || undefined,
      host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
      port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
      password: process.env.DATABASE_URL ? undefined : process.env.DB_PASS,
      database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      retryAttempts: 10,
      retryDelay: 5000,
      autoLoadEntities: true,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
      extra: {
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 20000,
      },
    }),
    
    // MongoDB Atlas Connection - For analytics, logs, sessions, and flexible data
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb+srv://damianherrera:Monchomix@clustermongoute.xtmuqtk.mongodb.net/ecommerce?retryWrites=true&w=majority',
      {
        connectionName: 'mongodb',
        serverApi: { 
          version: '1', 
          strict: true, 
          deprecationErrors: true 
        },
        dbName: 'ecommerce',
      }
    ),
    CommonModule,
    DashboardModule,
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
    NotificationsModule,
    AnalyticsModule,
    EmailModule,
    FilesModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}