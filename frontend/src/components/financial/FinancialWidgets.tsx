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
    { title: 'A Receber', value: metrics?.totalReceivables || 0, color: 'text-indigo-400' },
    { title: 'A Pagar', value: metrics?.totalPayables || 0, color: 'text-rose-400' },
    { title: 'Recebimentos Atrasados', value: metrics?.overdueReceivables || 0, color: 'text-amber-400' },
    { title: 'Saldo Projetado', value: metrics?.balance || 0, color: 'text-emerald-400' },
  ];

  // V2.5 - Novos cards de recebimento (separados)
  const breakdown = metrics?.paymentBreakdown || {};
  const receivedCards = [
    { title: 'Dinheiro', value: breakdown['CASH'] || 0, color: 'text-emerald-400' },
    { title: 'PIX', value: breakdown['PIX'] || 0, color: 'text-[#32bcad]' },
    { title: 'Débito', value: breakdown['DEBIT_CARD'] || 0, color: 'text-zinc-300' },
    { title: 'Crédito', value: breakdown['CREDIT_CARD'] || 0, color: 'text-zinc-300' },
    { title: 'Mercado Pago', value: breakdown['MERCADO_PAGO'] || 0, color: 'text-[#00b1ea]' },
    { title: 'Merkaup', value: breakdown['MERKAUP'] || 0, color: 'text-[#7c3aed]' },
    { title: 'Outros', value: breakdown['OTHER'] || 0, color: 'text-zinc-400' },
    { title: 'Total Recebido', value: Object.values(breakdown).reduce((a, b) => a + b, 0), color: 'text-primary' },
  ];

  const growth = metrics?.growth;

  return (
    <div className="space-y-6">
      {/* V2.6 - Indicadores Executivos (Growth) */}
      {growth && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card/90 backdrop-blur-md p-5 rounded-xl border border-border/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] dark:shadow-[0_4px_24px_-8px_rgba(201,148,26,0.08)] hover:border-primary/50 transition-all duration-300">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Receita (Hoje)</p>
            <p className="text-2xl font-black mt-1 text-emerald-400">R$ {growth.dailyInflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-card/90 backdrop-blur-md p-5 rounded-xl border border-border/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] dark:shadow-[0_4px_24px_-8px_rgba(201,148,26,0.08)] hover:border-primary/50 transition-all duration-300">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Despesa (Hoje)</p>
            <p className="text-2xl font-black mt-1 text-rose-400">R$ {growth.dailyOutflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-card/90 backdrop-blur-md p-5 rounded-xl border border-border/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] dark:shadow-[0_4px_24px_-8px_rgba(201,148,26,0.08)] hover:border-primary/50 transition-all duration-300">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Receita (Mês)</p>
            <p className="text-2xl font-black mt-1 text-emerald-400">R$ {growth.monthlyInflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-card/90 backdrop-blur-md p-5 rounded-xl border border-border/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] dark:shadow-[0_4px_24px_-8px_rgba(201,148,26,0.08)] hover:border-primary/50 transition-all duration-300">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Despesa (Mês)</p>
            <p className="text-2xl font-black mt-1 text-rose-400">R$ {growth.monthlyOutflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}

      {/* Main Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={`main-${i}`} className="bg-card/60 backdrop-blur-sm p-5 rounded-xl border border-border/30 hover:border-primary/40 transition-all duration-300 shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{c.title}</p>
            <p className={`text-xl font-bold mt-1 ${c.color}`}>
              R$ {c.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>
      
      {/* Received Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {receivedCards.map((c, i) => (
          <div key={`rec-${i}`} className="bg-[#0a0906]/80 backdrop-blur-sm p-3.5 rounded-xl border border-[rgba(201,148,26,0.15)] hover:border-primary/60 hover:shadow-[0_0_15px_rgba(201,148,26,0.1)] transition-all duration-300">
            <p className="text-[9px] font-black text-[#7a6840] uppercase tracking-widest">{c.title}</p>
            <p className={`text-base font-black mt-1 ${c.color}`}>
              R$ {c.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>
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
