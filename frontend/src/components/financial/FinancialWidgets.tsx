'use client';

import { FinancialTransactionStatus, DashboardMetrics } from '@/types/financial';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const statusConfig: Record<FinancialTransactionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pendente', variant: 'secondary' },
  PARTIALLY_PAID: { label: 'Pago Parcialmente', variant: 'outline' },
  PAID: { label: 'Pago', variant: 'default' },
  OVERDUE: { label: 'Atrasado', variant: 'destructive' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
  REFUNDED: { label: 'Estornado', variant: 'outline' },
};

export function FinancialStatusBadge({ status }: { status: FinancialTransactionStatus }) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function FinancialSummaryCards({ metrics }: { metrics?: DashboardMetrics | null }) {
  const cards = [
    { title: 'A Receber', value: metrics?.totalReceivables || 0, color: 'text-indigo-500' },
    { title: 'A Pagar', value: metrics?.totalPayables || 0, color: 'text-rose-500' },
    { title: 'Recebimentos Atrasados', value: metrics?.overdueReceivables || 0, color: 'text-amber-500' },
    { title: 'Saldo Projetado', value: metrics?.balance || 0, color: 'text-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{c.title}</p>
          <p className={`text-2xl font-bold mt-1 ${c.color}`}>
            R$ {c.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      ))}
    </div>
  );
}

export function CashFlowChart({ data }: { data: DashboardMetrics['cashFlowSeries'] }) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-zinc-500">Sem dados de fluxo de caixa</div>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
          <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
          <Tooltip 
            formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
          />
          <Area type="monotone" dataKey="balance" stroke="#10b981" fillOpacity={1} fill="url(#colorBalance)" name="Saldo Projetado" />
          <Line type="monotone" dataKey="inflow" stroke="#6366f1" strokeWidth={2} dot={false} name="Entradas" />
          <Line type="monotone" dataKey="outflow" stroke="#f43f5e" strokeWidth={2} dot={false} name="Saídas" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
