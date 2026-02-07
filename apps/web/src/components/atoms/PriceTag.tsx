import { useTranslation } from 'react-i18next';

interface PriceTagProps {
  preis: number;
  waehrung?: string;
  className?: string;
}

const localeMap: Record<string, string> = { de: 'de-DE', en: 'en-GB' };

export function PriceTag({ preis, waehrung = 'EUR', className = '' }: PriceTagProps) {
  const { i18n } = useTranslation();
  const locale = localeMap[i18n.language] ?? 'de-DE';
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: waehrung,
  }).format(preis);
  return <span className={`font-bold text-gray-900 dark:text-gray-100 ${className}`}>{formatted}</span>;
}
