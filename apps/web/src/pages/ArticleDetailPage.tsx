import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { DetailLayout } from '../components/templates/DetailLayout';
import { PriceTag, Badge, Button, Spinner } from '../components/atoms';
import { SupplierInfo } from '../components/molecules/SupplierInfo';
import { ClassificationBadge } from '../components/molecules/ClassificationBadge';
import { useClassify } from '../hooks/useClassify';
import { useSearchStore } from '../store/useSearchStore';
import type { Artikel } from '@procurement/shared';
import { Package, Leaf, Sparkles, FileText } from 'lucide-react';

export function ArticleDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const classifyMutation = useClassify();
  const { classifyResult, setClassifyResult } = useSearchStore();

  const artikel: Artikel | undefined = (location.state as any)?.artikel;

  if (!artikel) {
    return (
      <DetailLayout title="Artikel nicht gefunden" backTo="/results">
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">Artikel nicht gefunden</p>
          <p className="text-sm text-gray-500 mt-1">Bitte starten Sie eine neue Suche.</p>
          <Button className="mt-4" onClick={() => navigate('/search')}>
            Zur Suche
          </Button>
        </div>
      </DetailLayout>
    );
  }

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
    <DetailLayout title={artikel.bezeichnung} backTo="/results">
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
            </div>
          </div>
        </div>

        {/* KI-Klassifizierung */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary-600" />
            KI-Klassifizierung
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
                  <p className="text-sm text-gray-500">CPV-Code</p>
                  <p className="font-medium mt-0.5">
                    {classifyResult.cpvCode} – {classifyResult.cpvBezeichnung}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Begründung</p>
                  <p className="text-sm mt-0.5">{classifyResult.begruendung}</p>
                </div>
              </div>
              {classifyResult.rahmenvertrag && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-800">Rahmenvertrag gefunden</p>
                  <p className="text-sm text-green-700 mt-1">
                    {classifyResult.rahmenvertrag.bezeichnung} ({classifyResult.rahmenvertrag.lieferant})
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Ähnlichkeit: {Math.round(classifyResult.rahmenvertrag.aehnlichkeit * 100)}%
                  </p>
                </div>
              )}
              <Button
                variant="secondary"
                onClick={() => navigate(`/documentation/${classifyResult.id}`)}
                className="w-full sm:w-auto"
              >
                <FileText className="h-4 w-4 mr-2" />
                Vergabedokumentation anzeigen
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Lassen Sie diesen Artikel durch die KI klassifizieren, um den optimalen
                Beschaffungskanal zu ermitteln.
              </p>
              <Button onClick={handleClassify} disabled={classifyMutation.isPending} className="w-full sm:w-auto">
                {classifyMutation.isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Klassifiziere...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Jetzt klassifizieren
                  </>
                )}
              </Button>
              {classifyMutation.isError && (
                <p className="text-sm text-red-600 mt-2">
                  Fehler bei der Klassifizierung. Bitte versuchen Sie es erneut.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </DetailLayout>
  );
}
