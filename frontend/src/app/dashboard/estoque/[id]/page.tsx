'use client';

import { use } from 'react';
import Link from 'next/link';
import { useInventoryItem, useStockMovements } from '@/hooks/useInventory';
import { InventoryStatusBadge, InventoryTimeline } from '@/components/inventory/InventoryWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Box, AlertTriangle } from 'lucide-react';

export default function FichaProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: item, isLoading } = useInventoryItem(id);
  const { data: movements = [], isLoading: isLoadingMovements } = useStockMovements({ productId: id });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">Produto não encontrado no estoque.</p>
        <Link href="/dashboard/estoque/produtos"><Button variant="outline" className="mt-4">Voltar</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/estoque/produtos">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {item.productName}
              </h1>
              <InventoryStatusBadge status={item.status} />
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              SKU: {item.sku} • Depósito: {item.warehouseName || 'Geral'}
            </p>
          </div>
        </div>
      </div>

      {item.availableQuantity <= item.minimumQuantity && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Atenção: Estoque Baixo</p>
            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
              O estoque disponível ({item.availableQuantity}) atingiu ou ultrapassou o mínimo configurado ({item.minimumQuantity}). 
              Considere solicitar reposição ao setor de Compras.
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral (Saldos)</TabsTrigger>
          <TabsTrigger value="movements">Ficha de Movimentação (Kardex)</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 md:col-span-2">
              <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-indigo-500" /> Posição Atual
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <p className="text-xs text-zinc-500 uppercase">Físico (Real)</p>
                  <p className="text-xl font-bold mt-1">{item.currentQuantity}</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <p className="text-xs text-zinc-500 uppercase">Reservado</p>
                  <p className="text-xl font-bold mt-1 text-amber-500">{item.reservedQuantity}</p>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 uppercase">Disponível</p>
                  <p className="text-xl font-bold mt-1 text-indigo-700 dark:text-indigo-300">{item.availableQuantity}</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <p className="text-xs text-zinc-500 uppercase">Estoque Mín.</p>
                  <p className="text-xl font-bold mt-1">{item.minimumQuantity}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Financeiro</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Custo Médio Unitário</span>
                  <span className="font-medium">R$ {item.averageCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  <span className="text-zinc-500">Custo Total (Inventário)</span>
                  <span className="font-bold text-emerald-500">R$ {item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="movements">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-6">Histórico de Movimentações (Kardex)</h3>
            <InventoryTimeline movements={movements} isLoading={isLoadingMovements} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
