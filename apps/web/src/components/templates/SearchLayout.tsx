import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, BarChart3, FileText } from 'lucide-react';

interface SearchLayoutProps {
  children: ReactNode;
  title?: string;
}

const navItems = [
  { to: '/search', icon: Search, label: 'Suche' },
  { to: '/compare', icon: BarChart3, label: 'Vergleich' },
  { to: '/documentation/latest', icon: FileText, label: 'Doku' },
];

export function SearchLayout({ children, title }: SearchLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/search" className="font-bold text-primary-700 text-lg">
            eProcurement KI
          </Link>
          {title && (
            <h1 className="text-sm font-medium text-gray-600 hidden sm:block">{title}</h1>
          )}
          <nav className="hidden md:flex gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                  location.pathname.startsWith(to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 pb-20 md:pb-6">{children}</main>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 min-w-[64px] min-h-[44px] justify-center ${
                location.pathname.startsWith(to) ? 'text-primary-600' : 'text-gray-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
