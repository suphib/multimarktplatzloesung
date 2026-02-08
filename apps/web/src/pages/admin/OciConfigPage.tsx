import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Link2, RefreshCw, ExternalLink, Copy, Check, Clock,
  FileCode2, ArrowRight, Terminal, Settings2, Table,
} from 'lucide-react';
import { api } from '../../lib/api';
import { AdminLayout } from '../../components/templates/AdminLayout';
import { StatusDot, Button, Spinner } from '../../components/atoms';

const UNIT_MAPPING = [
  { de: 'Stück', iso: 'EA' },
  { de: 'Packung', iso: 'PK' },
  { de: 'Karton', iso: 'CT' },
  { de: 'Palette', iso: 'PF' },
  { de: 'Liter', iso: 'LT' },
  { de: 'Kilogramm', iso: 'KG' },
  { de: 'Meter', iso: 'MT' },
  { de: 'Set', iso: 'SET' },
  { de: 'Paar', iso: 'PR' },
  { de: 'Rolle', iso: 'RL' },
];

const OCI_FIELDS = [
  'DESCRIPTION', 'QUANTITY', 'UNIT', 'PRICE', 'CURRENCY',
  'VENDORMAT', 'VENDOR', 'CONTRACT', 'MATGROUP', 'LEADTIME', 'LONGTEXT',
] as const;

function CopyButton({ text }: { text: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
      title={t('admin.oci.copyUrl')}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          {t('admin.oci.copied')}
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {t('admin.oci.copyUrl')}
        </>
      )}
    </button>
  );
}

