import {
  Controller, Get, Post, Put, Delete, Body, Param,
  Query, BadRequestException, NotFoundException,
  UseInterceptors, UploadedFile,
  InternalServerErrorException, UseGuards
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { User } from './user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard, RequirePermissions, Permission } from '../common/guards/permissions.guard';
import { AdminGuard } from '../admin/admin.guard';
import { GetUser } from '../auth/get-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('public')
  async create(@Body() dto: CreateUserDto) {
    try {
      const user = await this.usersService.create(dto);
      return new SuccessResponseDto('User created successfully', user);
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: 'Error creating user: ' + error.message,
        data: null
      };
    }
  }

  @Post('/admin')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async adminCreateUser(@Body() dto: CreateUserDto, @GetUser() currentUser: User) {
    const user = await this.usersService.create(dto);
    return new SuccessResponseDto('User created by admin successfully', user);
  }

  @Post('public-create')
  async createPublicUser(@Body() dto: CreateUserDto) {
    try {
      const user = await this.usersService.create(dto);
      return new SuccessResponseDto('User created successfully (public)', user);
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: 'Error creating user: ' + error.message,
        data: null
      };
    }
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('isActive') isActive?: string,
  ): Promise<any> {
    try {
      if (isActive !== undefined && isActive !== 'true' && isActive !== 'false') {
        throw new BadRequestException('Invalid value for "isActive". Use "true" or "false".');
      }
      
      // Usar la MISMA lógica exacta que el endpoint público
      const result = await this.usersService.findAll({ page: 1, limit: 100 });
      
      if (!result) {
        console.error('findAll returned null');
        throw new InternalServerErrorException('Could not retrieve users');
      }
      
      console.log('findAll result:', { 
        itemsLength: result.items?.length, 
        totalItems: result.meta?.totalItems 
      });
      
      // Aplicar paginación manual a los resultados
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedItems = result.items.slice(startIndex, endIndex);
      
      const response = {
        items: paginatedItems,
        meta: {
          totalItems: result.items.length,
          itemCount: paginatedItems.length,
          itemsPerPage: limitNum,
          totalPages: Math.ceil(result.items.length / limitNum),
          currentPage: pageNum
        }
      };

      return new SuccessResponseDto('Users retrieved successfully', response);
    } catch (error) {
      console.error('Error retrieving users:', error);
      return {
        success: false,
        message: 'Error retrieving users',
        data: null
      };
    }
  }

  @Get('public-list')
  async getPublicUsersList() {
    try {
      const users = await this.usersService.findAll({ page: 1, limit: 100 });
      return new SuccessResponseDto('Users retrieved successfully (public)', users);
    } catch (error) {
      console.error('Error retrieving users:', error);
      return {
        success: false,
        message: 'Error retrieving users',
        data: null
      };
    }
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.USERS_READ)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return new SuccessResponseDto('User retrieved successfully', user);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.USERS_UPDATE)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto, @GetUser() currentUser: User) {
    const user = await this.usersService.update(id, dto);
    if (!user) throw new NotFoundException('User not found');
    return new SuccessResponseDto('User updated successfully', user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @GetUser() currentUser: User) {
    const user = await this.usersService.remove(id);
    if (!user) throw new NotFoundException('User not found');
    return new SuccessResponseDto('User deleted successfully', user);
  }

  @Put(':id/profile')
  @UseInterceptors(FileInterceptor('profile', {
    storage: diskStorage({
      destination: './public/profile',
      filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Only JPG or PNG files are allowed'), false);
      }
      cb(null, true);
    }
  }))
  async uploadProfile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Profile image is required');
    const user = await this.usersService.updateProfile(id, file.filename);
    if (!user) throw new NotFoundException('User not found');
    return new SuccessResponseDto('Profile image updated', user);
  }

  @Get('/test-admin')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async testAdmin(@GetUser() currentUser: User) {
    return new SuccessResponseDto('Admin test successful', {
      user: currentUser,
      permissions: ['users:read', 'users:create', 'users:update', 'users:delete']
    });
  }

  @Get('/admin-info')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getAdminInfo(@GetUser() currentUser: User) {
    return new SuccessResponseDto('Admin info retrieved', {
      id: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      canCreateUsers: true,
      canModifyUsers: true,
      canDeleteUsers: true
    });
  }
}
