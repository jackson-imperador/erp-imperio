'use client';

import { StockStatus, InventoryDashboardMetrics, StockMovement } from '@/types/inventory';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ArrowUpRight, ArrowDownRight, RefreshCw, Layers } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statusConfig: Record<StockStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  IN_STOCK: { label: 'Em Estoque', variant: 'default' },
  LOW_STOCK: { label: 'Baixo Estoque', variant: 'secondary' },
  OUT_OF_STOCK: { label: 'Sem Estoque', variant: 'destructive' },
  OVERSTOCKED: { label: 'Excesso', variant: 'outline' },
};

export function InventoryStatusBadge({ status }: { status: StockStatus }) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
  return <Badge variant={config.variant} className={status === 'IN_STOCK' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>{config.label}</Badge>;
}

export function InventorySummaryCards({ metrics }: { metrics?: InventoryDashboardMetrics | null }) {
  const cards = [
    { title: 'Itens em Estoque', value: metrics?.totalItems || 0, color: 'text-indigo-500', icon: Package },
    { title: 'Valor em Estoque', value: `R$ ${(metrics?.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-emerald-500', icon: Layers },
    { title: 'Itens Críticos (Baixo)', value: metrics?.lowStockCount || 0, color: 'text-amber-500', icon: ArrowDownRight },
    { title: 'Ruptura (Zerados)', value: metrics?.outOfStockCount || 0, color: 'text-rose-500', icon: ArrowUpRight },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{c.title}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
          <c.icon className={`w-8 h-8 opacity-20 ${c.color}`} />
        </div>
      ))}
    </div>
  );
}

export function InventoryTimeline({ movements, isLoading }: { movements: StockMovement[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (movements.length === 0) {
    return <p className="text-zinc-500 text-center py-8">Nenhuma movimentação registrada.</p>;
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {movements.map((mov) => {
        const isEntry = mov.type === 'IN' || mov.quantity > 0;
        const color = isEntry ? 'text-emerald-500' : 'text-rose-500';
        const Icon = isEntry ? ArrowDownRight : ArrowUpRight;
        
        return (
          <div key={mov.id} className="flex items-start gap-3 border-l-2 border-zinc-200 dark:border-zinc-700 pl-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-r-lg transition-colors">
            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${mov.type === 'TRANSFER' ? 'text-indigo-500' : mov.type === 'ADJUSTMENT' ? 'text-amber-500' : color}`} />
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{mov.productName || 'Produto'}</p>
                <span className={`text-sm font-bold ${color}`}>
                  {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {mov.type} • {mov.warehouseName || 'Depósito'} {mov.documentId && `• Doc: ${mov.documentId}`}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {new Date(mov.createdAt).toLocaleString('pt-BR')} por {mov.createdByName || 'Sistema'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function InventoryChart({ data }: { data: InventoryDashboardMetrics['movementsByDay'] }) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-zinc-500">Sem dados de movimentação</div>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
          <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
          />
          <Line type="monotone" dataKey="in" stroke="#10b981" strokeWidth={2} dot={false} name="Entradas" />
          <Line type="monotone" dataKey="out" stroke="#f43f5e" strokeWidth={2} dot={false} name="Saídas" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
