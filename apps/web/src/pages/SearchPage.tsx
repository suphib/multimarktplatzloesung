import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';


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
  { icon: Sparkles, tLabel: 'search.features.classification.label', tDesc: 'search.features.classification.desc' },
  { icon: Shield, tLabel: 'search.features.compliance.label', tDesc: 'search.features.compliance.desc' },
  { icon: BarChart3, tLabel: 'search.features.comparison.label', tDesc: 'search.features.comparison.desc' },
  { icon: FileText, tLabel: 'search.features.documentation.label', tDesc: 'search.features.documentation.desc' },
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

  const [isThinking, setIsThinking] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [showHazardousWarning, setShowHazardousWarning] = useState(false);
  const [hazardousArticleName, setHazardousArticleName] = useState('');

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <AnimatePresence mode="wait">
          {isThinking ? (
            <div className="w-full max-w-2xl py-8" key="thinking">
              <AIThinkingProcess
                query={currentQuery}
                onComplete={handleThinkingComplete}
                isVisible={isThinking}
              />
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-8" key="search">
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {t('search.headline')}
                </h1>
                <p className="text-gray-500 text-lg">
                  {t('search.subtitle')}
                </p>
              </div>

              <div className="w-full max-w-2xl">
                <SearchBar onSearch={handleSearch} isLoading={searchMutation.isPending} />
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <FileQuestion className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>{t('search.specialProcurementHint')}</span>
                  <button
                    onClick={() => navigate('/special-procurement')}
                    className="text-primary-600 hover:text-primary-800 font-medium underline underline-offset-2 whitespace-nowrap"
                  >
                    {t('search.specialProcurement')}
                  </button>
                </div>
              </div>

              {/* Kategorie-Chips */}
              <div className="w-full max-w-3xl">
                <p className="text-sm text-gray-500 mb-3 text-center">
                  {t('search.browseByCategory')}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {KATEGORIEN.map(({ tKey, suchbegriff, icon: Icon, anzahl }) => (
                    <button
                      key={tKey}
                      onClick={() => handleSearch(suchbegriff)}
                      disabled={searchMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-all shadow-sm disabled:opacity-50"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t(tKey)}
                      <span className="text-xs text-gray-400 ml-0.5">({anzahl})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature-Karten */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mt-2">
                {FEATURE_KEYS.map(({ icon: Icon, tLabel, tDesc }) => (
                  <div key={tLabel} className="card text-center">
                    <Icon className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">{t(tLabel)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t(tDesc)}</p>
                  </div>
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
