import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { SearchRequest } from '@procurement/shared';

export function useSearch() {
  return useMutation({
    mutationFn: (data: SearchRequest) => api.search(data),
  });
}
