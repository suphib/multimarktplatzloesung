import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  RahmenvertragCreateRequest,
  ShopConfigUpdateRequest,
  FrameworkContractItem,
  BestellungCreateRequest,
  SystemModus,
} from '@procurement/shared';

// ─── Query Keys ─────────────────────────────────────────────────

const keys = {
  stats: ['admin', 'stats'] as const,
  rahmenvertraege: ['admin', 'rahmenvertraege'] as const,
  rahmenvertrag: (id: string) => ['admin', 'rahmenvertrag', id] as const,
  shopConfigs: ['admin', 'shop-configs'] as const,
  katalog: (params: Record<string, any>) => ['admin', 'katalog', params] as const,
  bestellungen: ['admin', 'bestellungen'] as const,
  bestellung: (id: string) => ['admin', 'bestellung', id] as const,
  modus: ['admin', 'modus'] as const,
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

export function useRahmenvertrag(id: string) {
  return useQuery({
    queryKey: keys.rahmenvertrag(id),
    queryFn: () => api.getRahmenvertrag(id),
    enabled: !!id,
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

export function useUploadDokument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rvId, file }: { rvId: string; file: File }) =>
      api.uploadDokument(rvId, file),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: keys.rahmenvertrag(vars.rvId) });
      qc.invalidateQueries({ queryKey: keys.rahmenvertraege });
    },
  });
}

export function useDeleteDokument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rvId, dokId }: { rvId: string; dokId: string }) =>
      api.deleteDokument(rvId, dokId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: keys.rahmenvertrag(vars.rvId) });
      qc.invalidateQueries({ queryKey: keys.rahmenvertraege });
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

// ─── Bestellungen ────────────────────────────────────────────────

export function useBestellungen() {
  return useQuery({
    queryKey: keys.bestellungen,
    queryFn: () => api.getBestellungen(),
  });
}

export function useBestellung(id: string) {
  return useQuery({
    queryKey: keys.bestellung(id),
    queryFn: () => api.getBestellung(id),
    enabled: !!id,
  });
}

export function useCreateBestellung() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BestellungCreateRequest) => api.createBestellung(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.bestellungen });
    },
  });
}

export function useApproveBestellung() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.approveBestellung(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: keys.bestellungen });
      qc.invalidateQueries({ queryKey: keys.bestellung(id) });
    },
  });
}

export function useRejectBestellung() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, grund }: { id: string; grund: string }) => api.rejectBestellung(id, grund),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: keys.bestellungen });
      qc.invalidateQueries({ queryKey: keys.bestellung(vars.id) });
    },
  });
}

// ─── Modus (Demo / Echtdaten) ────────────────────────────────────

export function useModus() {
  return useQuery({
    queryKey: keys.modus,
    queryFn: () => api.getModus(),
  });
}

export function useSetModus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (modus: SystemModus) => api.setModus(modus),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useImportSandboxDaten() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (modus: 'ADDITIV' | 'ERSETZEND') => api.importSandboxDaten(modus),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}
