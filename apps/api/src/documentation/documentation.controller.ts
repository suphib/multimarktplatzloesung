import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DocumentationService } from './documentation.service';

@ApiTags('Dokumentation')
@Controller('documentation')
export class DocumentationController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Vergabedokumentation abrufen' })
  @ApiParam({ name: 'id', description: 'Klassifizierungs-ID' })
  @ApiResponse({ status: 200, description: 'Dokumentation gefunden' })
  @ApiResponse({ status: 404, description: 'Nicht gefunden' })
  async getDocumentation(@Param('id') id: string) {
    const doc = await this.documentationService.getDokumentation(id);
    if (!doc) {
      throw new NotFoundException(`Dokumentation für Klassifizierung ${id} nicht gefunden`);
    }
    return doc;
  }
}
