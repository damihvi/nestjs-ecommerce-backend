import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Analytics, AnalyticsDocument } from '../schemas/analytics.schema';
import { UserSession, UserSessionDocument } from '../schemas/user-session.schema';
import { Log, LogDocument } from '../schemas/log.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Analytics.name, 'mongodb')
    private analyticsModel: Model<AnalyticsDocument>,
    @InjectModel(UserSession.name, 'mongodb')
    private userSessionModel: Model<UserSessionDocument>,
    @InjectModel(Log.name, 'mongodb')
    private logModel: Model<LogDocument>,
  ) {}

  async getDashboardStats() {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    try {
      const [
        totalAnalytics,
        activeSessions,
        recentLogs,
        todayAnalytics,
        yesterdayAnalytics,
        weeklyAnalytics,
        monthlyAnalytics
      ] = await Promise.all([
        this.analyticsModel.countDocuments(),
        this.userSessionModel.countDocuments({ isActive: true }),
        this.logModel.countDocuments({ timestamp: { $gte: yesterday } }),
        this.analyticsModel.countDocuments({ timestamp: { $gte: today } }),
        this.analyticsModel.countDocuments({ 
          timestamp: { $gte: yesterday, $lt: today } 
        }),
        this.analyticsModel.countDocuments({ timestamp: { $gte: lastWeek } }),
        this.analyticsModel.countDocuments({ timestamp: { $gte: lastMonth } })
      ]);

      return {
        totalAnalytics,
        activeSessions,
        recentLogs,
        todayAnalytics,
        yesterdayAnalytics,
        weeklyAnalytics,
        monthlyAnalytics,
        growth: {
          daily: todayAnalytics - yesterdayAnalytics,
          weekly: weeklyAnalytics,
          monthly: monthlyAnalytics
        }
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getAnalyticsData(filter: any = {}) {
    try {
      const analytics = await this.analyticsModel
        .find(filter)
        .sort({ timestamp: -1 })
        .limit(100);
      
      return analytics;
    } catch (error) {
      console.error('Error getting analytics data:', error);
      throw error;
    }
  }

  async getActiveUserSessions() {
    try {
      const sessions = await this.userSessionModel
        .find({ isActive: true })
        .sort({ lastActivity: -1 })
        .limit(50);
      
      return sessions;
    } catch (error) {
      console.error('Error getting active sessions:', error);
      throw error;
    }
  }

  async getRecentLogs(limit: number = 50) {
    try {
      const logs = await this.logModel
        .find({})
        .sort({ timestamp: -1 })
        .limit(limit);
      
      return logs;
    } catch (error) {
      console.error('Error getting recent logs:', error);
      throw error;
    }
  }

  async getTopPages() {
    try {
      const topPages = await this.analyticsModel.aggregate([
        { $match: { event: 'page_view' } },
        { $group: { _id: '$properties.page', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      return topPages;
    } catch (error) {
      console.error('Error getting top pages:', error);
      throw error;
    }
  }

  async getConversionFunnel() {
    try {
      const funnel = await this.analyticsModel.aggregate([
        { $match: { event: { $in: ['page_view', 'add_to_cart', 'purchase'] } } },
        { $group: { _id: '$event', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      return funnel;
    } catch (error) {
      console.error('Error getting conversion funnel:', error);
      throw error;
    }
  }

  async trackEvent(eventData: any) {
    try {
      const event = new this.analyticsModel({
        event: eventData.event,
        userId: eventData.userId,
        productId: eventData.productId,
        properties: eventData.properties,
        timestamp: new Date()
      });
      
      await event.save();
      return { success: true };
    } catch (error) {
      console.error('Error tracking event:', error);
      throw error;
    }
  }

  async getHeatmapData() {
    try {
      const heatmap = await this.analyticsModel.aggregate([
        { $match: { event: 'click' } },
        { $group: { 
          _id: { 
            x: '$properties.x', 
            y: '$properties.y' 
          }, 
          count: { $sum: 1 } 
        } },
        { $sort: { count: -1 } },
        { $limit: 100 }
      ]);
      
      return heatmap;
    } catch (error) {
      console.error('Error getting heatmap data:', error);
      throw error;
    }
  }
}
