import { useNavigate } from 'react-router-dom';
import { SearchLayout } from '../components/templates/SearchLayout';
import { SearchBar } from '../components/molecules/SearchBar';
import { SearchResults } from '../components/organisms/SearchResults';
import { Spinner, Button } from '../components/atoms';
import { useSearchStore } from '../store/useSearchStore';
import { useSearch } from '../hooks/useSearch';
import { BarChart3 } from 'lucide-react';

export function ResultsPage() {
  const navigate = useNavigate();
  const {
    suchbegriff,
    searchResponse,
    selectedArticles,
    setSuchbegriff,
    setSearchResponse,
    toggleArticle,
  } = useSearchStore();
  const searchMutation = useSearch();

  const handleSearch = async (term: string) => {
    setSuchbegriff(term);
    const result = await searchMutation.mutateAsync({ suchbegriff: term });
    setSearchResponse(result);
  };

  if (!searchResponse) {
    navigate('/search');
    return null;
  }

  return (
    <SearchLayout title="Suchergebnisse">
      <div className="space-y-4 md:space-y-6">
        <SearchBar
          onSearch={handleSearch}
          isLoading={searchMutation.isPending}
          initialValue={suchbegriff}
        />

        {selectedArticles.length > 0 && (
          <div className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-xl p-3">
            <BarChart3 className="h-5 w-5 text-primary-600 flex-shrink-0" />
            <span className="text-sm text-primary-800 flex-1">
              {selectedArticles.length} Artikel ausgewählt
            </span>
            <Button size="sm" onClick={() => navigate('/compare')}>
              Vergleichen
            </Button>
          </div>
        )}

        {searchMutation.isPending ? (
          <Spinner size="lg" className="py-12" />
        ) : (
          <SearchResults
            ergebnisse={searchResponse.ergebnisse}
            gesamt={searchResponse.gesamt}
            aggregationen={searchResponse.aggregationen}
            selectedIds={selectedArticles.map((a) => a.id)}
            onToggleSelect={toggleArticle}
            onViewDetail={(artikel) => navigate(`/article/${artikel.id}`, { state: { artikel } })}
          />
        )}
      </div>
    </SearchLayout>
  );
}
