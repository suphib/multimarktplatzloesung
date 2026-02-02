import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ClassifyRequest } from '@procurement/shared';

export function useClassify() {
  return useMutation({
    mutationFn: (data: ClassifyRequest) => api.classify(data),
  });
}
