import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Hash simple usando btoa (más simple que crypto)
  private hashPassword(password: string): string {
    return Buffer.from(password + 'simple-salt').toString('base64');
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepo.find({
      select: ['id', 'email', 'name', 'firstName', 'lastName', 'role', 'isActive', 'phone', 'address', 'createdAt'],
      order: { createdAt: 'DESC' }
    });
    return users;
  }

  async findOne(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'firstName', 'lastName', 'role', 'isActive', 'phone', 'address', 'createdAt']
    });
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'> | null> {
    // Check if email exists
    const existingUser = await this.userRepo.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = this.hashPassword(createUserDto.password);
    
    const user = this.userRepo.create({
      ...createUserDto,
      password: hashedPassword,
      role: 'user'
    });

    const savedUser = await this.userRepo.save(user);
    
    // Return without password
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.isActive) return null;
    
    const hashedPassword = this.hashPassword(password);
    if (user.password === hashedPassword) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'> | null> {
    await this.userRepo.update(id, updateUserDto);
    return this.findOne(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepo.delete(id);
    return result.affected > 0;
  }
}
