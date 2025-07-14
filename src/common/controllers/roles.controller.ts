import { Controller, Get } from '@nestjs/common';
import { SuccessResponseDto } from '../dto/response.dto';
import { UserRole, ROLE_DISPLAY_NAMES, ROLE_COLORS, ROLE_CAPABILITIES, ROLE_ROUTES } from '../types/roles';

@Controller('roles')
export class RolesController {
  @Get()
  async getAllRoles() {
    const roles = Object.values(UserRole).map(role => ({
      value: role,
      label: ROLE_DISPLAY_NAMES[role],
      color: ROLE_COLORS[role],
      capabilities: ROLE_CAPABILITIES[role],
      routes: ROLE_ROUTES[role]
    }));

    return new SuccessResponseDto('Roles retrieved successfully', roles);
  }

  @Get('capabilities')
  async getRoleCapabilities() {
    return new SuccessResponseDto('Role capabilities retrieved successfully', ROLE_CAPABILITIES);
  }

  @Get('routes')
  async getRoleRoutes() {
    return new SuccessResponseDto('Role routes retrieved successfully', ROLE_ROUTES);
  }
}
