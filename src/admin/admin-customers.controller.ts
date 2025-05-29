import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllCustomers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('isActive') isActive?: boolean
  ) {
    const options = { page, limit };
    const customers = await this.usersService.findAll(options, isActive);
    
    if (!customers) {
      throw new BadRequestException('Failed to retrieve customers');
    }

    return new SuccessResponseDto('Customers retrieved successfully', customers);
  }

  @Get(':id')
  async getCustomer(@Param('id') id: string) {
    const customer = await this.usersService.findById(id);
      if (!customer) {
      throw new BadRequestException('Customer not found');
    }

    const { password, ...customerData } = customer;
    return new SuccessResponseDto('Customer retrieved successfully', customerData);
  }

  @Put(':id')
  async updateCustomer(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedCustomer = await this.usersService.update(id, updateUserDto);
      if (!updatedCustomer) {
      throw new BadRequestException('Failed to update customer');
    }

    const { password, ...customerData } = updatedCustomer;
    return new SuccessResponseDto('Customer updated successfully', customerData);
  }

  @Put(':id/activate')
  async activateCustomer(@Param('id') id: string) {
    const updatedCustomer = await this.usersService.update(id, { isActive: true });
    
    if (!updatedCustomer) {
      throw new BadRequestException('Failed to activate customer');
    }

    return new SuccessResponseDto('Customer activated successfully', null);
  }

  @Put(':id/deactivate')
  async deactivateCustomer(@Param('id') id: string) {
    const updatedCustomer = await this.usersService.update(id, { isActive: false });
    
    if (!updatedCustomer) {
      throw new BadRequestException('Failed to deactivate customer');
    }

    return new SuccessResponseDto('Customer deactivated successfully', null);
  }

  @Delete(':id')
  async deleteCustomer(@Param('id') id: string) {
    const deletedCustomer = await this.usersService.remove(id);
    
    if (!deletedCustomer) {
      throw new BadRequestException('Failed to delete customer');
    }

    return new SuccessResponseDto('Customer deleted successfully', null);
  }
}
