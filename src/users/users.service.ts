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
      const page = Number(options.page) || 1;
      const limit = Number(options.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Usar find simple para debug
      const [items, total] = await this.userRepo.findAndCount({
        order: { createdAt: 'DESC' },
        skip: skip,
        take: limit
      });
      
      return {
        items,
        meta: {
          totalItems: total,
          itemCount: items.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page
        }
      };
    } catch (err) {
      console.error('Error retrieving users:', err);
      return null;
    }
  }

  async findAllDebug(): Promise<User[]> {
    try {
      return await this.userRepo.find({
        order: {
          createdAt: 'DESC'
        }
      });
    } catch (err) {
      console.error('Error retrieving debug users:', err);
      return [];
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

  async countUsers(): Promise<number> {
    try {
      return await this.userRepo.count();
    } catch (err) {
      console.error('Error counting users:', err);
      return 0;
    }
  }
}
