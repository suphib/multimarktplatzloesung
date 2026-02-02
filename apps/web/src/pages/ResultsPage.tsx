import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchLayout } from '../components/templates/SearchLayout';
import { SearchBar } from '../components/molecules/SearchBar';
import { SearchResults } from '../components/organisms/SearchResults';
import { Spinner, Button } from '../components/atoms';
import { useSearchStore } from '../store/useSearchStore';
import { useSearch } from '../hooks/useSearch';
import { ArrowLeft, BarChart3, Search } from 'lucide-react';

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
  } = useSearchStore();
  const searchMutation = useSearch();

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
    setSuchbegriff(term);
    setSearchParams({ q: term }, { replace: true });
    const result = await searchMutation.mutateAsync({ suchbegriff: term });
    setSearchResponse(result);
  };

  return (
    <SearchLayout title={t('results.title')}>
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/search')}
            className="flex-shrink-0 min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('common.back')}</span>
          </Button>
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              isLoading={searchMutation.isPending}
              initialValue={queryParam || suchbegriff}
            />
          </div>
        </div>

        {selectedArticles.length > 0 && (
          <div className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-xl p-3">
            <BarChart3 className="h-5 w-5 text-primary-600 flex-shrink-0" />
            <span className="text-sm text-primary-800 flex-1">
              {t('results.articlesSelected', { count: selectedArticles.length })}
            </span>
            <Button size="sm" onClick={() => navigate('/compare')}>
              {t('results.compareButton')}
            </Button>
          </div>
        )}

        {searchMutation.isPending ? (
          <Spinner size="lg" className="py-12" />
        ) : searchResponse ? (
          <SearchResults
            ergebnisse={searchResponse.ergebnisse}
            gesamt={searchResponse.gesamt}
            aggregationen={searchResponse.aggregationen}
            selectedIds={selectedArticles.map((a) => a.id)}
            onToggleSelect={toggleArticle}
            onViewDetail={(artikel) => navigate(`/article/${artikel.id}`, { state: { artikel } })}
          />
        ) : !queryParam ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">{t('results.noResults')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('results.noResultsHint')}</p>
          </div>
        ) : null}
      </div>
    </SearchLayout>
  );
}
