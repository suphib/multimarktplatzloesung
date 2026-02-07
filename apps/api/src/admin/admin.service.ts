import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { RahmenvertragEntity } from '../embedding/entities/rahmenvertrag.entity';
import { FrameworkContractEntity } from '../search/entities/framework-contract.entity';
import { ShopConfigEntity } from './entities/shop-config.entity';
import { BestellungEntity } from './entities/bestellung.entity';
import { CreateRahmenvertragDto } from './dto/create-rahmenvertrag.dto';
import { UpdateRahmenvertragDto } from './dto/update-rahmenvertrag.dto';
import { UpdateShopConfigDto } from './dto/update-shop-config.dto';
import { CreateKatalogArtikelDto } from './dto/create-katalog-artikel.dto';
import { CreateBestellungDto } from './dto/create-bestellung.dto';
import { QueryFrameworkItemsDto } from './dto/query-framework-items.dto';
import type {
  AdminDashboardStats,
  PaginatedResponse,
  FrameworkContractItem,
  Rahmenvertrag,
  ShopConfig,
  Bestellung,
} from '@procurement/shared';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(RahmenvertragEntity)
    private readonly rvRepo: Repository<RahmenvertragEntity>,
    @InjectRepository(FrameworkContractEntity)
    private readonly fcRepo: Repository<FrameworkContractEntity>,
    @InjectRepository(ShopConfigEntity)
    private readonly scRepo: Repository<ShopConfigEntity>,
    @InjectRepository(BestellungEntity)
    private readonly bestellungRepo: Repository<BestellungEntity>,
  ) {}

  // ─── Dashboard ──────────────────────────────────────────────────

  async getStats(): Promise<AdminDashboardStats> {
    const rahmenvertraegeGesamt = await this.rvRepo.count();
    const rahmenvertraegeAktiv = await this.rvRepo
      .createQueryBuilder('rv')
      .where('rv.gueltigBis > NOW()')
      .getCount();
    const katalogArtikelGesamt = await this.fcRepo.count();
    const shopKonfigurationen = await this.scRepo.count();
    const shopKonfigurationenAktiv = await this.scRepo.count({ where: { aktiv: true } });

    return {
      rahmenvertraegeGesamt,
      rahmenvertraegeAktiv,
      katalogArtikelGesamt,
      shopKonfigurationen,
      shopKonfigurationenAktiv,
    };
  }

  // ─── Rahmenverträge ─────────────────────────────────────────────

  async findAllRahmenvertraege(): Promise<Rahmenvertrag[]> {
    const entities = await this.rvRepo.find({ order: { erstelltAm: 'DESC' } });
    return entities.map((e) => this.mapRahmenvertrag(e));
  }

  async findOneRahmenvertrag(id: string): Promise<Rahmenvertrag> {
    const entity = await this.rvRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Rahmenvertrag ${id} nicht gefunden`);
    return this.mapRahmenvertrag(entity);
  }

  async createRahmenvertrag(dto: CreateRahmenvertragDto): Promise<Rahmenvertrag> {
    const entity = this.rvRepo.create({
      id: randomUUID(),
      bezeichnung: dto.bezeichnung,
      beschreibung: dto.beschreibung,
      lieferant: dto.lieferant,
      vertragsnummer: dto.vertragsnummer,
      gueltigAb: dto.gueltigAb ? new Date(dto.gueltigAb) : null,
      gueltigBis: new Date(dto.gueltigBis),
      cpvCodes: dto.cpvCodes || '',
      maxVolumen: dto.maxVolumen || 0,
      status: dto.status || 'AKTIV',
      ansprechpartner: dto.ansprechpartner || null,
      ansprechpartnerEmail: dto.ansprechpartnerEmail || null,
      ansprechpartnerTelefon: dto.ansprechpartnerTelefon || null,
      zahlungsbedingungen: dto.zahlungsbedingungen || null,
      skonto: dto.skonto || null,
      kuendigungsfrist: dto.kuendigungsfrist || null,
      produktkategorien: dto.produktkategorien || null,
      abrufVolumen: dto.abrufVolumen || 0,
      mindestBestellwert: dto.mindestBestellwert || 0,
      notizen: dto.notizen || null,
    } as Partial<RahmenvertragEntity>);
    const saved = await this.rvRepo.save(entity);
    return this.mapRahmenvertrag(saved as RahmenvertragEntity);
  }

  async updateRahmenvertrag(id: string, dto: UpdateRahmenvertragDto): Promise<Rahmenvertrag> {
    const entity = await this.rvRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Rahmenvertrag ${id} nicht gefunden`);

    if (dto.bezeichnung !== undefined) entity.bezeichnung = dto.bezeichnung;
    if (dto.beschreibung !== undefined) entity.beschreibung = dto.beschreibung;
    if (dto.lieferant !== undefined) entity.lieferant = dto.lieferant;
    if (dto.vertragsnummer !== undefined) entity.vertragsnummer = dto.vertragsnummer;
    if (dto.gueltigAb !== undefined) entity.gueltigAb = dto.gueltigAb ? new Date(dto.gueltigAb) : (null as any);
    if (dto.gueltigBis !== undefined) entity.gueltigBis = new Date(dto.gueltigBis);
    if (dto.cpvCodes !== undefined) entity.cpvCodes = dto.cpvCodes;
    if (dto.maxVolumen !== undefined) entity.maxVolumen = dto.maxVolumen;
    if (dto.status !== undefined) entity.status = dto.status;
    if (dto.ansprechpartner !== undefined) entity.ansprechpartner = dto.ansprechpartner;
    if (dto.ansprechpartnerEmail !== undefined) entity.ansprechpartnerEmail = dto.ansprechpartnerEmail;
    if (dto.ansprechpartnerTelefon !== undefined) entity.ansprechpartnerTelefon = dto.ansprechpartnerTelefon;
    if (dto.zahlungsbedingungen !== undefined) entity.zahlungsbedingungen = dto.zahlungsbedingungen;
    if (dto.skonto !== undefined) entity.skonto = dto.skonto;
    if (dto.kuendigungsfrist !== undefined) entity.kuendigungsfrist = dto.kuendigungsfrist;
    if (dto.produktkategorien !== undefined) entity.produktkategorien = dto.produktkategorien;
    if (dto.abrufVolumen !== undefined) entity.abrufVolumen = dto.abrufVolumen;
    if (dto.mindestBestellwert !== undefined) entity.mindestBestellwert = dto.mindestBestellwert;
    if (dto.notizen !== undefined) entity.notizen = dto.notizen;

    const saved = await this.rvRepo.save(entity);
    return this.mapRahmenvertrag(saved);
  }

  async deleteRahmenvertrag(id: string): Promise<void> {
    const entity = await this.rvRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Rahmenvertrag ${id} nicht gefunden`);
    await this.rvRepo.remove(entity);
  }

  private mapRahmenvertrag(e: RahmenvertragEntity): Rahmenvertrag {
    const toIso = (d: Date | string | null | undefined): string => {
      if (!d) return '';
      return d instanceof Date ? d.toISOString() : String(d);
    };
    return {
      id: e.id,
      bezeichnung: e.bezeichnung,
      beschreibung: e.beschreibung,
      lieferant: e.lieferant,
      vertragsnummer: e.vertragsnummer,
      gueltigAb: toIso(e.gueltigAb),
      gueltigBis: toIso(e.gueltigBis),
      cpvCodes: e.cpvCodes || '',
      maxVolumen: Number(e.maxVolumen) || 0,
      status: (e.status as any) || 'AKTIV',
      ansprechpartner: e.ansprechpartner || '',
      ansprechpartnerEmail: e.ansprechpartnerEmail || '',
      ansprechpartnerTelefon: e.ansprechpartnerTelefon || '',
      zahlungsbedingungen: e.zahlungsbedingungen || '',
      skonto: e.skonto || '',
      kuendigungsfrist: e.kuendigungsfrist || '',
      produktkategorien: e.produktkategorien || '',
      abrufVolumen: Number(e.abrufVolumen) || 0,
      mindestBestellwert: Number(e.mindestBestellwert) || 0,
      dokumente: JSON.parse(e.dokumente || '[]'),
      verlaengerungen: JSON.parse(e.verlaengerungen || '[]'),
      notizen: e.notizen || '',
      erstelltAm: toIso(e.erstelltAm),
    };
  }

  // ─── Dokument Upload/Delete ───────────────────────────────────

  private getUploadsDir(rvId: string): string {
    return path.join(process.cwd(), 'uploads', 'rahmenvertraege', rvId);
  }

  async uploadDokument(id: string, file: { originalname: string; mimetype: string; size: number; buffer: Buffer }): Promise<Rahmenvertrag> {
    const entity = await this.rvRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Rahmenvertrag ${id} nicht gefunden`);

    const dir = this.getUploadsDir(id);
    fs.mkdirSync(dir, { recursive: true });

    const dokId = randomUUID();
    const ext = path.extname(file.originalname);
    const filename = `${dokId}${ext}`;
    fs.writeFileSync(path.join(dir, filename), file.buffer);

    const dokumente = JSON.parse(entity.dokumente || '[]');
    dokumente.push({
      id: dokId,
      dateiname: file.originalname,
      dateityp: file.mimetype,
      groesse: file.size,
      hochgeladenAm: new Date().toISOString(),
    });
    entity.dokumente = JSON.stringify(dokumente);

    const saved = await this.rvRepo.save(entity);
    return this.mapRahmenvertrag(saved);
  }

  async deleteDokument(rvId: string, dokId: string): Promise<Rahmenvertrag> {
    const entity = await this.rvRepo.findOne({ where: { id: rvId } });
    if (!entity) throw new NotFoundException(`Rahmenvertrag ${rvId} nicht gefunden`);

    const dokumente = JSON.parse(entity.dokumente || '[]');
    const dok = dokumente.find((d: any) => d.id === dokId);
    if (!dok) throw new NotFoundException(`Dokument ${dokId} nicht gefunden`);

    // Delete file from filesystem
    const dir = this.getUploadsDir(rvId);
    const ext = path.extname(dok.dateiname);
    const filepath = path.join(dir, `${dokId}${ext}`);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    entity.dokumente = JSON.stringify(dokumente.filter((d: any) => d.id !== dokId));
    const saved = await this.rvRepo.save(entity);
    return this.mapRahmenvertrag(saved);
  }

  async getDokumentFile(rvId: string, dokId: string): Promise<{ path: string; dateiname: string }> {
    const entity = await this.rvRepo.findOne({ where: { id: rvId } });
    if (!entity) throw new NotFoundException(`Rahmenvertrag ${rvId} nicht gefunden`);

    const dokumente = JSON.parse(entity.dokumente || '[]');
    const dok = dokumente.find((d: any) => d.id === dokId);
    if (!dok) throw new NotFoundException(`Dokument ${dokId} nicht gefunden`);

    const dir = this.getUploadsDir(rvId);
    const ext = path.extname(dok.dateiname);
    const filepath = path.join(dir, `${dokId}${ext}`);
    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Datei nicht gefunden');
    }

    return { path: filepath, dateiname: dok.dateiname };
  }

  // ─── Katalog (Framework Contract Items) ─────────────────────────

  async findKatalogArtikel(
    query: QueryFrameworkItemsDto,
  ): Promise<PaginatedResponse<FrameworkContractItem>> {
    const seite = query.seite || 1;
    const proSeite = query.proSeite || 10;
    const skip = (seite - 1) * proSeite;

    const qb = this.fcRepo.createQueryBuilder('fc');

    if (query.suchbegriff) {
      qb.andWhere(
        '(LOWER(fc.titel) LIKE :s OR LOWER(fc.beschreibung) LIKE :s OR LOWER(fc.lieferant) LIKE :s)',
        { s: `%${query.suchbegriff.toLowerCase()}%` },
      );
    }

    if (query.lieferant) {
      qb.andWhere('fc.lieferant = :lieferant', { lieferant: query.lieferant });
    }

    if (query.rahmenvertragsNummer) {
      qb.andWhere('fc.rahmenvertragsNummer = :rvNr', { rvNr: query.rahmenvertragsNummer });
    }

    if (query.nurVerfuegbar === 'true') {
      qb.andWhere('fc.verfuegbar = true');
    }

    const sortField = query.sortierFeld || 'erstelltAm';
    const sortDir = query.sortierRichtung || 'DESC';
    const allowedSortFields = ['titel', 'lieferant', 'preis', 'erstelltAm', 'artikelnummer', 'rahmenvertragsNummer'];
    if (allowedSortFields.includes(sortField)) {
      qb.orderBy(`fc.${sortField}`, sortDir);
    } else {
      qb.orderBy('fc.erstelltAm', 'DESC');
    }

    const [entities, gesamt] = await qb.skip(skip).take(proSeite).getManyAndCount();

    return {
      daten: entities.map((e) => this.mapFrameworkItem(e)),
      gesamt,
      seite,
      proSeite,
    };
  }

  async findOneKatalogArtikel(id: string): Promise<FrameworkContractItem> {
    const entity = await this.fcRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Katalog-Artikel ${id} nicht gefunden`);
    return this.mapFrameworkItem(entity);
  }

  async createKatalogArtikel(dto: CreateKatalogArtikelDto): Promise<FrameworkContractItem> {
    const entity = this.fcRepo.create({
      id: randomUUID(),
      titel: dto.titel,
      beschreibung: dto.beschreibung || '',
      lieferant: dto.lieferant,
      cpvCodes: dto.cpvCodes || '',
      preis: dto.preis,
      waehrung: dto.waehrung || 'EUR',
      rahmenvertragsNummer: dto.rahmenvertragsNummer,
      artikelnummer: dto.artikelnummer || '',
      nachhaltigkeitslabel: dto.nachhaltigkeitslabel || '',
      lieferzeit: dto.lieferzeit || '',
      bildUrl: dto.bildUrl || '',
      verfuegbar: dto.verfuegbar !== undefined ? dto.verfuegbar : true,
    });
    const saved = await this.fcRepo.save(entity);
    return this.mapFrameworkItem(saved);
  }

  async updateKatalogArtikel(
    id: string,
    dto: Partial<CreateKatalogArtikelDto>,
  ): Promise<FrameworkContractItem> {
    const entity = await this.fcRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Katalog-Artikel ${id} nicht gefunden`);

    Object.assign(entity, dto);
    const saved = await this.fcRepo.save(entity);
    return this.mapFrameworkItem(saved);
  }

  async deleteKatalogArtikel(id: string): Promise<void> {
    const entity = await this.fcRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Katalog-Artikel ${id} nicht gefunden`);
    await this.fcRepo.remove(entity);
  }

  private mapFrameworkItem(e: FrameworkContractEntity): FrameworkContractItem {
    return {
      id: e.id,
      titel: e.titel,
      beschreibung: e.beschreibung || '',
      lieferant: e.lieferant,
      cpvCodes: e.cpvCodes || '',
      preis: Number(e.preis),
      waehrung: e.waehrung,
      rahmenvertragsNummer: e.rahmenvertragsNummer,
      artikelnummer: e.artikelnummer || '',
      nachhaltigkeitslabel: e.nachhaltigkeitslabel || '',
      lieferzeit: e.lieferzeit || '',
      bildUrl: e.bildUrl || '',
      verfuegbar: e.verfuegbar,
      erstelltAm: e.erstelltAm instanceof Date ? e.erstelltAm.toISOString() : String(e.erstelltAm),
    };
  }

  // ─── Shop-Konfigurationen ───────────────────────────────────────

  async findAllShopConfigs(): Promise<ShopConfig[]> {
    const entities = await this.scRepo.find({ order: { erstelltAm: 'ASC' } });
    return entities.map((e) => this.mapShopConfig(e));
  }

  async updateShopConfig(id: string, dto: UpdateShopConfigDto): Promise<ShopConfig> {
    const entity = await this.scRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Shop-Konfiguration ${id} nicht gefunden`);

    if (dto.aktiv !== undefined) entity.aktiv = dto.aktiv;
    if (dto.baseUrl !== undefined) entity.baseUrl = dto.baseUrl;
    if (dto.apiKey !== undefined) {
      entity.apiKeyHash = createHash('sha256').update(dto.apiKey).digest('hex');
    }

    const saved = await this.scRepo.save(entity);
    return this.mapShopConfig(saved);
  }

  async triggerSync(id: string): Promise<ShopConfig> {
    const entity = await this.scRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Shop-Konfiguration ${id} nicht gefunden`);

    entity.letzteSynchronisation = new Date();
    const saved = await this.scRepo.save(entity);
    return this.mapShopConfig(saved);
  }

  private mapShopConfig(e: ShopConfigEntity): ShopConfig {
    // Count articles linked to this marketplace type
    const artikelAnzahl = 0; // Will be populated in findAllShopConfigs if needed
    return {
      id: e.id,
      name: e.name,
      typ: e.typ,
      aktiv: e.aktiv,
      apiKeyGesetzt: !!e.apiKeyHash,
      baseUrl: e.baseUrl || '',
      letzteSynchronisation: e.letzteSynchronisation
        ? e.letzteSynchronisation.toISOString()
        : null,
      artikelAnzahl,
      erstelltAm: e.erstelltAm instanceof Date ? e.erstelltAm.toISOString() : String(e.erstelltAm),
    };
  }

  // ─── Bestellungen ─────────────────────────────────────────────────

  async createBestellung(dto: CreateBestellungDto): Promise<Bestellung> {
    const gesamtpreis = dto.einzelpreis * dto.menge;
    let skontoAbzug = 0;
    let genehmigungErforderlich = false;

    if (dto.rahmenvertragNr) {
      const rv = await this.rvRepo.findOne({ where: { vertragsnummer: dto.rahmenvertragNr } });
      if (rv) {
        // Mindestbestellwert prüfen
        if (rv.mindestBestellwert && gesamtpreis < Number(rv.mindestBestellwert)) {
          throw new BadRequestException(
            `Mindestbestellwert ${rv.mindestBestellwert} € nicht erreicht (aktuell: ${gesamtpreis.toFixed(2)} €)`,
          );
        }
        // Skonto berechnen
        if (rv.skonto) {
          const prozent = parseFloat(rv.skonto);
          if (!isNaN(prozent)) {
            skontoAbzug = gesamtpreis * (prozent / 100);
          }
        }
        // abrufVolumen aktualisieren
        rv.abrufVolumen = Number(rv.abrufVolumen) + gesamtpreis;
        await this.rvRepo.save(rv);
      }
    }

    // Genehmigungspflicht nach Schwellenwerten
    if (gesamtpreis > 1000) {
      genehmigungErforderlich = true;
    }

    const endpreis = gesamtpreis - skontoAbzug;
    const status = genehmigungErforderlich ? 'GENEHMIGUNG_ANGEFORDERT' : 'BESTELLT';

    const entity = this.bestellungRepo.create({
      id: randomUUID(),
      artikelId: dto.artikelId,
      artikelBezeichnung: dto.artikelBezeichnung,
      marktplatz: dto.marktplatz,
      lieferant: dto.lieferant,
      einzelpreis: dto.einzelpreis,
      menge: dto.menge,
      gesamtpreis,
      skontoAbzug,
      endpreis,
      waehrung: dto.waehrung || 'EUR',
      status,
      rahmenvertragNr: dto.rahmenvertragNr || null,
      genehmigungErforderlich,
      begruendung: dto.begruendung || null,
    } as Partial<BestellungEntity>);

    const saved = await this.bestellungRepo.save(entity);
    return this.mapBestellung(saved as BestellungEntity);
  }

  async getBestellungen(): Promise<Bestellung[]> {
    const entities = await this.bestellungRepo.find({ order: { erstelltAm: 'DESC' } });
    return entities.map((e) => this.mapBestellung(e));
  }

  async approveBestellung(id: string): Promise<Bestellung> {
    const entity = await this.bestellungRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Bestellung ${id} nicht gefunden`);

    entity.status = 'GENEHMIGT';
    entity.genehmigungVon = 'Admin';
    entity.genehmigungAm = new Date();

    const saved = await this.bestellungRepo.save(entity);
    return this.mapBestellung(saved);
  }

  async rejectBestellung(id: string, grund: string): Promise<Bestellung> {
    const entity = await this.bestellungRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Bestellung ${id} nicht gefunden`);

    entity.status = 'ABGELEHNT';
    entity.ablehnungsgrund = grund || 'Kein Grund angegeben';

    const saved = await this.bestellungRepo.save(entity);
    return this.mapBestellung(saved);
  }

  private mapBestellung(e: BestellungEntity): Bestellung {
    const toIso = (d: Date | string | null | undefined): string => {
      if (!d) return '';
      return d instanceof Date ? d.toISOString() : String(d);
    };
    return {
      id: e.id,
      artikelId: e.artikelId,
      artikelBezeichnung: e.artikelBezeichnung,
      marktplatz: e.marktplatz as any,
      lieferant: e.lieferant,
      einzelpreis: Number(e.einzelpreis),
      menge: e.menge,
      gesamtpreis: Number(e.gesamtpreis),
      skontoAbzug: Number(e.skontoAbzug),
      endpreis: Number(e.endpreis),
      waehrung: e.waehrung,
      status: e.status as any,
      rahmenvertragNr: e.rahmenvertragNr || undefined,
      genehmigungErforderlich: e.genehmigungErforderlich,
      genehmigungVon: e.genehmigungVon || undefined,
      genehmigungAm: toIso(e.genehmigungAm) || undefined,
      ablehnungsgrund: e.ablehnungsgrund || undefined,
      begruendung: e.begruendung || undefined,
      bestelltAm: toIso(e.bestelltAm),
      erstelltAm: toIso(e.erstelltAm),
    };
  }
}
