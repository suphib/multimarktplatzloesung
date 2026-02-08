import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Rahmenvertrag } from '@procurement/shared';

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

const mockRahmenvertraege: Rahmenvertrag[] = [
  {
    id: 'rv-1',
    bezeichnung: 'IT-Endgeräte',
    beschreibung: 'Rahmenvertrag für IT-Endgeräte',
    lieferant: 'Bechtle AG',
    vertragsnummer: 'RV-2024-IT-001',
    gueltigAb: '2024-01-01T00:00:00Z',
    gueltigBis: '2025-12-31T00:00:00Z',
    cpvCodes: '30213100,30231000',
    maxVolumen: 500000,
    abrufVolumen: 125000,
    status: 'AKTIV' as any,
    ansprechpartner: 'Hans Schmidt',
    ansprechpartnerEmail: 'schmidt@bechtle.de',
    ansprechpartnerTelefon: '+49 123 456789',
    zahlungsbedingungen: '30 Tage netto',
    skonto: '2% bei Zahlung innerhalb 14 Tage',
    kuendigungsfrist: '3 Monate',
    produktkategorien: 'Laptops, Monitore',
    mindestBestellwert: 100,
    dokumente: [],
    verlaengerungen: [],
    notizen: '',
    erstelltAm: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rv-2',
    bezeichnung: 'Büromöbel',
    beschreibung: 'Rahmenvertrag für Büromöbel',
    lieferant: 'Sedus AG',
    vertragsnummer: 'RV-2024-BM-002',
    gueltigAb: '2024-03-01T00:00:00Z',
    gueltigBis: '2026-02-28T00:00:00Z',
    cpvCodes: '39112000',
    maxVolumen: 200000,
    abrufVolumen: 180000,
    status: 'AKTIV' as any,
    ansprechpartner: 'Maria Weber',
    ansprechpartnerEmail: 'weber@sedus.de',
    ansprechpartnerTelefon: '+49 987 654321',
    zahlungsbedingungen: '14 Tage netto',
    skonto: '3% bei Zahlung innerhalb 7 Tage',
    kuendigungsfrist: '6 Monate',
    produktkategorien: 'Stühle, Tische',
    mindestBestellwert: 250,
    dokumente: [],
    verlaengerungen: [],
    notizen: 'Wichtig',
    erstelltAm: '2024-03-01T00:00:00Z',
  },
];

describe('useExportRahmenvertraege', () => {
  let exportRahmenvertraegeExcel: (rahmenvertraege: Rahmenvertrag[]) => void;

  beforeEach(async () => {
    const mod = await import('./useExportRahmenvertraege');
    exportRahmenvertraegeExcel = mod.useExportRahmenvertraege().exportRahmenvertraegeExcel;
  });

  it('should generate CSV with correct header row', () => {
    exportRahmenvertraegeExcel(mockRahmenvertraege);
    const headerLine = capturedContent.split('\r\n')[0].replace('\uFEFF', '');

    const expectedHeaders = [
      'Vertragsnummer',
      'Bezeichnung',
      'Lieferant',
      'Status',
      'Gültig bis',
      'Max. Volumen',
      'Abruf-Volumen',
      'Auslastung %',
      'Zahlungsbedingungen',
      'Skonto',
      'Mindestbestellwert',
      'CPV-Codes',
      'Erstellt am',
    ];

    expectedHeaders.forEach((header) => {
      expect(headerLine).toContain(header);
    });
  });

  it('should include UTF-8 BOM', () => {
    exportRahmenvertraegeExcel(mockRahmenvertraege);
    expect(capturedContent.charCodeAt(0)).toBe(0xfeff);
  });

  it('should calculate volume utilization percentage correctly', () => {
    exportRahmenvertraegeExcel(mockRahmenvertraege);

    // rv-1: 125000/500000 = 25%
    // rv-2: 180000/200000 = 90%
    const lines = capturedContent.split('\r\n');
    // Data lines contain auslastung percentage
    expect(lines[1]).toContain(';25;');
    expect(lines[2]).toContain(';90;');
  });

  it('should format dates in German locale', () => {
    exportRahmenvertraegeExcel(mockRahmenvertraege);
    expect(capturedContent).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/);
  });

  it('should handle umlauts correctly via BOM', () => {
    exportRahmenvertraegeExcel(mockRahmenvertraege);
    expect(capturedContent).toContain('Büromöbel');
    expect(capturedContent).toContain('Gültig bis');
  });

  it('should use semicolon as separator', () => {
    exportRahmenvertraegeExcel(mockRahmenvertraege);
    const lines = capturedContent.split('\r\n');
    expect(lines[0]).toContain(';');
  });

  it('should include data for all rahmenvertraege', () => {
    exportRahmenvertraegeExcel(mockRahmenvertraege);
    const lines = capturedContent.split('\r\n').filter((l) => l.trim());

    expect(lines.length).toBe(3);
    expect(capturedContent).toContain('RV-2024-IT-001');
    expect(capturedContent).toContain('RV-2024-BM-002');
  });

  it('should handle empty array', () => {
    exportRahmenvertraegeExcel([]);
    const lines = capturedContent.split('\r\n').filter((l) => l.trim());
    expect(lines.length).toBe(1);
  });

  it('should generate filename with date and .csv extension', () => {
    exportRahmenvertraegeExcel(mockRahmenvertraege);
    const link = (document.createElement as any).mock.results[0].value;
    expect(link.download).toMatch(/Rahmenvertraege_\d{4}-\d{2}-\d{2}\.csv/);
  });

  it('should handle zero maxVolumen gracefully', () => {
    const rvZeroVolumen: Rahmenvertrag = {
      ...mockRahmenvertraege[0],
      id: 'rv-zero',
      maxVolumen: 0,
      abrufVolumen: 0,
    };

    exportRahmenvertraegeExcel([rvZeroVolumen]);
    // Should not crash on division by zero
    expect(capturedContent).toContain('RV-2024-IT-001');
  });

  it('should format volume values with comma decimal separator', () => {
    exportRahmenvertraegeExcel(mockRahmenvertraege);
    expect(capturedContent).toContain('500000,00');
    expect(capturedContent).toContain('125000,00');
  });

  it('should trigger download', () => {
    exportRahmenvertraegeExcel(mockRahmenvertraege);
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
});
