import type { Dokumentation } from '@procurement/shared';
import { Badge } from '../atoms';
import { ClassificationBadge } from '../molecules/ClassificationBadge';
import { FileText, Shield, Hash, CheckCircle, AlertCircle } from 'lucide-react';

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
  PRUEFUNG_ERFORDERLICH: 'Prüfung erforderlich',
  NICHT_KONFORM: 'Nicht konform',
};

export function DocumentationPanel({ dokumentation }: DocumentationPanelProps) {
  const { klassifizierung, compliancePruefung } = dokumentation;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary-600" />
          Vergabedokumentation
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Artikel</dt>
            <dd className="font-medium mt-0.5">{dokumentation.artikelBezeichnung}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Zeitstempel</dt>
            <dd className="mt-0.5">{new Date(dokumentation.zeitstempel).toLocaleString('de-DE')}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Benutzer</dt>
            <dd className="mt-0.5">{dokumentation.benutzer}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Klassifizierung</dt>
            <dd className="mt-0.5">
              <ClassificationBadge
                kanal={klassifizierung.empfohlenerKanal}
                konfidenz={klassifizierung.konfidenz}
                konfidenzWert={klassifizierung.konfidenzWert}
              />
            </dd>
          </div>
        </dl>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Begründung</h3>
          <p className="text-sm">{dokumentation.begruendung || klassifizierung.begruendung}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary-600" />
          Compliance-Prüfung
        </h2>
        <Badge variant={statusVariant[compliancePruefung.status] ?? 'warning'}>
          {statusLabels[compliancePruefung.status] ?? compliancePruefung.status}
        </Badge>
        <p className="text-sm text-gray-600 mt-2">{compliancePruefung.schwellenwertKategorie}</p>
        <ul className="mt-3 space-y-2">
          {compliancePruefung.pruefpunkte.map((p, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm py-1">
              {p.erfuellt ? (
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-medium">{p.bezeichnung}</span>
                {p.hinweis && <p className="text-gray-500 mt-0.5">{p.hinweis}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Hash className="h-5 w-5 text-primary-600" />
          Integritätsnachweis
        </h2>
        <p className="text-xs text-gray-500 mb-2">
          SHA-256 Hash zur Sicherstellung der Dokumentenintegrität
        </p>
        <code className="text-xs bg-gray-50 border border-gray-200 p-3 rounded-lg block break-all font-mono">
          {dokumentation.integritaetsHash}
        </code>
      </div>
    </div>
  );
}
