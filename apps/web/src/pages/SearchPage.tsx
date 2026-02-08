import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { SearchLayout } from '../components/templates/SearchLayout';
import { SearchBar } from '../components/molecules/SearchBar';
import { AIThinkingProcess } from '../components/organisms/AIThinkingProcess';
import { ComplianceWarning } from '../components/organisms/ComplianceWarning';
import { useSearchStore } from '../store/useSearchStore';
import { useSearch } from '../hooks/useSearch';
import {
  Sparkles, Shield, BarChart3, FileText,
  Laptop, Monitor, Armchair, Printer, Mouse, Package,
  FlaskConical, Cpu, Tv, Wrench, FileQuestion,
  ShoppingCart, Send, X, Wand2,
} from 'lucide-react';
import { useOciSession } from '../hooks/useOciSession';
import { MagicRequestPanel } from '../components/organisms/MagicRequestPanel';
import { useModus } from '../hooks/useAdmin';


const KATEGORIEN = [
  { tKey: 'search.categories.laptops', suchbegriff: 'Laptop', icon: Laptop, anzahl: 5 },
  { tKey: 'search.categories.monitors', suchbegriff: 'Monitor', icon: Monitor, anzahl: 3 },
  { tKey: 'search.categories.desktops', suchbegriff: 'Desktop', icon: Cpu, anzahl: 2 },
  { tKey: 'search.categories.chairs', suchbegriff: 'stuhl', icon: Armchair, anzahl: 3 },
  { tKey: 'search.categories.desks', suchbegriff: 'Schreibtisch', icon: Package, anzahl: 2 },
  { tKey: 'search.categories.printers', suchbegriff: 'Drucker', icon: Printer, anzahl: 2 },
  { tKey: 'search.categories.peripherals', suchbegriff: 'Peripherie', icon: Mouse, anzahl: 6 },
  { tKey: 'search.categories.lab', suchbegriff: 'Labor', icon: FlaskConical, anzahl: 6 },
  { tKey: 'search.categories.measurement', suchbegriff: 'Messtechnik', icon: Tv, anzahl: 4 },
  { tKey: 'search.categories.services', suchbegriff: 'Dienstleistung', icon: Wrench, anzahl: 5 },
  { tKey: 'search.categories.office', suchbegriff: 'Bürobedarf', icon: Package, anzahl: 3 },
  { tKey: 'search.categories.all', suchbegriff: 'Alle', icon: Package, anzahl: 41 },
] as const;

const FEATURE_KEYS = [
  { icon: Sparkles, tLabel: 'search.features.classification.label', tDesc: 'search.features.classification.desc', href: '/handbuch#klassifizierung' },
  { icon: Shield, tLabel: 'search.features.compliance.label', tDesc: 'search.features.compliance.desc', href: '/handbuch#compliance' },
  { icon: BarChart3, tLabel: 'search.features.comparison.label', tDesc: 'search.features.comparison.desc', href: '/handbuch#preisvergleich' },
  { icon: FileText, tLabel: 'search.features.documentation.label', tDesc: 'search.features.documentation.desc', href: '/handbuch#dokumentation' },
] as const;

interface AIThinkingResult {
  query: string;
  category: string;
  eclassCode: string;
  frameworkContracts: number;
  recommendation: string;
  isHazardous: boolean;
}

