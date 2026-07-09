'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePurchases } from '@/hooks/usePurchases';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { PurchaseStatusBadge, PurchaseSummaryCards } from '@/components/purchases/PurchaseWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseFilters } from '@/types/purchases';
import { Plus, FileDown, Filter } from 'lucide-react';

const statusOptions: { value: PurchaseOrderStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'QUOTATION', label: 'Cotação' },
  { value: 'PENDING_APPROVAL', label: 'Aguardando Aprovação' },
  { value: 'APPROVED', label: 'Aprovado' },
  { value: 'ORDERED', label: 'Pedido Enviado' },
  { value: 'PARTIAL_RECEIVED', label: 'Recebido Parcial' },
  { value: 'RECEIVED', label: 'Recebido' },
  { value: 'INVOICED', label: 'Faturado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export default function ComprasPage() {
  const [filters, setFilters] = useState<PurchaseFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const { data: orders = [], isLoading } = usePurchases(filters);

  const columns = [
    { key: 'orderNumber', header: 'Nº Pedido' },
    { key: 'supplierName', header: 'Fornecedor' },
    {
      key: 'status',
      header: 'Status',
      render: (row: PurchaseOrder) => <PurchaseStatusBadge status={row.status} />,
    },
    {
      key: 'total',
      header: 'Total',
      render: (row: PurchaseOrder) =>
        `R$ ${(row.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      key: 'expectedDeliveryDate',
      header: 'Previsão Entrega',
      render: (row: PurchaseOrder) =>
        row.expectedDeliveryDate ? new Date(row.expectedDeliveryDate).toLocaleDateString('pt-BR') : '-',
    },
    {
      key: 'createdAt',
      header: 'Data',
      render: (row: PurchaseOrder) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString('pt-BR') : '-',
    },
    {
      key: 'actions',
      header: '',
      render: (row: PurchaseOrder) => (
        <Link href={`/dashboard/compras/${row.id}`}>
          <Button variant="outline" size="sm">Visualizar</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Gestão de Compras</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gerencie pedidos de compra, cotações e recebimentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />Filtros
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Link href="/dashboard/compras/novo">
            <Button size="sm"><Plus className="w-4 h-4 mr-2" />Novo Pedido</Button>
          </Link>
        </div>
      </div>

      <PurchaseSummaryCards orders={orders} />

      {showFilters && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Status</label>
            <select
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-800"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: (e.target.value as PurchaseOrderStatus) || undefined })}
            >
              {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Data Início</label>
            <Input type="date" value={filters.dateFrom || ''} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Data Fim</label>
            <Input type="date" value={filters.dateTo || ''} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })} />
          </div>
          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={() => setFilters({})}>Limpar Filtros</Button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={orders} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
