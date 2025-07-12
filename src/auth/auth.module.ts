import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionLocalStrategy } from './session-local.strategy';
import { SessionSerializer } from './session.serializer';
import { UserSession, UserSessionSchema } from '../schemas/user-session.schema';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: true }),
    ConfigModule.forRoot(),
    // MongoDB para sesiones de usuario
    MongooseModule.forFeature([
      { name: UserSession.name, schema: UserSessionSchema }
    ], 'mongodb'),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionLocalStrategy, SessionSerializer],
  exports: [AuthService],
})
export class AuthModule {}
