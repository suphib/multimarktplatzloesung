import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SupplierInfoProps {
  lieferant: string;
  marktplatz: string;
  artikelnummer: string;
}

export function SupplierInfo({ lieferant, marktplatz, artikelnummer }: SupplierInfoProps) {
  const { t } = useTranslation();
  const mpLabel = t(`common.marketplace.${marktplatz}`, { defaultValue: marktplatz });

  return (
    <div className="flex flex-col gap-1 text-sm text-gray-600">
      <span className="flex items-center gap-1">
        <Building2 className="h-4 w-4" />
        {lieferant}
      </span>
      <span>{t('supplier.marketplace', { name: mpLabel })}</span>
      <span>{t('supplier.articleNumber', { number: artikelnummer })}</span>
    </div>
  );
}
