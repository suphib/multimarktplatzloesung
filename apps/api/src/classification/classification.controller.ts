import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClassificationService } from './classification.service';
import { ClassifyRequestDto } from './dto/classify-request.dto';
import { ClassifyResponseDto } from './dto/classify-response.dto';

@ApiTags('Klassifizierung')
@Controller('classify')
export class ClassificationController {
  constructor(private readonly classificationService: ClassificationService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Artikel klassifizieren' })
  @ApiResponse({ status: 200, description: 'Erfolgreiche Klassifizierung', type: ClassifyResponseDto })
  @ApiResponse({ status: 400, description: 'Ungültige Anfrage' })
  async classify(@Body() dto: ClassifyRequestDto): Promise<ClassifyResponseDto> {
    return this.classificationService.classify(dto);
  }
}
