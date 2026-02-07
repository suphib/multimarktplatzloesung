import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  FileText,
  Upload,
  Download,
  Trash2,
  Calendar,
  User,
  Mail,
  Phone,
  CreditCard,
  Clock,
  Package,
  StickyNote,
} from 'lucide-react';
import { AdminLayout } from '../../components/templates/AdminLayout';
import { Badge, Button, Spinner } from '../../components/atoms';
import {
  useRahmenvertrag,
  useUpdateRahmenvertrag,
  useUploadDokument,
  useDeleteDokument,
} from '../../hooks/useAdmin';
import { api } from '../../lib/api';
import type { RahmenvertragStatus, RahmenvertragDokument, RahmenvertragVerlaengerung } from '@procurement/shared';

type Tab = 'uebersicht' | 'konditionen' | 'dokumente' | 'verlauf';

const STATUS_BADGE: Record<RahmenvertragStatus, 'success' | 'info' | 'warning' | 'danger'> = {
  AKTIV: 'success',
  ENTWURF: 'info',
  GEKUENDIGT: 'warning',
  ABGELAUFEN: 'danger',
};

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('de-DE');
}

function formatCurrency(val: number): string {
  return val.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function RahmenvertragDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: rv, isLoading, error } = useRahmenvertrag(id!);
  const updateMutation = useUpdateRahmenvertrag();
  const uploadMutation = useUploadDokument();
  const deleteDokMutation = useDeleteDokument();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>('uebersicht');
  const [editingNotizen, setEditingNotizen] = useState(false);
  const [notizenDraft, setNotizenDraft] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'uebersicht', label: t('admin.rahmenvertraege.tab_uebersicht') },
    { key: 'konditionen', label: t('admin.rahmenvertraege.tab_konditionen') },
    { key: 'dokumente', label: t('admin.rahmenvertraege.tab_dokumente') },
    { key: 'verlauf', label: t('admin.rahmenvertraege.tab_verlauf') },
  ];

  const handleFileUpload = useCallback(
    async (files: FileList | File[]) => {
      if (!id) return;
      for (const file of Array.from(files)) {
        await uploadMutation.mutateAsync({ rvId: id, file });
      }
    },
    [id, uploadMutation],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files);
      }
    },
    [handleFileUpload],
  );

  const saveNotizen = async () => {
    if (!id) return;
    await updateMutation.mutateAsync({ id, data: { notizen: notizenDraft } });
    setEditingNotizen(false);
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

  if (error || !rv) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-gray-500">
          Rahmenvertrag nicht gefunden.
          <br />
          <Button variant="secondary" onClick={() => navigate('/admin/rahmenvertraege')} className="mt-4">
            {t('admin.rahmenvertraege.zurueck')}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const volumenProzent = rv.maxVolumen > 0 ? Math.min(100, Math.round((rv.abrufVolumen / rv.maxVolumen) * 100)) : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <button
              onClick={() => navigate('/admin/rahmenvertraege')}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('admin.rahmenvertraege.zurueck')}
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{rv.bezeichnung}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <span>{rv.vertragsnummer}</span>
              <span>·</span>
              <span>{rv.lieferant}</span>
              <span>·</span>
              <Badge variant={STATUS_BADGE[rv.status]}>
                {t(`admin.rahmenvertraege.status_${rv.status.toLowerCase()}` as any)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'uebersicht' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Beschreibung */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {t('admin.rahmenvertraege.beschreibung')}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{rv.beschreibung}</p>
            </div>

            {/* Laufzeit */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                {t('admin.rahmenvertraege.laufzeit')}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {formatDate(rv.gueltigAb)} – {formatDate(rv.gueltigBis)}
              </p>
            </div>

            {/* Volumen */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {t('admin.rahmenvertraege.abrufVolumen')}
              </h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(rv.abrufVolumen)} / {formatCurrency(rv.maxVolumen)}
              </p>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    volumenProzent >= 90 ? 'bg-red-500' : volumenProzent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${volumenProzent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('admin.rahmenvertraege.volumen_prozent', { prozent: volumenProzent })}
              </p>
            </div>

            {/* Produktkategorien */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                <Package className="inline h-4 w-4 mr-1" />
                {t('admin.rahmenvertraege.produktkategorien')}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {rv.produktkategorien
                  ? rv.produktkategorien.split(',').map((k, i) => (
                      <Badge key={i} variant="default">
                        {k.trim()}
                      </Badge>
                    ))
                  : <span className="text-sm text-gray-400">—</span>}
              </div>
            </div>

            {/* Kontakt */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {t('admin.rahmenvertraege.ansprechpartner')}
              </h3>
              {rv.ansprechpartner ? (
                <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    {rv.ansprechpartner}
                  </p>
                  {rv.ansprechpartnerEmail && (
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${rv.ansprechpartnerEmail}`} className="text-primary-600 hover:underline">
                        {rv.ansprechpartnerEmail}
                      </a>
                    </p>
                  )}
                  {rv.ansprechpartnerTelefon && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {rv.ansprechpartnerTelefon}
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-400">—</span>
              )}
            </div>

            {/* CPV-Codes */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {t('admin.rahmenvertraege.cpvCodes')}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {rv.cpvCodes
                  ? rv.cpvCodes.split(',').map((c, i) => (
                      <Badge key={i} variant="info">
                        {c.trim()}
                      </Badge>
                    ))
                  : <span className="text-sm text-gray-400">—</span>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'konditionen' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                <CreditCard className="inline h-4 w-4 mr-1" />
                {t('admin.rahmenvertraege.zahlungsbedingungen')}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {rv.zahlungsbedingungen || '—'}
              </p>
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {t('admin.rahmenvertraege.skonto')}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {rv.skonto || '—'}
              </p>
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                {t('admin.rahmenvertraege.kuendigungsfrist')}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {rv.kuendigungsfrist || '—'}
              </p>
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {t('admin.rahmenvertraege.mindestBestellwert')}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {rv.mindestBestellwert ? formatCurrency(rv.mindestBestellwert) : '—'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'dokumente' && (
          <div className="space-y-4">
            {/* Upload Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragOver
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Dateien hier ablegen oder
              </p>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? 'Wird hochgeladen...' : t('admin.rahmenvertraege.dokumente_hochladen')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFileUpload(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>

            {/* Document List */}
            {rv.dokumente.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                {t('admin.rahmenvertraege.dokumente_keine')}
              </p>
            ) : (
              <div className="space-y-2">
                {rv.dokumente.map((dok: RahmenvertragDokument) => (
                  <div
                    key={dok.id}
                    className="card flex items-center justify-between !p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-primary-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {dok.dateiname}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(dok.groesse)} · {formatDate(dok.hochgeladenAm)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={api.getDokumentUrl(id!, dok.id)}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-primary-600"
                        title={t('admin.rahmenvertraege.dokumente_herunterladen')}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => deleteDokMutation.mutate({ rvId: id!, dokId: dok.id })}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600"
                        title={t('admin.rahmenvertraege.dokumente_loeschen')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'verlauf' && (
          <div className="space-y-6">
            {/* Verlängerungen */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                {t('admin.rahmenvertraege.verlaengerungen')}
              </h3>
              {rv.verlaengerungen.length === 0 ? (
                <p className="text-sm text-gray-400">
                  {t('admin.rahmenvertraege.verlaengerungen_keine')}
                </p>
              ) : (
                <div className="space-y-3">
                  {rv.verlaengerungen.map((v: RahmenvertragVerlaengerung, i: number) => (
                    <div key={i} className="flex items-start gap-3 border-l-2 border-primary-300 pl-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Verlängert bis {formatDate(v.bisNeuesDatum)}
                        </p>
                        <p className="text-xs text-gray-500">
                          am {formatDate(v.datum)}
                          {v.bemerkung && ` — ${v.bemerkung}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notizen */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  <StickyNote className="inline h-4 w-4 mr-1" />
                  {t('admin.rahmenvertraege.notizen')}
                </h3>
                {!editingNotizen && (
                  <button
                    onClick={() => {
                      setNotizenDraft(rv.notizen);
                      setEditingNotizen(true);
                    }}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    {t('admin.common.bearbeiten')}
                  </button>
                )}
              </div>
              {editingNotizen ? (
                <div className="space-y-2">
                  <textarea
                    value={notizenDraft}
                    onChange={(e) => setNotizenDraft(e.target.value)}
                    rows={4}
                    className="input-field text-sm"
                    placeholder={t('admin.rahmenvertraege.notizen_placeholder')}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setEditingNotizen(false)}>
                      {t('admin.common.abbrechen')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveNotizen}
                      disabled={updateMutation.isPending}
                    >
                      {t('admin.common.speichern')}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {rv.notizen || <span className="text-gray-400">—</span>}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
