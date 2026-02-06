import { useTranslation } from 'react-i18next';
import { Plug, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../../components/templates/AdminLayout';
import { StatusDot, Spinner, Button } from '../../components/atoms';
import { useShopConfigs } from '../../hooks/useAdmin';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function ConnectionsPage() {
  const { t } = useTranslation();
  const { data: shopConfigs, isLoading: shopsLoading } = useShopConfigs();
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.health(),
  });

  const loading = shopsLoading || healthLoading;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12"><Spinner /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Plug className="h-6 w-6 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">{t('admin.verbindungen.title')}</h1>
          </div>
          <Button variant="secondary" size="sm" onClick={() => refetchHealth()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            {t('admin.verbindungen.statusPruefen')}
          </Button>
        </div>

        {/* Infrastructure */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('admin.verbindungen.infrastruktur')}</h2>
          <div className="space-y-3">
            {health?.services && Object.entries(health.services).map(([key, service]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <span className="text-sm font-medium text-gray-900 capitalize">{key}</span>
                  {service.latenzMs !== undefined && (
                    <span className="ml-2 text-xs text-gray-500">{service.latenzMs}ms</span>
                  )}
                </div>
                <StatusDot
                  status={service.status === 'up' ? 'online' : 'error'}
                  label={service.status === 'up' ? t('admin.verbindungen.verbunden') : t('admin.verbindungen.getrennt')}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Marketplace Connections */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('admin.verbindungen.marktplaetze')}</h2>
          <div className="space-y-3">
            {shopConfigs?.map((shop) => (
              <div key={shop.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-900">{shop.name}</span>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>
                      {t('admin.verbindungen.apiKeyStatus')}:{' '}
                      {shop.apiKeyGesetzt ? t('admin.verbindungen.gesetzt') : t('admin.verbindungen.nichtGesetzt')}
                    </span>
                    <span>
                      {t('admin.verbindungen.letztePruefung')}:{' '}
                      {shop.letzteSynchronisation
                        ? new Date(shop.letzteSynchronisation).toLocaleString('de-DE')
                        : '—'}
                    </span>
                  </div>
                </div>
                <StatusDot
                  status={shop.aktiv ? 'online' : 'offline'}
                  label={shop.aktiv ? t('admin.verbindungen.verbunden') : t('admin.verbindungen.getrennt')}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
