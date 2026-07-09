'use client';

import { useCrud } from '@/hooks/useCrud';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PlanoContasPage() {
  const { items, isLoading } = useCrud<{ id: string; code: string; name: string; type: string; }>(
    '/financial/categories',
    ['financial-categories']
  );

  const columns = [
    { key: 'code', header: 'Código' },
    { key: 'name', header: 'Descrição da Conta' },
    { 
      key: 'type', 
      header: 'Natureza',
      render: (row: any) => (
        <span className={row.type === 'REVENUE' ? 'text-emerald-500' : 'text-rose-500'}>
          {row.type === 'REVENUE' ? 'RECEITA' : 'DESPESA'}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Plano de Contas</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Categorização hierárquica de receitas e despesas
          </p>
        </div>
        <Button size="sm"><Plus className="w-4 h-4 mr-2" />Nova Conta</Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={items} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
