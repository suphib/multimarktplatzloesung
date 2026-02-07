import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle, CheckCircle, ShoppingCart, FileText } from 'lucide-react';
import { Button, Spinner } from '../atoms';
import { useCreateBestellung } from '../../hooks/useAdmin';
import type { Artikel } from '@procurement/shared';

interface BestellModalProps {
  artikel: Artikel;
  onClose: () => void;
}

export function BestellModal({ artikel, onClose }: BestellModalProps) {
  const { t } = useTranslation();
  const createBestellung = useCreateBestellung();
  const [menge, setMenge] = useState(1);
  const [begruendung, setBegruendung] = useState('');
  const [success, setSuccess] = useState(false);

  const rv = artikel.rahmenvertragInfo;
  const gesamtpreis = artikel.preis * menge;

  // Skonto berechnen
  let skontoAbzug = 0;
  if (rv?.skonto) {
    const prozent = parseFloat(rv.skonto);
    if (!isNaN(prozent)) {
      skontoAbzug = gesamtpreis * (prozent / 100);
    }
  }
  const endpreis = gesamtpreis - skontoAbzug;

  // Validierung
  const mindestErreicht = !rv?.mindestBestellwert || gesamtpreis >= rv.mindestBestellwert;
  const genehmigungErforderlich = gesamtpreis > 1000;

  // Volumen-Warnung
  const volumenProzent = rv && rv.maxVolumen > 0
    ? Math.round(((rv.abrufVolumen + gesamtpreis) / rv.maxVolumen) * 100)
    : 0;
  const volumenWarnung = volumenProzent > 90;
  const volumenUeberschritten = volumenProzent > 100;

  const handleBestellen = async () => {
    try {
      await createBestellung.mutateAsync({
        artikelId: artikel.id,
        artikelBezeichnung: artikel.bezeichnung,
        marktplatz: artikel.marktplatz,
        lieferant: artikel.lieferant,
        einzelpreis: artikel.preis,
        menge,
        waehrung: artikel.waehrung,
        rahmenvertragNr: rv?.vertragsnummer,
        begruendung: begruendung || undefined,
      });
      setSuccess(true);
    } catch {
      // Error handled by mutation state
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {genehmigungErforderlich
              ? t('order.genehmigungHinweis')
              : t('order.bestellungErfolgreich', { defaultValue: 'Bestellung erfolgreich aufgegeben' })}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {artikel.bezeichnung} ({menge}x)
          </p>
          <Button className="mt-6" onClick={onClose}>OK</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('order.bestellungAufgeben')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Artikel-Info */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">{artikel.bezeichnung}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {artikel.lieferant}
              {rv && <> · {rv.vertragsnummer}</>}
            </p>
          </div>

          {/* Preis + Menge */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('order.einzelpreis')}</span>
              <span className="text-gray-900 dark:text-gray-100">
                {artikel.preis.toLocaleString('de-DE', { style: 'currency', currency: artikel.waehrung })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('order.menge')}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMenge(Math.max(1, menge - 1))}
                  className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={menge}
                  onChange={(e) => setMenge(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border border-gray-300 dark:border-gray-600 rounded-lg py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={() => setMenge(menge + 1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  +
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('order.gesamtpreis')}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {gesamtpreis.toLocaleString('de-DE', { style: 'currency', currency: artikel.waehrung })}
                </span>
              </div>
              {skontoAbzug > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>{t('order.skonto')} ({rv?.skonto?.match(/[\d.]+/)?.[0]}%)</span>
                  <span>-{skontoAbzug.toLocaleString('de-DE', { style: 'currency', currency: artikel.waehrung })}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base">
                <span className="text-gray-900 dark:text-gray-100">{t('order.endpreis')}</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {endpreis.toLocaleString('de-DE', { style: 'currency', currency: artikel.waehrung })}
                </span>
              </div>
            </div>
          </div>

          {/* RV-Konditionen */}
          {rv && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 space-y-1.5 text-sm">
              <div className="flex items-center gap-1.5 font-medium text-green-800 dark:text-green-300">
                <FileText className="h-4 w-4" />
                {t('order.rvKonditionen')}
              </div>
              <div className="text-green-700 dark:text-green-400">
                {t('order.zahlung')}: {rv.zahlungsbedingungen}
              </div>
              {rv.skonto && (
                <div className="text-green-700 dark:text-green-400">
                  {t('order.skonto')}: {rv.skonto}
                </div>
              )}
              <div className="text-green-700 dark:text-green-400">
                {t('order.mindestBestellwertLabel')}: {rv.mindestBestellwert.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                {mindestErreicht
                  ? <span className="ml-1 text-green-600">✓</span>
                  : <span className="ml-1 text-red-500">✗</span>}
              </div>
              <div className={`${volumenWarnung ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-green-700 dark:text-green-400'}`}>
                {t('order.volumenWarnung', {
                  prozent: volumenProzent,
                  defaultValue: 'Vertragsvolumen: {{prozent}}% ausgeschöpft',
                })}
              </div>
            </div>
          )}

          {/* Mindestbestellwert nicht erreicht */}
          {!mindestErreicht && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-400">
                {t('order.mindestBestellwertNichtErreicht')} ({rv?.mindestBestellwert?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })})
              </span>
            </div>
          )}

          {/* Volumen-Warnung */}
          {volumenUeberschritten && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-400">
                {t('order.volumenUeberschritten')}
              </span>
            </div>
          )}

          {/* Genehmigungspflicht */}
          {genehmigungErforderlich && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-700 dark:text-amber-400">
                <p className="font-medium">{t('order.genehmigungErforderlich')} (&gt; 1.000 €)</p>
                <p className="mt-0.5">{t('order.genehmigungHinweis')}</p>
              </div>
            </div>
          )}

          {/* Begründung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('order.begruendung')}
            </label>
            <textarea
              value={begruendung}
              onChange={(e) => setBegruendung(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('order.begruendungPlaceholder', { defaultValue: 'Optional: Begründung für die Bestellung...' })}
            />
          </div>

          {/* Error */}
          {createBestellung.isError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
              {(createBestellung.error as Error)?.message || 'Fehler bei der Bestellung'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {t('compare.cancel')}
          </Button>
          <Button
            onClick={handleBestellen}
            disabled={!mindestErreicht || createBestellung.isPending}
            className="flex-1"
          >
            {createBestellung.isPending ? (
              <><Spinner size="sm" className="mr-2" /> {t('order.bestellen')}...</>
            ) : (
              <><ShoppingCart className="h-4 w-4 mr-2" /> {t('order.bestellungAufgeben')}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
