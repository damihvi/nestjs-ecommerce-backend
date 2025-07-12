import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from './log.schema';

@Injectable()
export class LogsService {
  constructor(
    @InjectModel(Log.name, 'mongodb') private logModel: Model<LogDocument>,
  ) {}

  async createLog(logData: Partial<Log>): Promise<Log> {
    const log = new this.logModel(logData);
    return log.save();
  }

  async findLogs(filter: any = {}, limit: number = 100): Promise<Log[]> {
    return this.logModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async findLogsByUserId(userId: string, limit: number = 50): Promise<Log[]> {
    return this.logModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async findLogsByLevel(level: string, limit: number = 100): Promise<Log[]> {
    return this.logModel
      .find({ level })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async deleteLogs(filter: any): Promise<any> {
    return this.logModel.deleteMany(filter).exec();
  }

  async getLogsStats(): Promise<any> {
    return this.logModel.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
          latestLog: { $max: '$timestamp' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).exec();
  }
}
