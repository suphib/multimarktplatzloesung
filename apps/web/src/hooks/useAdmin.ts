import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  RahmenvertragCreateRequest,
  ShopConfigUpdateRequest,
  FrameworkContractItem,
} from '@procurement/shared';

// ─── Query Keys ─────────────────────────────────────────────────

const keys = {
  stats: ['admin', 'stats'] as const,
  rahmenvertraege: ['admin', 'rahmenvertraege'] as const,
  shopConfigs: ['admin', 'shop-configs'] as const,
  katalog: (params: Record<string, any>) => ['admin', 'katalog', params] as const,
};

// ─── Queries ────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: keys.stats,
    queryFn: () => api.adminStats(),
  });
}

export function useRahmenvertraege() {
  return useQuery({
    queryKey: keys.rahmenvertraege,
    queryFn: () => api.getRahmenvertraege(),
  });
}

export function useShopConfigs() {
  return useQuery({
    queryKey: keys.shopConfigs,
    queryFn: () => api.getShopConfigs(),
  });
}

export function useKatalogArtikel(params: Record<string, string | number>) {
  return useQuery({
    queryKey: keys.katalog(params),
    queryFn: () => api.getKatalogArtikel(params),
  });
}

// ─── Mutations ──────────────────────────────────────────────────

export function useCreateRahmenvertrag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RahmenvertragCreateRequest) => api.createRahmenvertrag(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.rahmenvertraege });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

export function useUpdateRahmenvertrag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RahmenvertragCreateRequest> }) =>
      api.updateRahmenvertrag(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.rahmenvertraege });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

export function useDeleteRahmenvertrag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteRahmenvertrag(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.rahmenvertraege });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

export function useUpdateShopConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShopConfigUpdateRequest }) =>
      api.updateShopConfig(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.shopConfigs });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

export function useTriggerShopSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.triggerShopSync(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.shopConfigs });
    },
  });
}

export function useCreateKatalogArtikel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<FrameworkContractItem>) => api.createKatalogArtikel(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'katalog'] });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

export function useUpdateKatalogArtikel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FrameworkContractItem> }) =>
      api.updateKatalogArtikel(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'katalog'] });
    },
  });
}

export function useDeleteKatalogArtikel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteKatalogArtikel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'katalog'] });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}
