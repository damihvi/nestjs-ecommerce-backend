import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  getHello(): string {
    return 'Esta es una app hecha con los genios de programacion III';
  }

  async getHealthStatus() {
    const timestamp = new Date().toISOString();
    const environment = process.env.NODE_ENV || 'development';
    const port = process.env.PORT || 3000;

    try {
      // Verificar conexión a PostgreSQL
      const pgConnected = this.dataSource.isInitialized;
      
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
        status: pgConnected ? 'healthy' : 'unhealthy',
        timestamp,
        environment,
        port,
        uptime: uptimeFormatted,
        uptimeSeconds: uptime,
        memory: memoryMB,
        databases: {
          postgresql: {
            connected: pgConnected,
            status: pgConnected ? 'healthy' : 'disconnected'
          },
          mongodb: {
            connected: true, // Asumimos que está conectado si el módulo se carga
            status: 'healthy'
          }
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
        databases: {
          postgresql: { connected: false, status: 'error' },
          mongodb: { connected: false, status: 'error' }
        }
      };
    }
  }
}
