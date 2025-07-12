import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdvancedUsersService } from './advanced-users.service';
import { User } from './user.entity';

@Module({
  imports: [
    // PostgreSQL
    TypeOrmModule.forFeature([User]),
    // MongoDB schemas removed - using PostgreSQL only for users
  ],
  controllers: [UsersController],
  providers: [UsersService, AdvancedUsersService],
  exports: [UsersService, AdvancedUsersService],
})
export class UsersModule {}
