import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useKatalogImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rahmenvertragsNummer, file }: { rahmenvertragsNummer: string; file: File }) =>
      api.importKatalog(rahmenvertragsNummer, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'katalog'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
