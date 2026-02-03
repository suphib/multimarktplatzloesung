import type { Artikel } from '@procurement/shared';

interface ExportData {
  title: string;
  date: string;
  articles: Artikel[];
  specs?: Record<string, Record<string, string>>;
}

export function useExport() {
  const exportToPDF = async (data: ExportData) => {
    // Create a printable HTML document and trigger print dialog
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = generatePrintHTML(data);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const exportToExcel = (data: ExportData) => {
    // Generate CSV content (Excel-compatible)
    const rows: string[][] = [];

    // Header row
    rows.push(['Artikel', 'Bezeichnung', 'Preis (EUR)', 'Marktplatz', 'Lieferant', 'Lieferzeit', 'Artikelnummer']);

    // Data rows
    data.articles.forEach((article, index) => {
      rows.push([
        String(index + 1),
        article.bezeichnung,
        article.preis.toFixed(2).replace('.', ','),
        article.marktplatz,
        article.lieferant,
        article.lieferzeit,
        article.artikelnummer,
      ]);
    });

    // Add specs if available
    if (data.specs && Object.keys(data.specs).length > 0) {
      rows.push([]);
      rows.push(['Technische Spezifikationen']);
      rows.push([]);

      const specKeys = Object.keys(data.specs);
      const firstArticle = specKeys[0];
      const specLabels = Object.keys(data.specs[firstArticle] || {});

      // Header for specs
      rows.push(['Spezifikation', ...data.articles.map(a => a.bezeichnung)]);

      // Spec rows
      specLabels.forEach(label => {
        const row = [label];
        data.articles.forEach(article => {
          const articleSpecs = data.specs?.[article.id] || {};
          row.push(articleSpecs[label] || '-');
        });
        rows.push(row);
      });
    }

    // Add summary
    if (data.articles.length > 0) {
      const prices = data.articles.map(a => a.preis);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      rows.push([]);
      rows.push(['Zusammenfassung']);
      rows.push(['Günstigster Preis', `${minPrice.toFixed(2).replace('.', ',')} EUR`]);
      rows.push(['Teuerster Preis', `${maxPrice.toFixed(2).replace('.', ',')} EUR`]);
      rows.push(['Ersparnis', `${(maxPrice - minPrice).toFixed(2).replace('.', ',')} EUR`]);
    }

    // Convert to CSV
    const csv = rows.map(row =>
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma or quote
        const escaped = String(cell).replace(/"/g, '""');
        return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')
          ? `"${escaped}"`
          : escaped;
      }).join(';') // Use semicolon for German Excel
    ).join('\r\n');

    // Add BOM for UTF-8
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });

    // Download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFilename(data.title)}_${data.date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { exportToPDF, exportToExcel };
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9äöüÄÖÜß\-_]/g, '_').substring(0, 50);
}

function generatePrintHTML(data: ExportData): string {
  const articleRows = data.articles.map((article, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><strong>${escapeHtml(article.bezeichnung)}</strong><br><small>${escapeHtml(article.beschreibung)}</small></td>
      <td style="text-align: right; white-space: nowrap;">${article.preis.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
      <td>${escapeHtml(article.marktplatz)}</td>
      <td>${escapeHtml(article.lieferant)}</td>
      <td>${escapeHtml(article.lieferzeit)}</td>
    </tr>
  `).join('');

  let specsHTML = '';
  if (data.specs && Object.keys(data.specs).length > 0) {
    const specKeys = Object.keys(data.specs);
    const firstArticle = specKeys[0];
    const specLabels = Object.keys(data.specs[firstArticle] || {});

    const specRows = specLabels.map(label => {
      const cells = data.articles.map(article => {
        const articleSpecs = data.specs?.[article.id] || {};
        return `<td>${escapeHtml(articleSpecs[label] || '-')}</td>`;
      }).join('');
      return `<tr><td><strong>${escapeHtml(label)}</strong></td>${cells}</tr>`;
    }).join('');

    specsHTML = `
      <h2 style="margin-top: 30px;">Technische Spezifikationen</h2>
      <table>
        <thead>
          <tr>
            <th>Spezifikation</th>
            ${data.articles.map(a => `<th>${escapeHtml(a.bezeichnung)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${specRows}
        </tbody>
      </table>
    `;
  }

  const prices = data.articles.map(a => a.preis);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const savings = maxPrice - minPrice;

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(data.title)}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #333;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 { font-size: 18pt; margin-bottom: 5px; }
        h2 { font-size: 14pt; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .meta { color: #666; font-size: 10pt; margin-bottom: 20px; }
        .summary {
          background: #f0fdf4;
          border: 1px solid #86efac;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }
        .summary strong { color: #166534; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 10pt;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          vertical-align: top;
        }
        th { background: #f8f9fa; font-weight: 600; }
        tr:nth-child(even) { background: #fafafa; }
        small { color: #666; }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          font-size: 9pt;
          color: #666;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(data.title)}</h1>
      <p class="meta">Erstellt am ${data.date} | ${data.articles.length} Artikel</p>

      ${data.articles.length > 1 ? `
        <div class="summary">
          <strong>Mögliche Ersparnis: ${savings.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong><br>
          Günstigstes Angebot: ${minPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} vs. teuerstes: ${maxPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        </div>
      ` : ''}

      <h2>Artikelübersicht</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th>Artikel</th>
            <th style="width: 100px;">Preis</th>
            <th style="width: 100px;">Marktplatz</th>
            <th style="width: 120px;">Lieferant</th>
            <th style="width: 100px;">Lieferzeit</th>
          </tr>
        </thead>
        <tbody>
          ${articleRows}
        </tbody>
      </table>

      ${specsHTML}

      <div class="footer">
        eProcurement KI | WP Workers GmbH | Dieser Ausdruck dient der Dokumentation des Preisvergleichs gemäß Vergaberecht.
      </div>
    </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
