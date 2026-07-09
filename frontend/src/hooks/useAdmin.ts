import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/services/admin.service';
import { AdminFilters, ApiKey } from '@/types/admin';
import { useAuthStore } from '@/store/authStore';

const QK_ADMIN_DASH = 'admin-dashboard';
const QK_HEALTH = 'admin-health';
const QK_LICENSE = 'admin-license';
const QK_APIKEYS = 'admin-apikeys';
const QK_WEBHOOKS = 'admin-webhooks';
const QK_AUDIT = 'admin-audit';

export function useAdminDashboard() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_ADMIN_DASH, companyId],
    queryFn: () => adminService.getDashboard(companyId),
    enabled: !!companyId,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: [QK_HEALTH],
    queryFn: () => adminService.getHealth(),
    refetchInterval: 30000, // auto refresh every 30s
  });
}

export function useLicense() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_LICENSE, companyId],
    queryFn: () => adminService.getLicense(companyId),
    enabled: !!companyId,
  });
}

export function useApiKeys() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_APIKEYS, companyId],
    queryFn: () => adminService.listApiKeys(companyId),
    enabled: !!companyId,
  });
}

export function useWebhooks() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_WEBHOOKS, companyId],
    queryFn: () => adminService.listWebhooks(companyId),
    enabled: !!companyId,
  });
}

export function useAudit(filters?: AdminFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_AUDIT, companyId, filters],
    queryFn: () => adminService.listAuditLogs(companyId, filters),
    enabled: !!companyId,
  });
}

export function useAdminMutations() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  
  const createApiKey = useMutation({
    mutationFn: (data: Partial<ApiKey>) => adminService.createApiKey(companyId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QK_APIKEYS] }),
  });

  const revokeApiKey = useMutation({
    mutationFn: (id: string) => adminService.revokeApiKey(companyId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QK_APIKEYS] }),
  });

  return {
    createApiKey,
    revokeApiKey,
  };
}
