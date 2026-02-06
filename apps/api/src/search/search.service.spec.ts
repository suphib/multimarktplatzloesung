import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { FrameworkContractEntity } from './entities/framework-contract.entity';
import { Marktplatz } from '@procurement/shared';

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue([]),
};

const mockRepository = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    mockQueryBuilder.getMany.mockResolvedValue([]);
    mockQueryBuilder.where.mockReturnThis();
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getRepositoryToken(FrameworkContractEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get(SearchService);
  });

  it('sollte Suchergebnisse zurückgeben', async () => {
    const result = await service.search({ suchbegriff: 'Laptop' });
    expect(result.ergebnisse.length).toBeGreaterThan(0);
    expect(result.gesamt).toBeGreaterThan(0);
  });

  it('sollte nach Marktplatz filtern', async () => {
    const result = await service.search({
      suchbegriff: 'Laptop',
      marktplaetze: [Marktplatz.AMAZON_BUSINESS],
    });
    result.ergebnisse.forEach((a) => {
      expect(a.marktplatz).toBe(Marktplatz.AMAZON_BUSINESS);
    });
  });

  it('sollte nach Preis filtern', async () => {
    const result = await service.search({
      suchbegriff: 'Laptop',
      preisVon: 1000,
      preisBis: 1300,
    });
    result.ergebnisse.forEach((a) => {
      expect(a.preis).toBeGreaterThanOrEqual(1000);
      expect(a.preis).toBeLessThanOrEqual(1300);
    });
  });

  it('sollte Aggregationen enthalten', async () => {
    const result = await service.search({ suchbegriff: 'Laptop' });
    expect(result.aggregationen).toBeDefined();
    expect(result.aggregationen.marktplaetze).toBeDefined();
  });

  it('sollte leere Ergebnisse für unbekannte Suche liefern', async () => {
    const result = await service.search({ suchbegriff: 'xyznonexistent123' });
    expect(result.ergebnisse.length).toBe(0);
  });

  // ═══════════════════════════════════════════════════════════════
  // Tests für neue DLR-Anforderungen
  // ═══════════════════════════════════════════════════════════════

  it('sollte Dienstleistungen finden', async () => {
    const result = await service.search({ suchbegriff: 'Dienstleistung' });
    expect(result.ergebnisse.length).toBeGreaterThan(0);
    // Alle Ergebnisse sollten Dienstleistungs-bezogen sein
    const hasService = result.ergebnisse.some((a) =>
      a.bezeichnung.toLowerCase().includes('support') ||
      a.bezeichnung.toLowerCase().includes('schulung') ||
      a.bezeichnung.toLowerCase().includes('reinigung') ||
      a.bezeichnung.toLowerCase().includes('wartung') ||
      a.bezeichnung.toLowerCase().includes('installation'),
    );
    expect(hasService).toBe(true);
  });

  it('sollte IT-Support Dienstleistung finden', async () => {
    const result = await service.search({ suchbegriff: 'IT-Support' });
    expect(result.ergebnisse.length).toBeGreaterThan(0);
    expect(result.ergebnisse[0].bezeichnung).toContain('IT-Support');
  });

  it('sollte Lieferanten-Aggregation zurückgeben', async () => {
    const result = await service.search({ suchbegriff: 'Laptop' });
    expect(result.aggregationen.lieferanten).toBeDefined();
    expect(result.aggregationen.lieferanten!.length).toBeGreaterThan(0);
    // Lieferanten sollten nach Anzahl sortiert sein (absteigend)
    const counts = result.aggregationen.lieferanten!.map((l) => l.count);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeLessThanOrEqual(counts[i - 1]);
    }
  });

  it('sollte Dienstleistungen-Kategorie in Aggregationen haben', async () => {
    const result = await service.search({ suchbegriff: 'Dienstleistung' });
    const dienstleistungsKategorie = result.aggregationen.kategorien.find(
      (k) => k.bezeichnung === 'Dienstleistungen',
    );
    expect(dienstleistungsKategorie).toBeDefined();
    expect(dienstleistungsKategorie!.anzahl).toBeGreaterThan(0);
  });

  // ═══════════════════════════════════════════════════════════════
  // Tests für Rahmenvertrags-Artikel (Framework Contracts)
  // ═══════════════════════════════════════════════════════════════

  it('sollte Rahmenvertrags-Artikel in Aggregationen aufnehmen', async () => {
    mockQueryBuilder.getMany.mockResolvedValueOnce([
      {
        id: 'fc-test-1',
        titel: 'Dell Latitude 5550 Laptop (Rahmenvertrag)',
        beschreibung: '15.6 Zoll Business Laptop',
        lieferant: 'Bechtle AG',
        preis: 1049,
        waehrung: 'EUR',
        rahmenvertragsNummer: 'RV-2024-IT-001',
        artikelnummer: 'RV-DELL-5550',
        nachhaltigkeitslabel: 'Energy Star',
        lieferzeit: 'Laut Rahmenvertrag',
        bildUrl: null,
        verfuegbar: true,
        erstelltAm: new Date(),
        cpvCodes: '30213100',
      },
    ]);

    const result = await service.search({ suchbegriff: 'Laptop' });
    const rvAgg = result.aggregationen.marktplaetze.find(
      (m) => m.marktplatz === Marktplatz.RAHMENVERTRAG,
    );
    expect(rvAgg).toBeDefined();
    expect(rvAgg!.anzahl).toBeGreaterThan(0);
    // Framework contract item should appear first
    expect(result.ergebnisse[0].marktplatz).toBe(Marktplatz.RAHMENVERTRAG);
  });

  it('sollte bei DB-Fehler dennoch Marktplatz-Ergebnisse liefern', async () => {
    mockQueryBuilder.getMany.mockRejectedValueOnce(new Error('DB connection failed'));

    const result = await service.search({ suchbegriff: 'Laptop' });
    // Should still return marketplace results despite DB error
    expect(result.ergebnisse.length).toBeGreaterThan(0);
    expect(result.ergebnisse.every((a) => a.marktplatz !== Marktplatz.RAHMENVERTRAG)).toBe(true);
  });
});
