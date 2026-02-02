import { useNavigate } from 'react-router-dom';
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

const mpLabels: Record<string, string> = {
  AMAZON_BUSINESS: 'Amazon Business',
  MERCATEO: 'Mercateo',
  CONRAD: 'Conrad',
};

const mpColors: Record<string, string> = {
  AMAZON_BUSINESS: 'bg-orange-100 text-orange-800',
  MERCATEO: 'bg-blue-100 text-blue-800',
  CONRAD: 'bg-purple-100 text-purple-800',
};

const SPECS: { label: string; key: string; values: Record<string, string> }[] = [
  { label: 'Display', key: 'display', values: { 'cmp-1': '15.6" FHD (1920×1080)', 'cmp-2': '14" WUXGA (1920×1200)', 'cmp-3': '14" WUXGA (1920×1200)' } },
  { label: 'Prozessor', key: 'cpu', values: { 'cmp-1': 'Intel Core i7-1365U', 'cmp-2': 'AMD Ryzen 7 PRO 7840U', 'cmp-3': 'Intel Core i7-1355U' } },
  { label: 'RAM', key: 'ram', values: { 'cmp-1': '16 GB DDR5', 'cmp-2': '16 GB LPDDR5x', 'cmp-3': '16 GB DDR5' } },
  { label: 'Speicher', key: 'storage', values: { 'cmp-1': '512 GB NVMe SSD', 'cmp-2': '512 GB NVMe SSD', 'cmp-3': '512 GB NVMe SSD' } },
  { label: 'Betriebssystem', key: 'os', values: { 'cmp-1': 'Windows 11 Pro', 'cmp-2': 'Windows 11 Pro', 'cmp-3': 'Windows 11 Pro' } },
  { label: 'Garantie', key: 'warranty', values: { 'cmp-1': '3 Jahre ProSupport', 'cmp-2': '3 Jahre Vor-Ort-Service', 'cmp-3': '3 Jahre Next Business Day' } },
  { label: 'Gewicht', key: 'weight', values: { 'cmp-1': '1,66 kg', 'cmp-2': '1,22 kg', 'cmp-3': '1,36 kg' } },
  { label: 'Akkulaufzeit', key: 'battery', values: { 'cmp-1': 'bis zu 10 Std.', 'cmp-2': 'bis zu 13 Std.', 'cmp-3': 'bis zu 14 Std.' } },
];

