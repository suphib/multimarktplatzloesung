import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Store, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../../components/templates/AdminLayout';
import { StatusDot, Button, Spinner } from '../../components/atoms';
import { Modal, FormField } from '../../components/molecules';
import { useShopConfigs, useUpdateShopConfig, useTriggerShopSync } from '../../hooks/useAdmin';

const mpColors: Record<string, string> = {
  AMAZON_BUSINESS: 'border-l-orange-400',
  MERCATEO: 'border-l-blue-400',
  CONRAD: 'border-l-purple-400',
  RAHMENVERTRAG: 'border-l-green-400',
};

export function ShopConfigPage() {
  const { t } = useTranslation();
  const { data: configs, isLoading } = useShopConfigs();
  const updateMutation = useUpdateShopConfig();
  const syncMutation = useTriggerShopSync();

  const [apiKeyModalId, setApiKeyModalId] = useState<string | null>(null);
  const [apiKeyValue, setApiKeyValue] = useState('');

  const handleToggle = (id: string, aktiv: boolean) => {
    updateMutation.mutate({ id, data: { aktiv: !aktiv } });
  };

  const handleApiKeySave = async () => {
    if (apiKeyModalId && apiKeyValue) {
      await updateMutation.mutateAsync({ id: apiKeyModalId, data: { apiKey: apiKeyValue } });
      setApiKeyModalId(null);
      setApiKeyValue('');
    }
  };

  const handleSync = (id: string) => {
    syncMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12"><Spinner /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Store className="h-6 w-6 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('admin.shopConfig.title')}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {configs?.map((shop) => (
            <div
              key={shop.id}
              className={`bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 border-l-4 ${
                mpColors[shop.typ] || 'border-l-gray-400'
              } p-5 space-y-4`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{shop.name}</h3>
                <StatusDot
                  status={shop.aktiv ? 'online' : 'offline'}
                  label={shop.aktiv ? t('admin.shopConfig.aktiv') : t('admin.shopConfig.inaktiv')}
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t('admin.shopConfig.baseUrl')}</span>
                  <span className="text-gray-700 dark:text-gray-300 truncate ml-2 max-w-[180px]">{shop.baseUrl || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t('admin.shopConfig.apiKey')}</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {shop.apiKeyGesetzt ? '••••••••' : t('admin.shopConfig.nichtGesetzt')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t('admin.shopConfig.letzteSync')}</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {shop.letzteSynchronisation
                      ? new Date(shop.letzteSynchronisation).toLocaleString('de-DE')
                      : '—'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shop.aktiv}
                    onChange={() => handleToggle(shop.id, shop.aktiv)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('admin.shopConfig.aktivieren')}</span>
                </label>
                <button
                  onClick={() => {
                    setApiKeyModalId(shop.id);
                    setApiKeyValue('');
                  }}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  {t('admin.shopConfig.apiKeySetzen')}
                </button>
                <button
                  onClick={() => handleSync(shop.id)}
                  disabled={syncMutation.isPending}
                  className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                  {t('admin.shopConfig.synchronisieren')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* API Key Modal */}
        <Modal
          open={!!apiKeyModalId}
          onClose={() => setApiKeyModalId(null)}
          title={t('admin.shopConfig.apiKeySetzen')}
          size="sm"
        >
          <div className="space-y-4">
            <FormField
              label={t('admin.shopConfig.apiKey')}
              type="password"
              value={apiKeyValue}
              onChange={(e) => setApiKeyValue((e.target as HTMLInputElement).value)}
              placeholder="sk-..."
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setApiKeyModalId(null)}>
                {t('admin.common.abbrechen')}
              </Button>
              <Button onClick={handleApiKeySave} disabled={!apiKeyValue || updateMutation.isPending}>
                {t('admin.common.speichern')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
