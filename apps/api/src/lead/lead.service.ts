import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadEntity } from './entities/lead.entity';
import { CreateLeadDto, UpdateLeadStatusDto } from './dto/create-lead.dto';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(LeadEntity)
    private readonly leadRepository: Repository<LeadEntity>,
  ) {}

  async createLead(
    dto: CreateLeadDto,
    ipAdresse?: string,
    userAgent?: string,
  ): Promise<LeadEntity> {
    if (!dto.datenschutzAkzeptiert) {
      throw new BadRequestException(
        'Datenschutzbestimmungen müssen akzeptiert werden',
      );
    }

    const lead = this.leadRepository.create({
      ...dto,
      ipAdresse,
      userAgent,
      status: 'NEU',
    });

    return this.leadRepository.save(lead);
  }

  async findAllLeads(
    seite = 1,
    limit = 20,
  ): Promise<{ leads: LeadEntity[]; gesamt: number; seiten: number }> {
    const [leads, gesamt] = await this.leadRepository.findAndCount({
      order: { erstelltAm: 'DESC' },
      skip: (seite - 1) * limit,
      take: limit,
    });

    return {
      leads,
      gesamt,
      seiten: Math.ceil(gesamt / limit),
    };
  }

  async updateLeadStatus(
    id: string,
    dto: UpdateLeadStatusDto,
  ): Promise<LeadEntity> {
    const lead = await this.leadRepository.findOneBy({ id });
    if (!lead) {
      throw new BadRequestException('Lead nicht gefunden');
    }

    lead.status = dto.status;
    return this.leadRepository.save(lead);
  }

  async getLeadStats(): Promise<{
    gesamt: number;
    neu: number;
    kontaktiert: number;
    qualifiziert: number;
    konvertiert: number;
    nachTyp: Record<string, number>;
  }> {
    const leads = await this.leadRepository.find();

    const stats = {
      gesamt: leads.length,
      neu: leads.filter((l) => l.status === 'NEU').length,
      kontaktiert: leads.filter((l) => l.status === 'KONTAKTIERT').length,
      qualifiziert: leads.filter((l) => l.status === 'QUALIFIZIERT').length,
      konvertiert: leads.filter((l) => l.status === 'KONVERTIERT').length,
      nachTyp: {} as Record<string, number>,
    };

    for (const lead of leads) {
      stats.nachTyp[lead.typ] = (stats.nachTyp[lead.typ] || 0) + 1;
    }

    return stats;
  }
}
