import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, BarChart3, Settings, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher, Footer } from '../atoms';
import { ThemeSelector } from '../atoms/ThemeSelector';

interface SearchLayoutProps {
  children: ReactNode;
  title?: string;
}

const navKeys = [
  { to: '/search', icon: Search, tKey: 'common.search' },
  { to: '/compare', icon: BarChart3, tKey: 'common.compare' },
  { to: '/admin', icon: Settings, tKey: 'admin.title' },
] as const;

export function SearchLayout({ children, title }: SearchLayoutProps) {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/search" className="font-bold text-primary-700 text-lg">
            {t('common.appName')}
          </Link>
          {title && (
            <h1 className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:block">{title}</h1>
          )}
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex gap-1">
              {navKeys.map(({ to, icon: Icon, tKey }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                    location.pathname.startsWith(to)
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t(tKey)}
                </Link>
              ))}
            </nav>
            <Link
              to="/handbuch"
              className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
              title={t('footer.handbook')}
            >
              <HelpCircle className="h-5 w-5" />
            </Link>
            <ThemeSelector />
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 pb-20 md:pb-6">{children}</main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-10">
        <div className="flex justify-around py-2">
          {navKeys.map(({ to, icon: Icon, tKey }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 min-w-[64px] min-h-[44px] justify-center ${
                location.pathname.startsWith(to) ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{t(tKey)}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
