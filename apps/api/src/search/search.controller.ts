import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchRequestDto } from './dto/search-request.dto';

@ApiTags('Suche')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Artikel suchen' })
  @ApiResponse({ status: 200, description: 'Suchergebnisse' })
  async search(@Body() dto: SearchRequestDto) {
    return this.searchService.search(dto);
  }
}
