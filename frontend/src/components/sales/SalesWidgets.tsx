'use client';

import { SaleOrder, OrderStatus } from '@/types/sales';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Rascunho', variant: 'secondary' },
  QUOTE: { label: 'Orçamento', variant: 'outline' },
  PENDING: { label: 'Pendente', variant: 'default' },
  APPROVED: { label: 'Aprovado', variant: 'default' },
  PROCESSING: { label: 'Processando', variant: 'default' },
  INVOICED: { label: 'Faturado', variant: 'default' },
  SHIPPED: { label: 'Enviado', variant: 'default' },
  DELIVERED: { label: 'Entregue', variant: 'default' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
  RETURNED: { label: 'Devolvido', variant: 'destructive' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

interface OrderSummaryCardsProps {
  orders: SaleOrder[];
}

export function OrderSummaryCards({ orders }: OrderSummaryCardsProps) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const approvedCount = orders.filter((o) => o.status === 'APPROVED' || o.status === 'INVOICED').length;
  const cancelledCount = orders.filter((o) => o.status === 'CANCELLED').length;

  const cards = [
    { title: 'Receita Total', value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-emerald-500' },
    { title: 'Pedidos Pendentes', value: pendingCount, color: 'text-amber-500' },
    { title: 'Pedidos Aprovados', value: approvedCount, color: 'text-indigo-500' },
    { title: 'Pedidos Cancelados', value: cancelledCount, color: 'text-red-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{card.title}</p>
          <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
