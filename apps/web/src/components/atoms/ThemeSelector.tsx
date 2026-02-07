import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore, type Theme } from '../../hooks/useTheme';

const themes = [
  { value: 'schlicht' as Theme, icon: Sun },
  { value: 'dunkel' as Theme, icon: Moon },
  { value: 'modern' as Theme, icon: Sparkles },
] as const;

const labels = {
  schlicht: 'theme.schlicht',
  dunkel: 'theme.dunkel',
  modern: 'theme.modern',
} as const;

export function ThemeSelector() {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex items-center text-sm font-medium">
      {themes.map(({ value, icon: Icon }, i) => (
        <span key={value} className="flex items-center">
          {i > 0 && <span className="text-gray-300 dark:text-gray-600 mx-0.5">|</span>}
          <button
            onClick={() => setTheme(value)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
              theme === value
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            title={t(labels[value])}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{t(labels[value])}</span>
          </button>
        </span>
      ))}
    </div>
  );
}
