import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './user.entity';
import { Role, Permission, ROLE_PERMISSIONS } from '../common/guards/permissions.guard';
import * as bcrypt from 'bcrypt';

// Mapeo entre UserRole y Role
const ROLE_MAPPING = {
  [UserRole.ADMIN]: Role.ADMIN,
  [UserRole.CUSTOMER]: Role.CUSTOMER,
  [UserRole.SELLER]: Role.MANAGER, // Seller se mapea a Manager
};

const REVERSE_ROLE_MAPPING = {
  [Role.ADMIN]: UserRole.ADMIN,
  [Role.CUSTOMER]: UserRole.CUSTOMER,
  [Role.MANAGER]: UserRole.SELLER,
  [Role.EMPLOYEE]: UserRole.SELLER, // Employee se mapea a Seller
};

export interface UserWithPermissions extends User {
  permissions: Permission[];
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<Role, number>;
  recentRegistrations: number;
  lastLoginStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role: Role;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  role?: Role;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

@Injectable()
export class AdvancedUsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // === OPERACIONES BÁSICAS ===
  
  async getAllUsers(): Promise<UserWithPermissions[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' }
    });
    
    return users.map(user => ({
      ...user,
      permissions: ROLE_PERMISSIONS[ROLE_MAPPING[user.role]] || []
    }));
  }

  async getUserById(id: string): Promise<UserWithPermissions> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return {
      ...user,
      permissions: ROLE_PERMISSIONS[ROLE_MAPPING[user.role]] || []
    };
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserWithPermissions> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('El email ya está en uso');
    }

    // Verificar si el username ya existe
    const existingUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username }
    });

    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Convertir el rol del DTO al UserRole de la entidad
    const userRole = REVERSE_ROLE_MAPPING[createUserDto.role] || UserRole.CUSTOMER;

    const user = this.userRepository.create({
      ...createUserDto,
      role: userRole,
      password: hashedPassword,
      isActive: createUserDto.isActive ?? true,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      ...savedUser,
      permissions: ROLE_PERMISSIONS[createUserDto.role] || []
    };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserWithPermissions> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Verificar email único si se está actualizando
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email }
      });

      if (existingUser) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    // Verificar username único si se está actualizando
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: updateUserDto.username }
      });

      if (existingUsername) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }
    }

    // Convertir el rol si se está actualizando
    const updateData: any = { ...updateUserDto };
    if (updateUserDto.role) {
      updateData.role = REVERSE_ROLE_MAPPING[updateUserDto.role] || UserRole.CUSTOMER;
    }

    await this.userRepository.update(id, updateData);
    const updatedUser = await this.userRepository.findOne({ where: { id } });

    return {
      ...updatedUser!,
      permissions: ROLE_PERMISSIONS[ROLE_MAPPING[updatedUser!.role]] || []
    };
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // No permitir eliminar el último admin
    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.userRepository.count({
        where: { role: UserRole.ADMIN }
      });

      if (adminCount <= 1) {
        throw new BadRequestException('No se puede eliminar el último administrador');
      }
    }

    await this.userRepository.delete(id);
  }

  // === OPERACIONES AVANZADAS DE ADMIN ===

  async getUserStats(): Promise<UserStats> {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { isActive: true }
    });

    // Contar usuarios por rol
    const usersByRole = {} as Record<Role, number>;
    for (const role of Object.values(Role)) {
      const userRole = REVERSE_ROLE_MAPPING[role];
      if (userRole) {
        usersByRole[role] = await this.userRepository.count({
          where: { role: userRole }
        });
      } else {
        usersByRole[role] = 0;
      }
    }

    // Registros recientes (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await this.userRepository.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        } as any
      }
    });

    // Estadísticas de último login (simuladas por ahora)
    const lastLoginStats = {
      today: Math.floor(activeUsers * 0.1),
      thisWeek: Math.floor(activeUsers * 0.3),
      thisMonth: Math.floor(activeUsers * 0.6),
    };

    return {
      totalUsers,
      activeUsers,
      usersByRole,
      recentRegistrations,
      lastLoginStats
    };
  }

  async bulkUpdateUsers(updates: { id: string; data: UpdateUserDto }[]): Promise<void> {
    const updatePromises = updates.map(({ id, data }) => 
      this.updateUser(id, data)
    );

    await Promise.all(updatePromises);
  }

  async bulkDeleteUsers(ids: string[]): Promise<void> {
    // Verificar que no se eliminen todos los admins
    const adminUsers = await this.userRepository.find({
      where: { role: UserRole.ADMIN },
      select: ['id']
    });

    const adminIds = adminUsers.map(u => u.id);
    const adminsToDelete = ids.filter(id => adminIds.includes(id));

    if (adminsToDelete.length >= adminIds.length) {
      throw new BadRequestException('No se puede eliminar a todos los administradores');
    }

    await this.userRepository.delete(ids);
  }

  async changeUserRole(userId: string, newRole: Role): Promise<UserWithPermissions> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Verificar que no se quite el rol de admin al último admin
    if (user.role === UserRole.ADMIN && newRole !== Role.ADMIN) {
      const adminCount = await this.userRepository.count({
        where: { role: UserRole.ADMIN }
      });

      if (adminCount <= 1) {
        throw new BadRequestException('No se puede quitar el rol de administrador al último admin');
      }
    }

    const userRole = REVERSE_ROLE_MAPPING[newRole] || UserRole.CUSTOMER;
    await this.userRepository.update(userId, { role: userRole });
    const updatedUser = await this.userRepository.findOne({ where: { id: userId } });

    return {
      ...updatedUser!,
      permissions: ROLE_PERMISSIONS[newRole] || []
    };
  }

  async toggleUserStatus(userId: string): Promise<UserWithPermissions> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    await this.userRepository.update(userId, { isActive: !user.isActive });
    const updatedUser = await this.userRepository.findOne({ where: { id: userId } });

    return {
      ...updatedUser!,
      permissions: ROLE_PERMISSIONS[ROLE_MAPPING[updatedUser!.role]] || []
    };
  }

  async searchUsers(term: string): Promise<UserWithPermissions[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username ILIKE :term', { term: `%${term}%` })
      .orWhere('user.email ILIKE :term', { term: `%${term}%` })
      .orWhere('user.firstName ILIKE :term', { term: `%${term}%` })
      .orWhere('user.lastName ILIKE :term', { term: `%${term}%` })
      .orderBy('user.createdAt', 'DESC')
      .getMany();

    return users.map(user => ({
      ...user,
      permissions: ROLE_PERMISSIONS[ROLE_MAPPING[user.role]] || []
    }));
  }

  async getUsersByRole(role: Role): Promise<UserWithPermissions[]> {
    const userRole = REVERSE_ROLE_MAPPING[role];
    if (!userRole) {
      return [];
    }

    const users = await this.userRepository.find({
      where: { role: userRole },
      order: { createdAt: 'DESC' }
    });

    return users.map(user => ({
      ...user,
      permissions: ROLE_PERMISSIONS[role] || []
    }));
  }

  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  // === UTILIDADES ===

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    return ROLE_PERMISSIONS[ROLE_MAPPING[user.role]] || [];
  }

  async userHasPermission(userId: string, permission: Permission): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  async userHasRole(userId: string, role: Role): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user ? ROLE_MAPPING[user.role] === role : false;
  }
}
