import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MagicRequestService } from './magic-request.service';
import { MagicRequestDto } from './dto/magic-request.dto';
import type { MagicRequestResponse } from '@procurement/shared';

@ApiTags('Magic Request')
@Controller('magic-request')
export class MagicRequestController {
  constructor(private readonly magicRequestService: MagicRequestService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Freitext in strukturierte Bestellpositionen umwandeln' })
  @ApiResponse({ status: 200, description: 'Erfolgreich analysiert' })
  @ApiResponse({ status: 400, description: 'Ungültige Anfrage (Text zu kurz oder zu lang)' })
  async parse(@Body() dto: MagicRequestDto): Promise<MagicRequestResponse> {
    return this.magicRequestService.parse(dto.freitext);
  }
}
