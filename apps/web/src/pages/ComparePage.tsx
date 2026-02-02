import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchLayout } from '../components/templates/SearchLayout';
import { Button, Badge, PriceTag, Spinner } from '../components/atoms';
import { useSearchStore } from '../store/useSearchStore';
import { useClassify } from '../hooks/useClassify';
import type { Artikel } from '@procurement/shared';
import {
  ArrowLeft, X, Truck, Leaf, Star, Shield, TrendingDown, Package,
  ChevronDown, ChevronUp, Info,
} from 'lucide-react';
import { useState } from 'react';

const DEMO_ARTICLES: Artikel[] = [
  {
    id: 'cmp-1',
    bezeichnung: 'Dell Latitude 5540 Business Laptop',
    beschreibung: '15.6" FHD, Intel Core i7-1365U, 16GB RAM, 512GB SSD, Windows 11 Pro, 3 Jahre ProSupport',
    preis: 1289.0,
    waehrung: 'EUR',
    marktplatz: 'AMAZON_BUSINESS' as any,
    lieferant: 'Dell Technologies',
    lieferzeit: '2-3 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1593642702749-b7d2a804fbcf?w=300&h=300&fit=crop',
    nachhaltigkeitslabel: ['EPEAT Gold', 'Energy Star'],
    verfuegbar: true,
    artikelnummer: 'DELL-LAT5540-I7',
  },
  {
    id: 'cmp-2',
    bezeichnung: 'Lenovo ThinkPad T14s Gen 4',
    beschreibung: '14" WUXGA, AMD Ryzen 7 PRO 7840U, 16GB RAM, 512GB SSD, Windows 11 Pro, 3 Jahre Vor-Ort',
    preis: 1149.0,
    waehrung: 'EUR',
    marktplatz: 'MERCATEO' as any,
    lieferant: 'Lenovo GmbH',
    lieferzeit: '3-5 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
    nachhaltigkeitslabel: ['EPEAT Gold', 'TCO Certified'],
    verfuegbar: true,
    artikelnummer: 'LEN-T14S-G4-R7',
  },
  {
    id: 'cmp-3',
    bezeichnung: 'HP EliteBook 840 G10',
    beschreibung: '14" WUXGA, Intel Core i7-1355U, 16GB RAM, 512GB SSD, Windows 11 Pro, 3 Jahre NBD',
    preis: 1349.0,
    waehrung: 'EUR',
    marktplatz: 'CONRAD' as any,
    lieferant: 'HP Deutschland',
    lieferzeit: '1-2 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop',
    nachhaltigkeitslabel: ['EPEAT Gold', 'Energy Star', 'TCO Certified'],
    verfuegbar: true,
    artikelnummer: 'HP-EB840-G10-I7',
  },
];

const mpColors: Record<string, string> = {
  AMAZON_BUSINESS: 'bg-orange-100 text-orange-800',
  MERCATEO: 'bg-blue-100 text-blue-800',
  CONRAD: 'bg-purple-100 text-purple-800',
};

const SPEC_KEYS = ['display', 'cpu', 'ram', 'storage', 'os', 'warranty', 'weight', 'battery'] as const;

const SPEC_VALUES: Record<string, Record<string, string>> = {
  display: { 'cmp-1': '15.6" FHD (1920×1080)', 'cmp-2': '14" WUXGA (1920×1200)', 'cmp-3': '14" WUXGA (1920×1200)' },
  cpu: { 'cmp-1': 'Intel Core i7-1365U', 'cmp-2': 'AMD Ryzen 7 PRO 7840U', 'cmp-3': 'Intel Core i7-1355U' },
  ram: { 'cmp-1': '16 GB DDR5', 'cmp-2': '16 GB LPDDR5x', 'cmp-3': '16 GB DDR5' },
  storage: { 'cmp-1': '512 GB NVMe SSD', 'cmp-2': '512 GB NVMe SSD', 'cmp-3': '512 GB NVMe SSD' },
  os: { 'cmp-1': 'Windows 11 Pro', 'cmp-2': 'Windows 11 Pro', 'cmp-3': 'Windows 11 Pro' },
  warranty: { 'cmp-1': '3 Jahre ProSupport', 'cmp-2': '3 Jahre Vor-Ort-Service', 'cmp-3': '3 Jahre Next Business Day' },
  weight: { 'cmp-1': '1,66 kg', 'cmp-2': '1,22 kg', 'cmp-3': '1,36 kg' },
  battery: { 'cmp-1': 'bis zu 10 Std.', 'cmp-2': 'bis zu 13 Std.', 'cmp-3': 'bis zu 14 Std.' },
};

