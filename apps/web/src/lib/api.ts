import type {
  ClassifyRequest,
  ClassifyResponse,
  SearchRequest,
  SearchResponse,
  Dokumentation,
  HealthResponse,
} from '@procurement/shared';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ nachricht: 'Unbekannter Fehler' }));
    throw new Error(error.nachricht || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  classify(data: ClassifyRequest): Promise<ClassifyResponse> {
    return request('/classify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  search(data: SearchRequest): Promise<SearchResponse> {
    return request('/search', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getDocumentation(id: string): Promise<Dokumentation> {
    return request(`/documentation/${id}`);
  },

  health(): Promise<HealthResponse> {
    return request('/health');
  },
};
