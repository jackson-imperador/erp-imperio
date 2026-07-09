'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInventory } from '@/hooks/useInventory';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { InventoryStatusBadge } from '@/components/inventory/InventoryWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InventoryItem, InventoryFilters } from '@/types/inventory';
import { FileDown, Filter, Settings2 } from 'lucide-react';

export default function ProdutosEstoquePage() {
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const { data: items = [], isLoading } = useInventory(filters);

  const columns = [
    { key: 'sku', header: 'SKU' },
    { key: 'productName', header: 'Produto' },
    { key: 'warehouseName', header: 'Depósito/Local', render: (r: InventoryItem) => r.warehouseName || '-' },
    { key: 'availableQuantity', header: 'Qtd. Disponível', render: (r: InventoryItem) => r.availableQuantity },
    { key: 'reservedQuantity', header: 'Qtd. Reservada', render: (r: InventoryItem) => r.reservedQuantity },
    { key: 'status', header: 'Status', render: (r: InventoryItem) => <InventoryStatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: '',
      render: (r: InventoryItem) => (
        <Link href={`/dashboard/estoque/${r.productId}`}>
          <Button variant="outline" size="sm">Ficha Físico-Financeira</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Produtos em Estoque</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Visualização consolidada de saldos e disponibilidades
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />Filtros
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Link href="/dashboard/estoque/ajustes">
            <Button size="sm"><Settings2 className="w-4 h-4 mr-2" />Ajuste Rápido</Button>
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Busca (SKU ou Nome)</label>
            <Input placeholder="Pesquisar..." value={filters.search || ''} onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })} />
          </div>
          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={() => setFilters({})}>Limpar Filtros</Button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={items} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
