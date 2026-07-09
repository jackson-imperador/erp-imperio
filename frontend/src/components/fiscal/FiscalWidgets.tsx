'use client';

import { FiscalDocumentStatus, FiscalDashboardMetrics, FiscalEvent } from '@/types/fiscal';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';

const statusConfig: Record<FiscalDocumentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Rascunho', variant: 'secondary' },
  PENDING: { label: 'Pendente', variant: 'outline' },
  AUTHORIZED: { label: 'Autorizado', variant: 'default' },
  REJECTED: { label: 'Rejeitado', variant: 'destructive' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
  INUTILIZED: { label: 'Inutilizado', variant: 'outline' },
  CONTINGENCY: { label: 'Contingência', variant: 'outline' },
  PROCESSING: { label: 'Processando', variant: 'outline' },
};

export function FiscalStatusBadge({ status }: { status: FiscalDocumentStatus }) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
  return <Badge variant={config.variant} className={status === 'AUTHORIZED' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>{config.label}</Badge>;
}

export function FiscalSummaryCards({ metrics }: { metrics?: FiscalDashboardMetrics | null }) {
  const cards = [
    { title: 'Autorizados', value: metrics?.totalAuthorized || 0, color: 'text-emerald-500' },
    { title: 'Rejeitados', value: metrics?.totalRejected || 0, color: 'text-rose-500' },
    { title: 'Cancelados', value: metrics?.totalCancelled || 0, color: 'text-amber-500' },
    { title: 'Impostos (Mês)', value: `R$ ${(metrics?.totalTaxes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-indigo-500' },
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

export function FiscalTimeline({ events, isLoading }: { events: FiscalEvent[]; isLoading: boolean }) {
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
              {ev.eventType} • Seq: {ev.sequence} • {ev.createdAt ? new Date(ev.createdAt).toLocaleString('pt-BR') : '-'}
            </p>
            {ev.protocol && <p className="text-xs text-zinc-400 mt-1 font-mono">Protocolo: {ev.protocol}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
