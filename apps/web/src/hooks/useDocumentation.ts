import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useDocumentation(id: string) {
  return useQuery({
    queryKey: ['documentation', id],
    queryFn: () => api.getDocumentation(id),
    enabled: !!id,
  });
}
