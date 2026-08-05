import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialService } from '@/lib/services/financial.service';
import { FinancialFilters, CreateTransactionDto, PayTransactionDto } from '@/types/financial';
import { useAuthStore } from '@/store/authStore';

const QK_TRANSACTIONS = 'financial-transactions';
const QK_DASHBOARD = 'financial-dashboard';
const QK_STATEMENTS = 'financial-statements';

export function useFinancialDashboard() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_DASHBOARD, companyId],
    queryFn: () => financialService.getDashboard(companyId),
    enabled: !!companyId,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useFinancialTransactions(filters?: FinancialFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_TRANSACTIONS, companyId, filters],
    queryFn: () => financialService.listTransactions(companyId, filters),
    enabled: !!companyId,
  });
}

export function useFinancialTransaction(id: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_TRANSACTIONS, companyId, id],
    queryFn: () => financialService.getTransactionById(companyId, id),
    enabled: !!companyId && !!id,
  });
}

export function usePix(transactionId: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: ['pix', companyId, transactionId],
    queryFn: () => financialService.getPix(companyId, transactionId),
    enabled: !!companyId && !!transactionId,
  });
}

export function useBoleto(transactionId: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: ['boleto', companyId, transactionId],
    queryFn: () => financialService.getBoleto(companyId, transactionId),
    enabled: !!companyId && !!transactionId,
  });
}

export function useBankStatements(accountId?: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_STATEMENTS, companyId, accountId],
    queryFn: () => financialService.getStatements(companyId, accountId),
    enabled: !!companyId,
  });
}

export function useFinancialMutations() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QK_TRANSACTIONS] });
    queryClient.invalidateQueries({ queryKey: [QK_DASHBOARD] });
  };

  const createTransaction = useMutation({
    mutationFn: (dto: CreateTransactionDto) => financialService.createTransaction(companyId, dto),
    onSuccess: invalidate,
  });

  const updateTransaction = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateTransactionDto> }) =>
      financialService.updateTransaction(companyId, id, dto),
    onSuccess: invalidate,
  });

  const cancelTransaction = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      financialService.cancelTransaction(companyId, id, reason),
    onSuccess: invalidate,
  });

  const payTransaction = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: PayTransactionDto }) =>
      financialService.payTransaction(companyId, id, dto),
    onSuccess: invalidate,
  });

  const generatePix = useMutation({
    mutationFn: (transactionId: string) => financialService.generatePix(companyId, transactionId),
    onSuccess: (_, transactionId) => queryClient.invalidateQueries({ queryKey: ['pix', companyId, transactionId] }),
  });

  const generateBoleto = useMutation({
    mutationFn: (transactionId: string) => financialService.generateBoleto(companyId, transactionId),
    onSuccess: (_, transactionId) => queryClient.invalidateQueries({ queryKey: ['boleto', companyId, transactionId] }),
  });

  const reconcileStatement = useMutation({
    mutationFn: ({ statementId, transactionId }: { statementId: string; transactionId: string }) =>
      financialService.reconcileStatement(companyId, statementId, transactionId),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: [QK_STATEMENTS] });
    },
  });

  return {
    createTransaction,
    updateTransaction,
    cancelTransaction,
    payTransaction,
    generatePix,
    generateBoleto,
    reconcileStatement,
    isMutating:
      createTransaction.isPending || updateTransaction.isPending || cancelTransaction.isPending ||
      payTransaction.isPending || generatePix.isPending || generateBoleto.isPending || reconcileStatement.isPending,
  };
}
