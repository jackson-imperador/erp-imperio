'use client';

import { EmployeeStatus, HrDashboardMetrics } from '@/types/hr';
import { Badge } from '@/components/ui/badge';
import { Users, UserMinus, UserCheck, Briefcase, Activity, CalendarDays } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statusConfig: Record<EmployeeStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ACTIVE: { label: 'Ativo', variant: 'default' },
  ON_LEAVE: { label: 'Afastado', variant: 'secondary' },
  VACATION: { label: 'Férias', variant: 'outline' },
  TERMINATED: { label: 'Desligado', variant: 'destructive' },
  ADMISSION: { label: 'Em Admissão', variant: 'secondary' },
};

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
  return <Badge variant={config.variant} className={status === 'ACTIVE' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>{config.label}</Badge>;
}

export function HrSummaryCards({ metrics }: { metrics?: HrDashboardMetrics | null }) {
  const cards = [
    { title: 'Funcionários Ativos', value: metrics?.totalActiveEmployees || 0, color: 'text-indigo-500', icon: Users },
    { title: 'Folha de Pagamento', value: `R$ ${(metrics?.monthlyPayrollCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-emerald-500', icon: Briefcase },
    { title: 'Férias / Afastamentos', value: (metrics?.totalOnVacation || 0) + (metrics?.totalOnLeave || 0), color: 'text-amber-500', icon: CalendarDays },
    { title: 'Admissões (Mês)', value: metrics?.totalAdmissionsThisMonth || 0, color: 'text-emerald-500', icon: UserCheck },
    { title: 'Desligamentos (Mês)', value: metrics?.totalTerminatedThisMonth || 0, color: 'text-rose-500', icon: UserMinus },
    { title: 'Turnover', value: `${metrics?.turnoverRate || 0}%`, color: 'text-rose-500', icon: Activity },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between h-24">
          <div className="flex justify-between items-start">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide leading-tight line-clamp-2">{c.title}</p>
            <c.icon className={`w-4 h-4 opacity-50 ${c.color}`} />
          </div>
          <p className={`text-xl font-bold mt-1 ${c.color} truncate`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}

export function HeadcountChart({ data }: { data: HrDashboardMetrics['headcountHistory'] }) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-zinc-500">Sem dados de headcount</div>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
          <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
          />
          <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" name="Colaboradores" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
