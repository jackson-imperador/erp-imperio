import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrService } from '@/lib/services/hr.service';
import { HrFilters } from '@/types/hr';
import { useAuthStore } from '@/store/authStore';

const QK_HR_DASHBOARD = 'hr-dashboard';
const QK_EMPLOYEES = 'hr-employees';
const QK_DEPARTMENTS = 'hr-departments';
const QK_POSITIONS = 'hr-positions';
const QK_VACATIONS = 'hr-vacations';
const QK_LEAVES = 'hr-leaves';
const QK_PAYROLL = 'hr-payroll';
const QK_ESOCIAL = 'hr-esocial';

export function useHrDashboard() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_HR_DASHBOARD, companyId],
    queryFn: () => hrService.getDashboard(companyId),
    enabled: !!companyId,
  });
}

export function useEmployees(filters?: HrFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_EMPLOYEES, companyId, filters],
    queryFn: () => hrService.listEmployees(companyId, filters),
    enabled: !!companyId,
  });
}

export function useEmployee(employeeId: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_EMPLOYEES, companyId, employeeId],
    queryFn: () => hrService.getEmployee(companyId, employeeId),
    enabled: !!companyId && !!employeeId,
  });
}

export function useDepartments() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_DEPARTMENTS, companyId],
    queryFn: () => hrService.listDepartments(companyId),
    enabled: !!companyId,
  });
}

export function usePositions() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_POSITIONS, companyId],
    queryFn: () => hrService.listPositions(companyId),
    enabled: !!companyId,
  });
}

export function useVacations(filters?: HrFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_VACATIONS, companyId, filters],
    queryFn: () => hrService.listVacations(companyId, filters),
    enabled: !!companyId,
  });
}

export function useLeaves(filters?: HrFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_LEAVES, companyId, filters],
    queryFn: () => hrService.listLeaves(companyId, filters),
    enabled: !!companyId,
  });
}

export function usePayroll(year?: number) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_PAYROLL, companyId, year],
    queryFn: () => hrService.listPayrolls(companyId, year),
    enabled: !!companyId,
  });
}

export function useEsocial(filters?: HrFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_ESOCIAL, companyId, filters],
    queryFn: () => hrService.listEsocialEvents(companyId, filters),
    enabled: !!companyId,
  });
}

export function useHrMutations() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QK_PAYROLL] });
    queryClient.invalidateQueries({ queryKey: [QK_ESOCIAL] });
  };

  const calculatePayroll = useMutation({
    mutationFn: (data: { month: number; year: number }) => hrService.calculatePayroll(companyId, data.month, data.year),
    onSuccess: invalidate,
  });

  const syncEsocial = useMutation({
    mutationFn: () => hrService.syncEsocial(companyId),
    onSuccess: invalidate,
  });

  return {
    calculatePayroll,
    syncEsocial,
    isMutating: calculatePayroll.isPending || syncEsocial.isPending,
  };
}
