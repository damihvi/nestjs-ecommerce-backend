import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  async searchProducts(
    @Query('q') query?: string,
    @Query('category') categoryId?: string
  ) {
    return this.searchService.searchProducts(query, categoryId);
  }

  @Get('categories')
  async searchCategories(@Query('q') query?: string) {
    return this.searchService.searchCategories(query);
  }

  @Get('stats')
  async getStats() {
    return this.searchService.getStats();
  }
}