function EndpointCard({
  title,
  url,
  method,
  desc,
}: {
  title: string;
  url: string;
  method: string;
  desc: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded">
          {method}
        </span>
      </div>
      <code className="block text-sm bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 break-all font-mono">
        {url}
      </code>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">{desc}</span>
        <CopyButton text={url} />
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Link2;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

export function OciConfigPage() {
  const { t } = useTranslation();
  const [activeSessions, setActiveSessions] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL || '/api/v1';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const ociSetupUrl = `${origin}${apiBase}/oci/setup`;
  const cxmlSetupUrl = `${origin}${apiBase}/cxml/setup`;
  const cxmlOrderUrl = `${origin}${apiBase}/cxml/order`;

  const fetchStatus = useCallback(async () => {
    try {
      const status = await api.getOciStatus();
      setActiveSessions(status.activeSessions);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatus();
  };

  const handleTestSession = () => {
    window.open(
      `${apiBase}/oci/setup?HOOK_URL=${encodeURIComponent(origin + '/search')}`,
      '_blank',
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12"><Spinner /></div>
      </AdminLayout>
    );
  }

  const curlCmd = `curl -X POST ${cxmlSetupUrl} \\
  -H "Content-Type: application/xml" \\
  -d '<?xml version="1.0" encoding="UTF-8"?>
<cXML payloadID="test-1" timestamp="2026-01-01T00:00:00Z">
  <Header>
    <Sender><Credential domain="TEST">
      <Identity>test</Identity>
      <SharedSecret>secret</SharedSecret>
    </Credential></Sender>
  </Header>
  <Request>
    <PunchOutSetupRequest operation="create">
      <BuyerCookie>test-cookie</BuyerCookie>
      <BrowserFormPost><URL>${origin}/search</URL></BrowserFormPost>
    </PunchOutSetupRequest>
  </Request>
</cXML>'`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link2 className="h-6 w-6 text-primary-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t('admin.oci.configTitle')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.oci.desc')}</p>
            </div>
          </div>
        </div>

        {/* ── Active Sessions Status ──────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusDot
                status={activeSessions > 0 ? 'online' : 'offline'}
                label={`${t('admin.oci.activeSessions')}: ${activeSessions}`}
              />
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {t('admin.oci.sessionTtl')}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              {t('admin.oci.refresh')}
            </Button>
          </div>
        </div>

        {/* ── Endpoints ──────────────────────────── */}
        <div>
          <SectionHeader
            icon={Link2}
            title={t('admin.oci.endpoints')}
            desc={t('admin.oci.endpointsDesc')}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EndpointCard
              title={t('admin.oci.ociSetupUrl')}
              url={ociSetupUrl}
              method="POST"
              desc={t('admin.oci.ociSetupDesc')}
            />
            <EndpointCard
              title={t('admin.oci.cxmlSetupUrl')}
              url={cxmlSetupUrl}
              method="POST"
              desc={t('admin.oci.cxmlSetupDesc')}
            />
            <EndpointCard
              title={t('admin.oci.cxmlOrderUrl')}
              url={cxmlOrderUrl}
              method="POST"
              desc={t('admin.oci.cxmlOrderDesc')}
            />
          </div>
        </div>

        {/* ── Protocol Info ──────────────────────── */}
        <div>
          <SectionHeader
            icon={FileCode2}
            title={t('admin.oci.protocol')}
            desc={t('admin.oci.protocolDesc')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('admin.oci.ociProtocol')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.oci.ociProtocolDesc')}</p>
              <div className="flex items-center gap-2 pt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded font-mono">ERP</span>
                <ArrowRight className="h-3 w-3" />
                <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded font-mono">POST /oci/setup</span>
                <ArrowRight className="h-3 w-3" />
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded font-mono">Katalog</span>
                <ArrowRight className="h-3 w-3" />
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded font-mono">ERP</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('admin.oci.cxmlProtocol')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.oci.cxmlProtocolDesc')}</p>
              <div className="flex items-center gap-2 pt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded font-mono">ERP</span>
                <ArrowRight className="h-3 w-3" />
                <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded font-mono">POST /cxml/setup</span>
                <ArrowRight className="h-3 w-3" />
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded font-mono">XML</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Field Mapping ──────────────────────── */}
        <div>
          <SectionHeader
            icon={Table}
            title={t('admin.oci.fieldMapping')}
            desc={t('admin.oci.fieldMappingDesc')}
          />
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                    {t('admin.oci.ociField')}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                    {t('admin.oci.internalField')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {OCI_FIELDS.map((field) => (
                  <tr key={field} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <td className="px-4 py-2.5">
                      <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200">
                        NEW_ITEM-{field}
                      </code>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">
                      {t(`admin.oci.fields.${field}`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Unit Mapping ───────────────────────── */}
        <div>
          <SectionHeader
            icon={RefreshCw}
            title={t('admin.oci.unitMapping')}
            desc={t('admin.oci.unitMappingDesc')}
          />
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                    {t('admin.oci.germanUnit')}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                    {t('admin.oci.isoUnit')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {UNIT_MAPPING.map(({ de, iso }) => (
                  <tr key={de} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{de}</td>
                    <td className="px-4 py-2.5">
                      <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200">
                        {iso}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Test & Integration ─────────────────── */}
        <div>
          <SectionHeader
            icon={Terminal}
            title={t('admin.oci.testing')}
            desc={t('admin.oci.testingDesc')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OCI Test */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('admin.oci.testSession')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.oci.testOciDesc')}</p>
              <Button variant="secondary" size="sm" onClick={handleTestSession}>
                <ExternalLink className="h-4 w-4 mr-1" />
                {t('admin.oci.testSession')}
              </Button>
            </div>

            {/* cXML Test */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('admin.oci.curlExample')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.oci.testCxmlDesc')}</p>
              <div className="relative">
                <pre className="text-xs bg-gray-900 text-green-400 rounded-lg px-4 py-3 overflow-x-auto">
                  {curlCmd}
                </pre>
                <div className="absolute top-2 right-2">
                  <CopyButton text={curlCmd} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SAP Setup Guide ────────────────────── */}
        <div>
          <SectionHeader
            icon={Settings2}
            title={t('admin.oci.sapSetup')}
            desc={t('admin.oci.sapSetupDesc')}
          />
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <ol className="space-y-3">
              {([
                t('admin.oci.sapStep1'),
                t('admin.oci.sapStep2'),
                t('admin.oci.sapStep3'),
                t('admin.oci.sapStep4'),
                t('admin.oci.sapStep5'),
              ]).map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 pt-0.5">
                    {text}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