export function SearchPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setSuchbegriff, setSearchResponse } = useSearchStore();
  const searchMutation = useSearch();
  const oci = useOciSession();
  const { data: modusData } = useModus();
  const isSandbox = modusData?.aktuellerModus === 'SANDBOX';

  const [isThinking, setIsThinking] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [showHazardousWarning, setShowHazardousWarning] = useState(false);
  const [hazardousArticleName, setHazardousArticleName] = useState('');
  const [showMagicRequest, setShowMagicRequest] = useState(false);

  const handleSearch = async (term: string) => {
    setCurrentQuery(term);
    setIsThinking(true);
  };

  const handleThinkingComplete = async (result: AIThinkingResult) => {
    setIsThinking(false);

    // Show hazardous warning for dangerous substances
    if (result.isHazardous) {
      setHazardousArticleName(result.query);
      setShowHazardousWarning(true);
      return;
    }

    // Proceed with search
    await performSearch(result.query);
  };

  const performSearch = async (term: string) => {
    setSuchbegriff(term);
    try {
      const result = await searchMutation.mutateAsync({ suchbegriff: term });
      setSearchResponse(result);
      navigate(`/results?q=${encodeURIComponent(term)}`);
    } catch {
      // Error handling via React Query
    }
  };

  const handleHazardousClose = () => {
    setShowHazardousWarning(false);
  };

  const handleInitiateSpecial = () => {
    setShowHazardousWarning(false);
    // In a real app, this would open a special procurement workflow
    performSearch(currentQuery);
  };

  return (
    <SearchLayout title={t('search.title')}>
      {/* OCI Punch-Out Banner */}
      {oci.isActive && (
        <div className="bg-blue-600 text-white px-4 py-3 mb-4 rounded-lg flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">{t('admin.oci.banner')}</span>
            {oci.cartCount > 0 && (
              <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {t('admin.oci.cartItems', { count: oci.cartCount })}
              </span>
            )}
          </div>
          <button
            onClick={oci.submitCart}
            disabled={oci.cartCount === 0 || oci.isSubmitting}
            className="inline-flex items-center gap-1.5 bg-white text-blue-600 px-4 py-1.5 rounded-lg font-medium text-sm hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
            {oci.isSubmitting ? t('admin.oci.sending') : t('admin.oci.sendCart')}
          </button>
        </div>
      )}

      {/* OCI Cart Preview */}
      {oci.isActive && oci.cartItems.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            {t('admin.oci.cartItems', { count: oci.cartItems.length })}
          </h3>
          <div className="space-y-2">
            {oci.cartItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate block">{item.description}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {item.quantity}x · {item.price.toLocaleString('de-DE', { style: 'currency', currency: item.currency })} · {item.vendor}
                  </span>
                </div>
                <button
                  onClick={() => oci.removeFromCart(idx)}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6 md:space-y-8">
        <AnimatePresence mode="wait">
          {isThinking ? (
            <div className="w-full max-w-2xl mx-auto py-8" key="thinking">
              <AIThinkingProcess
                query={currentQuery}
                onComplete={handleThinkingComplete}
                isVisible={isThinking}
              />
            </div>
          ) : (
            <div className="w-full space-y-6 md:space-y-8" key="search">
              {/* Hero + Search */}
              <div className="text-center pt-4 md:pt-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t('search.headline')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {t('search.subtitle')}
                </p>
              </div>

              <div className="max-w-3xl mx-auto">
                <SearchBar onSearch={handleSearch} isLoading={searchMutation.isPending} />
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <FileQuestion className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>{t('search.specialProcurementHint')}</span>
                  <button
                    onClick={() => navigate('/special-procurement')}
                    className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium underline underline-offset-2 whitespace-nowrap"
                  >
                    {t('search.specialProcurement')}
                  </button>
                </div>
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={() => setShowMagicRequest(!showMagicRequest)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      showMagicRequest
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                    }`}
                  >
                    <Wand2 className="h-4 w-4" />
                    {t('magicRequest.title')}
                  </button>
                </div>
              </div>

              {/* Magic Request Panel */}
              <AnimatePresence>
                {showMagicRequest && (
                  <div className="w-full">
                    <MagicRequestPanel
                      ociMode={oci.isActive}
                      onAddToOciCart={oci.isActive ? oci.addToCart : undefined}
                      onSearchItem={(beschreibung) => handleSearch(beschreibung)}
                    />
                  </div>
                )}
              </AnimatePresence>

              {/* Kategorie-Chips (only in sandbox mode with mock data) */}
              {isSandbox && (
                <div className="w-full">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {t('search.browseByCategory')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {KATEGORIEN.map(({ tKey, suchbegriff, icon: Icon, anzahl }) => (
                      <button
                        key={tKey}
                        onClick={() => handleSearch(suchbegriff)}
                        disabled={searchMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-700 dark:hover:text-primary-400 transition-all shadow-sm disabled:opacity-50"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {t(tKey)}
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-0.5">({anzahl})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature-Karten */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {FEATURE_KEYS.map(({ icon: Icon, tLabel, tDesc, href }) => (
                  <Link
                    key={tLabel}
                    to={href}
                    className="card text-center group hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
                  >
                    <Icon className="h-6 w-6 text-primary-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t(tLabel)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t(tDesc)}</p>
                  </Link>
                ))}
              </div>

              {searchMutation.isError && (
                <div className="text-red-600 text-sm">
                  {t('search.error')}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Hazardous Material Warning Modal */}
      <AnimatePresence>
        {showHazardousWarning && (
          <ComplianceWarning
            type="hazardous"
            selectedArticle={{
              name: hazardousArticleName,
              price: 0,
              marketplace: '',
            }}
            onClose={handleHazardousClose}
            onInitiateSpecial={handleInitiateSpecial}
          />
        )}
      </AnimatePresence>
    </SearchLayout>
  );
}
