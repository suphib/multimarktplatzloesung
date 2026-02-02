import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { Marktplatz } from '@procurement/shared';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SearchService],
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
});
