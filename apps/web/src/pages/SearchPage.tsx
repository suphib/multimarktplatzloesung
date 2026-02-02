import { useNavigate } from 'react-router-dom';
import { SearchLayout } from '../components/templates/SearchLayout';
import { SearchBar } from '../components/molecules/SearchBar';
import { useSearchStore } from '../store/useSearchStore';
import { useSearch } from '../hooks/useSearch';
import { Sparkles, Shield, BarChart3, FileText } from 'lucide-react';

export function SearchPage() {
  const navigate = useNavigate();
  const { setSuchbegriff, setSearchResponse } = useSearchStore();
  const searchMutation = useSearch();

  const handleSearch = async (term: string) => {
    setSuchbegriff(term);
    try {
      const result = await searchMutation.mutateAsync({ suchbegriff: term });
      setSearchResponse(result);
      navigate('/results');
    } catch {
      // Error handling via React Query
    }
  };

  return (
    <SearchLayout title="Artikelsuche">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            KI-gestuetzte Beschaffung
          </h1>
          <p className="text-gray-500 text-lg">
            Finden, vergleichen und klassifizieren Sie Artikel vergaberechtskonform
          </p>
        </div>

        <div className="w-full max-w-2xl">
          <SearchBar onSearch={handleSearch} isLoading={searchMutation.isPending} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mt-4">
          {[
            { icon: Sparkles, label: 'KI-Klassifizierung', desc: 'Automatische CPV-Zuordnung' },
            { icon: Shield, label: 'Compliance', desc: 'Vergaberechtspruefung' },
            { icon: BarChart3, label: 'Preisvergleich', desc: 'Marktplatzuebergreifend' },
            { icon: FileText, label: 'Dokumentation', desc: 'Revisionssicher' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="card text-center">
              <Icon className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        {searchMutation.isError && (
          <div className="text-red-600 text-sm">
            Fehler bei der Suche. Bitte versuchen Sie es erneut.
          </div>
        )}
      </div>
    </SearchLayout>
  );
}
