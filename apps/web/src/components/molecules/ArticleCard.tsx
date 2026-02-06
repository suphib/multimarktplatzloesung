import { Package, Truck, Leaf } from 'lucide-react';
import type { Artikel } from '@procurement/shared';
import { useTranslation } from 'react-i18next';
import { Badge, PriceTag, Button } from '../atoms';

interface ArticleCardProps {
  artikel: Artikel;
  isSelected?: boolean;
  maxReached?: boolean;
  onToggleSelect?: () => void;
  onViewDetail?: () => void;
}

const mpColors: Record<string, string> = {
  AMAZON_BUSINESS: 'bg-orange-100 text-orange-800 border-orange-200',
  MERCATEO: 'bg-blue-100 text-blue-800 border-blue-200',
  CONRAD: 'bg-purple-100 text-purple-800 border-purple-200',
  RAHMENVERTRAG: 'bg-green-100 text-green-800 border-green-200',
};

export function ArticleCard({ artikel, isSelected, maxReached, onToggleSelect, onViewDetail }: ArticleCardProps) {
  const { t } = useTranslation();
  const mpLabel = t(`common.marketplace.${artikel.marktplatz}`, { defaultValue: artikel.marktplatz });

  return (
    <div className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all ${
      isSelected ? 'border-primary-400 ring-1 ring-primary-200' : 'border-gray-100'
    }`}>
      <div className="flex flex-col sm:flex-row">
        {/* Bild */}
        <div
          onClick={onViewDetail}
          role={onViewDetail ? 'button' : undefined}
          className={`w-full sm:w-36 md:w-44 h-40 sm:h-auto bg-gray-50 flex items-center justify-center flex-shrink-0 rounded-t-xl sm:rounded-t-none sm:rounded-l-xl overflow-hidden relative ${onViewDetail ? 'cursor-pointer' : ''}`}
        >
          {artikel.bildUrl ? (
            <img src={artikel.bildUrl} alt={artikel.bezeichnung} className="w-full h-full object-cover" />
          ) : (
            <Package className="h-12 w-12 text-gray-300" />
          )}
          <div className="absolute top-2 left-2 sm:hidden">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${mpColors[artikel.marktplatz] ?? 'bg-gray-100 text-gray-700'}`}>
              {mpLabel}
            </span>
          </div>
        </div>

        {/* Inhalt */}
        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-start justify-between gap-3">
            <div
              onClick={onViewDetail}
              role={onViewDetail ? 'button' : undefined}
              className={`min-w-0 flex-1 ${onViewDetail ? 'cursor-pointer group' : ''}`}
            >
              <div className="hidden sm:block mb-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${mpColors[artikel.marktplatz] ?? 'bg-gray-100 text-gray-700'}`}>
                  {mpLabel}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-700 transition-colors">
                {artikel.bezeichnung}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2 group-hover:text-gray-700 transition-colors">
                {artikel.beschreibung}
              </p>
            </div>
            <PriceTag preis={artikel.preis} waehrung={artikel.waehrung} className="text-xl font-bold flex-shrink-0" />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" />
              {artikel.lieferzeit}
            </span>
            <span>{artikel.lieferant}</span>
            {artikel.nachhaltigkeitslabel.length > 0 && (
              <span className="flex items-center gap-1 text-green-600">
                <Leaf className="h-3.5 w-3.5" />
                {artikel.nachhaltigkeitslabel.join(', ')}
              </span>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            {onViewDetail && (
              <Button variant="secondary" size="sm" onClick={onViewDetail}>{t('common.details')}</Button>
            )}
            {onToggleSelect && (
              <Button
                variant={isSelected ? 'primary' : 'ghost'}
                size="sm"
                onClick={onToggleSelect}
                disabled={!isSelected && maxReached}
                title={!isSelected && maxReached ? t('article.maxCompareReached') : undefined}
              >
                {isSelected ? t('article.selected') : maxReached ? t('article.maxCompareReached') : t('article.compareAction')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
