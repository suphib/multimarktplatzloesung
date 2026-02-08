const CSV_HEADER = 'titel;beschreibung;lieferant;artikelnummer;preis;waehrung;cpvCodes;lieferzeit;nachhaltigkeitslabel;verfuegbar';

const CSV_EXAMPLE =
  'Dell Latitude 5540;Business Laptop 15.6 Zoll i7;Dell Technologies;DELL-LAT5540;1189.00;EUR;30213100;3-5 Werktage;Energy Star,EPEAT Gold;true';

export function downloadCsvTemplate() {
  const content = `${CSV_HEADER}\n${CSV_EXAMPLE}\n`;
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'katalog-import-vorlage.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCsvPreview(file: File, maxRows = 5): Promise<{ headers: string[]; rows: string[][] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 1) {
        reject(new Error('CSV ist leer'));
        return;
      }
      const headers = lines[0].split(';').map((h) => h.trim());
      const rows = lines
        .slice(1, 1 + maxRows)
        .map((line) => line.split(';').map((cell) => cell.trim()));
      resolve({ headers, rows });
    };
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
    reader.readAsText(file, 'UTF-8');
  });
}
