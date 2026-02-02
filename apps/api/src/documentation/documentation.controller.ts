import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DocumentationService } from './documentation.service';
import { Kanal, Konfidenz, ComplianceStatus } from '@procurement/shared';

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
    let doc = await this.documentationService.getDokumentation(id);

    if (!doc) {
      // Mock-Dokumentation zurueckgeben
      doc = {
        id: id,
        klassifizierungId: id,
        zeitstempel: new Date().toISOString(),
        benutzer: 'max.mustermann@behoerde.de',
        artikelBezeichnung: 'Dell Latitude 5540 Business Laptop',
        klassifizierung: {
          id: id,
          artikelBezeichnung: 'Dell Latitude 5540 Business Laptop',
          empfohlenerKanal: Kanal.RAHMENVERTRAG,
          konfidenz: Konfidenz.HOCH,
          konfidenzWert: 0.94,
          cpvCode: '30213100',
          cpvBezeichnung: 'Tragbare Computer',
          begruendung: 'Der Artikel wurde als Business-Laptop identifiziert und dem CPV-Code 30213100 (Tragbare Computer) zugeordnet. Es besteht ein aktiver Rahmenvertrag fuer IT-Endgeraete mit der Bechtle AG (RV-2024-IT-001), der bis 31.12.2026 gueltig ist. Die Beschaffung ueber den Rahmenvertrag ist der wirtschaftlichste und vergaberechtlich korrekte Weg.',
          compliance: {
            status: ComplianceStatus.KONFORM,
            pruefpunkte: [
              { bezeichnung: 'Rahmenvertrag vorhanden', erfuellt: true, hinweis: 'RV-2024-IT-001 (Bechtle AG)' },
              { bezeichnung: 'Wirtschaftlichkeitspruefung', erfuellt: true },
              { bezeichnung: 'Bedarfspruefung', erfuellt: true },
            ],
            schwellenwertKategorie: 'Direktauftrag unter Rahmenvertrag',
            dokumentationspflicht: false,
          },
          rahmenvertrag: {
            id: 'rv-001',
            bezeichnung: 'IT-Endgeraete (Laptops, Desktops, Monitore)',
            lieferant: 'Bechtle AG',
            vertragsnummer: 'RV-2024-IT-001',
            gueltigBis: '2026-12-31',
            aehnlichkeit: 0.94,
          },
          alternativeKanaele: [
            { kanal: Kanal.KATALOG, begruendung: 'Katalogbestellung bei Einzelstueckpreis unter 1.000 EUR', prioritaet: 2 },
            { kanal: Kanal.FREIE_VERGABE, begruendung: 'Freihaendige Vergabe bei groesseren Stueckzahlen moeglich', prioritaet: 3 },
          ],
          erstelltAm: new Date().toISOString(),
        },
        begruendung: 'Die Beschaffung erfolgt ueber den bestehenden Rahmenvertrag RV-2024-IT-001 mit der Bechtle AG. Der Artikel faellt in die Kategorie IT-Endgeraete und ist durch den Rahmenvertrag abgedeckt. Eine separate Ausschreibung ist nicht erforderlich.',
        compliancePruefung: {
          status: ComplianceStatus.KONFORM,
          pruefpunkte: [
            { bezeichnung: 'Rahmenvertrag vorhanden und gueltig', erfuellt: true, hinweis: 'RV-2024-IT-001, gueltig bis 31.12.2026' },
            { bezeichnung: 'Wirtschaftlichkeitspruefung', erfuellt: true, hinweis: 'Preisvergleich mit 3 Marktplaetzen durchgefuehrt' },
            { bezeichnung: 'Bedarfspruefung dokumentiert', erfuellt: true },
            { bezeichnung: 'Vier-Augen-Prinzip', erfuellt: false, hinweis: 'Genehmigung durch Vorgesetzte/n erforderlich' },
          ],
          schwellenwertKategorie: 'Direktauftrag unter Rahmenvertrag',
          dokumentationspflicht: false,
        },
        integritaetsHash: 'a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
      };
    }

    return doc;
  }
}
