'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSalesOrders } from '@/hooks/useSales';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { StatusBadge, OrderSummaryCards } from '@/components/sales/SalesWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SaleOrder, OrderStatus, SalesFilters } from '@/types/sales';
import { Plus, FileDown, Filter } from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';

const statusOptions: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'QUOTE', label: 'Orçamento' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'APPROVED', label: 'Aprovado' },
  { value: 'PROCESSING', label: 'Processando' },
  { value: 'INVOICED', label: 'Faturado' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export default function VendasPage() {
  const [filters, setFilters] = useState<SalesFilters>({ perPage: 1000 });
  const [showFilters, setShowFilters] = useState(false);
  const { data: orders = [], isLoading } = useSalesOrders(filters);

  const columns = [
    { key: 'orderNumber', header: 'Nº Pedido' },
    { key: 'customerName', header: 'Cliente' },
    {
      key: 'status',
      header: 'Status',
      render: (row: SaleOrder) => <StatusBadge status={row.status} />,
    },
    {
      key: 'total',
      header: 'Total',
      render: (row: SaleOrder) =>
        `R$ ${(row.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      key: 'createdAt',
      header: 'Data',
      render: (row: SaleOrder) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString('pt-BR') : '-',
    },
    {
      key: 'actions',
      header: '',
      render: (row: SaleOrder) => (
        <Link href={`/dashboard/vendas/${row.id}`}>
          <Button variant="outline" size="sm">Visualizar</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Gestão de Vendas</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gerencie pedidos, orçamentos e faturamento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToCsv('vendas.csv', orders)}>
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Link href="/dashboard/vendas/novo">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Pedido
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <OrderSummaryCards orders={orders} />

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Status</label>
            <select
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-800"
              value={filters.status || ''}
              onChange={(e) =>
                setFilters({ ...filters, status: (e.target.value as OrderStatus) || undefined })
              }
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Data Início</label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Data Fim</label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
            />
          </div>
          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={() => setFilters({})}>
              Limpar Filtros
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable
          data={orders}
          columns={columns}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
