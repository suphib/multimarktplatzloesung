import { motion } from 'framer-motion';
import { AlertTriangle, AlertOctagon, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../atoms/Button';
import { useState } from 'react';

interface ComplianceWarningProps {
  type: 'price' | 'hazardous';
  selectedArticle: {
    name: string;
    price: number;
    marketplace: string;
  };
  frameworkAlternative?: {
    name: string;
    price: number;
    supplier: string;
  };
  onSelectFramework?: () => void;
  onProceedAnyway?: () => void;
  onClose: () => void;
  onInitiateSpecial?: () => void;
}

export function ComplianceWarning({
  type,
  selectedArticle,
  frameworkAlternative,
  onSelectFramework,
  onProceedAnyway,
  onClose,
  onInitiateSpecial,
}: ComplianceWarningProps) {
  const { t } = useTranslation();

  if (type === 'hazardous') {
    return (
      <HazardousWarning
        articleName={selectedArticle.name}
        onClose={onClose}
        onInitiateSpecial={onInitiateSpecial}
      />
    );
  }

  const savings = frameworkAlternative
    ? selectedArticle.price - frameworkAlternative.price
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">{t('compliance.warning.title')}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('compliance.warning.marketplaceSelected', { marketplace: selectedArticle.marketplace })}
          </p>

          {/* Price comparison */}
          {frameworkAlternative && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{selectedArticle.marketplace}</div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedArticle.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </div>
              </div>
              <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50 relative">
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  {t('compliance.warning.recommended')}
                </div>
                <div className="text-sm text-green-700 mb-1 flex items-center gap-1">
                  {t('compliance.warning.frameworkContract')}
                </div>
                <div className="text-xl font-bold text-green-700">
                  {frameworkAlternative.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </div>
                <div className="text-sm text-green-600 mt-1 font-medium">
                  {savings.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} {t('compliance.warning.cheaper')}
                </div>
              </div>
            </div>
          )}

          {/* Legal notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">📋</span>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <div className="font-medium mb-1">{t('compliance.warning.legalNoticeTitle')}</div>
                <p>{t('compliance.warning.legalNoticeText')}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onSelectFramework && (
              <Button
                onClick={onSelectFramework}
                className="flex-1 bg-green-600 hover:bg-green-700 justify-center"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t('compliance.warning.selectFramework')}
              </Button>
            )}
            {onProceedAnyway && (
              <Button
                onClick={onProceedAnyway}
                variant="secondary"
                className="flex-1 justify-center"
              >
                {t('compliance.warning.proceedAnyway')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface HazardousWarningProps {
  articleName: string;
  onClose: () => void;
  onInitiateSpecial?: () => void;
}

function HazardousWarning({ articleName, onClose, onInitiateSpecial }: HazardousWarningProps) {
  const { t } = useTranslation();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    officer: false,
    storage: false,
    sds: false,
  });

  const allChecked = Object.values(checkedItems).every(Boolean);

  const toggleCheck = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Header - Red for hazardous */}
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <AlertOctagon className="w-5 h-5" />
            <span className="font-semibold">{t('compliance.hazardous.title')}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-3">{articleName}</p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
            <div className="flex items-center gap-2 text-red-700 font-medium">
              <AlertTriangle className="w-4 h-4" />
              {t('compliance.hazardous.classified')}
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('compliance.hazardous.requiredActions')}
            </div>
            <div className="space-y-2">
              <ChecklistItem
                checked={checkedItems.officer}
                onChange={() => toggleCheck('officer')}
                label={t('compliance.hazardous.checkOfficer')}
              />
              <ChecklistItem
                checked={checkedItems.storage}
                onChange={() => toggleCheck('storage')}
                label={t('compliance.hazardous.checkStorage')}
              />
              <ChecklistItem
                checked={checkedItems.sds}
                onChange={() => toggleCheck('sds')}
                label={t('compliance.hazardous.checkSDS')}
              />
            </div>
          </div>

          <Button
            onClick={onInitiateSpecial}
            disabled={!allChecked}
            className={`w-full justify-center ${
              allChecked
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <AlertOctagon className="w-4 h-4 mr-2" />
            {t('compliance.hazardous.initiateSpecial')}
          </Button>

          {!allChecked && (
            <p className="text-xs text-gray-500 text-center mt-2">
              {t('compliance.hazardous.checkAllRequired')}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ChecklistItemProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

function ChecklistItem({ checked, onChange, label }: ChecklistItemProps) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-gray-600 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
      />
      <span className={`text-sm ${checked ? 'text-gray-900' : 'text-gray-600'}`}>
        {label}
      </span>
    </label>
  );
}
