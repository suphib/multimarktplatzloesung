import type { Artikel, Aggregationen } from '@procurement/shared';
import { useTranslation } from 'react-i18next';
import { ArticleCard } from '../molecules/ArticleCard';
import { Badge } from '../atoms';
import { Search, Info } from 'lucide-react';

interface SearchResultsProps {
  ergebnisse: Artikel[];
  gesamt: number;
  aggregationen: Aggregationen;
  selectedIds: string[];
  onToggleSelect: (artikel: Artikel) => void;
  onViewDetail: (artikel: Artikel) => void;
}

export function SearchResults({
  ergebnisse,
  gesamt,
  aggregationen,
  selectedIds,
  onToggleSelect,
  onViewDetail,
}: SearchResultsProps) {
  const { t } = useTranslation();

  // Calculate dominant supplier (>50% of results)
  const dominantSupplier = aggregationen.lieferanten && gesamt > 1
    ? aggregationen.lieferanten.find(l => (l.count / gesamt) > 0.5)
    : null;
  const dominantPercent = dominantSupplier ? Math.round((dominantSupplier.count / gesamt) * 100) : 0;

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <p className="text-sm text-gray-600">
          {t('results.resultCount', { count: gesamt })}
        </p>
        <div className="flex flex-wrap gap-2">
          {aggregationen.marktplaetze.map(({ marktplatz, anzahl }) => (
            <Badge key={marktplatz} variant="default">
              {t(`common.marketplace.${marktplatz}`, { defaultValue: marktplatz })} ({anzahl})
            </Badge>
          ))}
        </div>
      </div>

      {/* Supplier concentration hint */}
      {dominantSupplier && (
        <div className="mb-4 text-sm text-gray-600 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>
            {t('results.supplierHint', { supplier: dominantSupplier.name, percent: dominantPercent })}
          </span>
        </div>
      )}
      <div className="space-y-3 md:space-y-4">
        {ergebnisse.map((artikel) => (
          <ArticleCard
            key={artikel.id}
            artikel={artikel}
            isSelected={selectedIds.includes(artikel.id)}
            maxReached={selectedIds.length >= 3}
            onToggleSelect={() => onToggleSelect(artikel)}
            onViewDetail={() => onViewDetail(artikel)}
          />
        ))}
      </div>
      {ergebnisse.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">{t('results.noResults')}</p>
          <p className="text-sm text-gray-500 mt-1">{t('results.noResultsHint')}</p>
        </div>
      )}
    </div>
  );
}
