import {
  Controller, Get, Post, Put, Delete,
  Param, Body, NotFoundException, BadRequestException,
  InternalServerErrorException, ConflictException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, LoginDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    try {
      const users = await this.usersService.findAll();
      return {
        success: true,
        data: users,
        count: users.length
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new NotFoundException(`User not found`);
      }
      return {
        success: true,
        data: user
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    if (!createUserDto.email || !createUserDto.name || !createUserDto.password) {
      throw new BadRequestException('Email, name and password are required');
    }
    if (createUserDto.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    try {
      const user = await this.usersService.create(createUserDto);
      return {
        success: true,
        data: user
      };
    } catch (error) {
      if (error.message === 'Email already exists') {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    if (!loginDto.email || !loginDto.password) {
      throw new BadRequestException('Email and password are required');
    }

    try {
      const user = await this.usersService.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }
      
      return {
        success: true,
        data: {
          user,
          token: 'simple-token-' + user.id
        }
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Login failed');
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      if (!user) {
        throw new NotFoundException(`User not found`);
      }
      return {
        success: true,
        data: user
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      const success = await this.usersService.delete(id);
      if (!success) {
        throw new NotFoundException(`User not found`);
      }
      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
