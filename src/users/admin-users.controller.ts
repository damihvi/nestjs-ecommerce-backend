import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard, RequirePermissions, Permission } from '../common/guards/permissions.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from './user.entity';
import { 
  AdvancedUsersService, 
  CreateUserDto, 
  UpdateUserDto, 
  UserWithPermissions,
  UserStats
} from './advanced-users.service';
import { Role } from '../common/guards/permissions.guard';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminUsersController {
  constructor(private readonly advancedUsersService: AdvancedUsersService) {}

  // === OPERACIONES BÁSICAS ===

  @Get()
  @RequirePermissions(Permission.USERS_READ)
  async getAllUsers(): Promise<{ 
    statusCode: number; 
    message: string; 
    data: UserWithPermissions[] 
  }> {
    const users = await this.advancedUsersService.getAllUsers();
    return {
      statusCode: HttpStatus.OK,
      message: 'Usuarios obtenidos exitosamente',
      data: users
    };
  }

  @Get('stats')
  @RequirePermissions(Permission.USERS_READ, Permission.ANALYTICS_VIEW)
  async getUserStats(): Promise<{
    statusCode: number;
    message: string;
    data: UserStats;
  }> {
    const stats = await this.advancedUsersService.getUserStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Estadísticas de usuarios obtenidas exitosamente',
      data: stats
    };
  }

  @Get('search')
  @RequirePermissions(Permission.USERS_READ)
  async searchUsers(@Query('term') term: string): Promise<{
    statusCode: number;
    message: string;
    data: UserWithPermissions[];
  }> {
    if (!term || term.trim().length < 2) {
      throw new HttpException('El término de búsqueda debe tener al menos 2 caracteres', HttpStatus.BAD_REQUEST);
    }

    const users = await this.advancedUsersService.searchUsers(term);
    return {
      statusCode: HttpStatus.OK,
      message: 'Búsqueda completada exitosamente',
      data: users
    };
  }

  @Get('by-role/:role')
  @RequirePermissions(Permission.USERS_READ)
  async getUsersByRole(@Param('role') role: Role): Promise<{
    statusCode: number;
    message: string;
    data: UserWithPermissions[];
  }> {
    const users = await this.advancedUsersService.getUsersByRole(role);
    return {
      statusCode: HttpStatus.OK,
      message: `Usuarios con rol ${role} obtenidos exitosamente`,
      data: users
    };
  }

  @Get(':id')
  @RequirePermissions(Permission.USERS_READ)
  async getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<{
    statusCode: number;
    message: string;
    data: UserWithPermissions;
  }> {
    const user = await this.advancedUsersService.getUserById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Usuario obtenido exitosamente',
      data: user
    };
  }

  @Post()
  @RequirePermissions(Permission.USERS_UPDATE)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<{
    statusCode: number;
    message: string;
    data: UserWithPermissions;
  }> {
    const user = await this.advancedUsersService.createUser(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Usuario creado exitosamente',
      data: user
    };
  }

  @Put(':id')
  @RequirePermissions(Permission.USERS_UPDATE)
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<{
    statusCode: number;
    message: string;
    data: UserWithPermissions;
  }> {
    const user = await this.advancedUsersService.updateUser(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Usuario actualizado exitosamente',
      data: user
    };
  }

  @Delete(':id')
  @RequirePermissions(Permission.USERS_DELETE)
  async deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<{
    statusCode: number;
    message: string;
  }> {
    await this.advancedUsersService.deleteUser(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Usuario eliminado exitosamente'
    };
  }

  // === OPERACIONES AVANZADAS ===

  @Post('bulk-update')
  @RequirePermissions(Permission.USERS_UPDATE)
  async bulkUpdateUsers(@Body() updates: { id: string; data: UpdateUserDto }[]): Promise<{
    statusCode: number;
    message: string;
  }> {
    await this.advancedUsersService.bulkUpdateUsers(updates);
    return {
      statusCode: HttpStatus.OK,
      message: `${updates.length} usuarios actualizados exitosamente`
    };
  }

  @Post('bulk-delete')
  @RequirePermissions(Permission.USERS_DELETE)
  async bulkDeleteUsers(@Body() userIds: string[]): Promise<{
    statusCode: number;
    message: string;
  }> {
    await this.advancedUsersService.bulkDeleteUsers(userIds);
    return {
      statusCode: HttpStatus.OK,
      message: `${userIds.length} usuarios eliminados exitosamente`
    };
  }

  @Put(':id/role')
  @RequirePermissions(Permission.USERS_UPDATE)
  async changeUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { role }: { role: Role }
  ): Promise<{
    statusCode: number;
    message: string;
    data: UserWithPermissions;
  }> {
    const user = await this.advancedUsersService.changeUserRole(id, role);
    return {
      statusCode: HttpStatus.OK,
      message: 'Rol de usuario actualizado exitosamente',
      data: user
    };
  }

  @Put(':id/toggle-status')
  @RequirePermissions(Permission.USERS_UPDATE)
  async toggleUserStatus(@Param('id', ParseUUIDPipe) id: string): Promise<{
    statusCode: number;
    message: string;
    data: UserWithPermissions;
  }> {
    const user = await this.advancedUsersService.toggleUserStatus(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Estado de usuario actualizado exitosamente',
      data: user
    };
  }

  @Post(':id/reset-password')
  @RequirePermissions(Permission.USERS_UPDATE)
  async resetUserPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { newPassword }: { newPassword: string }
  ): Promise<{
    statusCode: number;
    message: string;
  }> {
    if (!newPassword || newPassword.length < 6) {
      throw new HttpException('La contraseña debe tener al menos 6 caracteres', HttpStatus.BAD_REQUEST);
    }

    await this.advancedUsersService.resetUserPassword(id, newPassword);
    return {
      statusCode: HttpStatus.OK,
      message: 'Contraseña restablecida exitosamente'
    };
  }

  // === UTILIDADES ===

  @Get(':id/permissions')
  @RequirePermissions(Permission.USERS_READ)
  async getUserPermissions(@Param('id', ParseUUIDPipe) id: string): Promise<{
    statusCode: number;
    message: string;
    data: Permission[];
  }> {
    const permissions = await this.advancedUsersService.getUserPermissions(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Permisos de usuario obtenidos exitosamente',
      data: permissions
    };
  }

  @Get(':id/has-permission/:permission')
  @RequirePermissions(Permission.USERS_READ)
  async userHasPermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permission') permission: Permission
  ): Promise<{
    statusCode: number;
    message: string;
    data: { hasPermission: boolean };
  }> {
    const hasPermission = await this.advancedUsersService.userHasPermission(id, permission);
    return {
      statusCode: HttpStatus.OK,
      message: 'Verificación de permisos completada',
      data: { hasPermission }
    };
  }

  @Get(':id/has-role/:role')
  @RequirePermissions(Permission.USERS_READ)
  async userHasRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('role') role: Role
  ): Promise<{
    statusCode: number;
    message: string;
    data: { hasRole: boolean };
  }> {
    const hasRole = await this.advancedUsersService.userHasRole(id, role);
    return {
      statusCode: HttpStatus.OK,
      message: 'Verificación de rol completada',
      data: { hasRole }
    };
  }
}
