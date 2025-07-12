import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnalyticsEvent, EventType } from './analytics-event.entity';
import { CreateAnalyticsEventDto, AnalyticsQueryDto } from './dto/analytics.dto';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private analyticsRepository: Repository<AnalyticsEvent>,
  ) {}

  async trackEvent(createAnalyticsEventDto: CreateAnalyticsEventDto): Promise<AnalyticsEvent> {
    const event = this.analyticsRepository.create(createAnalyticsEventDto);
    return await this.analyticsRepository.save(event);
  }

  async getEvents(query: AnalyticsQueryDto): Promise<Pagination<AnalyticsEvent>> {
    const queryBuilder = this.analyticsRepository.createQueryBuilder('event')
      .leftJoinAndSelect('event.user', 'user')
      .orderBy('event.createdAt', 'DESC');

    if (query.event) {
      queryBuilder.andWhere('event.event = :event', { event: query.event });
    }

    if (query.userId) {
      queryBuilder.andWhere('event.userId = :userId', { userId: query.userId });
    }

    if (query.startDate && query.endDate) {
      queryBuilder.andWhere('event.createdAt BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    }

    return paginate<AnalyticsEvent>(queryBuilder, {
      page: query.page || 1,
      limit: query.limit || 50,
    });
  }

  async getEventStats(startDate?: Date, endDate?: Date): Promise<any> {
    const whereClause = startDate && endDate ? { createdAt: Between(startDate, endDate) } : {};

    const totalEvents = await this.analyticsRepository.count({ where: whereClause });
    const uniqueUsers = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.userId)', 'count')
      .where(startDate && endDate ? 'event.createdAt BETWEEN :startDate AND :endDate' : '1=1', {
        startDate,
        endDate,
      })
      .getRawOne();

    const eventsByType = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('event.event', 'event')
      .addSelect('COUNT(*)', 'count')
      .where(startDate && endDate ? 'event.createdAt BETWEEN :startDate AND :endDate' : '1=1', {
        startDate,
        endDate,
      })
      .groupBy('event.event')
      .getRawMany();

    const topPages = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('event.page', 'page')
      .addSelect('COUNT(*)', 'count')
      .where('event.page IS NOT NULL')
      .andWhere(startDate && endDate ? 'event.createdAt BETWEEN :startDate AND :endDate' : '1=1', {
        startDate,
        endDate,
      })
      .groupBy('event.page')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalEvents,
      uniqueUsers: parseInt(uniqueUsers.count),
      eventsByType,
      topPages,
    };
  }

  async getTopProducts(startDate?: Date, endDate?: Date): Promise<any> {
    const query = this.analyticsRepository
      .createQueryBuilder('event')
      .select('event.properties->>\'productId\'', 'productId')
      .addSelect('COUNT(*)', 'views')
      .where('event.event = :event', { event: EventType.PRODUCT_VIEW })
      .andWhere('event.properties->>\'productId\' IS NOT NULL');

    if (startDate && endDate) {
      query.andWhere('event.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return query
      .groupBy('event.properties->>\'productId\'')
      .orderBy('views', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async getSearchTerms(startDate?: Date, endDate?: Date): Promise<any> {
    const query = this.analyticsRepository
      .createQueryBuilder('event')
      .select('event.properties->>\'searchTerm\'', 'searchTerm')
      .addSelect('COUNT(*)', 'searches')
      .where('event.event = :event', { event: EventType.SEARCH })
      .andWhere('event.properties->>\'searchTerm\' IS NOT NULL');

    if (startDate && endDate) {
      query.andWhere('event.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return query
      .groupBy('event.properties->>\'searchTerm\'')
      .orderBy('searches', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async getUserActivity(userId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const query = this.analyticsRepository
      .createQueryBuilder('event')
      .select('event.event', 'event')
      .addSelect('COUNT(*)', 'count')
      .where('event.userId = :userId', { userId });

    if (startDate && endDate) {
      query.andWhere('event.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const activities = await query
      .groupBy('event.event')
      .orderBy('count', 'DESC')
      .getRawMany();

    const totalEvents = await this.analyticsRepository.count({
      where: {
        userId,
        ...(startDate && endDate ? { createdAt: Between(startDate, endDate) } : {}),
      },
    });

    return {
      totalEvents,
      activities,
    };
  }

  async getDailyStats(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyStats = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('DATE(event.createdAt)', 'date')
      .addSelect('COUNT(*)', 'events')
      .addSelect('COUNT(DISTINCT event.userId)', 'uniqueUsers')
      .where('event.createdAt >= :startDate', { startDate })
      .groupBy('DATE(event.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return dailyStats;
  }

  async getConversionFunnel(startDate?: Date, endDate?: Date): Promise<any> {
    const whereClause = startDate && endDate ? 
      'event.createdAt BETWEEN :startDate AND :endDate' : '1=1';

    const pageViews = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.userId)', 'count')
      .where('event.event = :event', { event: EventType.PAGE_VIEW })
      .andWhere(whereClause, { startDate, endDate })
      .getRawOne();

    const productViews = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.userId)', 'count')
      .where('event.event = :event', { event: EventType.PRODUCT_VIEW })
      .andWhere(whereClause, { startDate, endDate })
      .getRawOne();

    const addToCart = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.userId)', 'count')
      .where('event.event = :event', { event: EventType.ADD_TO_CART })
      .andWhere(whereClause, { startDate, endDate })
      .getRawOne();

    const purchases = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.userId)', 'count')
      .where('event.event = :event', { event: EventType.PURCHASE })
      .andWhere(whereClause, { startDate, endDate })
      .getRawOne();

    return {
      pageViews: parseInt(pageViews.count),
      productViews: parseInt(productViews.count),
      addToCart: parseInt(addToCart.count),
      purchases: parseInt(purchases.count),
    };
  }
}
