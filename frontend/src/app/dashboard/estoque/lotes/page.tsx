'use client';

import { useInventoryLots } from '@/hooks/useInventory';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Badge } from '@/components/ui/badge';
import { InventoryLot } from '@/types/inventory';
import { PackageSearch } from 'lucide-react';

export default function LotesPage() {
  const { data: lots = [], isLoading } = useInventoryLots();

  const columns = [
    { key: 'lotNumber', header: 'Lote' },
    { key: 'productName', header: 'Produto' },
    { key: 'currentQuantity', header: 'Quantidade', render: (r: InventoryLot) => `${r.currentQuantity} / ${r.initialQuantity}` },
    { key: 'expirationDate', header: 'Validade', render: (r: InventoryLot) => new Date(r.expirationDate).toLocaleDateString('pt-BR') },
    { 
      key: 'status', 
      header: 'Status',
      render: (r: InventoryLot) => (
        <Badge variant={r.status === 'EXPIRED' ? 'destructive' : r.status === 'ACTIVE' ? 'default' : 'outline'} className={r.status === 'ACTIVE' ? 'bg-emerald-500' : ''}>
          {r.status}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Lotes e Validades</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão de lotes de fabricação, datas de validade e quarentenas
          </p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-lg text-sm font-medium flex items-center border border-indigo-100 dark:border-indigo-900/40">
          <PackageSearch className="w-4 h-4 mr-2" />
          Rastreabilidade Ativa
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={lots} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
