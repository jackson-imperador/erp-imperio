import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fiscalService } from '@/lib/services/fiscal.service';
import { FiscalFilters, FiscalDocumentType } from '@/types/fiscal';
import { useAuthStore } from '@/store/authStore';

const QK_DOCUMENTS = 'fiscal-documents';
const QK_DASHBOARD = 'fiscal-dashboard';
const QK_CERTIFICATES = 'fiscal-certificates';
const QK_SPED = 'fiscal-sped';
const QK_LOTS = 'fiscal-lots';
const QK_EVENTS = 'fiscal-events';

export function useFiscalDashboard() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_DASHBOARD, companyId],
    queryFn: () => fiscalService.getDashboard(companyId),
    enabled: !!companyId,
  });
}

export function useFiscalDocuments(filters?: FiscalFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_DOCUMENTS, companyId, filters],
    queryFn: () => fiscalService.listDocuments(companyId, filters),
    enabled: !!companyId,
  });
}

export function useFiscalDocument(id: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_DOCUMENTS, companyId, id],
    queryFn: () => fiscalService.getDocumentById(companyId, id),
    enabled: !!companyId && !!id,
  });
}

export function useFiscalEvents(documentId: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_EVENTS, companyId, documentId],
    queryFn: () => fiscalService.getEvents(companyId, documentId),
    enabled: !!companyId && !!documentId,
  });
}

export function useCertificates() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_CERTIFICATES, companyId],
    queryFn: () => fiscalService.listCertificates(companyId),
    enabled: !!companyId,
  });
}

export function useSpedReports(type?: 'FISCAL' | 'CONTRIBUICOES') {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_SPED, companyId, type],
    queryFn: () => fiscalService.listSpedReports(companyId, type),
    enabled: !!companyId,
  });
}

export function useFiscalLots() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_LOTS, companyId],
    queryFn: () => fiscalService.listLots(companyId),
    enabled: !!companyId,
    refetchInterval: 10000, // simple polling fallback if WS fails
  });
}

export function useFiscalMutations() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QK_DOCUMENTS] });
    queryClient.invalidateQueries({ queryKey: [QK_DASHBOARD] });
  };

  const transmitDocument = useMutation({
    mutationFn: (id: string) => fiscalService.transmitDocument(companyId, id),
    onSuccess: (data, id) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: [QK_EVENTS, companyId, id] });
    },
  });

  const cancelDocument = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      fiscalService.cancelDocument(companyId, id, reason),
    onSuccess: (data, { id }) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: [QK_EVENTS, companyId, id] });
    },
  });

  const issueCce = useMutation({
    mutationFn: ({ id, correction }: { id: string; correction: string }) =>
      fiscalService.issueCce(companyId, id, correction),
    onSuccess: (data, { id }) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: [QK_EVENTS, companyId, id] });
    },
  });

  return {
    transmitDocument,
    cancelDocument,
    issueCce,
    isMutating: transmitDocument.isPending || cancelDocument.isPending || issueCce.isPending,
  };
}
