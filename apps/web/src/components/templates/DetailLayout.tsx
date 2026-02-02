import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../atoms';

interface DetailLayoutProps {
  children: ReactNode;
  title: string;
  backTo?: string;
}

export function DetailLayout({ children, title, backTo }: DetailLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className="min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Zurück</span>
          </Button>
          <h1 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{title}</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-4 md:py-6">{children}</main>
    </div>
  );
}
