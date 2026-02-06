import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Store,
  Database,
  Plug,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher, Footer } from '../atoms';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, tKey: 'admin.nav.dashboard' },
  { to: '/admin/rahmenvertraege', icon: FileText, tKey: 'admin.nav.rahmenvertraege' },
  { to: '/admin/shop-config', icon: Store, tKey: 'admin.nav.shopConfig' },
  { to: '/admin/katalog', icon: Database, tKey: 'admin.nav.katalog' },
  { to: '/admin/verbindungen', icon: Plug, tKey: 'admin.nav.verbindungen' },
] as const;

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const sidebarContent = (
    <>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, tKey }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(to)
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span>{t(tKey)}</span>
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-200">
        <Link
          to="/search"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5 flex-shrink-0" />
          <span>{t('admin.nav.backToApp')}</span>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"
              aria-label="Menu"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/admin/dashboard" className="font-bold text-primary-700 text-lg">
              {t('common.appName')}
            </Link>
            <span className="text-sm text-gray-500 hidden sm:block">
              {t('admin.title')}
            </span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-60 bg-white border-r border-gray-200 sticky top-14 h-[calc(100vh-3.5rem)]">
          {sidebarContent}
        </aside>

        {/* Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-20 top-14">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="relative w-64 h-full bg-white flex flex-col shadow-xl">
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, tKey }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 min-w-[48px] min-h-[44px] justify-center ${
                isActive(to) ? 'text-primary-600' : 'text-gray-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] leading-tight text-center">
                {t(tKey + 'Short', t(tKey))}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
