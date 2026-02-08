import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Bestellung } from '@procurement/shared';

// Capture the string content passed to Blob
let capturedContent = '';
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn(() => 'blob:test');
const mockRevokeObjectURL = vi.fn();

const OriginalBlob = globalThis.Blob;

beforeEach(() => {
  vi.clearAllMocks();
  capturedContent = '';
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;

  // Intercept Blob constructor to capture content
  globalThis.Blob = class extends OriginalBlob {
    constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
      super(parts, options);
      capturedContent = parts?.map((p) => String(p)).join('') ?? '';
    }
  } as any;

  vi.spyOn(document, 'createElement').mockReturnValue({
    href: '',
    download: '',
    click: mockClick,
    style: {},
  } as unknown as HTMLElement);
  vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
  vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
});

const mockBestellungen: Bestellung[] = [
  {
    id: '1',
    artikelId: 'a1',
    artikelBezeichnung: 'Dell Latitude 5550',
    marktplatz: 'RAHMENVERTRAG' as any,
    lieferant: 'Bechtle AG',
    einzelpreis: 1049.0,
    menge: 3,
    gesamtpreis: 3147.0,
    skontoAbzug: 62.94,
    endpreis: 3084.06,
    waehrung: 'EUR',
    status: 'GENEHMIGT' as any,
    rahmenvertragNr: 'RV-2024-IT-001',
    genehmigungErforderlich: true,
    genehmigungVon: 'Max Müller',
    begruendung: 'Für Abteilung IT',
    bestelltAm: '2024-06-15T10:00:00Z',
    erstelltAm: '2024-06-14T08:00:00Z',
  },
  {
    id: '2',
    artikelId: 'a2',
    artikelBezeichnung: 'Bürostuhl Sedus se:joy',
    marktplatz: 'MERCATEO' as any,
    lieferant: 'Sedus AG',
    einzelpreis: 450.5,
    menge: 1,
    gesamtpreis: 450.5,
    skontoAbzug: 0,
    endpreis: 450.5,
    waehrung: 'EUR',
    status: 'BESTELLT' as any,
    genehmigungErforderlich: false,
    bestelltAm: '2024-06-16T14:00:00Z',
    erstelltAm: '2024-06-16T12:00:00Z',
  },
];

describe('useExportBestellungen', () => {
  let exportBestellungenCSV: (bestellungen: Bestellung[]) => void;

  beforeEach(async () => {
    const mod = await import('./useExportBestellungen');
    exportBestellungenCSV = mod.useExportBestellungen().exportBestellungenCSV;
  });

  it('should generate CSV with correct content type', () => {
    exportBestellungenCSV(mockBestellungen);
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
  });

  it('should include UTF-8 BOM for correct umlaut handling', () => {
    exportBestellungenCSV(mockBestellungen);
    expect(capturedContent.charCodeAt(0)).toBe(0xfeff);
  });

  it('should use semicolon separator for German Excel', () => {
    exportBestellungenCSV(mockBestellungen);
    const lines = capturedContent.split('\r\n');
    expect(lines[0]).toContain(';');
    expect(lines[0]).not.toMatch(/\t/);
  });

  it('should contain all required CSV columns in header', () => {
    exportBestellungenCSV(mockBestellungen);
    const headerLine = capturedContent.split('\r\n')[0].replace('\uFEFF', '');

    const expectedHeaders = [
      'Bestell-Nr',
      'Datum',
      'Artikel',
      'Lieferant',
      'Marktplatz',
      'Menge',
      'Einzelpreis',
      'Gesamtpreis',
      'Skonto',
      'Endpreis',
      'Status',
      'RV-Nr',
      'Genehmigt von',
      'Begründung',
    ];

    expectedHeaders.forEach((header) => {
      expect(headerLine).toContain(header);
    });
  });

  it('should format prices with comma as decimal separator', () => {
    exportBestellungenCSV(mockBestellungen);
    const lines = capturedContent.split('\r\n');

    expect(lines[1]).toContain('1049,00');
    expect(lines[1]).toContain('3147,00');
    expect(lines[1]).toContain('62,94');
    expect(lines[1]).toContain('3084,06');
  });

  it('should format dates in German locale', () => {
    exportBestellungenCSV(mockBestellungen);
    expect(capturedContent).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/);
  });

  it('should include data for all bestellungen', () => {
    exportBestellungenCSV(mockBestellungen);
    const lines = capturedContent.split('\r\n').filter((l) => l.trim());

    expect(lines.length).toBe(3);
    expect(capturedContent).toContain('Dell Latitude 5550');
    expect(capturedContent).toContain('Bürostuhl Sedus se:joy');
  });

  it('should handle empty bestellungen array', () => {
    exportBestellungenCSV([]);
    const lines = capturedContent.split('\r\n').filter((l) => l.trim());
    expect(lines.length).toBe(1);
  });

  it('should generate filename with current date', () => {
    exportBestellungenCSV(mockBestellungen);
    const link = (document.createElement as any).mock.results[0].value;
    expect(link.download).toMatch(/Bestellungen_\d{4}-\d{2}-\d{2}\.csv/);
  });

  it('should trigger download via link click', () => {
    exportBestellungenCSV(mockBestellungen);

    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test');
  });

  it('should handle missing optional fields gracefully', () => {
    const bestellungOhneOptional: Bestellung = {
      id: '3',
      artikelId: 'a3',
      artikelBezeichnung: 'Test Artikel',
      marktplatz: 'AMAZON_BUSINESS' as any,
      lieferant: 'Amazon',
      einzelpreis: 100,
      menge: 1,
      gesamtpreis: 100,
      skontoAbzug: 0,
      endpreis: 100,
      waehrung: 'EUR',
      status: 'ENTWURF' as any,
      genehmigungErforderlich: false,
      bestelltAm: '2024-06-17T10:00:00Z',
      erstelltAm: '2024-06-17T10:00:00Z',
    };

    exportBestellungenCSV([bestellungOhneOptional]);
    expect(capturedContent).toContain('Test Artikel');
  });
});
