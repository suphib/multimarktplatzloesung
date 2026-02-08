import type { Rahmenvertrag } from '@procurement/shared';

const CSV_HEADERS = [
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

export function useExportRahmenvertraege() {
  const exportRahmenvertraegeExcel = (rahmenvertraege: Rahmenvertrag[]) => {
    const rows: string[][] = [];

    rows.push(CSV_HEADERS);

    rahmenvertraege.forEach((rv) => {
      const auslastung = rv.maxVolumen > 0
        ? Math.round((rv.abrufVolumen / rv.maxVolumen) * 100)
        : 0;

      rows.push([
        rv.vertragsnummer,
        rv.bezeichnung,
        rv.lieferant,
        rv.status,
        formatDate(rv.gueltigBis),
        formatPrice(rv.maxVolumen),
        formatPrice(rv.abrufVolumen),
        String(auslastung),
        rv.zahlungsbedingungen || '',
        rv.skonto || '',
        formatPrice(rv.mindestBestellwert),
        rv.cpvCodes || '',
        formatDate(rv.erstelltAm),
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
    link.download = `Rahmenvertraege_${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { exportRahmenvertraegeExcel };
}
