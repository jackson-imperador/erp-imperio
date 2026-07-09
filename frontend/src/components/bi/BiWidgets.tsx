'use client';

import { KPI, ChartDataSeries, AnalyticsPrediction } from '@/types/bi';
import { TrendingUp, TrendingDown, Minus, BrainCircuit, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function formatValue(value: number | string, format: KPI['format']) {
  if (typeof value === 'string') return value;
  if (format === 'CURRENCY') return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  if (format === 'PERCENTAGE') return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%`;
  return value.toLocaleString('pt-BR');
}

export function MetricCard({ kpi }: { kpi: KPI }) {
  const isUp = kpi.trend === 'UP';
  const isDown = kpi.trend === 'DOWN';
  const colorClass = isUp ? 'text-emerald-500' : isDown ? 'text-rose-500' : 'text-zinc-500';
  const bgClass = isUp ? 'bg-emerald-500/10' : isDown ? 'bg-rose-500/10' : 'bg-zinc-500/10';

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2 truncate" title={kpi.title}>{kpi.title}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white truncate">{formatValue(kpi.value, kpi.format)}</h3>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${bgClass} ${colorClass}`}>
          {isUp && <TrendingUp className="w-3 h-3" />}
          {isDown && <TrendingDown className="w-3 h-3" />}
          {!isUp && !isDown && <Minus className="w-3 h-3" />}
          {kpi.trendValue > 0 ? '+' : ''}{kpi.trendValue}%
        </div>
      </div>
    </div>
  );
}

export function KPIGrid({ kpis }: { kpis: KPI[] }) {
  if (!kpis || kpis.length === 0) {
    return <div className="p-8 text-center text-zinc-500">Sem KPIs registrados para este período.</div>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <MetricCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}

export function RevenueChart({ data }: { data: ChartDataSeries }) {
  if (!data || !data.data || data.data.length === 0) return <div className="h-64 flex items-center justify-center text-zinc-500">Sem dados financeiros</div>;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
          <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${val/1000}k`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
            formatter={(value: any) => [`R$ ${Number(value || 0).toLocaleString('pt-BR')}`, 'Receita']}
          />
          <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChartWidget({ data, color = '#6366f1', label = 'Valor' }: { data: ChartDataSeries, color?: string, label?: string }) {
  if (!data || !data.data || data.data.length === 0) return <div className="h-64 flex items-center justify-center text-zinc-500">Sem dados</div>;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
          <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
            cursor={{ fill: 'transparent' }}
          />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} name={label} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PredictionCard({ prediction }: { prediction: AnalyticsPrediction }) {
  const Icon = prediction.impact === 'HIGH' ? AlertTriangle : prediction.impact === 'MEDIUM' ? Zap : CheckCircle2;
  const color = prediction.trend === 'UP' ? 'text-emerald-500' : prediction.trend === 'DOWN' ? 'text-rose-500' : 'text-indigo-500';

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <BrainCircuit className="w-16 h-16" />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <h4 className="font-semibold text-zinc-900 dark:text-white line-clamp-1">{prediction.metric}</h4>
      </div>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-bold">{formatValue(prediction.predictedValue, 'NUMBER')}</span>
        <span className="text-sm text-zinc-500">Previsto</span>
      </div>
      <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
        <p>Atual: <span className="font-medium text-zinc-900 dark:text-zinc-300">{formatValue(prediction.currentValue, 'NUMBER')}</span></p>
        <div className="flex items-center justify-between">
          <span>Confiança:</span>
          <span className="font-semibold text-indigo-500">{prediction.confidence}%</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-xs text-zinc-500 italic flex items-start gap-1">
          <BrainCircuit className="w-3 h-3 mt-0.5 flex-shrink-0" /> {prediction.suggestion}
        </p>
      </div>
    </div>
  );
}
