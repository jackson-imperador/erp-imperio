'use client';

import { useVacations } from '@/hooks/useHr';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vacation } from '@/types/hr';
import { CalendarRange } from 'lucide-react';

export default function FeriasPage() {
  const { data: vacations = [], isLoading } = useVacations();

  const columns = [
    { key: 'employeeName', header: 'Funcionário' },
    { key: 'periodStart', header: 'Início', render: (r: Vacation) => new Date(r.periodStart).toLocaleDateString('pt-BR') },
    { key: 'periodEnd', header: 'Término', render: (r: Vacation) => new Date(r.periodEnd).toLocaleDateString('pt-BR') },
    { key: 'daysTaken', header: 'Dias', render: (r: Vacation) => `${r.daysTaken} dias` },
    { 
      key: 'status', 
      header: 'Status',
      render: (r: Vacation) => (
        <Badge variant={r.status === 'COMPLETED' ? 'secondary' : r.status === 'ONGOING' ? 'default' : 'outline'} className={r.status === 'ONGOING' ? 'bg-indigo-500' : ''}>
          {r.status === 'SCHEDULED' ? 'Agendada' : r.status === 'ONGOING' ? 'Em Gozo' : 'Concluída'}
        </Badge>
      )
    },
    { key: 'paid', header: 'Pagamento', render: (r: Vacation) => r.paid ? <span className="text-emerald-500 font-medium">Pago</span> : <span className="text-amber-500 font-medium">Pendente</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Controle de Férias</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Programação e recibos de férias
          </p>
        </div>
        <Button size="sm"><CalendarRange className="w-4 h-4 mr-2" />Programar Férias</Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={vacations} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
