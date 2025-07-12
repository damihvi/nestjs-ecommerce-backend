import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { Order } from '../orders/order.entity';
import { Analytics, AnalyticsDocument } from '../schemas/analytics.schema';
import { UserSession, UserSessionDocument } from '../schemas/user-session.schema';
import { Log, LogDocument } from '../schemas/log.schema';

@Injectable()
export class HybridService {
  constructor(
    // PostgreSQL repositories
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    
    // MongoDB models - only complementary schemas
    @InjectModel(Analytics.name, 'mongodb')
    private analyticsModel: Model<AnalyticsDocument>,
    @InjectModel(UserSession.name, 'mongodb')
    private userSessionModel: Model<UserSessionDocument>,
    @InjectModel(Log.name, 'mongodb')
    private logModel: Model<LogDocument>,
  ) {}

  // Crear usuario en PostgreSQL y sesión en MongoDB
  async createUser(userData: any) {
    try {
      // Crear usuario en PostgreSQL
      const pgUser = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(pgUser);
      
      // Asegurarse de que savedUser sea un objeto único
      const user = Array.isArray(savedUser) ? savedUser[0] : savedUser;
      
      // Crear sesión inicial en MongoDB
      const userSession = new this.userSessionModel({
        userId: user.id.toString(),
        sessionId: 'initial-session',
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true
      });
      await userSession.save();
      
      // Log de creación
      await this.logModel.create({
        level: 'info',
        message: `User created: ${user.email}`,
        userId: user.id.toString(),
        timestamp: new Date()
      });
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Obtener estadísticas completas
  async getCompleteStats() {
    try {
      const [pgStats, mongoStats] = await Promise.all([
        // PostgreSQL: Datos transaccionales
        Promise.all([
          this.userRepository.count(),
          this.productRepository.count(),
          this.orderRepository.count(),
        ]),
        // MongoDB: Datos analíticos
        Promise.all([
          this.analyticsModel.countDocuments(),
          this.userSessionModel.countDocuments(),
          this.logModel.countDocuments(),
        ])
      ]);

      return {
        success: true,
        postgresql: {
          users: pgStats[0],
          products: pgStats[1],
          orders: pgStats[2]
        },
        mongodb: {
          analytics: mongoStats[0],
          sessions: mongoStats[1],
          logs: mongoStats[2]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Crear evento de análisis
  async trackEvent(eventData: any) {
    try {
      const analyticsEvent = new this.analyticsModel({
        event: eventData.event,
        userId: eventData.userId,
        productId: eventData.productId,
        properties: eventData.properties,
        timestamp: new Date()
      });
      
      await analyticsEvent.save();
      
      return {
        success: true,
        message: 'Event tracked successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener usuario completo (PostgreSQL + MongoDB)
  async getUserComplete(userId: string) {
    try {
      const [pgUser, userSessions, userLogs] = await Promise.all([
        this.userRepository.findOne({ where: { id: userId } }),
        this.userSessionModel.find({ userId: userId }),
        this.logModel.find({ userId: userId }).limit(10)
      ]);

      return {
        success: true,
        user: pgUser,
        sessions: userSessions,
        recentLogs: userLogs
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Sincronizar datos críticos (si es necesario)
  async syncCriticalData() {
    try {
      // Verificar que los usuarios críticos tengan sesiones
      const activeUsers = await this.userRepository.find({ where: { isActive: true } });
      
      for (const user of activeUsers) {
        const existingSession = await this.userSessionModel.findOne({ userId: user.id });
        if (!existingSession) {
          await this.userSessionModel.create({
            userId: user.id,
            sessionId: `sync-${Date.now()}`,
            createdAt: new Date(),
            lastActivity: new Date(),
            isActive: true
          });
        }
      }
      
      return {
        success: true,
        message: `Synchronized ${activeUsers.length} users`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
