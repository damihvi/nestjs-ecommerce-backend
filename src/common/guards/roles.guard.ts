import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Si no hay roles requeridos, permitir acceso
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;
    
    // Si no hay usuario en el request, verificar el header X-User-Roles
    if (!user?.roles) {
      const userRoles = request.headers['x-user-roles']?.split(',') || [];
      return requiredRoles.some((role) => userRoles.includes(role));
    }
    
    // Si hay usuario en el request, verificar sus roles
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
