'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFiscalDocuments } from '@/hooks/useFiscal';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { FiscalStatusBadge } from '@/components/fiscal/FiscalWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FiscalDocument, FiscalFilters } from '@/types/fiscal';
import { Plus, FileDown, Filter } from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';

export default function NfePage() {
  const [filters, setFilters] = useState<FiscalFilters>({ type: 'NFE' });
  const [showFilters, setShowFilters] = useState(false);
  const { data: documents = [], isLoading } = useFiscalDocuments(filters);

  const columns = [
    { key: 'number', header: 'Número', render: (r: FiscalDocument) => `${r.number} - Série ${r.series}` },
    { key: 'customerName', header: 'Destinatário/Emitente', render: (r: FiscalDocument) => r.customerName || '-' },
    { key: 'totalAmount', header: 'Valor Total', render: (r: FiscalDocument) => `R$ ${(r.totalAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { key: 'status', header: 'Status Sefaz', render: (r: FiscalDocument) => <FiscalStatusBadge status={r.status} /> },
    { key: 'issueDate', header: 'Emissão', render: (r: FiscalDocument) => r.issueDate ? new Date(r.issueDate).toLocaleDateString('pt-BR') : '-' },
    {
      key: 'actions',
      header: '',
      render: (r: FiscalDocument) => (
        <Link href={`/dashboard/fiscal/${r.id}`}>
          <Button variant="outline" size="sm">Gerenciar</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Nota Fiscal Eletrônica (NF-e)</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão de notas modelo 55 (Vendas, Devoluções, Remessas)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />Filtros
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToCsv('nfe.csv', documents)}>
            <FileDown className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Link href="/dashboard/fiscal/nfe/nova">
            <Button size="sm"><Plus className="w-4 h-4 mr-2" />Emitir NF-e</Button>
          </Link>
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
            <Button variant="outline" size="sm" onClick={() => setFilters({ type: 'NFE' })}>Limpar Filtros</Button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={documents} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
