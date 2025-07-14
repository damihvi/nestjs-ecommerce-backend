import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoService } from './mongo.service';
import { MongoController } from './mongo.controller';
import { HybridService } from './hybrid.service';
import { HybridController } from './hybrid.controller';
import { RolesController } from './controllers/roles.controller';
import { Analytics, AnalyticsSchema } from '../schemas/analytics.schema';
import { UserSession, UserSessionSchema } from '../schemas/user-session.schema';
import { User as UserEntity } from '../users/user.entity';
import { Product as ProductEntity } from '../products/product.entity';
import { Order as OrderEntity } from '../orders/order.entity';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // PostgreSQL entities
    TypeOrmModule.forFeature([UserEntity, ProductEntity, OrderEntity]),
    // MongoDB schemas - only complementary schemas
    MongooseModule.forFeature([
      { name: Analytics.name, schema: AnalyticsSchema },
      { name: UserSession.name, schema: UserSessionSchema },
    ], 'mongodb'),
  ],
  controllers: [MongoController, HybridController, RolesController],
  providers: [MongoService, HybridService],
  exports: [ConfigModule, MongoService, HybridService],
})
export class CommonModule {}
