import { useNavigate } from 'react-router-dom';
import { SearchLayout } from '../components/templates/SearchLayout';
import { ArticleComparison } from '../components/organisms/ArticleComparison';
import { Button, Spinner } from '../components/atoms';
import { useSearchStore } from '../store/useSearchStore';
import { useClassify } from '../hooks/useClassify';

export function ComparePage() {
  const navigate = useNavigate();
  const { selectedArticles, toggleArticle, setClassifyResult } = useSearchStore();
  const classifyMutation = useClassify();

  const handleClassify = async (artikel: any) => {
    const result = await classifyMutation.mutateAsync({
      artikelBezeichnung: artikel.bezeichnung,
      artikelBeschreibung: artikel.beschreibung,
      geschaetzterPreis: artikel.preis,
      menge: 1,
    });
    setClassifyResult(result);
    navigate(`/article/${artikel.id}`, { state: { artikel } });
  };

  return (
    <SearchLayout title="Preisvergleich">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Preisvergleich</h2>
          <Button variant="secondary" size="sm" onClick={() => navigate('/results')}>
            Zurueck zu Ergebnissen
          </Button>
        </div>

        {classifyMutation.isPending && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Spinner size="sm" />
            Klassifiziere Artikel...
          </div>
        )}

        <ArticleComparison
          articles={selectedArticles}
          onRemove={(id) => {
            const article = selectedArticles.find((a) => a.id === id);
            if (article) toggleArticle(article);
          }}
          onClassify={handleClassify}
        />
      </div>
    </SearchLayout>
  );
}
