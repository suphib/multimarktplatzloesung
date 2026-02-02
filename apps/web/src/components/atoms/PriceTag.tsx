interface PriceTagProps {
  preis: number;
  waehrung?: string;
  className?: string;
}

export function PriceTag({ preis, waehrung = 'EUR', className = '' }: PriceTagProps) {
  const formatted = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: waehrung,
  }).format(preis);
  return <span className={`font-bold text-gray-900 ${className}`}>{formatted}</span>;
}
