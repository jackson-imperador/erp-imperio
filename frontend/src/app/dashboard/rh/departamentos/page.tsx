'use client';

import { useDepartments } from '@/hooks/useHr';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Department } from '@/types/hr';
import { Plus } from 'lucide-react';

export default function DepartamentosPage() {
  const { data: departments = [], isLoading } = useDepartments();

  const columns = [
    { key: 'name', header: 'Departamento' },
    { key: 'managerName', header: 'Gestor/Responsável', render: (r: Department) => r.managerName || 'Não definido' },
    { key: 'headcount', header: 'Headcount (Pessoas)' },
    { 
      key: 'isActive', 
      header: 'Status',
      render: (r: Department) => (
        <Badge variant={r.isActive ? 'default' : 'secondary'} className={r.isActive ? 'bg-emerald-500' : ''}>
          {r.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Departamentos</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Organograma e divisões da empresa
          </p>
        </div>
        <Button size="sm"><Plus className="w-4 h-4 mr-2" />Novo Departamento</Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={departments} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
