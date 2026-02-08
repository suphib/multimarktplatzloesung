import { Test, TestingModule } from '@nestjs/testing';
import { MagicRequestService } from './magic-request.service';
import { MagicRequestAiService } from './magic-request-ai.service';

describe('MagicRequestService', () => {
  let service: MagicRequestService;
  let aiService: jest.Mocked<MagicRequestAiService>;

  const mockAiResult = {
    positionen: [
      {
        beschreibung: 'Dell Latitude Laptop',
        menge: 5,
        einheit: 'Stück',
        geschaetzterPreis: null,
        waehrung: 'EUR',
        lieferantHinweis: 'Dell',
        artikelnummerHinweis: '',
        kategorie: 'IT-Hardware',
        konfidenz: 0.9,
      },
    ],
    zusammenfassung: '1 Position erkannt',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MagicRequestService,
        {
          provide: MagicRequestAiService,
          useValue: { parse: jest.fn().mockResolvedValue(mockAiResult) },
        },
      ],
    }).compile();

    service = module.get(MagicRequestService);
    aiService = module.get(MagicRequestAiService);
  });

  it('sollte Freitext mit KI analysieren', async () => {
    const result = await service.parse('Bitte bestellen Sie 5 Dell Latitude Laptops');

    expect(result.methode).toBe('ki');
    expect(result.positionen).toHaveLength(1);
    expect(result.positionen[0].beschreibung).toBe('Dell Latitude Laptop');
    expect(result.positionen[0].menge).toBe(5);
    expect(result.positionen[0].kategorie).toBe('IT-Hardware');
    expect(result.zusammenfassung).toBeDefined();
  });

  it('sollte auf regelbasiertes Parsing zurückfallen', async () => {
    aiService.parse.mockRejectedValue(new Error('API nicht erreichbar'));

    const result = await service.parse('5 Laptops bestellen');

    expect(result.methode).toBe('regelbasiert');
    expect(result.positionen.length).toBeGreaterThan(0);
  });

  it('sollte verarbeitungszeit messen', async () => {
    const result = await service.parse('5 Laptops bestellen');
    expect(result.verarbeitungszeit).toBeGreaterThanOrEqual(0);
  });

  describe('regelbasiertesParsen', () => {
    it('sollte Mengen erkennen', () => {
      const result = service.regelbasiertesParsen('5 Laptops');
      expect(result.positionen).toHaveLength(1);
      expect(result.positionen[0].menge).toBe(5);
    });

    it('sollte mehrere Artikel erkennen', () => {
      const result = service.regelbasiertesParsen('3 Monitore und 2 Tastaturen');
      expect(result.positionen).toHaveLength(2);
      expect(result.positionen[0].menge).toBe(3);
      expect(result.positionen[1].menge).toBe(2);
    });

    it('sollte Preise erkennen', () => {
      const result = service.regelbasiertesParsen('Laptop für 1200 EUR');
      expect(result.positionen).toHaveLength(1);
      expect(result.positionen[0].geschaetzterPreis).toBe(1200);
    });

    it('sollte Markennamen erkennen', () => {
      const result = service.regelbasiertesParsen('Dell Latitude Laptop');
      expect(result.positionen).toHaveLength(1);
      expect(result.positionen[0].lieferantHinweis).toBe('Dell');
    });

    it('sollte bei unklarem Text leeres Array zurückgeben', () => {
      const result = service.regelbasiertesParsen('Keine Artikel hier');
      expect(result.positionen).toHaveLength(0);
    });

    it('sollte komplexen Besprechungstext parsen', () => {
      const text = `IT-Ausstattung für neue Mitarbeiter:
- 3 Laptops Dell Latitude
- 3 Monitore 27 Zoll
- 3 Tastaturen
- 3 Mäuse`;
      const result = service.regelbasiertesParsen(text);
      expect(result.positionen.length).toBeGreaterThanOrEqual(4);
    });

    it('sollte Kategorien korrekt zuordnen', () => {
      const laptopResult = service.regelbasiertesParsen('1 Laptop');
      expect(laptopResult.positionen[0].kategorie).toBe('IT-Hardware');

      const stuhlResult = service.regelbasiertesParsen('1 Stuhl');
      expect(stuhlResult.positionen[0].kategorie).toBe('Büromöbel');

      const papierResult = service.regelbasiertesParsen('10 Pakete Papier');
      expect(papierResult.positionen[0].kategorie).toBe('Bürobedarf');
    });

    it('sollte konfidenz 0.4 für regelbasierte Items setzen', () => {
      const result = service.regelbasiertesParsen('5 Laptops');
      expect(result.positionen[0].konfidenz).toBe(0.4);
    });

    it('sollte Zusammenfassung generieren', () => {
      const result = service.regelbasiertesParsen('3 Laptops und 2 Monitore');
      expect(result.zusammenfassung).toContain('erkannt');
    });

    it('sollte Tippfehler und zusammengeschriebene Zahlen erkennen', () => {
      const result = service.regelbasiertesParsen('5laptos mit 16gb arbeitsspeicher');
      expect(result.positionen).toHaveLength(1);
      expect(result.positionen[0].menge).toBe(5);
      expect(result.positionen[0].beschreibung).toContain('Laptop');
      expect(result.positionen[0].beschreibung).toContain('16');
    });
  });
});
