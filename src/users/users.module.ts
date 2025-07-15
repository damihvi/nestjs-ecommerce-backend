import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdvancedUsersService } from './advanced-users.service';
import { User } from './user.entity';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@Module({
  imports: [
    // PostgreSQL
    TypeOrmModule.forFeature([User]),
    // JWT module for authentication
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, AdvancedUsersService, PermissionsGuard],
  exports: [UsersService, AdvancedUsersService],
})
export class UsersModule {}
