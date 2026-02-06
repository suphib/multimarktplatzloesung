import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Plus } from 'lucide-react';
import { AdminLayout } from '../../components/templates/AdminLayout';
import { DataTable, Badge, Button } from '../../components/atoms';
import { Modal, FormField } from '../../components/molecules';
import type { Column } from '../../components/atoms/DataTable';
import type { Rahmenvertrag, RahmenvertragCreateRequest } from '@procurement/shared';
import {
  useRahmenvertraege,
  useCreateRahmenvertrag,
  useUpdateRahmenvertrag,
  useDeleteRahmenvertrag,
} from '../../hooks/useAdmin';

const emptyForm: RahmenvertragCreateRequest = {
  bezeichnung: '',
  beschreibung: '',
  lieferant: '',
  vertragsnummer: '',
  gueltigBis: '',
  cpvCodes: '',
  maxVolumen: 0,
};

export function RahmenvertraegePage() {
  const { t } = useTranslation();
  const { data: rahmenvertraege, isLoading } = useRahmenvertraege();
  const createMutation = useCreateRahmenvertrag();
  const updateMutation = useUpdateRahmenvertrag();
  const deleteMutation = useDeleteRahmenvertrag();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RahmenvertragCreateRequest>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isAktiv = (gueltigBis: string) => new Date(gueltigBis) > new Date();

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (rv: Rahmenvertrag) => {
    setEditingId(rv.id);
    setForm({
      bezeichnung: rv.bezeichnung,
      beschreibung: rv.beschreibung,
      lieferant: rv.lieferant,
      vertragsnummer: rv.vertragsnummer,
      gueltigBis: rv.gueltigBis.split('T')[0],
      cpvCodes: rv.cpvCodes,
      maxVolumen: rv.maxVolumen,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: form });
    } else {
      await createMutation.mutateAsync(form);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteMutation.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const columns: Column<Rahmenvertrag>[] = [
    { key: 'bezeichnung', label: t('admin.rahmenvertraege.bezeichnung'), sortable: true },
    { key: 'lieferant', label: t('admin.rahmenvertraege.lieferant'), sortable: true },
    { key: 'vertragsnummer', label: t('admin.rahmenvertraege.vertragsnummer') },
    {
      key: 'gueltigBis',
      label: t('admin.rahmenvertraege.gueltigBis'),
      sortable: true,
      render: (val: string) => new Date(val).toLocaleDateString('de-DE'),
    },
    {
      key: 'maxVolumen',
      label: t('admin.rahmenvertraege.maxVolumen'),
      render: (val: number) =>
        val ? `${val.toLocaleString('de-DE')} €` : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, row: Rahmenvertrag) =>
        isAktiv(row.gueltigBis) ? (
          <Badge variant="success">{t('admin.rahmenvertraege.aktiv')}</Badge>
        ) : (
          <Badge variant="warning">{t('admin.rahmenvertraege.abgelaufen')}</Badge>
        ),
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: Rahmenvertrag) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteConfirmId(row.id);
          }}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          {t('admin.common.loeschen')}
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">{t('admin.rahmenvertraege.title')}</h1>
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {t('admin.rahmenvertraege.neu')}
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={rahmenvertraege || []}
          isLoading={isLoading}
          onRowClick={openEdit}
          emptyMessage={t('admin.rahmenvertraege.keine')}
        />

        {/* Create/Edit Modal */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? t('admin.rahmenvertraege.bearbeiten') : t('admin.rahmenvertraege.neu')}
          size="lg"
        >
          <div className="space-y-4">
            <FormField
              label={t('admin.rahmenvertraege.bezeichnung')}
              value={form.bezeichnung}
              onChange={(e) => setForm({ ...form, bezeichnung: (e.target as HTMLInputElement).value })}
            />
            <FormField
              label={t('admin.rahmenvertraege.beschreibung')}
              type="textarea"
              value={form.beschreibung}
              onChange={(e) => setForm({ ...form, beschreibung: (e.target as HTMLTextAreaElement).value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label={t('admin.rahmenvertraege.lieferant')}
                value={form.lieferant}
                onChange={(e) => setForm({ ...form, lieferant: (e.target as HTMLInputElement).value })}
              />
              <FormField
                label={t('admin.rahmenvertraege.vertragsnummer')}
                value={form.vertragsnummer}
                onChange={(e) => setForm({ ...form, vertragsnummer: (e.target as HTMLInputElement).value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label={t('admin.rahmenvertraege.gueltigBis')}
                type="date"
                value={form.gueltigBis}
                onChange={(e) => setForm({ ...form, gueltigBis: (e.target as HTMLInputElement).value })}
              />
              <FormField
                label={t('admin.rahmenvertraege.maxVolumen')}
                type="number"
                value={form.maxVolumen || ''}
                onChange={(e) => setForm({ ...form, maxVolumen: Number((e.target as HTMLInputElement).value) })}
              />
            </div>
            <FormField
              label={t('admin.rahmenvertraege.cpvCodes')}
              value={form.cpvCodes || ''}
              onChange={(e) => setForm({ ...form, cpvCodes: (e.target as HTMLInputElement).value })}
              placeholder="z.B. 30213100,30231000"
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                {t('admin.common.abbrechen')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {t('admin.common.speichern')}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation */}
        <Modal
          open={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title={t('admin.rahmenvertraege.loeschenBestaetigung')}
          size="sm"
        >
          <p className="text-sm text-gray-600 mb-4">{t('admin.rahmenvertraege.loeschenHinweis')}</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
              {t('admin.common.abbrechen')}
            </Button>
            <Button onClick={handleDelete} disabled={deleteMutation.isPending}>
              {t('admin.common.loeschen')}
            </Button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
