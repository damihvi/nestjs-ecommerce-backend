import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Put,
  Param
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { LocalSessionAuthGuard } from './local-session.guard';
import { SessionAuthGuard } from './session-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    if (!result) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return new SuccessResponseDto('Login successful', result);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const result = await this.authService.register(createUserDto);
    if (!result) {
      throw new BadRequestException('Failed to register user');
    }
    return new SuccessResponseDto('Registration successful', result);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return new SuccessResponseDto('Logout successful', null);
  }

  // Session-based authentication endpoints
  @Post('session/login')
  @UseGuards(LocalSessionAuthGuard)
  @HttpCode(HttpStatus.OK)
  async sessionLogin(@Request() req) {
    return new SuccessResponseDto('Session login successful', {
      user: req.user
    });
  }

  @Post('session/logout')
  @UseGuards(SessionAuthGuard)
  @HttpCode(HttpStatus.OK)
  async sessionLogout(@Request() req) {
    req.logout((err) => {
      if (err) {
        throw new BadRequestException('Logout failed');
      }
    });
    return new SuccessResponseDto('Session logout successful', null);
  }

  @Get('session/profile')
  @UseGuards(SessionAuthGuard)
  async getSessionProfile(@Request() req) {
    return new SuccessResponseDto('Session profile retrieved successfully', {
      user: req.user
    });
  }

  @Get('profile/:userId')
  async getProfile(@Param('userId') userId: string) {
    const user = await this.authService.getProfile(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return new SuccessResponseDto('Profile retrieved successfully', user);
  }

  @Put('profile/:userId')
  async updateProfile(@Param('userId') userId: string, @Body() updateProfileDto: UpdateProfileDto) {
    const result = await this.authService.updateProfile(userId, updateProfileDto);
    if (!result) {
      throw new BadRequestException('Failed to update profile');
    }
    return new SuccessResponseDto('Profile updated successfully', result);
  }

  @Post('change-password/:userId')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Param('userId') userId: string, @Body() changePasswordDto: ChangePasswordDto) {
    const result = await this.authService.changePassword(userId, changePasswordDto);
    if (!result) {
      throw new BadRequestException('Invalid current password or failed to change password');
    }
    return new SuccessResponseDto('Password changed successfully', null);
  }
}
