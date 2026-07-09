'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { usePurchase, usePurchaseTimeline, usePurchaseQuotations, usePurchaseMutations } from '@/hooks/usePurchases';
import { PurchaseStatusBadge, PurchaseTimeline, PurchaseItemsTable } from '@/components/purchases/PurchaseWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GenericDialog } from '@/components/dialogs/GenericDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ArrowLeft, CheckCircle, XCircle, Package, PackageCheck,
  Printer, FileDown, BarChart3
} from 'lucide-react';

export default function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, isLoading } = usePurchase(id);
  const { data: timeline = [], isLoading: timelineLoading } = usePurchaseTimeline(id);
  const { data: quotations = [], isLoading: quotationsLoading } = usePurchaseQuotations(id);
  const { approveOrder, cancelOrder, receiveAll, receivePartial } = usePurchaseMutations();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);

  const handleApprove = async () => {
    try {
      await approveOrder.mutateAsync(id);
      toast.success('Pedido de compra aprovado!');
    } catch {
      toast.error('Erro ao aprovar pedido.');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder.mutateAsync({ id, reason: cancelReason });
      toast.success('Pedido cancelado.');
      setCancelDialogOpen(false);
    } catch {
      toast.error('Erro ao cancelar pedido.');
    }
  };

  const handleReceiveAll = async () => {
    try {
      await receiveAll.mutateAsync(id);
      toast.success('Recebimento total registrado!');
      setReceiveDialogOpen(false);
    } catch {
      toast.error('Erro ao registrar recebimento.');
    }
  };

  const handleReceivePartial = async () => {
    try {
      const items = (order?.items || []).map((item) => ({
        itemId: item.id,
        receivedQuantity: item.quantity,
      }));
      await receivePartial.mutateAsync({ id, items });
      toast.success('Recebimento parcial registrado!');
      setReceiveDialogOpen(false);
    } catch {
      toast.error('Erro ao registrar recebimento parcial.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">Pedido de compra não encontrado.</p>
        <Link href="/dashboard/compras"><Button variant="outline" className="mt-4">Voltar</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/compras">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Compra #{order.orderNumber || id.slice(0, 8)}
              </h1>
              <PurchaseStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              Fornecedor: {order.supplierName || '-'} • Criado em {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : '-'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(order.status === 'PENDING_APPROVAL' || order.status === 'DRAFT') && (
            <Button size="sm" onClick={handleApprove}><CheckCircle className="w-4 h-4 mr-2" />Aprovar</Button>
          )}
          {(order.status === 'APPROVED' || order.status === 'ORDERED') && (
            <Button size="sm" variant="outline" onClick={() => setReceiveDialogOpen(true)}>
              <Package className="w-4 h-4 mr-2" />Receber
            </Button>
          )}
          {order.status !== 'CANCELLED' && order.status !== 'RECEIVED' && (
            <Button size="sm" variant="destructive" onClick={() => setCancelDialogOpen(true)}>
              <XCircle className="w-4 h-4 mr-2" />Cancelar
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />Imprimir
          </Button>
          <Button size="sm" variant="outline">
            <FileDown className="w-4 h-4 mr-2" />PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="items">Itens ({order.items?.length || 0})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="quotations">Cotações</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Informações do Pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Nº Pedido</span><span className="font-medium">{order.orderNumber || '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Status</span><PurchaseStatusBadge status={order.status} /></div>
                <div className="flex justify-between"><span className="text-zinc-500">Pagamento</span><span className="font-medium">{order.paymentTerms || '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Previsão Entrega</span><span className="font-medium">{order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString('pt-BR') : '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Notas</span><span className="font-medium">{order.notes || '-'}</span></div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Resumo Financeiro</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Subtotal</span><span>R$ {(order.subtotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Descontos</span><span className="text-red-500">-R$ {(order.discountTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Impostos</span><span className="text-amber-500">R$ {(order.taxTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Frete</span><span>R$ {(order.shippingCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-2">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-emerald-500">R$ {(order.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="items">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <PurchaseItemsTable items={order.items || []} />
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Histórico de Eventos</h3>
            <PurchaseTimeline events={timeline} isLoading={timelineLoading} />
          </div>
        </TabsContent>

        <TabsContent value="quotations">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-zinc-900 dark:text-white">Comparativo de Cotações</h3>
            </div>
            {quotationsLoading ? (
              <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : quotations.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">Nenhuma cotação registrada para este pedido.</p>
            ) : (
              <div className="space-y-3">
                {quotations.map((q) => (
                  <div key={q.id} className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{q.supplierName}</p>
                      <p className="text-xs text-zinc-500">Válida até {q.validUntil ? new Date(q.validUntil).toLocaleDateString('pt-BR') : '-'}</p>
                    </div>
                    <p className="text-lg font-bold text-indigo-500">R$ {(q.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Integrações Automáticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 mb-1">
                  <PackageCheck className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm font-medium">Estoque</p>
                </div>
                <p className="text-xs text-zinc-500">
                  {order.status === 'RECEIVED' ? 'Entrada de estoque registrada' : 'Aguardando recebimento para dar entrada'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <p className="text-sm font-medium">Financeiro</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {order.status === 'INVOICED' ? 'Conta a pagar gerada' : 'Aguardando faturamento'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <p className="text-sm font-medium">Fiscal (NF-e Entrada)</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {order.status === 'INVOICED' ? 'NF-e de entrada vinculada' : 'Aguardando nota fiscal do fornecedor'}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <GenericDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen} title="Cancelar Pedido de Compra" description="Esta ação não pode ser desfeita.">
        <div className="space-y-4">
          <div>
            <Label>Motivo do Cancelamento</Label>
            <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Informe o motivo..." className="mt-1" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Voltar</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={!cancelReason}>Confirmar Cancelamento</Button>
          </div>
        </div>
      </GenericDialog>

      {/* Receive Dialog */}
      <GenericDialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen} title="Registrar Recebimento" description="Escolha o tipo de recebimento para este pedido.">
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Total do pedido: <span className="font-bold">R$ {(order?.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleReceiveAll} className="w-full">
              <PackageCheck className="w-4 h-4 mr-2" />Recebimento Total
            </Button>
            <Button variant="outline" onClick={handleReceivePartial} className="w-full">
              <Package className="w-4 h-4 mr-2" />Recebimento Parcial
            </Button>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setReceiveDialogOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </GenericDialog>
    </div>
  );
}
