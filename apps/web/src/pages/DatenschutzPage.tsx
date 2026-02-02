import { useTranslation } from 'react-i18next';
import { DetailLayout } from '../components/templates/DetailLayout';
import { Shield, Server, Cookie, Cpu, UserCheck, ExternalLink, Building2, Info } from 'lucide-react';

function Section({ icon: Icon, title, children }: { icon: typeof Shield; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="text-sm text-gray-600 space-y-2">{children}</div>
      </div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-primary-400 mt-1.5 flex-shrink-0">
            <svg className="h-1.5 w-1.5 fill-current" viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" /></svg>
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function DatenschutzPage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  return (
    <DetailLayout title={t('footer.privacy')} backTo="/search">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {isEn ? 'Privacy Policy' : 'Datenschutzerklärung'}
          </h2>
          <p className="text-sm text-gray-500">
            {isEn
              ? 'How we handle your data in this application'
              : 'Wie wir mit Ihren Daten in dieser Anwendung umgehen'}
          </p>
        </div>

        {/* Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">{isEn ? 'Demo Application' : 'Demo-Anwendung'}</p>
            <p className="mt-1 text-blue-600">
              {isEn
                ? 'This application is a demonstration prototype for AI-powered procurement classification. No real personal data is stored or processed. All articles, prices, and supplier information shown are sample data.'
                : 'Diese Anwendung ist ein Demonstrations-Prototyp für KI-gestützte Beschaffungsklassifizierung. Es werden keine echten personenbezogenen Daten gespeichert oder verarbeitet. Alle angezeigten Artikel, Preise und Lieferanteninformationen sind Beispieldaten.'}
            </p>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-8">
          <Section icon={Building2} title={isEn ? '1. Responsible Party' : '1. Verantwortlicher'}>
            <p className="font-medium text-gray-900">WP Workers GmbH</p>
            <p>Eichendorffstr. 13, 82223 Eichenau{isEn ? ', Germany' : ''}</p>
            <p>
              {isEn ? 'Email' : 'E-Mail'}:{' '}
              <a href="mailto:datenschutz@wp-workers.de" className="text-primary-600 hover:underline">
                datenschutz@wp-workers.de
              </a>
            </p>
          </Section>

          <Section icon={Server} title={isEn ? '2. Data Processing' : '2. Datenverarbeitung'}>
            <p>
              {isEn
                ? 'When using this demo application, the following data may be processed:'
                : 'Bei der Nutzung dieser Demo-Anwendung können folgende Daten verarbeitet werden:'}
            </p>
            <BulletList items={isEn ? [
              'Language preference — stored locally in your browser (localStorage)',
              'Search queries — transmitted to the API server, not stored permanently',
              'Server logs — IP address and browser info may be temporarily recorded',
            ] : [
              'Spracheinstellung — wird lokal in Ihrem Browser (localStorage) gespeichert',
              'Suchanfragen — werden an den API-Server übermittelt, keine dauerhafte Speicherung',
              'Server-Logs — IP-Adresse und Browser-Informationen können temporär erfasst werden',
            ]} />
          </Section>

          <Section icon={Cookie} title={isEn ? '3. Cookies' : '3. Cookies'}>
            <p>
              {isEn
                ? 'This application uses only technically necessary local storage (language preference). No tracking cookies or third-party analytics are used.'
                : 'Diese Anwendung verwendet ausschließlich technisch notwendigen lokalen Speicher (Spracheinstellung). Es werden keine Tracking-Cookies oder Drittanbieter-Analysetools eingesetzt.'}
            </p>
          </Section>

          <Section icon={Cpu} title={isEn ? '4. AI Services' : '4. KI-Dienste'}>
            <p>
              {isEn
                ? 'The classification feature uses Azure OpenAI. The following safeguards are in place:'
                : 'Die Klassifizierungsfunktion nutzt Azure OpenAI. Folgende Schutzmaßnahmen sind implementiert:'}
            </p>
            <BulletList items={isEn ? [
              'Encrypted connections (TLS/VPN) for all API communication',
              'No training on customer data',
              'Processing exclusively in EU/German data centers',
              'Only article descriptions are transmitted — no personal data',
            ] : [
              'Verschlüsselte Verbindungen (TLS/VPN) für alle API-Kommunikation',
              'Kein Training mit Kundendaten',
              'Verarbeitung ausschließlich in EU-/deutschen Rechenzentren',
              'Es werden nur Artikelbeschreibungen übermittelt — keine personenbezogenen Daten',
            ]} />
            <p className="text-xs text-gray-400 mt-2">
              {isEn
                ? 'Legal basis: Art. 6(1)(b) GDPR (contract fulfillment) and Art. 6(1)(f) GDPR (legitimate interest).'
                : 'Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).'}
            </p>
          </Section>

          <Section icon={UserCheck} title={isEn ? '5. Your Rights' : '5. Ihre Rechte'}>
            <p>
              {isEn
                ? 'Under the GDPR you have the right to access, rectification, deletion, restriction of processing, data portability, and the right to object.'
                : 'Nach der DSGVO haben Sie das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch.'}
            </p>
            <p>
              {isEn ? 'Contact' : 'Kontakt'}:{' '}
              <a href="mailto:datenschutz@wp-workers.de" className="text-primary-600 hover:underline">
                datenschutz@wp-workers.de
              </a>
            </p>
          </Section>

          <Section icon={ExternalLink} title={isEn ? '6. Full Privacy Policy' : '6. Vollständige Datenschutzerklärung'}>
            <p>
              {isEn
                ? 'The complete privacy policy of WP Workers GmbH is available at:'
                : 'Die vollständige Datenschutzerklärung der WP Workers GmbH finden Sie unter:'}
            </p>
            <a
              href="https://wp-workers.de/datenschutz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary-600 hover:underline font-medium"
            >
              wp-workers.de/datenschutz
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Section>
        </div>
      </div>
    </DetailLayout>
  );
}
