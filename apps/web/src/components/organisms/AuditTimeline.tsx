import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import type { AenderungsEintrag } from '@procurement/shared';
import { Spinner } from '../atoms';

interface AuditTimelineProps {
  entries: AenderungsEintrag[];
  isLoading?: boolean;
}

export function AuditTimeline({ entries, isLoading }: AuditTimelineProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Spinner size="sm" className="mr-2" />
        <span className="text-sm text-gray-500">{t('article.audit.loading')}</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return <p className="text-sm text-gray-500 py-4">{t('article.audit.empty')}</p>;
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-600" />

      <div className="space-y-4">
        {entries.map((entry) => {
          const isCreated = entry.aktion === 'ERSTELLT';
          return (
            <div key={entry.id} className="relative">
              {/* Dot */}
              <div
                className={`absolute -left-3.5 top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${
                  isCreated ? 'bg-blue-500' : 'bg-amber-500'
                }`}
              />

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      isCreated
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                  >
                    {isCreated ? t('article.audit.created') : t('article.audit.overridden')}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(entry.zeitpunkt).toLocaleString('de-DE')}
                  </span>
                </div>

                {/* CPV change */}
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {entry.vorher ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs text-gray-500">{entry.vorher.cpvCode}</span>
                      <span className="text-gray-400">{entry.vorher.cpvBezeichnung}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="font-mono text-xs font-medium">{entry.nachher.cpvCode}</span>
                      <span className="font-medium">{entry.nachher.cpvBezeichnung}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-medium">{entry.nachher.cpvCode}</span>
                      <span className="font-medium">{entry.nachher.cpvBezeichnung}</span>
                    </div>
                  )}
                </div>

                {/* Reason */}
                {entry.begruendung && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                    {entry.begruendung}
                  </p>
                )}

                {/* User */}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {entry.benutzer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
