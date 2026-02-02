import { ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, LanguageSwitcher, Footer } from '../atoms';

interface DetailLayoutProps {
  children: ReactNode;
  title: string;
  backTo?: string;
}

export function DetailLayout({ children, title, backTo }: DetailLayoutProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/search" className="font-bold text-primary-700 text-lg flex-shrink-0 hidden sm:block">
            {t('common.appName')}
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className="min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('common.back')}</span>
          </Button>
          <h1 className="font-semibold text-gray-900 truncate text-sm sm:text-base flex-1">{title}</h1>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 md:py-6">{children}</main>
      <Footer />
    </div>
  );
}
