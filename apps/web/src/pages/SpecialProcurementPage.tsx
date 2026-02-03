import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchLayout } from '../components/templates/SearchLayout';
import { Button, Input } from '../components/atoms';
import {
  ArrowLeft, Send, CheckCircle, Star, Building2,
  AlertCircle, Upload, X,
} from 'lucide-react';

const BESCHAFFUNGSDIENSTLEISTER = [
  { id: 'bd-001', name: 'SimplySourcing', spezialisierung: 'Laborausstattung', rating: 4.8 },
  { id: 'bd-002', name: 'TechProcure', spezialisierung: 'IT-Hardware', rating: 4.6 },
  { id: 'bd-003', name: 'IndustryBuy', spezialisierung: 'Industriebedarf', rating: 4.4 },
  { id: 'bd-004', name: 'ResearchSupply', spezialisierung: 'Forschungsbedarf', rating: 4.7 },
];

const KATEGORIEN = [
  'IT-Hardware',
  'Laborausstattung',
  'Forschungsbedarf',
  'Industriebedarf',
  'Büroausstattung',
  'Sonstiges',
];

const DRINGLICHKEIT = ['normal', 'urgent', 'critical'] as const;
type Dringlichkeit = typeof DRINGLICHKEIT[number];

interface FormData {
  beschreibung: string;
  geschaetzteKosten: string;
  dringlichkeit: Dringlichkeit;
  kategorie: string;
  begruendung: string;
  dienstleisterIds: string[];
}

