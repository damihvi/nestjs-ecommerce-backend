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
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/user.entity';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createCouponDto: CreateCouponDto) {
    const coupon = await this.couponsService.create(createCouponDto);
    if (!coupon) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Coupon code already exists',
      };
    }
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Coupon created successfully',
      data: coupon,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
  ) {
    const options = {
      page,
      limit,
      route: '/coupons',
    };

    const filters = {
      type: type || undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    };

    const coupons = await this.couponsService.findAll(options, filters);
    return {
      statusCode: HttpStatus.OK,
      message: 'Coupons retrieved successfully',
      data: coupons,
    };
  }

  @Get('active')
  async findActive(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const options = {
      page,
      limit,
      route: '/coupons/active',
    };

    const coupons = await this.couponsService.findActiveCoupons(options);
    return {
      statusCode: HttpStatus.OK,
      message: 'Active coupons retrieved successfully',
      data: coupons,
    };
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  async validateCoupon(
    @Body() validateCouponDto: ValidateCouponDto,
    @GetUser() user: User,
  ) {
    const result = await this.couponsService.validateCoupon(
      validateCouponDto.code,
      user.id,
      validateCouponDto.orderTotal,
      validateCouponDto.orderItems || [],
    );

    return {
      statusCode: result.isValid ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
      message: result.isValid ? 'Coupon is valid' : result.reason,
      data: result,
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getCouponStats() {
    const stats = await this.couponsService.getCouponStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Coupon statistics retrieved successfully',
      data: stats,
    };
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findOne(@Param('id') id: string) {
    const coupon = await this.couponsService.findOne(id);
    if (!coupon) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Coupon not found',
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Coupon retrieved successfully',
      data: coupon,
    };
  }

  @Get('code/:code')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findByCode(@Param('code') code: string) {
    const coupon = await this.couponsService.findByCode(code);
    if (!coupon) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Coupon not found',
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Coupon retrieved successfully',
      data: coupon,
    };
  }
  @Get(':id/usage')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getCouponUsage(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const options = {
      page,
      limit,
      route: `/coupons/${id}/usage`,
    };

    const usage = await this.couponsService.getCouponUsages(id, options);
    return {
      statusCode: HttpStatus.OK,
      message: 'Coupon usage retrieved successfully',
      data: usage,
    };
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    const coupon = await this.couponsService.update(id, updateCouponDto);
    if (!coupon) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Coupon not found',
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Coupon updated successfully',
      data: coupon,
    };
  }
  @Put(':id/toggle-status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async toggleStatus(@Param('id') id: string) {
    const coupon = await this.couponsService.toggleStatus(id);
    if (!coupon) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Coupon not found',
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      data: coupon,
    };
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string) {
    const success = await this.couponsService.remove(id);
    if (!success) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Coupon not found',
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Coupon deleted successfully',
    };
  }
}
