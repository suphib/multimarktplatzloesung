import { useTranslation } from 'react-i18next';
import { DetailLayout } from '../components/templates/DetailLayout';
import { Building2, Mail, Globe, Scale, FileText, Users } from 'lucide-react';

function Section({ icon: Icon, title, children }: { icon: typeof Building2; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
        <div className="text-sm text-gray-600 space-y-1">{children}</div>
      </div>
    </div>
  );
}

export function ImpressumPage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  return (
    <DetailLayout title={t('footer.imprint')}>
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {isEn ? 'Legal Notice' : 'Impressum'}
          </h2>
          <p className="text-sm text-gray-500">
            {isEn
              ? 'Information in accordance with § 5 TMG (German Telemedia Act)'
              : 'Angaben gemäß § 5 TMG'}
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-8">
          <Section icon={Building2} title={isEn ? 'Company' : 'Unternehmen'}>
            <p className="font-medium text-gray-900">WP Workers GmbH</p>
            <p>Eichendorffstr. 13</p>
            <p>82223 Eichenau{isEn ? ', Germany' : ''}</p>
          </Section>

          <Section icon={Users} title={isEn ? 'Represented by' : 'Vertreten durch'}>
            <p>{isEn ? 'Managing Director' : 'Geschäftsführer'}: Suphi Basdemir</p>
          </Section>

          <Section icon={Mail} title={isEn ? 'Contact' : 'Kontakt'}>
            <p>
              {isEn ? 'Email' : 'E-Mail'}:{' '}
              <a href="mailto:info@wp-workers.de" className="text-primary-600 hover:underline">
                info@wp-workers.de
              </a>
            </p>
            <p>
              {isEn ? 'Website' : 'Web'}:{' '}
              <a href="https://wp-workers.de" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                wp-workers.de
              </a>
            </p>
          </Section>

          <Section icon={FileText} title={isEn ? 'Commercial Register' : 'Handelsregister'}>
            <p>{isEn ? 'Registered at' : 'Registergericht'}: Amtsgericht München</p>
            <p>{isEn ? 'Registration number' : 'Registernummer'}: HRB [{isEn ? 'on request' : 'auf Anfrage'}]</p>
          </Section>

          <Section icon={Globe} title={isEn ? 'VAT ID' : 'Umsatzsteuer-ID'}>
            <p>
              {isEn
                ? 'VAT identification number according to § 27a UStG'
                : 'Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG'}
              : DE [{isEn ? 'on request' : 'auf Anfrage'}]
            </p>
          </Section>

          <Section icon={Users} title={isEn ? 'Responsible for content' : 'Verantwortlich für den Inhalt'}>
            <p className="text-xs text-gray-400 mb-1">§ 55 Abs. 2 RStV</p>
            <p>Suphi Basdemir, WP Workers GmbH</p>
          </Section>

          <Section icon={Scale} title={isEn ? 'Dispute Resolution' : 'Streitschlichtung'}>
            <p>
              {isEn
                ? 'The European Commission provides a platform for online dispute resolution (OS):'
                : 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:'}
            </p>
            <p>
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline break-all">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
            <p className="text-gray-500">
              {isEn
                ? 'We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.'
                : 'Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'}
            </p>
          </Section>
        </div>
      </div>
    </DetailLayout>
  );
}
