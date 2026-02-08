import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { SearchLayout } from '../components/templates/SearchLayout';
import { SearchBar } from '../components/molecules/SearchBar';
import { SearchResults } from '../components/organisms/SearchResults';
import { AIThinkingProcess } from '../components/organisms/AIThinkingProcess';
import { ComplianceWarning } from '../components/organisms/ComplianceWarning';
import { BestellModal } from '../components/organisms/BestellModal';
import { Spinner, Button } from '../components/atoms';
import { useSearchStore } from '../store/useSearchStore';
import { useSearch } from '../hooks/useSearch';
import { ArrowLeft, BarChart3, Search, ShoppingCart, Send, X } from 'lucide-react';
import type { Artikel } from '@procurement/shared';
import { useOciSession } from '../hooks/useOciSession';

interface AIThinkingResult {
  query: string;
  category: string;
  eclassCode: string;
  frameworkContracts: number;
  recommendation: string;
  isHazardous: boolean;
}

export function ResultsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const {
    suchbegriff,
    searchResponse,
    selectedArticles,
    setSuchbegriff,
    setSearchResponse,
    toggleArticle,
    clearSearch,
  } = useSearchStore();
  const searchMutation = useSearch();
  const oci = useOciSession();

  const [isThinking, setIsThinking] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [showHazardousWarning, setShowHazardousWarning] = useState(false);
  const [hazardousArticleName, setHazardousArticleName] = useState('');
  const [bestellArtikel, setBestellArtikel] = useState<Artikel | null>(null);

  const queryParam = searchParams.get('q') ?? '';

  // Auto-search when landing with ?q= but no store data
  useEffect(() => {
    if (queryParam && !searchResponse && !searchMutation.isPending) {
      setSuchbegriff(queryParam);
      searchMutation
        .mutateAsync({ suchbegriff: queryParam })
        .then((result) => setSearchResponse(result))
        .catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async (term: string) => {
    setCurrentQuery(term);
    setIsThinking(true);
  };

  const handleThinkingComplete = async (result: AIThinkingResult) => {
    setIsThinking(false);

    if (result.isHazardous) {
      setHazardousArticleName(result.query);
      setShowHazardousWarning(true);
      return;
    }

    await performSearch(result.query);
  };

  const performSearch = async (term: string) => {
    setSuchbegriff(term);
    setSearchParams({ q: term }, { replace: true });
    const result = await searchMutation.mutateAsync({ suchbegriff: term });
    setSearchResponse(result);
  };

  const handleHazardousClose = () => {
    setShowHazardousWarning(false);
  };

  const handleInitiateSpecial = () => {
    setShowHazardousWarning(false);
    performSearch(currentQuery);
  };

  return (
    <SearchLayout title={t('results.title')}>
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

      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearSearch();
              navigate('/search');
            }}
            className="flex-shrink-0 min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('common.back')}</span>
          </Button>
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              isLoading={searchMutation.isPending || isThinking}
              initialValue={queryParam || suchbegriff}
            />
          </div>
        </div>

        {selectedArticles.length > 0 && !isThinking && (
          <div className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-xl p-3">
            <BarChart3 className="h-5 w-5 text-primary-600 flex-shrink-0" />
            <span className="text-sm text-primary-800 flex-1">
              {t('results.articlesSelected', { count: selectedArticles.length })}
              {selectedArticles.length >= 3 && (
                <span className="text-xs text-primary-600 ml-1">({t('results.maxReached')})</span>
              )}
            </span>
            <Button size="sm" onClick={() => navigate('/compare')}>
              {t('results.compareButton')}
            </Button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isThinking ? (
            <div className="py-8" key="thinking">
              <AIThinkingProcess
                query={currentQuery}
                onComplete={handleThinkingComplete}
                isVisible={isThinking}
              />
            </div>
          ) : searchMutation.isPending ? (
            <Spinner size="lg" className="py-12" key="loading" />
          ) : searchResponse ? (
            <SearchResults
              key="results"
              ergebnisse={searchResponse.ergebnisse}
              gesamt={searchResponse.gesamt}
              aggregationen={searchResponse.aggregationen}
              selectedIds={selectedArticles.map((a) => a.id)}
              onToggleSelect={toggleArticle}
              onViewDetail={(artikel) => navigate(`/article/${artikel.id}`, { state: { artikel } })}
              onBestellen={(artikel) => setBestellArtikel(artikel)}
              ociMode={oci.isActive}
              onAddToOciCart={oci.isActive ? (artikel) => {
                oci.addToCart({
                  description: artikel.bezeichnung,
                  quantity: 1,
                  unit: 'EA',
                  price: artikel.preis,
                  currency: artikel.waehrung,
                  vendorMat: artikel.artikelnummer,
                  vendor: artikel.lieferant,
                  contract: artikel.rahmenvertragInfo?.vertragsnummer,
                  matgroup: artikel.rahmenvertragInfo ? undefined : undefined,
                });
              } : undefined}
            />
          ) : !queryParam ? (
            <div className="text-center py-16" key="empty">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">{t('results.noResults')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('results.noResultsHint')}</p>
            </div>
          ) : null}
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

      {/* Bestell-Modal */}
      {bestellArtikel && (
        <BestellModal
          artikel={bestellArtikel}
          onClose={() => setBestellArtikel(null)}
        />
      )}
    </SearchLayout>
  );
}
