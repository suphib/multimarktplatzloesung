import { ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher, Footer } from '../atoms';

interface DetailLayoutProps {
  children: ReactNode;
  title: string;
  backTo?: string;
  wide?: boolean;
}

export function DetailLayout({ children, title, backTo, wide }: DetailLayoutProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/search" className="font-bold text-primary-700 text-lg">
            {t('common.appName')}
          </Link>
          <h1 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">
            {title}
          </h1>
          <LanguageSwitcher />
        </div>
      </header>
      <main className={`flex-1 ${wide ? 'max-w-7xl' : 'max-w-4xl'} w-full mx-auto px-4 py-4 md:py-6`}>
        {/* Back button inside content area */}
        <button
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </button>
        {children}
      </main>
      <Footer />
    </div>
  );
}
