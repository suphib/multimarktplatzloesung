import type { Dokumentation } from '@procurement/shared';
import { Badge } from '../atoms';
import { ClassificationBadge } from '../molecules/ClassificationBadge';
import { FileText, Shield, Hash } from 'lucide-react';

interface DocumentationPanelProps {
  dokumentation: Dokumentation;
}

const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  KONFORM: 'success',
  PRUEFUNG_ERFORDERLICH: 'warning',
  NICHT_KONFORM: 'danger',
};

const statusLabels: Record<string, string> = {
  KONFORM: 'Konform',
  PRUEFUNG_ERFORDERLICH: 'Pruefung erforderlich',
  NICHT_KONFORM: 'Nicht konform',
};

export function DocumentationPanel({ dokumentation }: DocumentationPanelProps) {
  const { klassifizierung, compliancePruefung } = dokumentation;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5" />
          Vergabedokumentation
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Artikel</dt>
            <dd className="font-medium">{dokumentation.artikelBezeichnung}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Zeitstempel</dt>
            <dd>{new Date(dokumentation.zeitstempel).toLocaleString('de-DE')}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Benutzer</dt>
            <dd>{dokumentation.benutzer}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Klassifizierung</dt>
            <dd>
              <ClassificationBadge
                kanal={klassifizierung.empfohlenerKanal}
                konfidenz={klassifizierung.konfidenz}
                konfidenzWert={klassifizierung.konfidenzWert}
              />
            </dd>
          </div>
        </dl>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Begruendung</h3>
          <p className="text-sm">{dokumentation.begruendung || klassifizierung.begruendung}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5" />
          Compliance-Pruefung
        </h2>
        <Badge variant={statusVariant[compliancePruefung.status] ?? 'warning'}>
          {statusLabels[compliancePruefung.status] ?? compliancePruefung.status}
        </Badge>
        <p className="text-sm text-gray-600 mt-2">{compliancePruefung.schwellenwertKategorie}</p>
        <ul className="mt-3 space-y-2">
          {compliancePruefung.pruefpunkte.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className={p.erfuellt ? 'text-green-500' : 'text-yellow-500'}>
                {p.erfuellt ? '✓' : '○'}
              </span>
              <div>
                <span className="font-medium">{p.bezeichnung}</span>
                {p.hinweis && <p className="text-gray-500">{p.hinweis}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Hash className="h-5 w-5" />
          Integritaetsnachweis
        </h2>
        <code className="text-xs bg-gray-100 p-2 rounded block break-all">
          {dokumentation.integritaetsHash}
        </code>
      </div>
    </div>
  );
}
