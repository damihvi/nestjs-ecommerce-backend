import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { Log, LogSchema } from './log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Log.name, schema: LogSchema }
    ], 'mongodb'), // Especifica la conexión MongoDB
  ],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
