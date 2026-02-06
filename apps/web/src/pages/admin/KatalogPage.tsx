import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, Plus, Search } from 'lucide-react';
import { AdminLayout } from '../../components/templates/AdminLayout';
import { DataTable, Badge, Button, Input } from '../../components/atoms';
import { PriceTag } from '../../components/atoms';
import { Pagination, Modal, FormField } from '../../components/molecules';
import type { Column } from '../../components/atoms/DataTable';
import type { FrameworkContractItem } from '@procurement/shared';
import {
  useKatalogArtikel,
  useCreateKatalogArtikel,
  useUpdateKatalogArtikel,
  useDeleteKatalogArtikel,
  useRahmenvertraege,
} from '../../hooks/useAdmin';

const emptyForm = {
  titel: '',
  beschreibung: '',
  lieferant: '',
  cpvCodes: '',
  preis: 0,
  waehrung: 'EUR',
  rahmenvertragsNummer: '',
  artikelnummer: '',
  nachhaltigkeitslabel: '',
  lieferzeit: '',
  bildUrl: '',
  verfuegbar: true,
};

export function KatalogPage() {
  const { t } = useTranslation();

  const [suchbegriff, setSuchbegriff] = useState('');
  const [lieferant, setLieferant] = useState('');
  const [rvNummer, setRvNummer] = useState('');
  const [nurVerfuegbar, setNurVerfuegbar] = useState(false);
  const [seite, setSeite] = useState(1);
  const [sortierFeld, setSortierFeld] = useState('erstelltAm');
  const [sortierRichtung, setSortierRichtung] = useState<'ASC' | 'DESC'>('DESC');

  const queryParams: Record<string, string | number> = {
    seite,
    proSeite: 10,
    sortierFeld,
    sortierRichtung,
  };
  if (suchbegriff) queryParams.suchbegriff = suchbegriff;
  if (lieferant) queryParams.lieferant = lieferant;
  if (rvNummer) queryParams.rahmenvertragsNummer = rvNummer;
  if (nurVerfuegbar) queryParams.nurVerfuegbar = 'true';

  const { data, isLoading } = useKatalogArtikel(queryParams);
  const { data: rahmenvertraege } = useRahmenvertraege();
  const createMutation = useCreateKatalogArtikel();
  const updateMutation = useUpdateKatalogArtikel();
  const deleteMutation = useDeleteKatalogArtikel();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const lieferanten = [...new Set(data?.daten.map((d) => d.lieferant) || [])];
  const rvNummern = [...new Set(rahmenvertraege?.map((r) => r.vertragsnummer) || [])];

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: FrameworkContractItem) => {
    setEditingId(item.id);
    setForm({
      titel: item.titel,
      beschreibung: item.beschreibung,
      lieferant: item.lieferant,
      cpvCodes: item.cpvCodes,
      preis: item.preis,
      waehrung: item.waehrung,
      rahmenvertragsNummer: item.rahmenvertragsNummer,
      artikelnummer: item.artikelnummer,
      nachhaltigkeitslabel: item.nachhaltigkeitslabel,
      lieferzeit: item.lieferzeit,
      bildUrl: item.bildUrl,
      verfuegbar: item.verfuegbar,
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

  const handleSort = (field: string) => {
    if (sortierFeld === field) {
      setSortierRichtung(sortierRichtung === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortierFeld(field);
      setSortierRichtung('ASC');
    }
    setSeite(1);
  };

  const columns: Column<FrameworkContractItem>[] = [
    { key: 'titel', label: t('admin.katalog.titel'), sortable: true },
    { key: 'lieferant', label: t('admin.katalog.lieferant'), sortable: true },
    { key: 'artikelnummer', label: t('admin.katalog.artikelnummer') },
    { key: 'rahmenvertragsNummer', label: t('admin.katalog.rvNummer') },
    {
      key: 'preis',
      label: t('admin.katalog.preis'),
      sortable: true,
      render: (val: number) => <PriceTag preis={val} waehrung="EUR" />,
    },
    {
      key: 'verfuegbar',
      label: t('admin.katalog.verfuegbar'),
      render: (val: boolean) =>
        val ? (
          <Badge variant="success">{t('admin.katalog.ja')}</Badge>
        ) : (
          <Badge variant="warning">{t('admin.katalog.nein')}</Badge>
        ),
    },
    { key: 'lieferzeit', label: t('admin.katalog.lieferzeit') },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: FrameworkContractItem) => (
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
            <Database className="h-6 w-6 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">{t('admin.katalog.title')}</h1>
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {t('admin.katalog.neu')}
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={suchbegriff}
                onChange={(e) => {
                  setSuchbegriff(e.target.value);
                  setSeite(1);
                }}
                placeholder={t('admin.katalog.suchen')}
                className="pl-9"
              />
            </div>
            <select
              value={lieferant}
              onChange={(e) => {
                setLieferant(e.target.value);
                setSeite(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">{t('admin.katalog.alleLieferanten')}</option>
              {lieferanten.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <select
              value={rvNummer}
              onChange={(e) => {
                setRvNummer(e.target.value);
                setSeite(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">{t('admin.katalog.alleRahmenvertraege')}</option>
              {rvNummern.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={nurVerfuegbar}
                onChange={(e) => {
                  setNurVerfuegbar(e.target.checked);
                  setSeite(1);
                }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              {t('admin.katalog.nurVerfuegbar')}
            </label>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.daten || []}
          isLoading={isLoading}
          sortField={sortierFeld}
          sortDirection={sortierRichtung}
          onSort={handleSort}
          onRowClick={openEdit}
          emptyMessage={t('admin.katalog.keine')}
        />

        {data && (
          <Pagination
            seite={data.seite}
            proSeite={data.proSeite}
            gesamt={data.gesamt}
            onPageChange={setSeite}
          />
        )}

        {/* Create/Edit Modal */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? t('admin.katalog.bearbeiten') : t('admin.katalog.neu')}
          size="lg"
        >
          <div className="space-y-4">
            <FormField
              label={t('admin.katalog.titel')}
              value={form.titel}
              onChange={(e) => setForm({ ...form, titel: (e.target as HTMLInputElement).value })}
            />
            <FormField
              label={t('admin.katalog.beschreibung')}
              type="textarea"
              value={form.beschreibung}
              onChange={(e) => setForm({ ...form, beschreibung: (e.target as HTMLTextAreaElement).value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label={t('admin.katalog.lieferant')}
                value={form.lieferant}
                onChange={(e) => setForm({ ...form, lieferant: (e.target as HTMLInputElement).value })}
              />
              <FormField
                label={t('admin.katalog.rvNummer')}
                value={form.rahmenvertragsNummer}
                onChange={(e) => setForm({ ...form, rahmenvertragsNummer: (e.target as HTMLInputElement).value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                label={t('admin.katalog.preis')}
                type="number"
                value={form.preis || ''}
                onChange={(e) => setForm({ ...form, preis: Number((e.target as HTMLInputElement).value) })}
              />
              <FormField
                label={t('admin.katalog.artikelnummer')}
                value={form.artikelnummer}
                onChange={(e) => setForm({ ...form, artikelnummer: (e.target as HTMLInputElement).value })}
              />
              <FormField
                label={t('admin.katalog.lieferzeit')}
                value={form.lieferzeit}
                onChange={(e) => setForm({ ...form, lieferzeit: (e.target as HTMLInputElement).value })}
              />
            </div>
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
          title={t('admin.katalog.loeschenBestaetigung')}
          size="sm"
        >
          <p className="text-sm text-gray-600 mb-4">{t('admin.katalog.loeschenHinweis')}</p>
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
