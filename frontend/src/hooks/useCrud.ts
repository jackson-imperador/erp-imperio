
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export function useCrud<T>(endpoint: string, queryKey: string[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      // Mocking for frontend architecture tests, in real scenarios use backend
      try {
        const { data } = await api.get(endpoint);
        return data.data || data || [];
      } catch (e) {
        return [];
      }
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newData: any) => {
      const { data } = await api.post(endpoint, newData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: res } = await api.put(`${endpoint}/${id}`, data);
      return res;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`${endpoint}/${id}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
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
