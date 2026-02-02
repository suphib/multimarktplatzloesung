import { Package, Truck, Leaf } from 'lucide-react';
import type { Artikel } from '@procurement/shared';
import { Badge, PriceTag, Button } from '../atoms';

interface ArticleCardProps {
  artikel: Artikel;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onViewDetail?: () => void;
}

const marktplatzLabels: Record<string, string> = {
  AMAZON_BUSINESS: 'Amazon Business',
  MERCATEO: 'Mercateo',
  CONRAD: 'Conrad',
};

export function ArticleCard({ artikel, isSelected, onToggleSelect, onViewDetail }: ArticleCardProps) {
  return (
    <div className={`card hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {artikel.bildUrl ? (
            <img src={artikel.bildUrl} alt={artikel.bezeichnung} className="w-full h-full object-contain rounded-lg" />
          ) : (
            <Package className="h-12 w-12 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{artikel.bezeichnung}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{artikel.beschreibung}</p>
            </div>
            <PriceTag preis={artikel.preis} waehrung={artikel.waehrung} className="text-lg flex-shrink-0" />
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="info">{marktplatzLabels[artikel.marktplatz] ?? artikel.marktplatz}</Badge>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" />
              {artikel.lieferzeit}
            </span>
            {artikel.nachhaltigkeitslabel.length > 0 && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Leaf className="h-3.5 w-3.5" />
                {artikel.nachhaltigkeitslabel.join(', ')}
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            {onViewDetail && (
              <Button variant="secondary" size="sm" onClick={onViewDetail}>Details</Button>
            )}
            {onToggleSelect && (
              <Button variant={isSelected ? 'primary' : 'ghost'} size="sm" onClick={onToggleSelect}>
                {isSelected ? 'Ausgewaehlt' : 'Vergleichen'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
