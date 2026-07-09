'use client';

import { useState } from 'react';
import { useStockMovements } from '@/hooks/useInventory';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StockMovement, InventoryFilters } from '@/types/inventory';
import { FileDown, Filter, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

export default function MovimentacoesPage() {
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const { data: movements = [], isLoading } = useStockMovements(filters);

  const columns = [
    { key: 'createdAt', header: 'Data/Hora', render: (r: StockMovement) => new Date(r.createdAt).toLocaleString('pt-BR') },
    { key: 'productName', header: 'Produto', render: (r: StockMovement) => r.productName || 'Desconhecido' },
    { 
      key: 'type', 
      header: 'Operação',
      render: (r: StockMovement) => (
        <span className="flex items-center gap-1 text-xs font-medium uppercase">
          {r.type === 'IN' ? <><ArrowDownRight className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Entrada</span></> : 
           r.type === 'OUT' ? <><ArrowUpRight className="w-3 h-3 text-rose-500" /><span className="text-rose-500">Saída</span></> :
           r.type === 'TRANSFER' ? <><RefreshCw className="w-3 h-3 text-indigo-500" /><span className="text-indigo-500">Transf</span></> :
           <span className="text-amber-500">Ajuste</span>}
        </span>
      )
    },
    { key: 'quantity', header: 'Quantidade', render: (r: StockMovement) => r.quantity > 0 ? `+${r.quantity}` : r.quantity },
    { key: 'warehouseName', header: 'Depósito' },
    { key: 'createdByName', header: 'Usuário', render: (r: StockMovement) => r.createdByName || 'Sistema' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Movimentações de Estoque</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Histórico completo (Entradas, Saídas, Ajustes e Transferências)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />Filtros
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="w-4 h-4 mr-2" />Exportar
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Data Inicial</label>
            <Input type="date" value={filters.dateFrom || ''} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Data Final</label>
            <Input type="date" value={filters.dateTo || ''} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })} />
          </div>
          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={() => setFilters({})}>Limpar Filtros</Button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={movements} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