export function SpecialProcurementPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<FormData>({
    beschreibung: '',
    geschaetzteKosten: '',
    dringlichkeit: 'normal',
    kategorie: '',
    begruendung: '',
    dienstleisterIds: [],
  });

  const [files, setFiles] = useState<File[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.beschreibung.trim()) {
      newErrors.beschreibung = t('specialProcurement.errors.descriptionRequired');
    }
    if (!formData.geschaetzteKosten.trim()) {
      newErrors.geschaetzteKosten = t('specialProcurement.errors.costRequired');
    }
    if (!formData.kategorie) {
      newErrors.kategorie = t('specialProcurement.errors.categoryRequired');
    }
    if (!formData.begruendung.trim()) {
      newErrors.begruendung = t('specialProcurement.errors.reasonRequired');
    }
    if (formData.dienstleisterIds.length === 0) {
      newErrors.dienstleisterIds = t('specialProcurement.errors.providerRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const selectedProviders = BESCHAFFUNGSDIENSTLEISTER.filter(
    (d) => formData.dienstleisterIds.includes(d.id)
  );

  const toggleProvider = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      dienstleisterIds: prev.dienstleisterIds.includes(id)
        ? prev.dienstleisterIds.filter((pid) => pid !== id)
        : [...prev.dienstleisterIds, id],
    }));
  };

  if (showConfirmation) {
    return (
      <SearchLayout title={t('specialProcurement.title')}>
        <div className="max-w-lg mx-auto py-8 md:py-16">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              {t('specialProcurement.confirmation.title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('specialProcurement.confirmation.message', {
                count: selectedProviders.length,
                providers: selectedProviders.map((p) => p.name).join(', ')
              })}
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {t('specialProcurement.confirmation.summary')}
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('specialProcurement.form.category')}</dt>
                  <dd className="font-medium text-gray-900">{formData.kategorie}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('specialProcurement.form.estimatedCost')}</dt>
                  <dd className="font-medium text-gray-900">{formData.geschaetzteKosten} EUR</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('specialProcurement.form.urgency')}</dt>
                  <dd className="font-medium text-gray-900">
                    {t(`specialProcurement.urgency.${formData.dringlichkeit}`)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('specialProcurement.form.providers')}</dt>
                  <dd className="font-medium text-gray-900 text-right">
                    {selectedProviders.map((p) => p.name).join(', ')}
                  </dd>
                </div>
                {files.length > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">{t('specialProcurement.form.attachments')}</dt>
                    <dd className="font-medium text-gray-900">{files.length} {t('specialProcurement.files')}</dd>
                  </div>
                )}
              </dl>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              {t('specialProcurement.confirmation.nextSteps')}
            </p>

            <Button onClick={() => navigate('/search')} className="w-full">
              {t('common.toSearch')}
            </Button>
          </div>
        </div>
      </SearchLayout>
    );
  }

  return (
    <SearchLayout title={t('specialProcurement.title')}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('common.back')}
          </Button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {t('specialProcurement.title')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('specialProcurement.subtitle')}
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">{t('specialProcurement.info.title')}</p>
            <p className="mt-1 text-blue-700">{t('specialProcurement.info.text')}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 space-y-5">
            {/* Bedarfsbeschreibung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('specialProcurement.form.description')} *
              </label>
              <textarea
                value={formData.beschreibung}
                onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                rows={4}
                className={`input-field resize-none ${errors.beschreibung ? 'border-red-500' : ''}`}
                placeholder={t('specialProcurement.form.descriptionPlaceholder')}
              />
              {errors.beschreibung && (
                <p className="mt-1 text-sm text-red-600">{errors.beschreibung}</p>
              )}
            </div>

            {/* Kosten & Dringlichkeit - Mobile stacked, Desktop side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label={`${t('specialProcurement.form.estimatedCost')} *`}
                  type="number"
                  value={formData.geschaetzteKosten}
                  onChange={(e) => setFormData({ ...formData, geschaetzteKosten: e.target.value })}
                  placeholder="0.00"
                  error={errors.geschaetzteKosten}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('specialProcurement.form.urgency')}
                </label>
                <select
                  value={formData.dringlichkeit}
                  onChange={(e) => setFormData({ ...formData, dringlichkeit: e.target.value as Dringlichkeit })}
                  className="input-field"
                >
                  {DRINGLICHKEIT.map((d) => (
                    <option key={d} value={d}>
                      {t(`specialProcurement.urgency.${d}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kategorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('specialProcurement.form.category')} *
              </label>
              <select
                value={formData.kategorie}
                onChange={(e) => setFormData({ ...formData, kategorie: e.target.value })}
                className={`input-field ${errors.kategorie ? 'border-red-500' : ''}`}
              >
                <option value="">{t('specialProcurement.form.selectCategory')}</option>
                {KATEGORIEN.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              {errors.kategorie && (
                <p className="mt-1 text-sm text-red-600">{errors.kategorie}</p>
              )}
            </div>

            {/* Begründung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('specialProcurement.form.reason')} *
              </label>
              <textarea
                value={formData.begruendung}
                onChange={(e) => setFormData({ ...formData, begruendung: e.target.value })}
                rows={3}
                className={`input-field resize-none ${errors.begruendung ? 'border-red-500' : ''}`}
                placeholder={t('specialProcurement.form.reasonPlaceholder')}
              />
              {errors.begruendung && (
                <p className="mt-1 text-sm text-red-600">{errors.begruendung}</p>
              )}
            </div>

            {/* Datei-Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('specialProcurement.form.attachments')}
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-primary-300 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{t('specialProcurement.form.uploadHint')}</p>
                </label>
              </div>
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                      <span className="truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Beschaffungsdienstleister */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary-600" />
              {t('specialProcurement.form.providers')} *
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t('specialProcurement.form.providersHint')}
            </p>
            {errors.dienstleisterIds && (
              <p className="mb-3 text-sm text-red-600">{errors.dienstleisterIds}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BESCHAFFUNGSDIENSTLEISTER.map((dienstleister) => {
                const isSelected = formData.dienstleisterIds.includes(dienstleister.id);
                return (
                  <button
                    key={dienstleister.id}
                    type="button"
                    onClick={() => toggleProvider(dienstleister.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-primary-600" />
                      </div>
                    )}
                    <div className="flex items-start justify-between pr-6">
                      <div>
                        <p className="font-semibold text-gray-900">{dienstleister.name}</p>
                        <p className="text-sm text-gray-500">{dienstleister.spezialisierung}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{dienstleister.rating}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {formData.dienstleisterIds.length > 0 && (
              <p className="mt-3 text-sm text-primary-600">
                {t('specialProcurement.form.selectedCount', { count: formData.dienstleisterIds.length })}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto"
            >
              {t('specialProcurement.form.cancel')}
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              <Send className="h-4 w-4 mr-2" />
              {t('specialProcurement.form.submit')}
            </Button>
          </div>
        </form>
      </div>
    </SearchLayout>
  );
}
