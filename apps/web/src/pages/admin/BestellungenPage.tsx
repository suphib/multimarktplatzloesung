import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../../components/templates/AdminLayout';
import { Button, Spinner } from '../../components/atoms';
import { useBestellungen, useApproveBestellung, useRejectBestellung } from '../../hooks/useAdmin';
import { Check, X, AlertTriangle, ShoppingCart, Download } from 'lucide-react';
import { useExportBestellungen } from '../../hooks/useExportBestellungen';
import type { Bestellung, BestellStatus } from '@procurement/shared';

type FilterStatus = 'ALLE' | BestellStatus;

export function BestellungenPage() {
  const { t } = useTranslation();
  const { data: bestellungen, isLoading } = useBestellungen();
  const approveMutation = useApproveBestellung();
  const rejectMutation = useRejectBestellung();
  const { exportBestellungenCSV } = useExportBestellungen();

  const [filter, setFilter] = useState<FilterStatus>('ALLE');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectGrund, setRejectGrund] = useState('');

  const filtered = bestellungen?.filter((b) =>
    filter === 'ALLE' ? true : b.status === filter,
  ) ?? [];

  const ausstehendCount = bestellungen?.filter((b) => b.status === 'GENEHMIGUNG_ANGEFORDERT').length ?? 0;

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = () => {
    if (rejectId) {
      rejectMutation.mutate({ id: rejectId, grund: rejectGrund });
      setRejectId(null);
      setRejectGrund('');
    }
  };

  const statusBadge = (status: BestellStatus) => {
    const map: Record<BestellStatus, { bg: string; label: string }> = {
      ENTWURF: { bg: 'bg-gray-100 text-gray-700', label: t('admin.bestellungen.entwurf', { defaultValue: 'Entwurf' }) },
      GENEHMIGUNG_ANGEFORDERT: { bg: 'bg-amber-100 text-amber-800', label: t('admin.bestellungen.ausstehend') },
      GENEHMIGT: { bg: 'bg-green-100 text-green-800', label: t('admin.bestellungen.genehmigt') },
      BESTELLT: { bg: 'bg-blue-100 text-blue-800', label: t('admin.bestellungen.bestellt') },
      ABGELEHNT: { bg: 'bg-red-100 text-red-800', label: t('admin.bestellungen.abgelehnt') },
    };
    const s = map[status] ?? map.ENTWURF;
    return <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.bg}`}>{s.label}</span>;
  };

  const filters: { key: FilterStatus; label: string; count?: number }[] = [
    { key: 'ALLE', label: t('admin.bestellungen.alle') },
    { key: 'GENEHMIGUNG_ANGEFORDERT', label: t('admin.bestellungen.ausstehend'), count: ausstehendCount },
    { key: 'GENEHMIGT', label: t('admin.bestellungen.genehmigt') },
    { key: 'BESTELLT', label: t('admin.bestellungen.bestellt') },
    { key: 'ABGELEHNT', label: t('admin.bestellungen.abgelehnt') },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('admin.bestellungen.title')}
            </h1>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => exportBestellungenCSV(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">{t('admin.export.csv', { defaultValue: 'CSV-Export' })}</span>
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                filter === key
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              {label}
              {count !== undefined && count > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <Spinner size="lg" className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>{t('admin.bestellungen.keine')}</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                      {t('admin.katalog.titel')}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {t('admin.katalog.lieferant')}
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                      {t('order.endpreis')}
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                      {t('admin.rahmenvertraege.status')}
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                      {t('admin.common.bearbeiten', { defaultValue: 'Aktion' })}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                          {b.artikelBezeichnung}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {b.menge}x · {b.rahmenvertragNr || b.marktplatz}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                        {b.lieferant}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {b.endpreis.toLocaleString('de-DE', { style: 'currency', currency: b.waehrung })}
                        </div>
                        {b.skontoAbzug > 0 && (
                          <div className="text-xs text-green-600">
                            -{b.skontoAbzug.toLocaleString('de-DE', { style: 'currency', currency: b.waehrung })} Skonto
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {statusBadge(b.status)}
                        {b.ablehnungsgrund && (
                          <div className="text-xs text-red-500 mt-1 max-w-[120px] truncate mx-auto" title={b.ablehnungsgrund}>
                            {b.ablehnungsgrund}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {b.status === 'GENEHMIGUNG_ANGEFORDERT' && (
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleApprove(b.id)}
                              disabled={approveMutation.isPending}
                              title={t('admin.bestellungen.genehmigen')}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setRejectId(b.id)}
                              disabled={rejectMutation.isPending}
                              title={t('admin.bestellungen.ablehnen')}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('admin.bestellungen.ablehnen')}
              </h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.bestellungen.ablehnungsgrund')}
              </label>
              <textarea
                value={rejectGrund}
                onChange={(e) => setRejectGrund(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <Button variant="secondary" onClick={() => { setRejectId(null); setRejectGrund(''); }}>
                {t('compare.cancel')}
              </Button>
              <Button
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {t('admin.bestellungen.ablehnen')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
