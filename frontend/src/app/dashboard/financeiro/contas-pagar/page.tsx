'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFinancialTransactions } from '@/hooks/useFinancial';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { FinancialStatusBadge } from '@/components/financial/FinancialWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FinancialTransaction, FinancialFilters } from '@/types/financial';
import { Plus, FileDown, Filter } from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';

export default function ContasPagarPage() {
  const [filters, setFilters] = useState<FinancialFilters>({ type: 'PAYABLE' });
  const [showFilters, setShowFilters] = useState(false);
  const { data: transactions = [], isLoading } = useFinancialTransactions(filters);

  const columns = [
    { key: 'referenceNumber', header: 'Documento' },
    { key: 'description', header: 'Descrição' },
    {
      key: 'status',
      header: 'Status',
      render: (row: FinancialTransaction) => <FinancialStatusBadge status={row.status} />,
    },
    {
      key: 'dueDate',
      header: 'Vencimento',
      render: (row: FinancialTransaction) =>
        row.dueDate ? new Date(row.dueDate).toLocaleDateString('pt-BR') : '-',
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (row: FinancialTransaction) =>
        `R$ ${(row.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      key: 'actions',
      header: '',
      render: (row: FinancialTransaction) => (
        <Link href={`/dashboard/financeiro/${row.id}`}>
          <Button variant="outline" size="sm">Detalhes</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Contas a Pagar</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão de obrigações, despesas e fornecedores
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />Filtros
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToCsv('contas-pagar.csv', transactions)}>
            <FileDown className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Link href="/dashboard/financeiro/contas-pagar/novo">
            <Button size="sm"><Plus className="w-4 h-4 mr-2" />Nova Obrigação</Button>
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Vencimento Inicial</label>
            <Input type="date" value={filters.dueDateFrom || ''} onChange={(e) => setFilters({ ...filters, dueDateFrom: e.target.value || undefined })} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Vencimento Final</label>
            <Input type="date" value={filters.dueDateTo || ''} onChange={(e) => setFilters({ ...filters, dueDateTo: e.target.value || undefined })} />
          </div>
          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={() => setFilters({ type: 'PAYABLE' })}>Limpar Filtros</Button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={transactions} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
