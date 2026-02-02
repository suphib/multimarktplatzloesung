import { Routes, Route, Navigate } from 'react-router-dom';
import { SearchPage } from './pages/SearchPage';
import { ResultsPage } from './pages/ResultsPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ComparePage } from './pages/ComparePage';
import { DocumentationPage } from './pages/DocumentationPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/search" replace />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/article/:id" element={<ArticleDetailPage />} />
      <Route path="/compare" element={<ComparePage />} />
      <Route path="/documentation/:id" element={<DocumentationPage />} />
    </Routes>
  );
}
