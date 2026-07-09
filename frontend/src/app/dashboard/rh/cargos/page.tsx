'use client';

import { usePositions } from '@/hooks/useHr';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Position } from '@/types/hr';
import { Plus } from 'lucide-react';

export default function CargosPage() {
  const { data: positions = [], isLoading } = usePositions();

  const columns = [
    { key: 'title', header: 'Cargo' },
    { key: 'departmentName', header: 'Departamento Vinculado' },
    { key: 'cboCode', header: 'CBO', render: (r: Position) => r.cboCode || '-' },
    { key: 'baseSalary', header: 'Salário Base (Piso)', render: (r: Position) => `R$ ${(r.baseSalary || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { 
      key: 'isActive', 
      header: 'Status',
      render: (r: Position) => (
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Cargos e Salários</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Plano de cargos, CBO e remuneração base
          </p>
        </div>
        <Button size="sm"><Plus className="w-4 h-4 mr-2" />Novo Cargo</Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={positions} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
