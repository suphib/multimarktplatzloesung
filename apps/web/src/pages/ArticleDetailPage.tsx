import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { DetailLayout } from '../components/templates/DetailLayout';
import { PriceTag, Badge, Button, Spinner } from '../components/atoms';
import { SupplierInfo } from '../components/molecules/SupplierInfo';
import { ClassificationBadge } from '../components/molecules/ClassificationBadge';
import { useClassify } from '../hooks/useClassify';
import { useSearchStore } from '../store/useSearchStore';
import type { Artikel } from '@procurement/shared';
import { Package, Leaf } from 'lucide-react';

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
        <div className="text-center py-12 text-gray-500">
          <p>Artikel nicht gefunden. Bitte starten Sie eine neue Suche.</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate('/search')}>
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
      <div className="space-y-6">
        <div className="card">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64 h-48 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {artikel.bildUrl ? (
                <img
                  src={artikel.bildUrl}
                  alt={artikel.bezeichnung}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <Package className="h-16 w-16 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{artikel.bezeichnung}</h2>
              <p className="text-gray-600 mt-2">{artikel.beschreibung}</p>
              <div className="mt-4">
                <PriceTag preis={artikel.preis} waehrung={artikel.waehrung} className="text-2xl" />
              </div>
              <div className="mt-4">
                <SupplierInfo
                  lieferant={artikel.lieferant}
                  marktplatz={artikel.marktplatz}
                  artikelnummer={artikel.artikelnummer}
                />
              </div>
              {artikel.nachhaltigkeitslabel.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
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

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">KI-Klassifizierung</h3>
          {classifyResult ? (
            <div className="space-y-4">
              <ClassificationBadge
                kanal={classifyResult.empfohlenerKanal}
                konfidenz={classifyResult.konfidenz}
                konfidenzWert={classifyResult.konfidenzWert}
              />
              <div>
                <p className="text-sm text-gray-500">CPV-Code</p>
                <p className="font-medium">
                  {classifyResult.cpvCode} - {classifyResult.cpvBezeichnung}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Begruendung</p>
                <p className="text-sm">{classifyResult.begruendung}</p>
              </div>
              {classifyResult.rahmenvertrag && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800">Rahmenvertrag gefunden</p>
                  <p className="text-sm text-green-700">
                    {classifyResult.rahmenvertrag.bezeichnung} ({classifyResult.rahmenvertrag.lieferant})
                  </p>
                  <p className="text-xs text-green-600">
                    Aehnlichkeit: {Math.round(classifyResult.rahmenvertrag.aehnlichkeit * 100)}%
                  </p>
                </div>
              )}
              <Button
                variant="secondary"
                onClick={() => navigate(`/documentation/${classifyResult.id}`)}
              >
                Vergabedokumentation anzeigen
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-3">
                Lassen Sie diesen Artikel durch die KI klassifizieren, um den optimalen
                Beschaffungskanal zu ermitteln.
              </p>
              <Button onClick={handleClassify} disabled={classifyMutation.isPending}>
                {classifyMutation.isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Klassifiziere...
                  </>
                ) : (
                  'Jetzt klassifizieren'
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
