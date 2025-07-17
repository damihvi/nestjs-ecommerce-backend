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
      console.log('No roles required for this route, allowing access');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;
    
    // Si no hay usuario en el request, verificar el header X-User-Roles
    if (!user?.roles) {
      const userRolesHeader = request.headers['x-user-roles'];
      if (!userRolesHeader) {
        console.log('No user roles found in request or headers');
        return false;
      }

      const userRoles = userRolesHeader.split(',')
        .map(role => role.trim())
        .filter(role => role !== '')
        .filter(role => Object.values(UserRole).includes(role as UserRole));

      if (userRoles.length === 0) {
        console.log('No valid user roles found in header');
        return false;
      }

      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      console.log(`User roles from header: ${userRoles.join(', ')}`);
      console.log(`Required roles: ${requiredRoles.join(', ')}`);
      console.log(`Access ${hasRequiredRole ? 'granted' : 'denied'}`);
      return hasRequiredRole;
    }
    
    // Si hay usuario en el request, verificar sus roles
    const hasRequiredRole = requiredRoles.some(role => user.roles?.includes(role));
    console.log(`User roles from session: ${user.roles?.join(', ')}`);
    console.log(`Required roles: ${requiredRoles.join(', ')}`);
    console.log(`Access ${hasRequiredRole ? 'granted' : 'denied'}`);
    return hasRequiredRole;
  }
}
