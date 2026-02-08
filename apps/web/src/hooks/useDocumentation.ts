import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useDocumentation(id: string) {
  return useQuery({
    queryKey: ['documentation', id],
    queryFn: () => api.getDocumentation(id),
    enabled: !!id,
  });
}

export function useCreateDocumentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { klassifizierungId: string }) => api.createDocumentation(data),
    onSuccess: (doc) => {
      queryClient.setQueryData(['documentation', doc.klassifizierungId], doc);
    },
  });
}
