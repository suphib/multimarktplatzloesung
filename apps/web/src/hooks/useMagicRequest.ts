import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { MagicRequestInput } from '@procurement/shared';

export function useMagicRequest() {
  return useMutation({
    mutationFn: (data: MagicRequestInput) => api.magicRequest(data),
  });
}
