import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Artikel, SearchResponse, ClassifyResponse, Marktplatz } from '@procurement/shared';

export interface SavedComparison {
  id: string;
  name: string;
  createdAt: string;
  suchbegriff: string;
  articles: Artikel[];
}

interface SearchState {
  suchbegriff: string;
  searchResponse: SearchResponse | null;
  selectedArticles: Artikel[];
  classifyResult: ClassifyResponse | null;
  filters: {
    marktplaetze: Marktplatz[];
    preisVon?: number;
    preisBis?: number;
    nurNachhaltig: boolean;
  };
  savedComparisons: SavedComparison[];
  setSuchbegriff: (s: string) => void;
  setSearchResponse: (r: SearchResponse | null) => void;
  toggleArticle: (a: Artikel) => void;
  clearSelectedArticles: () => void;
  setClassifyResult: (r: ClassifyResponse | null) => void;
  setFilters: (f: Partial<SearchState['filters']>) => void;
  saveComparison: (name: string) => void;
  loadComparison: (id: string) => void;
  deleteComparison: (id: string) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      suchbegriff: '',
      searchResponse: null,
      selectedArticles: [],
      classifyResult: null,
      filters: {
        marktplaetze: [],
        nurNachhaltig: false,
      },
      savedComparisons: [],
      setSuchbegriff: (suchbegriff) => set({ suchbegriff, selectedArticles: [] }),
      setSearchResponse: (searchResponse) => set({ searchResponse }),
      toggleArticle: (artikel) => {
        const current = get().selectedArticles;
        const exists = current.find((a) => a.id === artikel.id);
        if (exists) {
          set({ selectedArticles: current.filter((a) => a.id !== artikel.id) });
        } else if (current.length < 5) {
          set({ selectedArticles: [...current, artikel] });
        }
      },
      clearSelectedArticles: () => set({ selectedArticles: [] }),
      setClassifyResult: (classifyResult) => set({ classifyResult }),
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      saveComparison: (name) => {
        const { suchbegriff, selectedArticles, savedComparisons } = get();
        if (selectedArticles.length === 0) return;
        const newComparison: SavedComparison = {
          id: `cmp-${Date.now()}`,
          name,
          createdAt: new Date().toISOString(),
          suchbegriff,
          articles: selectedArticles,
        };
        set({ savedComparisons: [newComparison, ...savedComparisons] });
      },
      loadComparison: (id) => {
        const comparison = get().savedComparisons.find((c) => c.id === id);
        if (comparison) {
          set({
            suchbegriff: comparison.suchbegriff,
            selectedArticles: comparison.articles,
          });
        }
      },
      deleteComparison: (id) => {
        set((state) => ({
          savedComparisons: state.savedComparisons.filter((c) => c.id !== id),
        }));
      },
      clearSearch: () => set({ suchbegriff: '', searchResponse: null }),
    }),
    {
      name: 'procurement-search',
      partialize: (state) => ({
        suchbegriff: state.suchbegriff,
        searchResponse: state.searchResponse,
        selectedArticles: state.selectedArticles,
        classifyResult: state.classifyResult,
        savedComparisons: state.savedComparisons,
      }),
    }
  )
);
