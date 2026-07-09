'use client';

import { PdvDashboardMetrics, CashDrawer } from '@/types/pdv';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, TrendingUp, MonitorSmartphone } from 'lucide-react';

export function PdvSummaryCards({ metrics }: { metrics?: PdvDashboardMetrics | null }) {
  const cards = [
    { title: 'Vendas Hoje', value: metrics?.totalSalesToday || 0, icon: ShoppingCart, color: 'text-indigo-500' },
    { title: 'Faturamento', value: `R$ ${(metrics?.totalRevenueToday || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-emerald-500' },
    { title: 'Ticket Médio', value: `R$ ${(metrics?.avgTicket || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-amber-500' },
    { title: 'Caixas Ativos', value: metrics?.activeDrawers || 0, icon: MonitorSmartphone, color: 'text-zinc-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 ${c.color}`}>
            <c.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{c.title}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white truncate">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CashDrawerCard({ drawer }: { drawer: CashDrawer }) {
  const isOpen = drawer.status === 'OPEN';
  
  return (
    <div className={`p-6 rounded-xl border ${isOpen ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/10' : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'} shadow-sm relative`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <MonitorSmartphone className={`w-5 h-5 ${isOpen ? 'text-emerald-500' : 'text-zinc-400'}`} /> 
            {drawer.name}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Operador: <span className="font-medium">{drawer.operatorName || 'Nenhum'}</span>
          </p>
        </div>
        <Badge variant={isOpen ? 'default' : 'secondary'} className={isOpen ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
          {isOpen ? 'Aberto' : 'Fechado'}
        </Badge>
      </div>
      
      <div className="space-y-2 mt-6">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Saldo Inicial</span>
          <span className="font-medium">R$ {(drawer.initialBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-base border-t border-zinc-200 dark:border-zinc-800 pt-2">
          <span className="text-zinc-700 dark:text-zinc-300 font-semibold">Saldo Atual</span>
          <span className="font-bold text-emerald-500">R$ {(drawer.currentBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}

export function NumericKeyboard({ onInput, onBackspace, onEnter }: { onInput: (val: string) => void, onBackspace: () => void, onEnter: () => void }) {
  const buttons = ['7','8','9','4','5','6','1','2','3','0','00','.'];
  return (
    <div className="grid grid-cols-3 gap-2">
      {buttons.map(b => (
        <button 
          key={b} 
          onClick={() => onInput(b)}
          className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 h-14 rounded-lg text-xl font-bold shadow-sm active:bg-zinc-100 dark:active:bg-zinc-700"
        >
          {b}
        </button>
      ))}
      <button onClick={onBackspace} className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900 h-14 rounded-lg text-lg font-bold shadow-sm col-span-1">
        C
      </button>
      <button onClick={onEnter} className="bg-emerald-500 text-white h-14 rounded-lg text-lg font-bold shadow-sm col-span-2">
        ENTER
      </button>
    </div>
  );
}
