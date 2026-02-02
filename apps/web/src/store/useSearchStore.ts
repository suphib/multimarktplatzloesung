import { create } from 'zustand';
import type { Artikel, SearchResponse, ClassifyResponse, Marktplatz } from '@procurement/shared';

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
  setSuchbegriff: (s: string) => void;
  setSearchResponse: (r: SearchResponse | null) => void;
  toggleArticle: (a: Artikel) => void;
  clearSelectedArticles: () => void;
  setClassifyResult: (r: ClassifyResponse | null) => void;
  setFilters: (f: Partial<SearchState['filters']>) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  suchbegriff: '',
  searchResponse: null,
  selectedArticles: [],
  classifyResult: null,
  filters: {
    marktplaetze: [],
    nurNachhaltig: false,
  },
  setSuchbegriff: (suchbegriff) => set({ suchbegriff }),
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
}));
