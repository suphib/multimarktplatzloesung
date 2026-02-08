import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, Download, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../../components/templates/AdminLayout';
import { Button, Badge } from '../../components/atoms';
import { useRahmenvertraege } from '../../hooks/useAdmin';
import { useKatalogImport } from '../../hooks/useKatalogImport';
import { downloadCsvTemplate, parseCsvPreview } from '../../lib/csv-template';
import type { KatalogImportResult } from '@procurement/shared';

export function KatalogImportPage() {
  const { t } = useTranslation();

  const [rahmenvertragsNummer, setRahmenvertragsNummer] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [result, setResult] = useState<KatalogImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: rahmenvertraege } = useRahmenvertraege();
  const importMutation = useKatalogImport();

  const handleFile = useCallback(async (file: File) => {
    setSelectedFile(file);
    setResult(null);
    try {
      const previewData = await parseCsvPreview(file);
      setPreview(previewData);
    } catch {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleImport = async () => {
    if (!selectedFile || !rahmenvertragsNummer) return;
    const importResult = await importMutation.mutateAsync({
      rahmenvertragsNummer,
      file: selectedFile,
    });
    setResult(importResult);
  };

  return (
    <AdminLayout>
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Upload className="h-6 w-6 text-primary-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t('katalogImport.title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('katalogImport.subtitle')}
            </p>
          </div>
        </div>

        {/* Rahmenvertrag Dropdown */}
        <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('katalogImport.selectRv')}
          </label>
          <select
            value={rahmenvertragsNummer}
            onChange={(e) => setRahmenvertragsNummer(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 px-3 py-2 text-sm"
          >
            <option value="">{t('katalogImport.noRv')}</option>
            {rahmenvertraege?.map((rv) => (
              <option key={rv.vertragsnummer} value={rv.vertragsnummer}>
                {rv.vertragsnummer} — {rv.bezeichnung}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload / Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`bg-white rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors dark:bg-gray-800 ${
            dragOver
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 hover:border-primary-400 dark:border-gray-600'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-10 w-10 text-primary-600" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-gray-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('katalogImport.uploadFile')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('katalogImport.dropHint')}
              </p>
              <p className="text-xs text-gray-400">
                {t('katalogImport.csvFormat')}
              </p>
            </div>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              {t('katalogImport.preview')}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-2 py-1 text-left font-medium text-gray-500">#</th>
                    {preview.headers.slice(0, 4).map((h) => (
                      <th key={h} className="px-2 py-1 text-left font-medium text-gray-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="px-2 py-1 text-gray-400">{i + 1}</td>
                      {row.slice(0, 4).map((cell, j) => (
                        <td key={j} className="px-2 py-1 text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={!selectedFile || !rahmenvertragsNummer || importMutation.isPending}
          className="w-full sm:w-auto"
        >
          {importMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              {t('katalogImport.importing')}
            </>
          ) : (
            t('katalogImport.importButton')
          )}
        </Button>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('katalogImport.result')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {result.importiert > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('katalogImport.imported', { count: result.importiert })}
                  </span>
                </div>
              )}
              {result.aktualisiert > 0 && (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('katalogImport.updated', { count: result.aktualisiert })}
                  </span>
                </div>
              )}
              {result.fehler.length > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('katalogImport.errors', { count: result.fehler.length })}
                  </span>
                </div>
              )}
            </div>
            {result.fehler.length > 0 && (
              <div className="space-y-1 mt-2">
                {result.fehler.map((err, i) => (
                  <p key={i} className="text-xs text-red-600 dark:text-red-400">
                    {t('katalogImport.errorDetail', { zeile: err.zeile, nachricht: `${err.feld}: ${err.nachricht}` })}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error from mutation */}
        {importMutation.isError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-sm text-red-700 dark:text-red-400">
              {(importMutation.error as Error).message}
            </p>
          </div>
        )}

        {/* Download Template */}
        <div className="pt-2">
          <button
            onClick={downloadCsvTemplate}
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400"
          >
            <Download className="h-4 w-4" />
            {t('katalogImport.downloadTemplate')}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
