import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FileText, LayoutDashboard, Database, Store, Plug } from 'lucide-react';
import { AdminLayout } from '../../components/templates/AdminLayout';
import { StatusDot, Spinner } from '../../components/atoms';
import { useAdminStats, useShopConfigs, useModus, useImportSandboxDaten } from '../../hooks/useAdmin';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { AlertTriangle, Plus, RefreshCw } from 'lucide-react';

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: shopConfigs } = useShopConfigs();
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.health(),
  });
  const { data: modusData } = useModus();
  const importSandboxDaten = useImportSandboxDaten();
  const isSandbox = modusData?.aktuellerModus === 'SANDBOX';

  const handleImportAdditiv = () => {
    importSandboxDaten.mutate('ADDITIV');
  };

  const handleImportErsetzend = () => {
    if (window.confirm(t('admin.sandbox.replaceConfirm'))) {
      importSandboxDaten.mutate('ERSETZEND');
    }
  };

  const statCards = [
    {
      label: t('admin.dashboard.rahmenvertraegeGesamt'),
      value: stats?.rahmenvertraegeGesamt ?? '—',
      icon: FileText,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
      to: '/admin/rahmenvertraege',
    },
    {
      label: t('admin.dashboard.rahmenvertraegeAktiv'),
      value: stats?.rahmenvertraegeAktiv ?? '—',
      icon: FileText,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/30',
      to: '/admin/rahmenvertraege',
    },
    {
      label: t('admin.dashboard.katalogArtikel'),
      value: stats?.katalogArtikelGesamt ?? '—',
      icon: Database,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
      to: '/admin/katalog',
    },
    {
      label: t('admin.dashboard.shopKonfigurationen'),
      value: stats?.shopKonfigurationen ?? '—',
      icon: Store,
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30',
      to: '/admin/shop-config',
    },
    {
      label: t('admin.dashboard.shopKonfigurationenAktiv'),
      value: stats?.shopKonfigurationenAktiv ?? '—',
      icon: Plug,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30',
      to: '/admin/verbindungen',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('admin.dashboard.title')}</h1>
        </div>

        {/* Stat Cards */}
        {statsLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statCards.map((card) => (
              <Link
                key={card.label}
                to={card.to}
                className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-3 hover:border-primary-300 hover:shadow-sm dark:hover:border-primary-700 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`inline-flex p-1.5 rounded-lg ${card.color}`}>
                    <card.icon className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{card.label}</p>
              </Link>
            ))}
          </div>
        )}

        {/* Sandbox Data Management (only in sandbox mode) */}
        {isSandbox && (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-5">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-300">{t('admin.sandbox.title')}</h2>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{t('admin.sandbox.description')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleImportAdditiv}
                disabled={importSandboxDaten.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700 transition-colors disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                {t('admin.sandbox.additive')}
              </button>
              <button
                onClick={handleImportErsetzend}
                disabled={importSandboxDaten.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {t('admin.sandbox.replace')}
              </button>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('admin.dashboard.systemStatus')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {health?.services && Object.entries(health.services).map(([key, service]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{key}</span>
                <StatusDot
                  status={service.status === 'up' ? 'online' : 'error'}
                  label={service.status === 'up' ? t('admin.dashboard.online') : t('admin.dashboard.offline')}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Shop Connection Status */}
        {shopConfigs && shopConfigs.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('admin.dashboard.shopVerbindungen')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {shopConfigs.map((shop) => (
                <div key={shop.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{shop.name}</span>
                  <StatusDot
                    status={shop.aktiv ? 'online' : 'offline'}
                    label={shop.aktiv ? t('admin.dashboard.verbunden') : t('admin.dashboard.getrennt')}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
