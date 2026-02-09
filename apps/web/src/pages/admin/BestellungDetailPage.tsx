import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  X,
  AlertTriangle,
  Clock,
  FileText,
  Tag,
} from 'lucide-react';
import { AdminLayout } from '../../components/templates/AdminLayout';
import { Badge, Button, Spinner } from '../../components/atoms';
import {
  useBestellung,
  useApproveBestellung,
  useRejectBestellung,
} from '../../hooks/useAdmin';
import type { BestellStatus } from '@procurement/shared';

const STATUS_BADGE: Record<BestellStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  ENTWURF: 'default',
  GENEHMIGUNG_ANGEFORDERT: 'warning',
  GENEHMIGT: 'success',
  BESTELLT: 'info',
  ABGELEHNT: 'danger',
};

const MARKTPLATZ_COLOR: Record<string, string> = {
  AMAZON_BUSINESS: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  MERCATEO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  CONRAD: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  RAHMENVERTRAG: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(val: number, waehrung = 'EUR'): string {
  return val.toLocaleString('de-DE', { style: 'currency', currency: waehrung });
}

const TIMELINE_STEPS: { status: BestellStatus; labelKey: string }[] = [
  { status: 'ENTWURF', labelKey: 'admin.bestellungen.entwurf' },
  { status: 'GENEHMIGUNG_ANGEFORDERT', labelKey: 'admin.bestellungen.ausstehend' },
  { status: 'GENEHMIGT', labelKey: 'admin.bestellungen.genehmigt' },
  { status: 'BESTELLT', labelKey: 'admin.bestellungen.bestellt' },
];

function getTimelineIndex(status: BestellStatus): number {
  if (status === 'ABGELEHNT') return 1; // rejected after GENEHMIGUNG_ANGEFORDERT
  return TIMELINE_STEPS.findIndex((s) => s.status === status);
}

export function BestellungDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: bestellung, isLoading, error } = useBestellung(id!);
  const approveMutation = useApproveBestellung();
  const rejectMutation = useRejectBestellung();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectGrund, setRejectGrund] = useState('');

  const handleApprove = () => {
    if (!id) return;
    approveMutation.mutate(id);
  };

  const handleReject = () => {
    if (!id) return;
    rejectMutation.mutate({ id, grund: rejectGrund });
    setShowRejectModal(false);
    setRejectGrund('');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      </AdminLayout>
    );
  }

  if (error || !bestellung) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-gray-500">
          {t('admin.bestellungen.nichtGefunden')}
          <br />
          <Button variant="secondary" onClick={() => navigate('/admin/bestellungen')} className="mt-4">
            {t('admin.bestellungen.zurueck')}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const b = bestellung;
  const currentStep = getTimelineIndex(b.status);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <button
              onClick={() => navigate('/admin/bestellungen')}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('admin.bestellungen.zurueck')}
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {b.artikelBezeichnung}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <span>{b.lieferant}</span>
              <span>·</span>
              <Badge variant={STATUS_BADGE[b.status]}>
                {t(`admin.bestellungen.${b.status === 'GENEHMIGUNG_ANGEFORDERT' ? 'ausstehend' : b.status === 'ENTWURF' ? 'entwurf' : b.status === 'GENEHMIGT' ? 'genehmigt' : b.status === 'BESTELLT' ? 'bestellt' : 'abgelehnt'}`)}
              </Badge>
            </div>
          </div>
          {b.status === 'GENEHMIGUNG_ANGEFORDERT' && (
            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4 mr-1" />
                {t('admin.bestellungen.genehmigen')}
              </Button>
              <Button
                onClick={() => setShowRejectModal(true)}
                disabled={rejectMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <X className="h-4 w-4 mr-1" />
                {t('admin.bestellungen.ablehnen')}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Artikeldetails */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              {t('admin.bestellungen.artikelDetails')}
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">{t('admin.bestellungen.artikelId')}</dt>
                <dd className="text-gray-900 dark:text-gray-100 font-mono text-xs">{b.artikelId}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-gray-500 dark:text-gray-400">{t('admin.bestellungen.marktplatz')}</dt>
                <dd>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${MARKTPLATZ_COLOR[b.marktplatz] || 'bg-gray-100 text-gray-700'}`}>
                    {t(`common.marketplace.${b.marktplatz}`, { defaultValue: b.marktplatz })}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">{t('admin.bestellungen.lieferant')}</dt>
                <dd className="text-gray-900 dark:text-gray-100">{b.lieferant}</dd>
              </div>
            </dl>
          </div>

          {/* Preisaufstellung */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
              <ShoppingCart className="h-4 w-4" />
              {t('admin.bestellungen.preisaufstellung')}
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">{t('order.einzelpreis')}</dt>
                <dd className="text-gray-900 dark:text-gray-100">{formatCurrency(b.einzelpreis, b.waehrung)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">{t('order.menge')}</dt>
                <dd className="text-gray-900 dark:text-gray-100">{b.menge}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">{t('order.gesamtpreis')}</dt>
                <dd className="text-gray-900 dark:text-gray-100">{formatCurrency(b.gesamtpreis, b.waehrung)}</dd>
              </div>
              {b.skontoAbzug > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{t('order.skonto')}</dt>
                  <dd className="text-green-600 font-medium">-{formatCurrency(b.skontoAbzug, b.waehrung)}</dd>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                <dt className="font-semibold text-gray-900 dark:text-gray-100">{t('order.endpreis')}</dt>
                <dd className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                  {formatCurrency(b.endpreis, b.waehrung)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Rahmenvertrag */}
          {b.rahmenvertragNr && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                {t('admin.bestellungen.rahmenvertrag')}
              </h3>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {b.rahmenvertragNr}
              </p>
            </div>
          )}

          {/* Begründung */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
              {t('admin.bestellungen.begruendung')}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {b.begruendung || <span className="text-gray-400">{t('admin.bestellungen.keineBegruendung')}</span>}
            </p>
          </div>
        </div>

        {/* Genehmigung Timeline */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
            {t('admin.bestellungen.genehmigung')}
          </h3>
          <div className="flex items-center gap-0">
            {TIMELINE_STEPS.map((step, i) => {
              const isActive = i <= currentStep;
              const isRejected = b.status === 'ABGELEHNT' && i === 1;
              return (
                <div key={step.status} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isRejected
                          ? 'bg-red-500 text-white'
                          : isActive
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}
                    >
                      {isRejected ? <X className="h-4 w-4" /> : isActive ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={`text-xs mt-1 text-center ${isActive ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-400'}`}>
                      {isRejected ? t('admin.bestellungen.abgelehnt') : t(step.labelKey)}
                    </span>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Approval details */}
          {(b.genehmigungVon || b.genehmigungAm || b.ablehnungsgrund) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1 text-sm">
              {b.genehmigungVon && (
                <p className="text-gray-600 dark:text-gray-400">
                  {t('admin.bestellungen.genehmigungVon')}: <span className="text-gray-900 dark:text-gray-100">{b.genehmigungVon}</span>
                </p>
              )}
              {b.genehmigungAm && (
                <p className="text-gray-600 dark:text-gray-400">
                  {t('admin.bestellungen.genehmigungAm')}: <span className="text-gray-900 dark:text-gray-100">{formatDate(b.genehmigungAm)}</span>
                </p>
              )}
              {b.ablehnungsgrund && (
                <div className="flex items-start gap-2 text-red-600 dark:text-red-400 mt-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{b.ablehnungsgrund}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Zeitstempel */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {t('admin.bestellungen.zeitpunkt')}
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">{t('admin.bestellungen.erstelltAm')}</dt>
              <dd className="text-gray-900 dark:text-gray-100">{formatDate(b.erstelltAm)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">{t('admin.bestellungen.bestelltAm')}</dt>
              <dd className="text-gray-900 dark:text-gray-100">{formatDate(b.bestelltAm)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
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
              <Button variant="secondary" onClick={() => { setShowRejectModal(false); setRejectGrund(''); }}>
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
