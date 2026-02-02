import { ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';
import type { Kanal, Konfidenz } from '@procurement/shared';
import { useTranslation } from 'react-i18next';
import { Badge } from '../atoms';

interface ClassificationBadgeProps {
  kanal: Kanal;
  konfidenz: Konfidenz;
  konfidenzWert: number;
}

const konfidenzConfig: Record<string, { variant: 'success' | 'warning' | 'danger'; icon: typeof ShieldCheck }> = {
  HOCH: { variant: 'success', icon: ShieldCheck },
  MITTEL: { variant: 'warning', icon: AlertTriangle },
  NIEDRIG: { variant: 'danger', icon: XCircle },
};

export function ClassificationBadge({ kanal, konfidenz, konfidenzWert }: ClassificationBadgeProps) {
  const { t } = useTranslation();
  const config = konfidenzConfig[konfidenz] ?? konfidenzConfig.NIEDRIG;
  const Icon = config.icon;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="info">{t(`common.kanal.${kanal}`, { defaultValue: kanal })}</Badge>
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {t('common.konfidenz', { value: Math.round(konfidenzWert * 100) })}
      </Badge>
    </div>
  );
}
