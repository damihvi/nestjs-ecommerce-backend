import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRole } from '../types/roles';

export enum Permission {
  // Productos
  PRODUCTS_CREATE = 'products:create',
  PRODUCTS_READ = 'products:read',
  PRODUCTS_UPDATE = 'products:update',
  PRODUCTS_DELETE = 'products:delete',
  PRODUCTS_BULK_OPERATIONS = 'products:bulk',
  
  // Inventario
  INVENTORY_READ = 'inventory:read',
  INVENTORY_UPDATE = 'inventory:update',
  INVENTORY_REPORTS = 'inventory:reports',
  
  // Analytics
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_ADVANCED = 'analytics:advanced',
  
  // Usuarios
  USERS_READ = 'users:read',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',
  
  // Sistema
  SYSTEM_CONFIG = 'system:config',
  SYSTEM_LOGS = 'system:logs',
  
  // Ventas
  SALES_READ = 'sales:read',
  SALES_REPORTS = 'sales:reports',
  
  // Categorías
  CATEGORIES_CREATE = 'categories:create',
  CATEGORIES_UPDATE = 'categories:update',
  CATEGORIES_DELETE = 'categories:delete',
  
  // Cupones
  COUPONS_CREATE = 'coupons:create',
  COUPONS_UPDATE = 'coupons:update',
  COUPONS_DELETE = 'coupons:delete',
}

export enum Role {
  ADMIN = 'admin',
  SELLER = 'seller',
  CUSTOMER = 'customer',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Acceso total a todo
    Permission.PRODUCTS_CREATE,
    Permission.PRODUCTS_READ,
    Permission.PRODUCTS_UPDATE,
    Permission.PRODUCTS_DELETE,
    Permission.PRODUCTS_BULK_OPERATIONS,
    Permission.INVENTORY_READ,
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_REPORTS,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_ADVANCED,
    Permission.USERS_READ,
    Permission.USERS_UPDATE,
    Permission.USERS_DELETE,
    Permission.SYSTEM_CONFIG,
    Permission.SYSTEM_LOGS,
    Permission.SALES_READ,
    Permission.SALES_REPORTS,
    Permission.CATEGORIES_CREATE,
    Permission.CATEGORIES_UPDATE,
    Permission.CATEGORIES_DELETE,
    Permission.COUPONS_CREATE,
    Permission.COUPONS_UPDATE,
    Permission.COUPONS_DELETE,
  ],
  [Role.SELLER]: [
    // Gestión de productos e inventario (como vendedor)
    Permission.PRODUCTS_CREATE,
    Permission.PRODUCTS_READ,
    Permission.PRODUCTS_UPDATE,
    Permission.PRODUCTS_DELETE,
    Permission.INVENTORY_READ,
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_REPORTS,
    Permission.ANALYTICS_VIEW,
    Permission.SALES_READ,
    Permission.SALES_REPORTS,
    Permission.CATEGORIES_CREATE,
    Permission.CATEGORIES_UPDATE,
    Permission.COUPONS_CREATE,
    Permission.COUPONS_UPDATE,
  ],
  [Role.CUSTOMER]: [
    // Solo lectura de productos
    Permission.PRODUCTS_READ,
  ],
};

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: Permission[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PERMISSIONS_KEY, permissions, descriptor.value);
    return descriptor;
  };
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions) {
      return true; // No hay permisos requeridos
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Obtener permisos del usuario basado en su rol
    const userPermissions = ROLE_PERMISSIONS[user.role as Role] || [];

    // Verificar si el usuario tiene todos los permisos requeridos
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Acceso denegado. Permisos requeridos: ${requiredPermissions.join(', ')}`
      );
    }

    return true;
  }
}
