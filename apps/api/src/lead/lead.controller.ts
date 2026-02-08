import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { LeadService } from './lead.service';
import { CreateLeadDto, UpdateLeadStatusDto } from './dto/create-lead.dto';

@Controller()
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post('leads')
  async createLead(@Body() dto: CreateLeadDto, @Req() req: Request) {
    const ipAdresse =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip;
    const userAgent = req.headers['user-agent'];

    return this.leadService.createLead(dto, ipAdresse, userAgent);
  }

  @Get('admin/leads')
  async findAllLeads(
    @Query('seite') seite?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leadService.findAllLeads(
      seite ? parseInt(seite, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('admin/leads/stats')
  async getLeadStats() {
    return this.leadService.getLeadStats();
  }

  @Patch('admin/leads/:id')
  async updateLeadStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
  ) {
    return this.leadService.updateLeadStatus(id, dto);
  }
}
