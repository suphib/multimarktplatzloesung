import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Kanal, Konfidenz, ComplianceStatus, SCHWELLENWERTE } from '@procurement/shared';
import { ClassificationEntity } from './entities/classification.entity';
import { ClassifyRequestDto } from './dto/classify-request.dto';
import { ClassifyResponseDto } from './dto/classify-response.dto';
import { ClassificationAiService } from '../ai/classification-ai.service';
import { EmbeddingService } from '../embedding/embedding.service';

@Injectable()
export class ClassificationService {
  private readonly logger = new Logger(ClassificationService.name);

  constructor(
    @InjectRepository(ClassificationEntity)
    private readonly classificationRepo: Repository<ClassificationEntity>,
    private readonly aiService: ClassificationAiService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async classify(dto: ClassifyRequestDto): Promise<ClassifyResponseDto> {
    const id = uuidv4();
    const gesamtpreis = (dto.geschaetzterPreis ?? 0) * (dto.menge ?? 1);

    // 1. KI-Klassifizierung (mit Fallback)
    let aiResult;
    try {
      aiResult = await this.aiService.classify(dto.artikelBezeichnung, dto.artikelBeschreibung);
    } catch (error) {
      this.logger.warn('KI-Klassifizierung fehlgeschlagen, nutze regelbasierte Klassifizierung', error);
      aiResult = this.regelbasierteKlassifizierung(dto.artikelBezeichnung, gesamtpreis);
    }

    // 2. Rahmenvertrag-Matching
    let rahmenvertrag;
    try {
      rahmenvertrag = await this.embeddingService.findeAehnlichenRahmenvertrag(dto.artikelBezeichnung);
    } catch (error) {
      this.logger.warn('Rahmenvertrag-Matching fehlgeschlagen', error);
    }

    // 3. Kanal bestimmen
    const empfohlenerKanal = this.bestimmeKanal(gesamtpreis, rahmenvertrag);

    // 4. Compliance prüfen
    const compliance = this.pruefeCompliance(gesamtpreis, empfohlenerKanal);

    // 5. Ergebnis zusammenstellen
    const ergebnis: ClassifyResponseDto = {
      id,
      artikelBezeichnung: dto.artikelBezeichnung,
      empfohlenerKanal,
      konfidenz: aiResult.konfidenz,
      konfidenzWert: aiResult.konfidenzWert,
      cpvCode: aiResult.cpvCode,
      cpvBezeichnung: aiResult.cpvBezeichnung,
      begruendung: aiResult.begruendung,
      compliance,
      rahmenvertrag: rahmenvertrag ?? undefined,
      alternativeKanaele: this.ermittleAlternativen(empfohlenerKanal, gesamtpreis),
      erstelltAm: new Date().toISOString(),
    };

    // 6. Persistieren
    try {
      const entity = this.classificationRepo.create({
        id,
        artikelBezeichnung: dto.artikelBezeichnung,
        artikelBeschreibung: dto.artikelBeschreibung,
        geschaetzterPreis: dto.geschaetzterPreis,
        menge: dto.menge,
        empfohlenerKanal,
        konfidenz: aiResult.konfidenz,
        konfidenzWert: aiResult.konfidenzWert,
        cpvCode: aiResult.cpvCode,
        ergebnis: ergebnis as any,
      });
      await this.classificationRepo.save(entity);
    } catch (error) {
      this.logger.error('Klassifizierung konnte nicht gespeichert werden', error);
    }

    return ergebnis;
  }

  bestimmeKanal(gesamtpreis: number, rahmenvertrag?: any): Kanal {
    if (rahmenvertrag && rahmenvertrag.aehnlichkeit > 0.8) {
      return Kanal.RAHMENVERTRAG;
    }
    if (gesamtpreis <= SCHWELLENWERTE.DIREKTAUFTRAG) {
      return Kanal.KATALOG;
    }
    if (gesamtpreis <= SCHWELLENWERTE.FREIE_VERGABE) {
      return Kanal.FREIE_VERGABE;
    }
    return Kanal.OEFFENTLICHE_AUSSCHREIBUNG;
  }

  pruefeCompliance(gesamtpreis: number, kanal: Kanal) {
    const pruefpunkte = [];
    let schwellenwertKategorie: string;

    if (gesamtpreis <= SCHWELLENWERTE.DIREKTAUFTRAG) {
      schwellenwertKategorie = 'Direktauftrag (bis 1.000 EUR)';
      pruefpunkte.push({
        bezeichnung: 'Wirtschaftlichkeitsprüfung',
        erfuellt: true,
        hinweis: 'Bei Direktaufträgen vereinfachte Prüfung',
      });
    } else if (gesamtpreis <= SCHWELLENWERTE.FREIE_VERGABE) {
      schwellenwertKategorie = 'Freie Vergabe (bis 25.000 EUR)';
      pruefpunkte.push(
        {
          bezeichnung: 'Mindestens 3 Vergleichsangebote',
          erfuellt: false,
          hinweis: 'Vergleichsangebote müssen eingeholt werden',
        },
        {
          bezeichnung: 'Dokumentationspflicht',
          erfuellt: true,
        },
      );
    } else if (gesamtpreis <= SCHWELLENWERTE.UNTERSCHWELLENVERGABE) {
      schwellenwertKategorie = 'Unterschwellenvergabe (bis 143.000 EUR)';
      pruefpunkte.push(
        {
          bezeichnung: 'Vergabevermerk erforderlich',
          erfuellt: false,
          hinweis: 'Formeller Vergabevermerk muss erstellt werden',
        },
        {
          bezeichnung: 'Öffentliche Bekanntmachung',
          erfuellt: false,
        },
        {
          bezeichnung: 'Bieterwettbewerb',
          erfuellt: false,
        },
      );
    } else {
      schwellenwertKategorie = 'Oberschwellenvergabe (ab 143.000 EUR)';
      pruefpunkte.push(
        {
          bezeichnung: 'EU-weite Ausschreibung erforderlich',
          erfuellt: false,
        },
        {
          bezeichnung: 'Vergabevermerk erforderlich',
          erfuellt: false,
        },
        {
          bezeichnung: 'Mindestfristen einhalten',
          erfuellt: false,
        },
      );
    }

    const alleErfuellt = pruefpunkte.every((p) => p.erfuellt);

    return {
      status: alleErfuellt ? ComplianceStatus.KONFORM : ComplianceStatus.PRUEFUNG_ERFORDERLICH,
      pruefpunkte,
      schwellenwertKategorie,
      dokumentationspflicht: gesamtpreis > SCHWELLENWERTE.DIREKTAUFTRAG,
    };
  }

  ermittleAlternativen(hauptkanal: Kanal, gesamtpreis: number) {
    const alternativen = [];
    if (hauptkanal !== Kanal.KATALOG && gesamtpreis <= SCHWELLENWERTE.DIREKTAUFTRAG) {
      alternativen.push({
        kanal: Kanal.KATALOG,
        begruendung: 'Bestellwert unter Direktauftragsschwelle',
        prioritaet: 2,
      });
    }
    if (hauptkanal !== Kanal.RAHMENVERTRAG) {
      alternativen.push({
        kanal: Kanal.RAHMENVERTRAG,
        begruendung: 'Prüfen Sie bestehende Rahmenverträge',
        prioritaet: 1,
      });
    }
    if (hauptkanal !== Kanal.FREIE_VERGABE && gesamtpreis <= SCHWELLENWERTE.FREIE_VERGABE) {
      alternativen.push({
        kanal: Kanal.FREIE_VERGABE,
        begruendung: 'Freihändige Vergabe bei ausreichender Markterkundung möglich',
        prioritaet: 3,
      });
    }
    return alternativen;
  }

  private regelbasierteKlassifizierung(bezeichnung: string, gesamtpreis: number) {
    const lower = bezeichnung.toLowerCase();
    let cpvCode = '30190000';
    let cpvBezeichnung = 'Verschiedene Bürogeräte und -materialien';

    if (lower.includes('laptop') || lower.includes('notebook') || lower.includes('computer')) {
      cpvCode = '30213100';
      cpvBezeichnung = 'Tragbare Computer';
    } else if (lower.includes('monitor') || lower.includes('bildschirm')) {
      cpvCode = '30231000';
      cpvBezeichnung = 'Computerbildschirme und Konsolen';
    } else if (lower.includes('drucker') || lower.includes('printer')) {
      cpvCode = '30232000';
      cpvBezeichnung = 'Peripheriegeräte';
    } else if (lower.includes('stuhl') || lower.includes('schreibtisch') || lower.includes('möbel')) {
      cpvCode = '39130000';
      cpvBezeichnung = 'Büromöbel';
    } else if (lower.includes('papier') || lower.includes('ordner') || lower.includes('stift')) {
      cpvCode = '30192000';
      cpvBezeichnung = 'Bürobedarf';
    }

    return {
      cpvCode,
      cpvBezeichnung,
      konfidenz: Konfidenz.NIEDRIG,
      konfidenzWert: 0.4,
      begruendung: 'Regelbasierte Klassifizierung (KI nicht verfügbar). ' +
        'Bitte prüfen Sie die Zuordnung manuell.',
    };
  }
}
