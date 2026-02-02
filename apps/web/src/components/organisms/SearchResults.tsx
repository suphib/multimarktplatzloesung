import type { Artikel, Aggregationen } from '@procurement/shared';
import { ArticleCard } from '../molecules/ArticleCard';
import { Badge } from '../atoms';

interface SearchResultsProps {
  ergebnisse: Artikel[];
  gesamt: number;
  aggregationen: Aggregationen;
  selectedIds: string[];
  onToggleSelect: (artikel: Artikel) => void;
  onViewDetail: (artikel: Artikel) => void;
}

const mpLabels: Record<string, string> = {
  AMAZON_BUSINESS: 'Amazon Business',
  MERCATEO: 'Mercateo',
  CONRAD: 'Conrad',
};

export function SearchResults({
  ergebnisse,
  gesamt,
  aggregationen,
  selectedIds,
  onToggleSelect,
  onViewDetail,
}: SearchResultsProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <p className="text-sm text-gray-600">
          {gesamt} Ergebnis{gesamt !== 1 ? 'se' : ''} gefunden
        </p>
        <div className="flex gap-2">
          {aggregationen.marktplaetze.map(({ marktplatz, anzahl }) => (
            <Badge key={marktplatz} variant="default">
              {mpLabels[marktplatz] ?? marktplatz} ({anzahl})
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {ergebnisse.map((artikel) => (
          <ArticleCard
            key={artikel.id}
            artikel={artikel}
            isSelected={selectedIds.includes(artikel.id)}
            onToggleSelect={() => onToggleSelect(artikel)}
            onViewDetail={() => onViewDetail(artikel)}
          />
        ))}
      </div>
      {ergebnisse.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Keine Ergebnisse gefunden</p>
          <p className="mt-1">Versuchen Sie einen anderen Suchbegriff</p>
        </div>
      )}
    </div>
  );
}
