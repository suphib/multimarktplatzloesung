import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Modal } from '../molecules/Modal';
import { Button, Spinner } from '../atoms';
import { CPV_KATEGORIEN } from '@procurement/shared';

interface CpvOverrideModalProps {
  open: boolean;
  onClose: () => void;
  currentCpvCode: string;
  onSave: (cpvCode: string, cpvBezeichnung: string, begruendung: string) => void;
  isSaving: boolean;
}

export function CpvOverrideModal({ open, onClose, currentCpvCode, onSave, isSaving }: CpvOverrideModalProps) {
  const { t } = useTranslation();
  const [suchbegriff, setSuchbegriff] = useState('');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [begruendung, setBegruendung] = useState('');

  const cpvEntries = useMemo(() => {
    const entries = Object.entries(CPV_KATEGORIEN).map(([code, bezeichnung]) => ({
      code,
      bezeichnung,
    }));
    if (!suchbegriff.trim()) return entries;
    const lower = suchbegriff.toLowerCase();
    return entries.filter(
      (e) => e.code.includes(lower) || e.bezeichnung.toLowerCase().includes(lower),
    );
  }, [suchbegriff]);

  const selectedBezeichnung = selectedCode
    ? CPV_KATEGORIEN[selectedCode as keyof typeof CPV_KATEGORIEN] || ''
    : '';

  const canSave = selectedCode && selectedCode !== currentCpvCode && begruendung.trim().length >= 10;

  const handleSave = () => {
    if (!canSave || !selectedCode) return;
    onSave(selectedCode, selectedBezeichnung, begruendung.trim());
  };

  const handleClose = () => {
    setSuchbegriff('');
    setSelectedCode(null);
    setBegruendung('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={t('article.override.title')} size="lg">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={suchbegriff}
            onChange={(e) => setSuchbegriff(e.target.value)}
            placeholder={t('article.override.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        {/* CPV List */}
        <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg divide-y divide-gray-100 dark:divide-gray-700">
          {cpvEntries.map((entry) => (
            <button
              key={entry.code}
              onClick={() => setSelectedCode(entry.code)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedCode === entry.code
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500'
                  : ''
              } ${entry.code === currentCpvCode ? 'text-gray-400' : ''}`}
            >
              <span className="font-mono text-xs text-gray-500 dark:text-gray-400 mr-2">{entry.code}</span>
              <span className="text-gray-900 dark:text-gray-100">{entry.bezeichnung}</span>
              {entry.code === currentCpvCode && (
                <span className="ml-2 text-xs text-gray-400">({t('article.override.current')})</span>
              )}
            </button>
          ))}
          {cpvEntries.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-500">{t('article.override.noResults')}</p>
          )}
        </div>

        {/* Selected */}
        {selectedCode && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('article.override.selected')}</p>
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {selectedCode} – {selectedBezeichnung}
            </p>
          </div>
        )}

        {/* Begründung */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('article.override.reasonLabel')} *
          </label>
          <textarea
            value={begruendung}
            onChange={(e) => setBegruendung(e.target.value)}
            placeholder={t('article.override.reasonPlaceholder')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
          {begruendung.length > 0 && begruendung.trim().length < 10 && (
            <p className="text-xs text-red-500 mt-1">{t('article.override.reasonMinLength')}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            {t('admin.common.abbrechen')}
          </Button>
          <Button onClick={handleSave} disabled={!canSave || isSaving}>
            {isSaving ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {t('article.override.saving')}
              </>
            ) : (
              t('article.override.save')
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
