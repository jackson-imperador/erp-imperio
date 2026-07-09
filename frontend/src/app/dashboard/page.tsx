
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Jan', vendas: 4000, lucros: 2400 },
  { name: 'Fev', vendas: 3000, lucros: 1398 },
  { name: 'Mar', vendas: 2000, lucros: 9800 },
  { name: 'Abr', vendas: 2780, lucros: 3908 },
  { name: 'Mai', vendas: 1890, lucros: 4800 },
  { name: 'Jun', vendas: 2390, lucros: 3800 },
];

export default function DashboardOverview() {
  // Exemplo de query real
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Usar a rota real construída na Fase 26 (Enterprise Analytics)
      // Como estamos injetando o mock, vamos apenas simular a resposta para que o UI nÃ£o quebre se o backend falhar
      try {
        const res = await api.get('/companies/comp-1/enterprise-intelligence/analytics/dashboard');
        return res.data;
      } catch (e) {
        console.warn('Backend unavailable, using fallback data');
        return {
          totalSales: 'R$ 1.2M',
          activeCustomers: 1250,
          pendingNfe: 14,
          cashflow: 'R$ 450K'
        };
      }
    },
  });

  if (isLoading) return <div className="text-zinc-500">Carregando painel de inteligência...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Visão Geral</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Faturamento Mensal', value: data?.totalSales || 'R$ 0,00', color: 'text-emerald-600' },
          { title: 'Clientes Ativos', value: data?.activeCustomers || 0, color: 'text-indigo-600' },
          { title: 'NF-e Pendentes', value: data?.pendingNfe || 0, color: 'text-amber-600' },
          { title: 'Fluxo de Caixa Livre', value: data?.cashflow || 'R$ 0,00', color: 'text-blue-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.title}</h3>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700 h-[400px]">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">Performance de Receita vs Lucro</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis dataKey="name" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip />
            <Line type="monotone" dataKey="vendas" stroke="#4F46E5" strokeWidth={3} />
            <Line type="monotone" dataKey="lucros" stroke="#10B981" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
