import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  seite: number;
  proSeite: number;
  gesamt: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ seite, proSeite, gesamt, onPageChange }: PaginationProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(gesamt / proSeite));

  return (
    <div className="flex items-center justify-between py-3 px-1">
      <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
        {t('admin.common.pagination', {
          von: Math.min((seite - 1) * proSeite + 1, gesamt),
          bis: Math.min(seite * proSeite, gesamt),
          gesamt,
        })}
      </span>
      <div className="flex items-center gap-2 mx-auto sm:mx-0">
        <button
          onClick={() => onPageChange(seite - 1)}
          disabled={seite <= 1}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:cursor-not-allowed"
          aria-label={t('admin.common.vorherigeSeite')}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[80px] text-center">
          {t('admin.common.seiteVon', { seite, gesamt: totalPages })}
        </span>
        <button
          onClick={() => onPageChange(seite + 1)}
          disabled={seite >= totalPages}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:cursor-not-allowed"
          aria-label={t('admin.common.naechsteSeite')}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
