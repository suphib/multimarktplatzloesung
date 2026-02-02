import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('System')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health Check' })
  @ApiResponse({ status: 200, description: 'System gesund' })
  @ApiResponse({ status: 503, description: 'System beeinträchtigt' })
  async check() {
    return this.healthService.check();
  }
}
