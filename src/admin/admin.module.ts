import { Module } from '@nestjs/common';
import { AdminCustomersController } from './admin-customers.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AdminCustomersController],
})
export class AdminModule {}
