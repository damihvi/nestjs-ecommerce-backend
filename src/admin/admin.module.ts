import { Module } from '@nestjs/common';
import { AdminCustomersController } from './admin-customers.controller';
import { AdminProductsController } from '../products/admin-products.controller';
import { AdminUsersController } from '../users/admin-users.controller';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [UsersModule, ProductsModule],
  controllers: [AdminCustomersController, AdminProductsController, AdminUsersController],
})
export class AdminModule {}
