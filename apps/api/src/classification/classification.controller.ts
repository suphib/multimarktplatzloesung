import { Controller, Post, Patch, Get, Body, Param, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClassificationService } from './classification.service';
import { ClassifyRequestDto } from './dto/classify-request.dto';
import { ClassifyResponseDto, AenderungsEintragDto } from './dto/classify-response.dto';
import { OverrideClassificationDto } from './dto/override-classification.dto';

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

  @Patch(':id')
  @ApiOperation({ summary: 'Klassifizierung manuell übersteuern' })
  @ApiResponse({ status: 200, description: 'Klassifizierung aktualisiert', type: ClassifyResponseDto })
  @ApiResponse({ status: 404, description: 'Klassifizierung nicht gefunden' })
  async overrideClassification(
    @Param('id') id: string,
    @Body() dto: OverrideClassificationDto,
  ): Promise<ClassifyResponseDto> {
    return this.classificationService.overrideClassification(id, dto);
  }

  @Get(':id/audit')
  @ApiOperation({ summary: 'Änderungshistorie einer Klassifizierung' })
  @ApiResponse({ status: 200, description: 'Audit-Trail', type: [AenderungsEintragDto] })
  @ApiResponse({ status: 404, description: 'Klassifizierung nicht gefunden' })
  async getAuditTrail(@Param('id') id: string): Promise<AenderungsEintragDto[]> {
    return this.classificationService.getAuditTrail(id);
  }
}
