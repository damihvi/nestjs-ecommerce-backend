import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  
  getHello(): string {
    return 'Hello World! - eCommerce API está funcionando correctamente ✅';
  }

  async getHealthStatus() {
    const timestamp = new Date().toISOString();
    const environment = process.env.NODE_ENV || 'development';
    const port = process.env.PORT || 3101;

    try {
      // Verificar memoria
      const memoryUsage = process.memoryUsage();
      const memoryMB = {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      };

      const uptime = process.uptime();
      const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

      return {
        status: 'healthy',
        timestamp,
        environment,
        port,
        uptime: uptimeFormatted,
        uptimeSeconds: uptime,
        memory: memoryMB,
        database: {
          status: 'connected'
        },
        version: process.version,
        platform: process.platform,
        arch: process.arch
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp,
        environment,
        port,
        error: error.message,
        database: {
          status: 'error'
        }
      };
    }
  }
}
