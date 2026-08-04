
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export function useCrud<T>(endpoint: string, queryKey: string[]) {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((s) => s.user?.companyId || '');

  const query = useQuery({
    queryKey: [...queryKey, companyId],
    queryFn: async () => {
      if (!companyId) return [];
      try {
        const hasPrefix = endpoint.startsWith('/companies') || endpoint.startsWith('/company');
        const url = hasPrefix ? endpoint : `/companies/${companyId}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
        const { data: resData } = await api.get(url);
        const unwrapped = resData?.data || resData;
        return unwrapped?.data || unwrapped || [];
      } catch (e) {
        return [];
      }
    },
    enabled: !!companyId
  });

  const createMutation = useMutation({
    mutationFn: async (newData: any) => {
      const hasPrefix = endpoint.startsWith('/companies') || endpoint.startsWith('/company');
      const url = hasPrefix ? endpoint : `/companies/${companyId}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
      const { data } = await api.post(url, newData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...queryKey, companyId] })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const hasPrefix = endpoint.startsWith('/companies') || endpoint.startsWith('/company');
      const url = hasPrefix ? endpoint : `/companies/${companyId}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
      const baseUrl = url.split('?')[0];
      const { data: res } = await api.put(`${baseUrl}/${id}`, data);
      return res;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...queryKey, companyId] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const hasPrefix = endpoint.startsWith('/companies') || endpoint.startsWith('/company');
      const url = hasPrefix ? endpoint : `/companies/${companyId}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
      const baseUrl = url.split('?')[0];
      const { data } = await api.delete(`${baseUrl}/${id}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...queryKey, companyId] })
  });

  return {
    ...query,
    items: (query.data as T[]) || [],
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
