'use client';

import { PurchaseOrder, PurchaseOrderStatus, PurchaseEvent } from '@/types/purchases';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const statusConfig: Record<PurchaseOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Rascunho', variant: 'secondary' },
  QUOTATION: { label: 'Cotação', variant: 'outline' },
  PENDING_APPROVAL: { label: 'Aguardando Aprovação', variant: 'default' },
  APPROVED: { label: 'Aprovado', variant: 'default' },
  ORDERED: { label: 'Pedido Enviado', variant: 'default' },
  PARTIAL_RECEIVED: { label: 'Recebido Parcial', variant: 'default' },
  RECEIVED: { label: 'Recebido', variant: 'default' },
  INVOICED: { label: 'Faturado', variant: 'default' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
  RETURNED: { label: 'Devolvido', variant: 'destructive' },
};

export function PurchaseStatusBadge({ status }: { status: PurchaseOrderStatus }) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function PurchaseSummaryCards({ orders }: { orders: PurchaseOrder[] }) {
  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'PENDING_APPROVAL' || o.status === 'ORDERED').length;
  const receivedCount = orders.filter((o) => o.status === 'RECEIVED' || o.status === 'PARTIAL_RECEIVED').length;
  const cancelledCount = orders.filter((o) => o.status === 'CANCELLED').length;

  const cards = [
    { title: 'Total em Compras', value: `R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-indigo-500' },
    { title: 'Pedidos Pendentes', value: pendingCount, color: 'text-amber-500' },
    { title: 'Recebimentos', value: receivedCount, color: 'text-emerald-500' },
    { title: 'Cancelados', value: cancelledCount, color: 'text-red-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{c.title}</p>
          <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}

export function PurchaseTimeline({ events, isLoading }: { events: PurchaseEvent[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (events.length === 0) {
    return <p className="text-zinc-500 text-center py-8">Nenhum evento registrado.</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((ev) => (
        <div key={ev.id} className="flex items-start gap-3 border-l-2 border-indigo-500 pl-4 py-2">
          <Clock className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">{ev.description}</p>
            <p className="text-xs text-zinc-500">
              {ev.userName} • {ev.createdAt ? new Date(ev.createdAt).toLocaleString('pt-BR') : '-'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PurchaseItemsTable({ items }: { items: PurchaseOrder['items'] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <th className="text-left py-3 px-2 text-zinc-500 font-medium">Produto</th>
            <th className="text-left py-3 px-2 text-zinc-500 font-medium">SKU</th>
            <th className="text-right py-3 px-2 text-zinc-500 font-medium">Qtd Ped.</th>
            <th className="text-right py-3 px-2 text-zinc-500 font-medium">Qtd Receb.</th>
            <th className="text-right py-3 px-2 text-zinc-500 font-medium">Custo Unit.</th>
            <th className="text-right py-3 px-2 text-zinc-500 font-medium">Desconto</th>
            <th className="text-right py-3 px-2 text-zinc-500 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {(items || []).map((item) => (
            <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-3 px-2 font-medium">{item.productName || '-'}</td>
              <td className="py-3 px-2 text-zinc-500">{item.sku || '-'}</td>
              <td className="py-3 px-2 text-right">{item.quantity}</td>
              <td className="py-3 px-2 text-right">
                <span className={item.receivedQuantity >= item.quantity ? 'text-emerald-500' : 'text-amber-500'}>
                  {item.receivedQuantity || 0}
                </span>
              </td>
              <td className="py-3 px-2 text-right">R$ {(item.unitCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td className="py-3 px-2 text-right text-red-500">R$ {(item.discount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td className="py-3 px-2 text-right font-bold">R$ {(item.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
          {(!items || items.length === 0) && (
            <tr><td colSpan={7} className="py-8 text-center text-zinc-500">Nenhum item neste pedido.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