export function ComparePage() {
  const navigate = useNavigate();
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
    <SearchLayout title="Preisvergleich">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Preisvergleich</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {articles.length} Artikel im Vergleich
              {isDemo && (
                <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Demo-Daten
                </span>
              )}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/results')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zurück zu Ergebnissen
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
                Mögliche Ersparnis: {ersparnis.toFixed(2)} €
              </p>
              <p className="text-xs text-green-600">
                Günstigstes Angebot: {minPreis.toFixed(2)} € vs. teuerstes: {maxPreis.toFixed(2)} €
              </p>
            </div>
          </div>
        )}

        {classifyMutation.isPending && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
            <Spinner size="sm" />
            Klassifiziere Artikel...
          </div>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Keine Artikel zum Vergleich</p>
            <p className="text-sm text-gray-500 mt-1">
              Wählen Sie bis zu 5 Artikel aus den Suchergebnissen.
            </p>
            <Button className="mt-4" onClick={() => navigate('/search')}>
              Zur Suche
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile: Karten-Ansicht */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((a) => {
                const isCheapest = a.preis === minPreis && articles.length >= 2;
                return (
                  <div
                    key={a.id}
                    className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-all ${
                      isCheapest ? 'border-green-400 ring-1 ring-green-200' : 'border-gray-100'
                    }`}
                  >
                    {/* Günstigster Badge */}
                    {isCheapest && (
                      <div className="bg-green-500 text-white text-xs font-semibold text-center py-1.5 flex items-center justify-center gap-1">
                        <Star className="h-3.5 w-3.5" />
                        Günstigstes Angebot
                      </div>
                    )}

                    {/* Bild + Entfernen */}
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
                          {mpLabels[a.marktplatz] ?? a.marktplatz}
                        </span>
                      </div>
                    </div>

                    {/* Inhalt */}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 min-h-[2.5rem]">
                        {a.bezeichnung}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.beschreibung}</p>

                      {/* Preis */}
                      <div className="mt-3 flex items-baseline gap-2">
                        <PriceTag
                          preis={a.preis}
                          waehrung={a.waehrung}
                          className={`text-2xl font-bold ${isCheapest ? 'text-green-600' : 'text-gray-900'}`}
                        />
                      </div>

                      {/* Details */}
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Truck className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{a.lieferzeit}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Shield className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{a.lieferant}</span>
                        </div>
                        {a.nachhaltigkeitslabel.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
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
                        )}
                      </div>

                      {/* Aktionen */}
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => navigate(`/article/${a.id}`, { state: { artikel: a } })}
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleClassify(a)}
                          disabled={classifyMutation.isPending}
                        >
                          Klassifizieren
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spezifikations-Vergleich (nur für Demo mit 3 festen Artikeln) */}
            {isDemo && demoArticles.length >= 2 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setShowSpecs(!showSpecs)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900 flex items-center gap-2">
                    <Info className="h-4 w-4 text-gray-500" />
                    Technische Spezifikationen
                  </span>
                  {showSpecs ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {showSpecs && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 px-4 font-medium text-gray-500 w-32">Merkmal</th>
                          {demoArticles.map((a) => (
                            <th key={a.id} className="text-left py-3 px-4 font-medium text-gray-900 min-w-[180px]">
                              {a.bezeichnung.split(' ').slice(0, 2).join(' ')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-50">
                          <td className="py-2.5 px-4 font-medium text-gray-500">Preis</td>
                          {demoArticles.map((a) => (
                            <td
                              key={a.id}
                              className={`py-2.5 px-4 font-bold ${
                                a.preis === minPreis ? 'text-green-600' : 'text-gray-900'
                              }`}
                            >
                              {a.preis.toFixed(2)} €
                              {a.preis === minPreis && (
                                <span className="ml-1 text-xs font-normal bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                  Bester Preis
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                        {SPECS.filter((spec) =>
                          demoArticles.some((a) => spec.values[a.id])
                        ).map((spec) => (
                          <tr key={spec.key} className="border-b border-gray-50">
                            <td className="py-2.5 px-4 font-medium text-gray-500">{spec.label}</td>
                            {demoArticles.map((a) => (
                              <td key={a.id} className="py-2.5 px-4 text-gray-700">
                                {spec.values[a.id] ?? '–'}
                              </td>
                            ))}
                          </tr>
                        ))}
                        <tr className="border-b border-gray-50">
                          <td className="py-2.5 px-4 font-medium text-gray-500">Nachhaltigkeit</td>
                          {demoArticles.map((a) => (
                            <td key={a.id} className="py-2.5 px-4">
                              <div className="flex flex-wrap gap-1">
                                {a.nachhaltigkeitslabel.map((label) => (
                                  <span
                                    key={label}
                                    className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                                  >
                                    {label}
                                  </span>
                                ))}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-medium text-gray-500">Lieferzeit</td>
                          {demoArticles.map((a) => (
                            <td key={a.id} className="py-2.5 px-4 text-gray-700 flex items-center gap-1">
                              <Truck className="h-3.5 w-3.5 text-gray-400" />
                              {a.lieferzeit}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Info-Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Vergaberechts-Hinweis</p>
                <p className="mt-1 text-blue-600">
                  Bei Beschaffungen über 1.000 € netto ist ein dokumentierter Preisvergleich erforderlich.
                  Nutzen Sie die Klassifizierungsfunktion, um den korrekten Beschaffungskanal zu ermitteln
                  und die Vergabedokumentation automatisch zu erstellen.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </SearchLayout>
  );
}
