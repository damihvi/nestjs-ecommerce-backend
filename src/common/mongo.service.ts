import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Analytics, AnalyticsDocument } from '../analytics/analytics.schema';
import { UserSession, UserSessionDocument } from '../auth/user-session.schema';
import { Log, LogDocument } from '../logs/log.schema';

@Injectable()
export class MongoService {
  constructor(
    @InjectModel(Analytics.name, 'mongodb')
    private analyticsModel: Model<AnalyticsDocument>,
    
    @InjectModel(UserSession.name, 'mongodb')
    private userSessionModel: Model<UserSessionDocument>,
    
    @InjectModel(Log.name, 'mongodb')
    private logModel: Model<LogDocument>,
  ) {}

  // Probar conexión a MongoDB
  async testConnection() {
    try {
      // Probar cada colección
      const [analyticsTest, sessionTest, logTest] = await Promise.all([
        this.analyticsModel.findOne().exec(),
        this.userSessionModel.findOne().exec(),
        this.logModel.findOne().exec(),
      ]);

      const counts = await Promise.all([
        this.analyticsModel.countDocuments().exec(),
        this.userSessionModel.countDocuments().exec(),
        this.logModel.countDocuments().exec(),
      ]);

      return {
        connectionStatus: 'successful',
        collections: {
          analytics: { count: counts[0], hasData: !!analyticsTest },
          sessions: { count: counts[1], hasData: !!sessionTest },
          logs: { count: counts[2], hasData: !!logTest },
        },
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`MongoDB connection test failed: ${error.message}`);
    }
  }

  // Crear evento analítico
  async createAnalyticsEvent(data: Partial<Analytics>) {
    const event = new this.analyticsModel(data);
    return event.save();
  }

  // Crear sesión de usuario
  async createUserSession(data: Partial<UserSession>) {
    const session = new this.userSessionModel(data);
    return session.save();
  }

  // Crear log
  async createLog(data: Partial<Log>) {
    const log = new this.logModel(data);
    return log.save();
  }

  // Obtener todas las colecciones (para verificar)
  async getAllCollections() {
    const [analytics, sessions, logs] = await Promise.all([
      this.analyticsModel.find().limit(10).exec(),
      this.userSessionModel.find().limit(10).exec(),
      this.logModel.find().limit(10).exec(),
    ]);

    return {
      analytics: analytics.length,
      sessions: sessions.length,
      logs: logs.length,
      data: {
        analytics,
        sessions,
        logs,
      }
    };
  }

  // Insertar datos de ejemplo
  async seedData() {
    // Analytics de ejemplo
    await this.createAnalyticsEvent({
      eventType: 'page_view',
      eventName: 'Home Page Visit',
      eventData: { page: '/home', referrer: 'google.com' },
      userId: 'user123',
      page: '/home',
      userAgent: 'Mozilla/5.0...',
      ip: '192.168.1.1',
    });

    // Sesión de ejemplo
    await this.createUserSession({
      sessionId: 'session_' + Date.now(),
      userId: 'user123',
      email: 'user@example.com',
      userAgent: 'Mozilla/5.0...',
      ip: '192.168.1.1',
      pageViews: 1,
      visitedPages: ['/home'],
      isActive: true,
    });

    // Log de ejemplo
    await this.createLog({
      level: 'info',
      message: 'User logged in successfully',
      metadata: { userId: 'user123', timestamp: new Date() },
      userId: 'user123',
      action: 'login',
      ip: '192.168.1.1',
    });

    return { message: 'Datos de ejemplo insertados correctamente' };
  }
}
