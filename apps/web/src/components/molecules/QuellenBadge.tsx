import { Sparkles, BookOpen, UserPen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../atoms';
import type { KlassifizierungsQuelle } from '@procurement/shared';

interface QuellenBadgeProps {
  quelle: KlassifizierungsQuelle;
}

const quellenConfig: Record<string, { variant: 'info' | 'warning' | 'default'; icon: typeof Sparkles; labelKey: string }> = {
  KI: { variant: 'info', icon: Sparkles, labelKey: 'article.quelle.KI' },
  REGELBASIERT: { variant: 'warning', icon: BookOpen, labelKey: 'article.quelle.REGELBASIERT' },
  MANUELL: { variant: 'default', icon: UserPen, labelKey: 'article.quelle.MANUELL' },
};

export function QuellenBadge({ quelle }: QuellenBadgeProps) {
  const { t } = useTranslation();
  const config = quellenConfig[quelle] ?? quellenConfig.KI;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant}>
      <Icon className="h-3 w-3 mr-1" />
      {t(config.labelKey as any)}
    </Badge>
  );
}
