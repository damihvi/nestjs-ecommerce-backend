import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '../users/users.service';

export interface LoginDto {
  identifier: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.usersService.validateUser(loginDto.identifier, loginDto.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    return {
      success: true,
      data: {
        token: 'simple-token-' + user.id,
        user: user
      }
    };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.create({
      name: registerDto.username,
      email: registerDto.email,
      password: registerDto.password
    });

    return {
      success: true,
      data: {
        token: 'simple-token-' + user.id,
        user: user
      }
    };
  }
}
