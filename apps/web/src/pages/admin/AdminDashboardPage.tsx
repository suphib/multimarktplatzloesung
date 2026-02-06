import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FileText, Search, LayoutDashboard, Database, Store, Plug } from 'lucide-react';
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
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: t('admin.dashboard.rahmenvertraegeAktiv'),
      value: stats?.rahmenvertraegeAktiv ?? '—',
      icon: FileText,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: t('admin.dashboard.katalogArtikel'),
      value: stats?.katalogArtikelGesamt ?? '—',
      icon: Database,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: t('admin.dashboard.shopKonfigurationen'),
      value: stats?.shopKonfigurationen ?? '—',
      icon: Store,
      color: 'text-orange-600 bg-orange-50',
    },
    {
      label: t('admin.dashboard.shopKonfigurationenAktiv'),
      value: stats?.shopKonfigurationenAktiv ?? '—',
      icon: Plug,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
        </div>

        {/* Stat Cards */}
        {statsLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className={`inline-flex p-2 rounded-lg ${card.color} mb-3`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('admin.dashboard.schnellzugriff')}</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/rahmenvertraege"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100"
            >
              <FileText className="h-4 w-4" />
              {t('admin.dashboard.neuerRahmenvertrag')}
            </Link>
            <Link
              to="/admin/katalog"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              <Search className="h-4 w-4" />
              {t('admin.dashboard.katalogDurchsuchen')}
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('admin.dashboard.systemStatus')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {health?.services && Object.entries(health.services).map(([key, service]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
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
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('admin.dashboard.shopVerbindungen')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {shopConfigs.map((shop) => (
                <div key={shop.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">{shop.name}</span>
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
