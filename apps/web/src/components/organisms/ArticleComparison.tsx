import type { Artikel } from '@procurement/shared';
import { useTranslation } from 'react-i18next';
import { PriceTag, Badge, Button } from '../atoms';
import { X, Truck, Leaf } from 'lucide-react';

interface ArticleComparisonProps {
  articles: Artikel[];
  onRemove: (id: string) => void;
  onClassify: (artikel: Artikel) => void;
}

export function ArticleComparison({ articles, onRemove, onClassify }: ArticleComparisonProps) {
  const { t } = useTranslation();

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        {t('organisms.noArticlesForComparison')}
        <br />
        {t('organisms.selectUpTo5')}
      </div>
    );
  }

  const minPreis = Math.min(...articles.map((a) => a.preis));

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-4 min-w-full pb-4" style={{ minWidth: articles.length * 280 }}>
        {articles.map((a) => (
          <div
            key={a.id}
            className={`card w-72 flex-shrink-0 ${a.preis === minPreis ? 'ring-2 ring-green-500' : ''}`}
          >
            <div className="flex justify-between items-start mb-3">
              <Badge variant="info">{t(`common.marketplace.${a.marktplatz}`, { defaultValue: a.marktplatz })}</Badge>
              <button onClick={() => onRemove(a.id)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="font-semibold text-sm line-clamp-2 mb-2">{a.bezeichnung}</h3>
            <PriceTag
              preis={a.preis}
              className={`text-xl ${a.preis === minPreis ? 'text-green-600' : ''}`}
            />
            {a.preis === minPreis && (
              <Badge variant="success" className="mt-1">
                {t('compare.cheapest')}
              </Badge>
            )}
            <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" />
                {a.lieferzeit}
              </p>
              <p>{a.lieferant}</p>
              {a.nachhaltigkeitslabel.length > 0 && (
                <p className="flex items-center gap-1 text-green-600">
                  <Leaf className="h-3.5 w-3.5" />
                  {a.nachhaltigkeitslabel.join(', ')}
                </p>
              )}
            </div>
            <Button variant="secondary" size="sm" className="w-full mt-4" onClick={() => onClassify(a)}>
              {t('common.classify')}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
