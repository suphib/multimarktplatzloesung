import { ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';
import type { Kanal, Konfidenz } from '@procurement/shared';
import { Badge } from '../atoms';

interface ClassificationBadgeProps {
  kanal: Kanal;
  konfidenz: Konfidenz;
  konfidenzWert: number;
}

const kanalLabels: Record<string, string> = {
  RAHMENVERTRAG: 'Rahmenvertrag',
  KATALOG: 'Katalogbestellung',
  FREIE_VERGABE: 'Freie Vergabe',
  OEFFENTLICHE_AUSSCHREIBUNG: 'Oeffentliche Ausschreibung',
};

const konfidenzConfig: Record<string, { variant: 'success' | 'warning' | 'danger'; icon: typeof ShieldCheck }> = {
  HOCH: { variant: 'success', icon: ShieldCheck },
  MITTEL: { variant: 'warning', icon: AlertTriangle },
  NIEDRIG: { variant: 'danger', icon: XCircle },
};

export function ClassificationBadge({ kanal, konfidenz, konfidenzWert }: ClassificationBadgeProps) {
  const config = konfidenzConfig[konfidenz] ?? konfidenzConfig.NIEDRIG;
  const Icon = config.icon;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="info">{kanalLabels[kanal] ?? kanal}</Badge>
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {Math.round(konfidenzWert * 100)}% Konfidenz
      </Badge>
    </div>
  );
}
