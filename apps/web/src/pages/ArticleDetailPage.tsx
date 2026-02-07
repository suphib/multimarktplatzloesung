import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DetailLayout } from '../components/templates/DetailLayout';
import { PriceTag, Badge, Button, Spinner } from '../components/atoms';
import { SupplierInfo } from '../components/molecules/SupplierInfo';
import { ClassificationBadge } from '../components/molecules/ClassificationBadge';
import { useClassify } from '../hooks/useClassify';
import { useSearchStore } from '../store/useSearchStore';
import type { Artikel } from '@procurement/shared';
import { Package, Leaf, Sparkles, FileText, ExternalLink, BarChart3, Check, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { BestellModal } from '../components/organisms/BestellModal';

export function ArticleDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const classifyMutation = useClassify();
  const { classifyResult, setClassifyResult, selectedArticles, toggleArticle } = useSearchStore();
  const [bestellModalOpen, setBestellModalOpen] = useState(false);

  const artikel: Artikel | undefined = (location.state as any)?.artikel;

  if (!artikel) {
    return (
      <DetailLayout title={t('article.notFound')} backTo={undefined}>
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">{t('article.notFound')}</p>
          <p className="text-sm text-gray-500 mt-1">{t('article.notFoundText')}</p>
          <Button className="mt-4" onClick={() => navigate('/search')}>
            {t('common.toSearch')}
          </Button>
        </div>
      </DetailLayout>
    );
  }

  const isSelected = selectedArticles.some((a) => a.id === artikel.id);

  const handleClassify = async () => {
    const result = await classifyMutation.mutateAsync({
      artikelBezeichnung: artikel.bezeichnung,
      artikelBeschreibung: artikel.beschreibung,
      geschaetzterPreis: artikel.preis,
      menge: 1,
    });
    setClassifyResult(result);
  };

  return (
    <DetailLayout title={artikel.bezeichnung} backTo={undefined}>
      <div className="space-y-4 md:space-y-6">
        {/* Artikel-Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-72 h-56 md:h-auto bg-gray-50 flex items-center justify-center flex-shrink-0">
              {artikel.bildUrl ? (
                <img
                  src={artikel.bildUrl}
                  alt={artikel.bezeichnung}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-16 w-16 text-gray-300" />
              )}
            </div>
            <div className="flex-1 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">{artikel.bezeichnung}</h2>
              <p className="text-gray-600 mt-2 text-sm md:text-base">{artikel.beschreibung}</p>
              <div className="mt-4">
                <PriceTag preis={artikel.preis} waehrung={artikel.waehrung} className="text-2xl md:text-3xl font-bold" />
              </div>
              <div className="mt-4">
                <SupplierInfo
                  lieferant={artikel.lieferant}
                  marktplatz={artikel.marktplatz}
                  artikelnummer={artikel.artikelnummer}
                />
              </div>
              {artikel.nachhaltigkeitslabel.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {artikel.nachhaltigkeitslabel.map((label) => (
                    <Badge key={label} variant="success">
                      <Leaf className="h-3 w-3 mr-1" />
                      {label}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100">
                <Button
                  onClick={() => {
                    const urls: Record<string, string> = {
                      AMAZON_BUSINESS: 'https://business.amazon.de',
                      MERCATEO: 'https://www.mercateo.com',
                      CONRAD: 'https://www.conrad.de',
                    };
                    window.open(urls[artikel.marktplatz] ?? '#', '_blank');
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('article.goToMarketplace')}
                </Button>
                {isSelected ? (
                  <Button
                    variant="secondary"
                    onClick={() => toggleArticle(artikel)}
                    className="flex-1 sm:flex-none"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {t('article.removeFromCompare')}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => toggleArticle(artikel)}
                    disabled={selectedArticles.length >= 3}
                    className="flex-1 sm:flex-none"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {selectedArticles.length >= 3
                      ? t('article.maxCompareReached')
                      : t('article.addToCompare')}
                  </Button>
                )}
                {selectedArticles.length >= 2 && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/compare')}
                    className="flex-1 sm:flex-none"
                  >
                    {t('article.goToCompare')} ({selectedArticles.length})
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RV-Konditionen */}
        {artikel.rahmenvertragInfo && artikel.marktplatz === 'RAHMENVERTRAG' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-green-600" />
              {t('order.rvKonditionen')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('admin.rahmenvertraege.vertragsnummer')}</p>
                <p className="font-medium mt-0.5">{artikel.rahmenvertragInfo.vertragsnummer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('admin.rahmenvertraege.zahlungsbedingungen')}</p>
                <p className="font-medium mt-0.5">{artikel.rahmenvertragInfo.zahlungsbedingungen || '–'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('admin.rahmenvertraege.skonto')}</p>
                <p className="font-medium mt-0.5">{artikel.rahmenvertragInfo.skonto || '–'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('admin.rahmenvertraege.mindestBestellwert')}</p>
                <p className="font-medium mt-0.5">{artikel.rahmenvertragInfo.mindestBestellwert.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('admin.rahmenvertraege.maxVolumen')}</p>
                <p className="font-medium mt-0.5">
                  {artikel.rahmenvertragInfo.abrufVolumen.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  {' / '}
                  {artikel.rahmenvertragInfo.maxVolumen.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  {' '}
                  ({artikel.rahmenvertragInfo.maxVolumen > 0
                    ? Math.round((artikel.rahmenvertragInfo.abrufVolumen / artikel.rahmenvertragInfo.maxVolumen) * 100)
                    : 0}%)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('order.gueltigBis')}</p>
                <p className="font-medium mt-0.5">
                  {artikel.rahmenvertragInfo.gueltigBis
                    ? new Date(artikel.rahmenvertragInfo.gueltigBis).toLocaleDateString('de-DE')
                    : '–'}
                </p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <Button onClick={() => setBestellModalOpen(true)}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t('order.bestellen')}
              </Button>
            </div>
          </div>
        )}

        {/* Bestell-Modal */}
        {bestellModalOpen && artikel && (
          <BestellModal
            artikel={artikel}
            onClose={() => setBestellModalOpen(false)}
          />
        )}

        {/* KI-Klassifizierung */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary-600" />
            {t('article.classificationTitle')}
          </h3>
          {classifyResult ? (
            <div className="space-y-4">
              <ClassificationBadge
                kanal={classifyResult.empfohlenerKanal}
                konfidenz={classifyResult.konfidenz}
                konfidenzWert={classifyResult.konfidenzWert}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('article.cpvCode')}</p>
                  <p className="font-medium mt-0.5">
                    {classifyResult.cpvCode} – {classifyResult.cpvBezeichnung}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('article.reasoning')}</p>
                  <p className="text-sm mt-0.5">{classifyResult.begruendung}</p>
                </div>
              </div>
              {classifyResult.rahmenvertrag && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-800">{t('article.frameworkFound')}</p>
                  <p className="text-sm text-green-700 mt-1">
                    {classifyResult.rahmenvertrag.bezeichnung} ({classifyResult.rahmenvertrag.lieferant})
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    {t('article.similarity', { value: Math.round(classifyResult.rahmenvertrag.aehnlichkeit * 100) })}
                  </p>
                </div>
              )}
              <Button
                variant="secondary"
                onClick={() => navigate(`/documentation/${classifyResult.id}`)}
                className="w-full sm:w-auto"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t('article.showDocumentation')}
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                {t('article.classifyPrompt')}
              </p>
              <Button onClick={handleClassify} disabled={classifyMutation.isPending} className="w-full sm:w-auto">
                {classifyMutation.isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    {t('article.classifying')}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('article.classifyButton')}
                  </>
                )}
              </Button>
              {classifyMutation.isError && (
                <p className="text-sm text-red-600 mt-2">
                  {t('article.classifyError')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </DetailLayout>
  );
}