export function ComparePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedArticles, toggleArticle, setClassifyResult } = useSearchStore();
  const classifyMutation = useClassify();
  const [showSpecs, setShowSpecs] = useState(true);
  const [removedDemo, setRemovedDemo] = useState<string[]>([]);

  const storeArticles = selectedArticles.length > 0 ? selectedArticles : [];
  const demoArticles = DEMO_ARTICLES.filter((a) => !removedDemo.includes(a.id));
  const articles = storeArticles.length > 0 ? storeArticles : demoArticles;
  const isDemo = storeArticles.length === 0;

  const minPreis = articles.length > 0 ? Math.min(...articles.map((a) => a.preis)) : 0;
  const maxPreis = articles.length > 0 ? Math.max(...articles.map((a) => a.preis)) : 0;
  const ersparnis = maxPreis - minPreis;

  const handleClassify = async (artikel: Artikel) => {
    const result = await classifyMutation.mutateAsync({
      artikelBezeichnung: artikel.bezeichnung,
      artikelBeschreibung: artikel.beschreibung,
      geschaetzterPreis: artikel.preis,
      menge: 1,
    });
    setClassifyResult(result);
    navigate(`/article/${artikel.id}`, { state: { artikel } });
  };

  const handleRemove = (id: string) => {
    if (isDemo) {
      setRemovedDemo((prev) => [...prev, id]);
    } else {
      const article = selectedArticles.find((a) => a.id === id);
      if (article) toggleArticle(article);
    }
  };

  return (
    <SearchLayout title={t('compare.title')}>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t('compare.title')}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {t('compare.articlesInComparison', { count: articles.length })}
              {isDemo && (
                <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {t('compare.demoData')}
                </span>
              )}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/results')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('compare.backToResults')}
          </Button>
        </div>

        {/* Ersparnis-Banner */}
        {articles.length >= 2 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-2">
              <TrendingDown className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800">
                {t('compare.possibleSavings', { amount: ersparnis.toFixed(2) })}
              </p>
              <p className="text-xs text-green-600">
                {t('compare.cheapestVsExpensive', { min: minPreis.toFixed(2), max: maxPreis.toFixed(2) })}
              </p>
            </div>
          </div>
        )}

        {classifyMutation.isPending && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
            <Spinner size="sm" />
            {t('compare.classifyingArticle')}
          </div>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">{t('compare.noArticles')}</p>
            <p className="text-sm text-gray-500 mt-1">
              {t('compare.noArticlesHint')}
            </p>
            <Button className="mt-4" onClick={() => navigate('/search')}>
              {t('common.toSearch')}
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile: Karten-Ansicht */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {articles.map((a) => {
                const isCheapest = a.preis === minPreis && articles.length >= 2;
                const mpLabel = t(`common.marketplace.${a.marktplatz}`, { defaultValue: a.marktplatz });
                return (
                  <div
                    key={a.id}
                    className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-all flex flex-col ${
                      isCheapest ? 'border-green-400 ring-1 ring-green-200' : 'border-gray-100'
                    }`}
                  >
                    <div className="relative">
                      <div className="h-40 bg-gray-50 flex items-center justify-center">
                        {a.bildUrl ? (
                          <img src={a.bildUrl} alt={a.bezeichnung} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-12 w-12 text-gray-300" />
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(a.id)}
                        className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full p-1.5 shadow hover:bg-red-50 transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                      </button>
                      <div className="absolute top-2 left-2">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${mpColors[a.marktplatz] ?? 'bg-gray-100 text-gray-700'}`}>
                          {mpLabel}
                        </span>
                      </div>
                      {isCheapest && (
                        <div className="absolute bottom-0 inset-x-0 bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold text-center py-1.5 flex items-center justify-center gap-1">
                          <Star className="h-3.5 w-3.5" />
                          {t('compare.cheapestOffer')}
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 min-h-[2.5rem]">
                        {a.bezeichnung}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[2rem]">{a.beschreibung}</p>

                      <div className="mt-3 flex items-baseline gap-2">
                        <PriceTag
                          preis={a.preis}
                          waehrung={a.waehrung}
                          className={`text-2xl font-bold ${isCheapest ? 'text-green-600' : 'text-gray-900'}`}
                        />
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Truck className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{a.lieferzeit}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Shield className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{a.lieferant}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 min-h-[1.5rem]">
                          {a.nachhaltigkeitslabel.map((label) => (
                            <span
                              key={label}
                              className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                            >
                              <Leaf className="h-3 w-3" />
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-auto pt-4 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => navigate(`/article/${a.id}`, { state: { artikel: a } })}
                        >
                          {t('common.details')}
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleClassify(a)}
                          disabled={classifyMutation.isPending}
                        >
                          {t('common.classify')}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spezifikations-Vergleich */}
            {isDemo && demoArticles.length >= 2 && (
              <div>
                <button
                  onClick={() => setShowSpecs(!showSpecs)}
                  className="w-full flex items-center justify-between py-2 text-left"
                >
                  <span className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-gray-400" />
                    {t('compare.technicalSpecs')}
                  </span>
                  {showSpecs ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                {showSpecs && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {demoArticles.map((a) => {
                      const isCheapest = a.preis === minPreis;
                      return (
                        <div
                          key={a.id}
                          className={`border-t-4 pt-3 ${isCheapest ? 'border-green-400' : 'border-gray-200'}`}
                        >
                          <h4 className="font-semibold text-sm text-gray-900 mb-3 truncate">
                            {a.bezeichnung.split(' ').slice(0, 3).join(' ')}
                          </h4>
                          <div className="space-y-0">
                            {SPEC_KEYS.map((key, i) => (
                              <div key={key} className={`flex flex-col py-2 px-2.5 rounded ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
                                <span className="text-xs font-medium text-gray-400">{t(`compare.specLabels.${key}`)}</span>
                                <span className="text-sm text-gray-700">{SPEC_VALUES[key]?.[a.id] ?? '–'}</span>
                              </div>
                            ))}
                            <div className={`flex flex-col py-2 px-2.5 rounded ${SPEC_KEYS.length % 2 === 0 ? 'bg-gray-50' : ''}`}>
                              <span className="text-xs font-medium text-gray-400">{t('compare.specLabels.sustainability')}</span>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {a.nachhaltigkeitslabel.map((label) => (
                                  <span
                                    key={label}
                                    className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                                  >
                                    {label}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className={`flex flex-col py-2 px-2.5 rounded ${(SPEC_KEYS.length + 1) % 2 === 0 ? 'bg-gray-50' : ''}`}>
                              <span className="text-xs font-medium text-gray-400">{t('compare.specLabels.deliveryTime')}</span>
                              <span className="text-sm text-gray-700 inline-flex items-center gap-1">
                                <Truck className="h-3.5 w-3.5 text-gray-400" />
                                {a.lieferzeit}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Info-Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">{t('compare.procurementNotice')}</p>
                <p className="mt-1 text-blue-600">
                  {t('compare.procurementNoticeText')}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </SearchLayout>
  );
}
