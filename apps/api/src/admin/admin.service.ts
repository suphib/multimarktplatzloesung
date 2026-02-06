import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import { RahmenvertragEntity } from '../embedding/entities/rahmenvertrag.entity';
import { FrameworkContractEntity } from '../search/entities/framework-contract.entity';
import { ShopConfigEntity } from './entities/shop-config.entity';
import { CreateRahmenvertragDto } from './dto/create-rahmenvertrag.dto';
import { UpdateRahmenvertragDto } from './dto/update-rahmenvertrag.dto';
import { UpdateShopConfigDto } from './dto/update-shop-config.dto';
import { CreateKatalogArtikelDto } from './dto/create-katalog-artikel.dto';
import { QueryFrameworkItemsDto } from './dto/query-framework-items.dto';
import type {
  AdminDashboardStats,
  PaginatedResponse,
  FrameworkContractItem,
  Rahmenvertrag,
  ShopConfig,
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
      gueltigBis: new Date(dto.gueltigBis),
      cpvCodes: dto.cpvCodes || '',
      maxVolumen: dto.maxVolumen || 0,
    });
    const saved = await this.rvRepo.save(entity);
    return this.mapRahmenvertrag(saved);
  }

  async updateRahmenvertrag(id: string, dto: UpdateRahmenvertragDto): Promise<Rahmenvertrag> {
    const entity = await this.rvRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Rahmenvertrag ${id} nicht gefunden`);

    if (dto.bezeichnung !== undefined) entity.bezeichnung = dto.bezeichnung;
    if (dto.beschreibung !== undefined) entity.beschreibung = dto.beschreibung;
    if (dto.lieferant !== undefined) entity.lieferant = dto.lieferant;
    if (dto.vertragsnummer !== undefined) entity.vertragsnummer = dto.vertragsnummer;
    if (dto.gueltigBis !== undefined) entity.gueltigBis = new Date(dto.gueltigBis);
    if (dto.cpvCodes !== undefined) entity.cpvCodes = dto.cpvCodes;
    if (dto.maxVolumen !== undefined) entity.maxVolumen = dto.maxVolumen;

    const saved = await this.rvRepo.save(entity);
    return this.mapRahmenvertrag(saved);
  }

  async deleteRahmenvertrag(id: string): Promise<void> {
    const entity = await this.rvRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Rahmenvertrag ${id} nicht gefunden`);
    await this.rvRepo.remove(entity);
  }

  private mapRahmenvertrag(e: RahmenvertragEntity): Rahmenvertrag {
    return {
      id: e.id,
      bezeichnung: e.bezeichnung,
      beschreibung: e.beschreibung,
      lieferant: e.lieferant,
      vertragsnummer: e.vertragsnummer,
      gueltigBis: e.gueltigBis instanceof Date ? e.gueltigBis.toISOString() : String(e.gueltigBis),
      cpvCodes: e.cpvCodes || '',
      maxVolumen: Number(e.maxVolumen) || 0,
      erstelltAm: e.erstelltAm instanceof Date ? e.erstelltAm.toISOString() : String(e.erstelltAm),
    };
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
}
