import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { SearchLayout } from '../components/templates/SearchLayout';
import { SearchBar } from '../components/molecules/SearchBar';
import { SearchResults } from '../components/organisms/SearchResults';
import { AIThinkingProcess } from '../components/organisms/AIThinkingProcess';
import { ComplianceWarning } from '../components/organisms/ComplianceWarning';
import { Spinner, Button } from '../components/atoms';
import { useSearchStore } from '../store/useSearchStore';
import { useSearch } from '../hooks/useSearch';
import { ArrowLeft, BarChart3, Search } from 'lucide-react';

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

  const [isThinking, setIsThinking] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [showHazardousWarning, setShowHazardousWarning] = useState(false);
  const [hazardousArticleName, setHazardousArticleName] = useState('');

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
    </SearchLayout>
  );
}
