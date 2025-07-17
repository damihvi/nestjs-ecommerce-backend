import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  @Get('dashboard/stats')
  getDashboardStats() {
    // Implementar estadísticas del dashboard
  }

  @Get('dashboard/sales')
  getDashboardSales() {
    // Implementar estadísticas de ventas
  }

  @Get('dashboard/inventory')
  getDashboardInventory() {
    // Implementar estadísticas de inventario
  }
}
