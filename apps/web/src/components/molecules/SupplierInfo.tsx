import { Building2 } from 'lucide-react';

interface SupplierInfoProps {
  lieferant: string;
  marktplatz: string;
  artikelnummer: string;
}

const marktplatzLabels: Record<string, string> = {
  AMAZON_BUSINESS: 'Amazon Business',
  MERCATEO: 'Mercateo',
  CONRAD: 'Conrad',
};

export function SupplierInfo({ lieferant, marktplatz, artikelnummer }: SupplierInfoProps) {
  return (
    <div className="flex flex-col gap-1 text-sm text-gray-600">
      <span className="flex items-center gap-1">
        <Building2 className="h-4 w-4" />
        {lieferant}
      </span>
      <span>Marktplatz: {marktplatzLabels[marktplatz] ?? marktplatz}</span>
      <span>Art.-Nr.: {artikelnummer}</span>
    </div>
  );
}
