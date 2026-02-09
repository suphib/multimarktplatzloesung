import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { OverrideClassificationRequest } from '@procurement/shared';

export function useOverrideClassification() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OverrideClassificationRequest }) =>
      api.overrideClassification(id, data),
  });
}

export function useClassificationAudit(id: string | undefined) {
  return useQuery({
    queryKey: ['classification-audit', id],
    queryFn: () => api.getClassificationAudit(id!),
    enabled: !!id,
  });
}
