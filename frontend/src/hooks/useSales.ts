import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '@/lib/services/sales.service';
import { CreateSaleOrderDto, SalesFilters } from '@/types/sales';
import { useAuthStore } from '@/store/authStore';

const QUERY_KEY = 'sales-orders';

export function useSalesOrders(filters?: SalesFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');

  return useQuery({
    queryKey: [QUERY_KEY, companyId, filters],
    queryFn: () => salesService.list(companyId, filters),
    enabled: !!companyId,
  });
}

export function useSalesOrder(id: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');

  return useQuery({
    queryKey: [QUERY_KEY, companyId, id],
    queryFn: () => salesService.getById(companyId, id),
    enabled: !!companyId && !!id,
  });
}

export function useSalesTimeline(id: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');

  return useQuery({
    queryKey: [QUERY_KEY, 'timeline', companyId, id],
    queryFn: () => salesService.getTimeline(companyId, id),
    enabled: !!companyId && !!id,
  });
}

export function useSalesMutations() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((s) => s.user?.companyId || '');

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });

  const createOrder = useMutation({
    mutationFn: (dto: CreateSaleOrderDto) =>
      salesService.create(companyId, dto),
    onSuccess: invalidate,
  });

  const updateOrder = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateSaleOrderDto> }) =>
      salesService.update(companyId, id, dto),
    onSuccess: invalidate,
  });

  const cancelOrder = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      salesService.cancel(companyId, id, reason),
    onSuccess: invalidate,
  });

  const approveOrder = useMutation({
    mutationFn: (id: string) => salesService.approve(companyId, id),
    onSuccess: invalidate,
  });

  const convertQuote = useMutation({
    mutationFn: (id: string) => salesService.convertQuote(companyId, id),
    onSuccess: invalidate,
  });

  const checkout = useMutation({
    mutationFn: ({ id, paymentMethod }: { id: string; paymentMethod: string }) =>
      salesService.checkout(companyId, id, paymentMethod),
    onSuccess: invalidate,
  });

  const reserveStock = useMutation({
    mutationFn: (id: string) => salesService.reserveStock(companyId, id),
    onSuccess: invalidate,
  });

  return {
    createOrder,
    updateOrder,
    cancelOrder,
    approveOrder,
    convertQuote,
    checkout,
    reserveStock,
    isMutating:
      createOrder.isPending ||
      updateOrder.isPending ||
      cancelOrder.isPending ||
      approveOrder.isPending ||
      convertQuote.isPending ||
      checkout.isPending ||
      reserveStock.isPending,
  };
}
