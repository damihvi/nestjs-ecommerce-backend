import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmailOrUsername(email);
    
    if (!user || !user.isActive) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    // Return user without password
    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailOrUsername(loginDto.identifier);
    
    if (!user || !user.isActive) {
      return null;
    }

    const isValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isValid) {
      return null;
    }

    const payload = { 
      id: user.id, 
      username: user.username,
      email: user.email,
      role: user.role 
    };
    
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    if (!user) return null;

    const payload = { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      role: user.role
    };
    
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      return null;
    }
    
    const { password, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      return null;
    }

    const updatedUser = await this.usersService.updateUserProfile(userId, updateProfileDto);
    if (!updatedUser) {
      return null;
    }

    const { password, ...profile } = updatedUser;
    return profile;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) return false;

    const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return false;
    }

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersService.updatePassword(userId, hashedNewPassword);
    return true;
  }
}
