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
  ShoppingCart,
  Search,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher, Footer } from '../atoms';
import { ThemeSelector } from '../atoms/ThemeSelector';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, tKey: 'admin.nav.dashboard' },
  { to: '/admin/rahmenvertraege', icon: FileText, tKey: 'admin.nav.rahmenvertraege' },
  { to: '/admin/bestellungen', icon: ShoppingCart, tKey: 'admin.nav.bestellungen' },
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
      {/* Prominent link back to search */}
      <div className="px-3 pt-4 pb-2">
        <Link
          to="/search"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50 border border-primary-200 dark:border-primary-800 transition-colors"
        >
          <Search className="h-4 w-4 flex-shrink-0" />
          <span>{t('admin.nav.backToSearch')}</span>
        </Link>
      </div>
      <div className="mx-3 border-b border-gray-200 dark:border-gray-700" />
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, tKey }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(to)
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span>{t(tKey)}</span>
          </Link>
        ))}
      </nav>
      <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/search"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 flex-shrink-0" />
          <span>{t('admin.nav.backToApp')}</span>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="h-1 bg-amber-500" />
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Menu"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/admin/dashboard" className="font-bold text-primary-700 text-lg">
              {t('common.appName')}
            </Link>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              {t('admin.title')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/search"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>{t('admin.nav.backToSearch')}</span>
            </Link>
            <ThemeSelector />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 sticky top-14 h-[calc(100vh-3.5rem)]">
          {sidebarContent}
        </aside>

        {/* Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-20 top-14">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="relative w-64 h-full bg-white dark:bg-gray-900 flex flex-col shadow-xl">
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* Main Content + Footer */}
        <div className="flex-1 flex flex-col min-h-[calc(100vh-3.5rem)]">
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-6xl w-full mx-auto">
            {children}
          </main>
          <div className="hidden md:block">
            <Footer />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-30">
        <div className="flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, tKey }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 min-w-[48px] min-h-[44px] justify-center ${
                isActive(to) ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'
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
