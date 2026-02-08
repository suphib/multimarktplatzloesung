import { Routes, Route, Navigate } from 'react-router-dom';
import { SearchPage } from './pages/SearchPage';
import { ResultsPage } from './pages/ResultsPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ComparePage } from './pages/ComparePage';
import { DocumentationPage } from './pages/DocumentationPage';
import { ImpressumPage } from './pages/ImpressumPage';
import { DatenschutzPage } from './pages/DatenschutzPage';
import { HandbuchPage } from './pages/HandbuchPage';
import { SpecialProcurementPage } from './pages/SpecialProcurementPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { RahmenvertraegePage } from './pages/admin/RahmenvertraegePage';
import { RahmenvertragDetailPage } from './pages/admin/RahmenvertragDetailPage';
import { ShopConfigPage } from './pages/admin/ShopConfigPage';
import { KatalogPage } from './pages/admin/KatalogPage';
import { KatalogImportPage } from './pages/admin/KatalogImportPage';
import { ConnectionsPage } from './pages/admin/ConnectionsPage';
import { BestellungenPage } from './pages/admin/BestellungenPage';
import { OciConfigPage } from './pages/admin/OciConfigPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/search" replace />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/article/:id" element={<ArticleDetailPage />} />
      <Route path="/compare" element={<ComparePage />} />
      <Route path="/documentation/:id" element={<DocumentationPage />} />
      <Route path="/impressum" element={<ImpressumPage />} />
      <Route path="/datenschutz" element={<DatenschutzPage />} />
      <Route path="/handbuch" element={<HandbuchPage />} />
      <Route path="/special-procurement" element={<SpecialProcurementPage />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/rahmenvertraege" element={<RahmenvertraegePage />} />
      <Route path="/admin/rahmenvertraege/:id" element={<RahmenvertragDetailPage />} />
      <Route path="/admin/bestellungen" element={<BestellungenPage />} />
      <Route path="/admin/shop-config" element={<ShopConfigPage />} />
      <Route path="/admin/katalog" element={<KatalogPage />} />
      <Route path="/admin/katalog/import" element={<KatalogImportPage />} />
      <Route path="/admin/oci-config" element={<OciConfigPage />} />
      <Route path="/admin/verbindungen" element={<ConnectionsPage />} />
    </Routes>
  );
}
