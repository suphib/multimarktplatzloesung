import type {
  ClassifyRequest,
  ClassifyResponse,
  SearchRequest,
  SearchResponse,
  Dokumentation,
  HealthResponse,
  AdminDashboardStats,
  Rahmenvertrag,
  RahmenvertragCreateRequest,
  ShopConfig,
  ShopConfigUpdateRequest,
  FrameworkContractItem,
  PaginatedResponse,
  Bestellung,
  BestellungCreateRequest,
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

  if (response.status === 204) return undefined as T;
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

  // ─── Admin ──────────────────────────────────────────────────────

  adminStats(): Promise<AdminDashboardStats> {
    return request('/admin/dashboard/stats');
  },

  getRahmenvertraege(): Promise<Rahmenvertrag[]> {
    return request('/admin/rahmenvertraege');
  },

  createRahmenvertrag(data: RahmenvertragCreateRequest): Promise<Rahmenvertrag> {
    return request('/admin/rahmenvertraege', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateRahmenvertrag(id: string, data: Partial<RahmenvertragCreateRequest>): Promise<Rahmenvertrag> {
    return request(`/admin/rahmenvertraege/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteRahmenvertrag(id: string): Promise<void> {
    return request(`/admin/rahmenvertraege/${id}`, { method: 'DELETE' });
  },

  getRahmenvertrag(id: string): Promise<Rahmenvertrag> {
    return request(`/admin/rahmenvertraege/${id}`);
  },

  async uploadDokument(rvId: string, file: File): Promise<Rahmenvertrag> {
    const formData = new FormData();
    formData.append('datei', file);
    const response = await fetch(`${API_BASE}/admin/rahmenvertraege/${rvId}/dokumente`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ nachricht: 'Upload fehlgeschlagen' }));
      throw new Error(error.nachricht || `HTTP ${response.status}`);
    }
    return response.json();
  },

  deleteDokument(rvId: string, dokId: string): Promise<Rahmenvertrag> {
    return request(`/admin/rahmenvertraege/${rvId}/dokumente/${dokId}`, { method: 'DELETE' });
  },

  getDokumentUrl(rvId: string, dokId: string): string {
    return `${API_BASE}/admin/rahmenvertraege/${rvId}/dokumente/${dokId}`;
  },

  getShopConfigs(): Promise<ShopConfig[]> {
    return request('/admin/shop-configs');
  },

  updateShopConfig(id: string, data: ShopConfigUpdateRequest): Promise<ShopConfig> {
    return request(`/admin/shop-configs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  triggerShopSync(id: string): Promise<ShopConfig> {
    return request(`/admin/shop-configs/${id}/sync`, { method: 'POST' });
  },

  getKatalogArtikel(params: Record<string, string | number>): Promise<PaginatedResponse<FrameworkContractItem>> {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    return request(`/admin/katalog?${qs.toString()}`);
  },

  createKatalogArtikel(data: Partial<FrameworkContractItem>): Promise<FrameworkContractItem> {
    return request('/admin/katalog', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateKatalogArtikel(id: string, data: Partial<FrameworkContractItem>): Promise<FrameworkContractItem> {
    return request(`/admin/katalog/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteKatalogArtikel(id: string): Promise<void> {
    return request(`/admin/katalog/${id}`, { method: 'DELETE' });
  },

  // ─── Bestellungen ─────────────────────────────────────────────────

  createBestellung(data: BestellungCreateRequest): Promise<Bestellung> {
    return request('/admin/bestellungen', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getBestellungen(): Promise<Bestellung[]> {
    return request('/admin/bestellungen');
  },

  approveBestellung(id: string): Promise<Bestellung> {
    return request(`/admin/bestellungen/${id}/approve`, { method: 'PATCH' });
  },

  rejectBestellung(id: string, grund: string): Promise<Bestellung> {
    return request(`/admin/bestellungen/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ grund }),
    });
  },
};
