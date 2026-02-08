import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Wand2, Loader2, Trash2, ShoppingCart, Search, Sparkles, Info, Cpu } from 'lucide-react';
import { useMagicRequest } from '../../hooks/useMagicRequest';
import type { MagicRequestItem, MagicRequestResponse, OciCartItem } from '@procurement/shared';

interface MagicRequestPanelProps {
  ociMode?: boolean;
  onAddToOciCart?: (item: OciCartItem) => void;
  onSearchItem?: (beschreibung: string) => void;
}

function einheitZuOci(einheit: string): string {
  const mapping: Record<string, string> = {
    'Stück': 'EA', 'Packung': 'PK', 'Karton': 'CT', 'Set': 'SET',
    'Paar': 'PR', 'Meter': 'MTR', 'Liter': 'LTR', 'Kilogramm': 'KGM',
  };
  return mapping[einheit] ?? 'EA';
}

function toOciCartItem(item: MagicRequestItem): OciCartItem {
  return {
    description: item.beschreibung,
    quantity: item.menge,
    unit: einheitZuOci(item.einheit),
    price: item.geschaetzterPreis ?? 0,
    currency: item.waehrung,
    vendorMat: item.artikelnummerHinweis || '',
    vendor: item.lieferantHinweis || '',
    matgroup: item.kategorie,
  };
}

function KonfidenzBadge({ konfidenz }: { konfidenz: number }) {
  const prozent = Math.round(konfidenz * 100);
  let colorClass: string;
  if (konfidenz >= 0.8) {
    colorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  } else if (konfidenz >= 0.5) {
    colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  } else {
    colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {prozent}%
    </span>
  );
}

export function MagicRequestPanel({ ociMode, onAddToOciCart, onSearchItem }: MagicRequestPanelProps) {
  const { t } = useTranslation();
  const mutation = useMagicRequest();
  const [freitext, setFreitext] = useState('');
  const [result, setResult] = useState<MagicRequestResponse | null>(null);
  const [editedItems, setEditedItems] = useState<MagicRequestItem[]>([]);

  const beispiele = [
    { label: 'E-Mail', key: 'email' as const },
    { label: 'Notiz', key: 'note' as const },
    { label: 'Protokoll', key: 'protocol' as const },
  ];

  const handleAnalyze = async () => {
    try {
      const data = await mutation.mutateAsync({ freitext });
      setResult(data);
      setEditedItems([...data.positionen]);
    } catch {
      // Error handled by React Query
    }
  };

  const handleExampleClick = (key: 'email' | 'note' | 'protocol') => {
    setFreitext(t(`magicRequest.examples.${key}`));
    setResult(null);
    setEditedItems([]);
  };

  const updateItem = (index: number, field: keyof MagicRequestItem, value: string | number) => {
    setEditedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const removeItem = (index: number) => {
    setEditedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddToCart = (item: MagicRequestItem) => {
    if (onAddToOciCart) {
      onAddToOciCart(toOciCartItem(item));
    }
  };

  const handleAddAllToCart = () => {
    if (onAddToOciCart) {
      editedItems.forEach((item) => onAddToOciCart(toOciCartItem(item)));
    }
  };

  const handleSearchItem = (beschreibung: string) => {
    if (onSearchItem) {
      onSearchItem(beschreibung);
    }
  };

  const isDisabled = freitext.length < 10;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('magicRequest.title')}
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('magicRequest.subtitle')}
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Input */}
          <div className="flex-shrink-0 md:w-2/5 flex flex-col gap-3">
            <textarea
              value={freitext}
              onChange={(e) => setFreitext(e.target.value)}
              placeholder={t('magicRequest.textareaPlaceholder')}
              className="w-full min-h-[200px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm resize-y focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={5000}
            />

            {/* Example Chips */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                {t('magicRequest.examples.title')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {beispiele.map(({ label, key }) => (
                  <button
                    key={key}
                    onClick={() => handleExampleClick(key)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/30 text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    <Sparkles className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isDisabled || mutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('magicRequest.analyzing')}
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  {t('magicRequest.analyzeButton')}
                </>
              )}
            </button>

            {/* Hint */}
            <div className="flex items-start gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>{t('magicRequest.hint')}</span>
            </div>
          </div>

          {/* Right: Results */}
          <div className="flex-1 min-w-0">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Method + Processing Time */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t(`magicRequest.method.${result.methode}`)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {t('magicRequest.processingTime', { ms: result.verarbeitungszeit })}
                  </span>
                </div>

                {editedItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="font-medium">{t('magicRequest.noResults')}</p>
                    <p className="text-sm mt-1">{t('magicRequest.noResultsHint')}</p>
                  </div>
                ) : (
                  <>
                    {/* Results Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('magicRequest.results')} ({editedItems.length})
                      </h3>
                      {ociMode && onAddToOciCart && editedItems.length > 1 && (
                        <button
                          onClick={handleAddAllToCart}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          {t('magicRequest.addAllToCart')}
                        </button>
                      )}
                    </div>

                    {/* Item Cards */}
                    <div className="space-y-3">
                      {editedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <input
                              type="text"
                              value={item.beschreibung}
                              onChange={(e) => updateItem(idx, 'beschreibung', e.target.value)}
                              className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-500 focus:border-purple-500 outline-none py-0.5"
                            />
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <KonfidenzBadge konfidenz={item.konfidenz} />
                              <button
                                onClick={() => removeItem(idx)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title={t('magicRequest.removeItem')}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-2">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">{t('magicRequest.quantity')}: </span>
                              <input
                                type="number"
                                value={item.menge}
                                onChange={(e) => updateItem(idx, 'menge', parseInt(e.target.value, 10) || 1)}
                                min={1}
                                className="w-14 text-gray-900 dark:text-gray-100 bg-transparent border-b border-gray-300 dark:border-gray-500 focus:border-purple-500 outline-none"
                              />
                              <span className="text-gray-500 dark:text-gray-400 ml-1">{item.einheit}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">{t('magicRequest.category')}: </span>
                              <span className="text-gray-700 dark:text-gray-300">{item.kategorie}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">{t('magicRequest.estimatedPrice')}: </span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {item.geschaetzterPreis != null
                                  ? `${item.geschaetzterPreis.toLocaleString('de-DE')} ${item.waehrung}`
                                  : t('magicRequest.noPrice')}
                              </span>
                            </div>
                            {item.lieferantHinweis && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">{t('magicRequest.vendor')}: </span>
                                <span className="text-gray-700 dark:text-gray-300">{item.lieferantHinweis}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="flex justify-end">
                            {ociMode && onAddToOciCart ? (
                              <button
                                onClick={() => handleAddToCart(item)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                              >
                                <ShoppingCart className="h-3 w-3" />
                                {t('magicRequest.addToCart')}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSearchItem(item.beschreibung)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 transition-colors"
                              >
                                <Search className="h-3 w-3" />
                                {t('magicRequest.addToSearch')}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                      <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                        {t('magicRequest.summary')}
                      </p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        {result.zusammenfassung}
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Error State */}
            {mutation.isError && (
              <div className="text-red-600 dark:text-red-400 text-sm p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {(mutation.error as Error)?.message || 'Fehler bei der Analyse'}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
