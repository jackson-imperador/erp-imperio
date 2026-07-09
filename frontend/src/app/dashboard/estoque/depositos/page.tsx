'use client';

import { useWarehouses } from '@/hooks/useInventory';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Warehouse } from '@/types/inventory';

export default function DepositosPage() {
  const { data: warehouses = [], isLoading } = useWarehouses();

  const columns = [
    { key: 'name', header: 'Nome do Almoxarifado/Depósito' },
    { key: 'description', header: 'Descrição', render: (r: Warehouse) => r.description || '-' },
    { 
      key: 'isDefault', 
      header: 'Padrão',
      render: (r: Warehouse) => r.isDefault ? <Badge variant="default" className="bg-indigo-500">Padrão</Badge> : '-'
    },
    { 
      key: 'isActive', 
      header: 'Status',
      render: (r: Warehouse) => (
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Múltiplos Depósitos</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão de almoxarifados, filiais e centros de distribuição
          </p>
        </div>
        <Button size="sm"><Plus className="w-4 h-4 mr-2" />Novo Depósito</Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={warehouses} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
