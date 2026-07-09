'use client';

import { useFinancialTransactions } from '@/hooks/useFinancial';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { FinancialStatusBadge } from '@/components/financial/FinancialWidgets';
import { Button } from '@/components/ui/button';
import { FinancialTransaction } from '@/types/financial';
import { QrCode } from 'lucide-react';
import Link from 'next/link';

export default function PixPage() {
  const { data: transactions = [], isLoading } = useFinancialTransactions();
  const pixTransactions = transactions.filter(t => t.paymentMethod === 'PIX');

  const columns = [
    { key: 'referenceNumber', header: 'Documento' },
    { key: 'description', header: 'Descrição' },
    {
      key: 'status',
      header: 'Status',
      render: (row: FinancialTransaction) => <FinancialStatusBadge status={row.status} />,
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
          <Button variant="outline" size="sm">Visualizar QR Code</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">PIX</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão de recebimentos via PIX
          </p>
        </div>
        <Button size="sm"><QrCode className="w-4 h-4 mr-2" />Novo PIX Avulso</Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={pixTransactions} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
