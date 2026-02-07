import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FileText, LayoutDashboard, Database, Store, Plug } from 'lucide-react';
import { AdminLayout } from '../../components/templates/AdminLayout';
import { StatusDot, Spinner } from '../../components/atoms';
import { useAdminStats, useShopConfigs } from '../../hooks/useAdmin';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: shopConfigs } = useShopConfigs();
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.health(),
  });

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
