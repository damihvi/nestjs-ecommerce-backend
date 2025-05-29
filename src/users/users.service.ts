import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
  async create(dto: CreateUserDto): Promise<User | null> {
    try {
      // Hash password before saving
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const userData = {
        ...dto,
        password: hashedPassword
      };
      const user = this.userRepo.create(userData);
      return await this.userRepo.save(user);
    } catch (err) {
      console.error('Error creating user:', err);
      return null;
    }
  }

  async findAll(options: IPaginationOptions, isActive?: boolean): Promise<Pagination<User> | null> {
    try {
      const query = this.userRepo.createQueryBuilder('user');
      if (isActive !== undefined) {
        query.where('user.isActive = :isActive', { isActive });
      }
      return await paginate<User>(query, options);
    } catch (err) {
      console.error('Error retrieving users:', err);
      return null;
    }
  }

  async findOne(id: string): Promise<User | null> {
    try {
      return await this.userRepo.findOne({ where: { id } });
    } catch (err) {
      console.error('Error finding user:', err);
      return null;
    }
  }
  async findByUsername(username: string): Promise<User | null> {
    try {
      return await this.userRepo.findOne({ where: { username } });
    } catch (err) {
      console.error('Error finding user by username:', err);
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepo.findOne({ where: { email } });
    } catch (err) {
      console.error('Error finding user by email:', err);
      return null;
    }
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    try {
      return await this.userRepo.findOne({ 
        where: [
          { email: identifier },
          { username: identifier }
        ]
      });
    } catch (err) {
      console.error('Error finding user by email or username:', err);
      return null;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.userRepo.findOne({ where: { id } });
    } catch (err) {
      console.error('Error finding user by id:', err);
      return null;
    }  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    try {
      await this.userRepo.update(id, { password: hashedPassword });
    } catch (err) {
      console.error('Error updating password:', err);
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<User | null> {
    try {
      const user = await this.findOne(id);
      if (!user) return null;

      Object.assign(user, dto);
      return await this.userRepo.save(user);
    } catch (err) {
      console.error('Error updating user:', err);
      return null;
    }
  }

  async remove(id: string): Promise<User | null> {
    try {
      const user = await this.findOne(id);
      if (!user) return null;

      return await this.userRepo.remove(user);
    } catch (err) {
      console.error('Error deleting user:', err);
      return null;
    }
  }
  async updateProfile(id: string, filename: string): Promise<User | null> {
    try {
      const user = await this.findOne(id);
      if (!user) return null;

      user.profile = filename;
      return await this.userRepo.save(user);
    } catch (err) {
      console.error('Error updating user profile image:', err);
      return null;
    }
  }

  async updateUserProfile(id: string, updateData: any): Promise<User | null> {
    try {
      const user = await this.findById(id);
      if (!user) return null;

      Object.assign(user, updateData);
      return await this.userRepo.save(user);
    } catch (err) {
      console.error('Error updating user profile:', err);
      return null;
    }
  }
}
