'use client';

import { useLocations, useWarehouses } from '@/hooks/useInventory';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { StockLocation } from '@/types/inventory';
import { useState } from 'react';

export default function LocalizacoesPage() {
  const [warehouseId, setWarehouseId] = useState<string>('');
  const { data: warehouses = [] } = useWarehouses();
  const { data: locations = [], isLoading } = useLocations(warehouseId || undefined);

  const columns = [
    { key: 'code', header: 'Código de Localização (Rua/Prateleira/Nível)' },
    { key: 'description', header: 'Descrição', render: (r: StockLocation) => r.description || '-' },
    { key: 'warehouseName', header: 'Depósito' },
    { 
      key: 'isActive', 
      header: 'Status',
      render: (r: StockLocation) => (
        <Badge variant={r.isActive ? 'default' : 'secondary'} className={r.isActive ? 'bg-emerald-500' : ''}>
          {r.isActive ? 'Ativa' : 'Inativa'}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Localizações Físicas</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Mapeamento 3D/Hierárquico do Almoxarifado
          </p>
        </div>
        <Button size="sm"><Plus className="w-4 h-4 mr-2" />Nova Localização</Button>
      </div>

      <div className="flex items-center gap-2 mb-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <label className="text-sm font-medium">Filtrar por Depósito:</label>
        <select 
          value={warehouseId} 
          onChange={(e) => setWarehouseId(e.target.value)}
          className="rounded-md border border-zinc-300 dark:border-zinc-700 p-1.5 text-sm bg-white dark:bg-zinc-800"
        >
          <option value="">Todos</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={locations} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
