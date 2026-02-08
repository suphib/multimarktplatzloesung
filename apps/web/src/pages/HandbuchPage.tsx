import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DetailLayout } from '../components/templates/DetailLayout';
import {
  Search, Sparkles, BarChart3, Cpu, ShieldCheck, FileText,
  RefreshCw, Settings, LayoutDashboard, FileStack, ShoppingCart,
  Store, Database, Plug, Download, HelpCircle, Lightbulb,
  AlertTriangle, ChevronRight, ArrowUp,
} from 'lucide-react';

/* ── Local helper components ─────────────────────────────────── */

function Section({
  id,
  icon: Icon,
  color = 'primary',
  title,
  children,
}: {
  id?: string;
  icon: typeof Search;
  color?: 'primary' | 'amber' | 'emerald' | 'rose' | 'blue' | 'violet';
  title: string;
  children: React.ReactNode;
}) {
  const colors: Record<string, { bg: string; text: string }> = {
    primary: { bg: 'bg-primary-50 dark:bg-primary-900/30', text: 'text-primary-600 dark:text-primary-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
  };
  const c = colors[color];
  return (
    <div id={id} className="scroll-mt-20">
      <div className="flex gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-lg">{title}</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

function StepFlow({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-start my-3">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start sm:items-center gap-2 sm:gap-0">
          <div className="flex items-start gap-2 sm:items-center">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold">
              {i + 1}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="hidden sm:block h-4 w-4 text-gray-300 dark:text-gray-600 mx-2 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex gap-2.5 mt-2">
      <Lightbulb className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
      <span className="text-sm text-blue-800 dark:text-blue-300">{children}</span>
    </div>
  );
}

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-2.5 mt-2">
      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
      <span className="text-sm text-amber-800 dark:text-amber-300">{children}</span>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  label,
  desc,
  href,
}: {
  icon: typeof Search;
  label: string;
  desc: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <Icon className="h-5 w-5 text-primary-500 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{desc}</p>
      </div>
    </a>
  );
}

function KeyboardShortcut({ path }: { path: string }) {
  const parts = path.split('→').map((p) => p.trim());
  return (
    <span className="inline-flex items-center gap-1 my-1">
      {parts.map((part, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600">
            {part}
          </span>
          {i < parts.length - 1 && <ChevronRight className="h-3 w-3 text-gray-400" />}
        </span>
      ))}
    </span>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">{title}</h4>
      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">{children}</div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{q}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{a}</p>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */

export function HandbuchPage() {
  const { t } = useTranslation();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      // Small delay to ensure DOM is rendered after navigation
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hash]);

  const tocItems = [
    { id: 'suche', icon: Search, label: t('handbook.search.title') },
    { id: 'magic-request', icon: Sparkles, label: t('handbook.magicRequest.title') },
    { id: 'preisvergleich', icon: BarChart3, label: t('handbook.compare.title') },
    { id: 'klassifizierung', icon: Cpu, label: t('handbook.classification.title') },
    { id: 'compliance', icon: ShieldCheck, label: t('handbook.compliance.title') },
    { id: 'dokumentation', icon: FileText, label: t('handbook.documentation.title') },
    { id: 'oci', icon: RefreshCw, label: t('handbook.oci.title') },
    { id: 'export', icon: Download, label: t('handbook.export.title') },
    { id: 'admin', icon: Settings, label: t('handbook.admin.title') },
    { id: 'faq', icon: HelpCircle, label: t('handbook.faq.title') },
  ];

  return (
    <DetailLayout title={t('handbook.title')} wide>
      <div className="space-y-6">
        {/* Welcome Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {t('handbook.welcome')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('handbook.welcomeDesc')}</p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('handbook.toc')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tocItems.map(({ id, icon, label }) => (
              <FeatureCard key={id} icon={icon} label={label} desc="" href={`#${id}`} />
            ))}
          </div>
        </div>

        {/* Content sections */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8 space-y-10">

          {/* ── Artikelsuche ──────────────────────────── */}
          <Section id="suche" icon={Search} title={t('handbook.search.title')}>
            <p>{t('handbook.search.desc')}</p>
            <StepFlow steps={[t('handbook.search.step1'), t('handbook.search.step2'), t('handbook.search.step3')]} />
            <TipBox>{t('handbook.search.tip')}</TipBox>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{t('handbook.search.categories')}</p>
          </Section>

          {/* ── Magic Request ─────────────────────────── */}
          <Section id="magic-request" icon={Sparkles} color="violet" title={t('handbook.magicRequest.title')}>
            <p>{t('handbook.magicRequest.desc')}</p>
            <StepFlow
              steps={[
                t('handbook.magicRequest.step1'),
                t('handbook.magicRequest.step2'),
                t('handbook.magicRequest.step3'),
                t('handbook.magicRequest.step4'),
              ]}
            />
            <TipBox>{t('handbook.magicRequest.tip')}</TipBox>
            <WarningBox>{t('handbook.magicRequest.example')}</WarningBox>
          </Section>

          {/* ── Preisvergleich ────────────────────────── */}
          <Section id="preisvergleich" icon={BarChart3} color="emerald" title={t('handbook.compare.title')}>
            <p>{t('handbook.compare.desc')}</p>
            <StepFlow
              steps={[t('handbook.compare.step1'), t('handbook.compare.step2'), t('handbook.compare.step3')]}
            />
            <TipBox>{t('handbook.compare.tip')}</TipBox>
            <p className="mt-2">{t('handbook.compare.export')}</p>
          </Section>

          {/* ── KI-Klassifizierung ────────────────────── */}
          <Section id="klassifizierung" icon={Cpu} color="blue" title={t('handbook.classification.title')}>
            <p>{t('handbook.classification.desc')}</p>
            <StepFlow
              steps={[
                t('handbook.classification.step1'),
                t('handbook.classification.step2'),
                t('handbook.classification.step3'),
              ]}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('handbook.classification.channels')}</p>
            <TipBox>{t('handbook.classification.tip')}</TipBox>
          </Section>

          {/* ── Compliance ────────────────────────────── */}
          <Section id="compliance" icon={ShieldCheck} color="rose" title={t('handbook.compliance.title')}>
            <p>{t('handbook.compliance.desc')}</p>
            <p>{t('handbook.compliance.thresholds')}</p>
            <p>{t('handbook.compliance.checks')}</p>
            <WarningBox>{t('handbook.compliance.hazardous')}</WarningBox>
          </Section>

          {/* ── Vergabedokumentation ──────────────────── */}
          <Section id="dokumentation" icon={FileText} color="amber" title={t('handbook.documentation.title')}>
            <p>{t('handbook.documentation.desc')}</p>
            <p>{t('handbook.documentation.includes')}</p>
            <TipBox>{t('handbook.documentation.tip')}</TipBox>
          </Section>

          {/* ── OCI / SAP ────────────────────────────── */}
          <Section id="oci" icon={RefreshCw} color="blue" title={t('handbook.oci.title')}>
            <p>{t('handbook.oci.desc')}</p>
            <p className="font-medium text-gray-800 dark:text-gray-200">{t('handbook.oci.what')}</p>
            <StepFlow
              steps={[
                t('handbook.oci.step1'),
                t('handbook.oci.step2'),
                t('handbook.oci.step3'),
              ]}
            />
            <StepFlow
              steps={[
                t('handbook.oci.step4'),
                t('handbook.oci.step5'),
              ]}
            />
            <WarningBox>{t('handbook.oci.warning')}</WarningBox>
            <p className="mt-2">{t('handbook.oci.cxml')}</p>
            <p>
              {t('handbook.oci.sapConnection')}{' '}
              <KeyboardShortcut path="Administration → Verbindungen" />
            </p>
          </Section>

          {/* ── Export ────────────────────────────────── */}
          <Section id="export" icon={Download} color="emerald" title={t('handbook.export.title')}>
            <p>{t('handbook.export.desc')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('handbook.export.locations')}</p>
            <StepFlow
              steps={[t('handbook.export.step1'), t('handbook.export.step2'), t('handbook.export.step3')]}
            />
            <TipBox>{t('handbook.export.tip')}</TipBox>
          </Section>

          {/* ── Administration ────────────────────────── */}
          <Section id="admin" icon={Settings} color="amber" title={t('handbook.admin.title')}>
            <p>{t('handbook.admin.desc')}</p>

            <SubSection title={t('handbook.admin.dashboard.title')}>
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-gray-400" />
                <span>{t('handbook.admin.dashboard.desc')}</span>
              </div>
            </SubSection>

            <SubSection title={t('handbook.admin.rahmenvertraege.title')}>
              <div className="flex items-center gap-2">
                <FileStack className="h-4 w-4 text-gray-400" />
                <span>{t('handbook.admin.rahmenvertraege.desc')}</span>
              </div>
            </SubSection>

            <SubSection title={t('handbook.admin.bestellungen.title')}>
              <div className="flex items-start gap-2">
                <ShoppingCart className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p>{t('handbook.admin.bestellungen.desc')}</p>
                  <p className="mt-1">{t('handbook.admin.bestellungen.csvExport')}</p>
                  <KeyboardShortcut path="Admin → Bestellungen → CSV-Export" />
                </div>
              </div>
            </SubSection>

            <SubSection title={t('handbook.admin.shopConfig.title')}>
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-gray-400" />
                <span>{t('handbook.admin.shopConfig.desc')}</span>
              </div>
            </SubSection>

            <SubSection title={t('handbook.admin.katalog.title')}>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-gray-400" />
                <span>{t('handbook.admin.katalog.desc')}</span>
              </div>
            </SubSection>

            <SubSection title={t('handbook.admin.verbindungen.title')}>
              <div className="flex items-start gap-2">
                <Plug className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p>{t('handbook.admin.verbindungen.desc')}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('handbook.admin.verbindungen.sapNote')}</p>
                </div>
              </div>
            </SubSection>
          </Section>

          {/* ── FAQ ───────────────────────────────────── */}
          <Section id="faq" icon={HelpCircle} title={t('handbook.faq.title')}>
            <div className="space-y-3">
              <FaqItem q={t('handbook.faq.q1')} a={t('handbook.faq.a1')} />
              <FaqItem q={t('handbook.faq.q2')} a={t('handbook.faq.a2')} />
              <FaqItem q={t('handbook.faq.q3')} a={t('handbook.faq.a3')} />
              <FaqItem q={t('handbook.faq.q4')} a={t('handbook.faq.a4')} />
              <FaqItem q={t('handbook.faq.q5')} a={t('handbook.faq.a5')} />
            </div>
          </Section>
        </div>

        {/* Back to top */}
        <div className="text-center pb-4">
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowUp className="h-4 w-4" />
            {t('handbook.backToTop')}
          </a>
        </div>
      </div>
    </DetailLayout>
  );
}
