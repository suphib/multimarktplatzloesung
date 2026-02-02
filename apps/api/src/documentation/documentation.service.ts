import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Dokumentation } from '@procurement/shared';
import { DocumentationEntity } from './entities/documentation.entity';

@Injectable()
export class DocumentationService {
  private readonly logger = new Logger(DocumentationService.name);

  constructor(
    @InjectRepository(DocumentationEntity)
    private readonly docRepo: Repository<DocumentationEntity>,
  ) {}

  async getDokumentation(klassifizierungId: string): Promise<Dokumentation | null> {
    const entity = await this.docRepo.findOne({
      where: { klassifizierungId },
    });

    if (!entity) {
      return null;
    }

    return {
      id: entity.id,
      klassifizierungId: entity.klassifizierungId,
      zeitstempel: entity.erstelltAm.toISOString(),
      benutzer: entity.benutzer,
      artikelBezeichnung: entity.artikelBezeichnung,
      klassifizierung: entity.klassifizierung as any,
      suchergebnisse: entity.suchergebnisse as any,
      ausgewaehlterArtikel: entity.ausgewaehlterArtikel as any,
      begruendung: entity.begruendung,
      compliancePruefung: entity.compliancePruefung as any,
      integritaetsHash: entity.integritaetsHash,
    };
  }

  async erstelleDokumentation(data: Partial<Dokumentation>): Promise<Dokumentation> {
    const id = uuidv4();
    const zeitstempel = new Date();

    const hashInput = JSON.stringify({
      id,
      klassifizierungId: data.klassifizierungId,
      zeitstempel: zeitstempel.toISOString(),
      klassifizierung: data.klassifizierung,
    });

    const integritaetsHash = createHash('sha256').update(hashInput).digest('hex');

    const entity = this.docRepo.create({
      id,
      klassifizierungId: data.klassifizierungId,
      benutzer: data.benutzer ?? 'system',
      artikelBezeichnung: data.artikelBezeichnung ?? '',
      klassifizierung: data.klassifizierung as any,
      suchergebnisse: data.suchergebnisse as any,
      ausgewaehlterArtikel: data.ausgewaehlterArtikel as any,
      begruendung: data.begruendung ?? '',
      compliancePruefung: data.compliancePruefung as any,
      integritaetsHash,
      erstelltAm: zeitstempel,
    });

    const saved = await this.docRepo.save(entity);

    return {
      id: saved.id,
      klassifizierungId: saved.klassifizierungId,
      zeitstempel: saved.erstelltAm.toISOString(),
      benutzer: saved.benutzer,
      artikelBezeichnung: saved.artikelBezeichnung,
      klassifizierung: saved.klassifizierung as any,
      suchergebnisse: saved.suchergebnisse as any,
      ausgewaehlterArtikel: saved.ausgewaehlterArtikel as any,
      begruendung: saved.begruendung,
      compliancePruefung: saved.compliancePruefung as any,
      integritaetsHash: saved.integritaetsHash,
    };
  }

  berechneHash(data: any): string {
    return createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }
}
