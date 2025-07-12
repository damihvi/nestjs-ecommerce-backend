import { Controller, Get, Post, Body, Query, Delete } from '@nestjs/common';
import { LogsService } from './logs.service';
import { Log } from './log.schema';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  async createLog(@Body() logData: Partial<Log>): Promise<Log> {
    return this.logsService.createLog(logData);
  }

  @Get()
  async getLogs(
    @Query('level') level?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
  ): Promise<Log[]> {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    
    if (level) {
      return this.logsService.findLogsByLevel(level, limitNum);
    }
    
    if (userId) {
      return this.logsService.findLogsByUserId(userId, limitNum);
    }
    
    return this.logsService.findLogs({}, limitNum);
  }

  @Get('stats')
  async getLogsStats(): Promise<any> {
    return this.logsService.getLogsStats();
  }

  @Delete()
  async deleteLogs(
    @Query('level') level?: string,
    @Query('userId') userId?: string,
  ): Promise<any> {
    const filter: any = {};
    
    if (level) filter.level = level;
    if (userId) filter.userId = userId;
    
    return this.logsService.deleteLogs(filter);
  }
}
