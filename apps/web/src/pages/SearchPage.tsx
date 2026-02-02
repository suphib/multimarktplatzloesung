import { useNavigate } from 'react-router-dom';
import { SearchLayout } from '../components/templates/SearchLayout';
import { SearchBar } from '../components/molecules/SearchBar';
import { useSearchStore } from '../store/useSearchStore';
import { useSearch } from '../hooks/useSearch';
import {
  Sparkles, Shield, BarChart3, FileText,
  Laptop, Monitor, Armchair, Printer, Mouse, Headphones, Package,
  FlaskConical, Cpu, Tv,
} from 'lucide-react';

const KATEGORIEN = [
  { label: 'Laptops', suchbegriff: 'Laptop', icon: Laptop, anzahl: 5 },
  { label: 'Monitore', suchbegriff: 'Monitor', icon: Monitor, anzahl: 3 },
  { label: 'Desktop PCs', suchbegriff: 'Desktop', icon: Cpu, anzahl: 2 },
  { label: 'Bürostühle', suchbegriff: 'stuhl', icon: Armchair, anzahl: 3 },
  { label: 'Schreibtische', suchbegriff: 'Schreibtisch', icon: Package, anzahl: 2 },
  { label: 'Drucker', suchbegriff: 'Drucker', icon: Printer, anzahl: 2 },
  { label: 'Peripherie', suchbegriff: 'Maus', icon: Mouse, anzahl: 6 },
  { label: 'Laborbedarf', suchbegriff: 'Labor', icon: FlaskConical, anzahl: 6 },
  { label: 'Messtechnik', suchbegriff: 'GPU', icon: Tv, anzahl: 4 },
  { label: 'Bürobedarf', suchbegriff: 'Papier', icon: Package, anzahl: 3 },
  { label: 'Alle Artikel', suchbegriff: 'er', icon: Package, anzahl: 37 },
];

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
            KI-gestützte Beschaffung
          </h1>
          <p className="text-gray-500 text-lg">
            Finden, vergleichen und klassifizieren Sie Artikel vergaberechtskonform
          </p>
        </div>

        <div className="w-full max-w-2xl">
          <SearchBar onSearch={handleSearch} isLoading={searchMutation.isPending} />
        </div>

        {/* Kategorie-Chips */}
        <div className="w-full max-w-3xl">
          <p className="text-sm text-gray-500 mb-3 text-center">
            Oder nach Kategorie durchsuchen:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {KATEGORIEN.map(({ label, suchbegriff, icon: Icon, anzahl }) => (
              <button
                key={label}
                onClick={() => handleSearch(suchbegriff)}
                disabled={searchMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-all shadow-sm disabled:opacity-50"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                <span className="text-xs text-gray-400 ml-0.5">({anzahl})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feature-Karten */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mt-2">
          {[
            { icon: Sparkles, label: 'KI-Klassifizierung', desc: 'Automatische CPV-Zuordnung' },
            { icon: Shield, label: 'Compliance', desc: 'Vergaberechtsprüfung' },
            { icon: BarChart3, label: 'Preisvergleich', desc: '3 Marktplätze' },
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
