import type { Bestellung } from '@procurement/shared';

const CSV_HEADERS = [
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

function formatPrice(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('de-DE');
}

function escapeCSV(value: string): string {
  const escaped = String(value).replace(/"/g, '""');
  return escaped.includes(';') || escaped.includes('"') || escaped.includes('\n')
    ? `"${escaped}"`
    : escaped;
}

export function useExportBestellungen() {
  const exportBestellungenCSV = (bestellungen: Bestellung[]) => {
    const rows: string[][] = [];

    rows.push(CSV_HEADERS);

    bestellungen.forEach((b) => {
      rows.push([
        b.id,
        formatDate(b.bestelltAm),
        b.artikelBezeichnung,
        b.lieferant,
        b.marktplatz,
        String(b.menge),
        formatPrice(b.einzelpreis),
        formatPrice(b.gesamtpreis),
        formatPrice(b.skontoAbzug),
        formatPrice(b.endpreis),
        b.status,
        b.rahmenvertragNr || '',
        b.genehmigungVon || '',
        b.begruendung || '',
      ]);
    });

    const csv = rows
      .map((row) => row.map(escapeCSV).join(';'))
      .join('\r\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const today = new Date().toISOString().slice(0, 10);
    link.download = `Bestellungen_${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { exportBestellungenCSV };
}
