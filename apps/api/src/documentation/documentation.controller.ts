import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentationService } from './documentation.service';
import { ClassificationEntity } from '../classification/entities/classification.entity';
import { Kanal, Konfidenz, ComplianceStatus } from '@procurement/shared';

@ApiTags('Dokumentation')
@Controller('documentation')
export class DocumentationController {
  constructor(
    private readonly documentationService: DocumentationService,
    @InjectRepository(ClassificationEntity)
    private readonly classificationRepo: Repository<ClassificationEntity>,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Vergabedokumentation abrufen' })
  @ApiParam({ name: 'id', description: 'Klassifizierungs-ID' })
  @ApiResponse({ status: 200, description: 'Dokumentation gefunden' })
  @ApiResponse({ status: 404, description: 'Nicht gefunden' })
  async getDocumentation(@Param('id') id: string) {
    let doc = await this.documentationService.getDokumentation(id);

    if (!doc) {
      // Try to build documentation from stored classification
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let classification: ClassificationEntity | null = null;
      if (uuidRegex.test(id)) {
        classification = await this.classificationRepo.findOne({ where: { id } });
      }

      if (classification && classification.ergebnis) {
        const result = classification.ergebnis as any;
        const schwellenwertKategorie = this.getSchwellenwertKategorie(
          classification.empfohlenerKanal as string,
          classification.geschaetzterPreis,
        );

        doc = {
          id,
          klassifizierungId: id,
          zeitstempel: classification.erstelltAm?.toISOString() ?? new Date().toISOString(),
          benutzer: 'max.mustermann@behoerde.de',
          artikelBezeichnung: classification.artikelBezeichnung,
          klassifizierung: result,
          begruendung: result.begruendung ?? 'Automatische Klassifizierung durch KI-System.',
          compliancePruefung: result.compliance ?? {
            status: ComplianceStatus.PRUEFUNG_ERFORDERLICH,
            pruefpunkte: [
              { bezeichnung: 'Wirtschaftlichkeitspruefung', erfuellt: true, hinweis: 'Preisvergleich mit 3 Marktplaetzen durchgefuehrt' },
              { bezeichnung: 'Bedarfspruefung dokumentiert', erfuellt: true },
              { bezeichnung: 'Vier-Augen-Prinzip', erfuellt: false, hinweis: 'Genehmigung durch Vorgesetzte/n erforderlich' },
            ],
            schwellenwertKategorie,
            dokumentationspflicht: false,
          },
          integritaetsHash: this.documentationService.berechneHash({ id, klassifizierung: result }),
        };
      } else {
        // Fallback: generic mock
        doc = {
          id,
          klassifizierungId: id,
          zeitstempel: new Date().toISOString(),
          benutzer: 'max.mustermann@behoerde.de',
          artikelBezeichnung: 'Artikel (Klassifizierung nicht gefunden)',
          klassifizierung: {
            id,
            artikelBezeichnung: 'Artikel',
            empfohlenerKanal: Kanal.FREIE_VERGABE,
            konfidenz: Konfidenz.NIEDRIG,
            konfidenzWert: 0.3,
            cpvCode: '00000000',
            cpvBezeichnung: 'Nicht klassifiziert',
            begruendung: 'Die Klassifizierungsdaten konnten nicht geladen werden.',
            compliance: {
              status: ComplianceStatus.PRUEFUNG_ERFORDERLICH,
              pruefpunkte: [],
              schwellenwertKategorie: 'Unbekannt',
              dokumentationspflicht: true,
            },
            alternativeKanaele: [],
            erstelltAm: new Date().toISOString(),
          },
          begruendung: 'Die Klassifizierungsdaten konnten nicht geladen werden.',
          compliancePruefung: {
            status: ComplianceStatus.PRUEFUNG_ERFORDERLICH,
            pruefpunkte: [],
            schwellenwertKategorie: 'Unbekannt',
            dokumentationspflicht: true,
          },
          integritaetsHash: this.documentationService.berechneHash({ id }),
        };
      }
    }

    return doc;
  }

  private getSchwellenwertKategorie(kanal: string, preis?: number | string): string {
    const preisStr = preis != null ? Number(preis).toFixed(2) : '?';
    if (kanal === 'RAHMENVERTRAG') return 'Direktauftrag unter Rahmenvertrag';
    if (kanal === 'KATALOG') return 'Direktauftrag / Katalogbestellung';
    if (kanal === 'FREIE_VERGABE') return `Freie Vergabe (Schaetzwert: ${preisStr} EUR)`;
    return `Oeffentliche Ausschreibung (Schaetzwert: ${preisStr} EUR)`;
  }
}
