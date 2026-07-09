'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSalesOrder, useSalesTimeline, useSalesMutations } from '@/hooks/useSales';
import { StatusBadge } from '@/components/sales/SalesWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GenericDialog } from '@/components/dialogs/GenericDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ArrowLeft, CheckCircle, XCircle, RefreshCw, Printer,
  FileDown, Clock, ShoppingCart
} from 'lucide-react';

export default function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: order, isLoading } = useSalesOrder(id);
  const { data: timeline = [], isLoading: timelineLoading } = useSalesTimeline(id);
  const { approveOrder, cancelOrder, convertQuote, checkout, reserveStock } = useSalesMutations();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('PIX');

  const handleApprove = async () => {
    try {
      await approveOrder.mutateAsync(id);
      toast.success('Pedido aprovado com sucesso!');
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

  const handleConvert = async () => {
    try {
      await convertQuote.mutateAsync(id);
      toast.success('Orçamento convertido em pedido!');
    } catch {
      toast.error('Erro ao converter orçamento.');
    }
  };

  const handleCheckout = async () => {
    try {
      await checkout.mutateAsync({ id, paymentMethod });
      toast.success('Checkout realizado com sucesso!');
      setCheckoutDialogOpen(false);
    } catch {
      toast.error('Erro ao realizar checkout.');
    }
  };

  const handleReserveStock = async () => {
    try {
      await reserveStock.mutateAsync(id);
      toast.success('Estoque reservado!');
    } catch {
      toast.error('Erro ao reservar estoque.');
    }
  };

  const handlePrint = () => {
    window.print();
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
        <p className="text-zinc-500">Pedido não encontrado.</p>
        <Link href="/dashboard/vendas">
          <Button variant="outline" className="mt-4">Voltar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vendas">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Pedido #{order.orderNumber || id.slice(0, 8)}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              Criado em {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : '-'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.status === 'QUOTE' && (
            <Button size="sm" variant="outline" onClick={handleConvert}>
              <RefreshCw className="w-4 h-4 mr-2" />Converter em Pedido
            </Button>
          )}
          {(order.status === 'PENDING' || order.status === 'DRAFT') && (
            <Button size="sm" onClick={handleApprove}>
              <CheckCircle className="w-4 h-4 mr-2" />Aprovar
            </Button>
          )}
          {order.status === 'APPROVED' && (
            <>
              <Button size="sm" variant="outline" onClick={handleReserveStock}>
                <ShoppingCart className="w-4 h-4 mr-2" />Reservar Estoque
              </Button>
              <Button size="sm" onClick={() => setCheckoutDialogOpen(true)}>
                <CheckCircle className="w-4 h-4 mr-2" />Checkout
              </Button>
            </>
          )}
          {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
            <Button size="sm" variant="destructive" onClick={() => setCancelDialogOpen(true)}>
              <XCircle className="w-4 h-4 mr-2" />Cancelar
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handlePrint}>
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
          <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Informações do Pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Nº Pedido</span><span className="font-medium">{order.orderNumber || '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Status</span><StatusBadge status={order.status} /></div>
                <div className="flex justify-between"><span className="text-zinc-500">Pagamento</span><span className="font-medium">{order.paymentMethod || '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Notas</span><span className="font-medium">{order.notes || '-'}</span></div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Cliente</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Nome</span><span className="font-medium">{order.customerName || '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">ID</span><span className="font-medium text-xs">{order.customerId || '-'}</span></div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3 md:col-span-2">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Resumo Financeiro</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><p className="text-zinc-500">Subtotal</p><p className="text-lg font-bold">R$ {(order.subtotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                <div><p className="text-zinc-500">Descontos</p><p className="text-lg font-bold text-red-500">-R$ {(order.discountTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                <div><p className="text-zinc-500">Impostos</p><p className="text-lg font-bold text-amber-500">R$ {(order.taxTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                <div><p className="text-zinc-500">Total</p><p className="text-2xl font-bold text-emerald-500">R$ {(order.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left py-3 px-2 text-zinc-500 font-medium">Produto</th>
                    <th className="text-left py-3 px-2 text-zinc-500 font-medium">SKU</th>
                    <th className="text-right py-3 px-2 text-zinc-500 font-medium">Qtd</th>
                    <th className="text-right py-3 px-2 text-zinc-500 font-medium">Preço Unit.</th>
                    <th className="text-right py-3 px-2 text-zinc-500 font-medium">Desconto</th>
                    <th className="text-right py-3 px-2 text-zinc-500 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item) => (
                    <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-3 px-2 font-medium">{item.productName || '-'}</td>
                      <td className="py-3 px-2 text-zinc-500">{item.sku || '-'}</td>
                      <td className="py-3 px-2 text-right">{item.quantity}</td>
                      <td className="py-3 px-2 text-right">R$ {(item.unitPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-2 text-right text-red-500">R$ {(item.discount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-2 text-right font-bold">R$ {(item.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {(!order.items || order.items.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500">Nenhum item neste pedido.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Histórico de Eventos</h3>
            {timelineLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}
              </div>
            ) : timeline.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">Nenhum evento registrado.</p>
            ) : (
              <div className="space-y-4">
                {timeline.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 border-l-2 border-indigo-500 pl-4 py-2">
                    <Clock className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{event.description}</p>
                      <p className="text-xs text-zinc-500">
                        {event.userName} • {event.createdAt ? new Date(event.createdAt).toLocaleString('pt-BR') : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Fiscal Tab */}
        <TabsContent value="fiscal">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Integração Fiscal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <p className="text-sm font-medium">NF-e</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {order.status === 'INVOICED' ? 'Nota fiscal emitida' : 'Aguardando faturamento'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <p className="text-sm font-medium">NFC-e</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {order.status === 'INVOICED' ? 'Cupom fiscal emitido' : 'Aguardando checkout'}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <GenericDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancelar Pedido"
        description="Esta ação não pode ser desfeita. Informe o motivo do cancelamento."
      >
        <div className="space-y-4">
          <div>
            <Label>Motivo do Cancelamento</Label>
            <Input
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Informe o motivo..."
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Voltar</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={!cancelReason}>
              Confirmar Cancelamento
            </Button>
          </div>
        </div>
      </GenericDialog>

      {/* Checkout Dialog */}
      <GenericDialog
        open={checkoutDialogOpen}
        onOpenChange={setCheckoutDialogOpen}
        title="Checkout do Pedido"
        description="Confirme a forma de pagamento para finalizar o pedido."
      >
        <div className="space-y-4">
          <div>
            <Label>Forma de Pagamento</Label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-800"
            >
              <option value="PIX">PIX</option>
              <option value="BOLETO">Boleto</option>
              <option value="CARTAO_CREDITO">Cartão de Crédito</option>
              <option value="DINHEIRO">Dinheiro</option>
            </select>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-500">Total a Cobrar</p>
            <p className="text-2xl font-bold text-emerald-500">
              R$ {(order?.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCheckout}>Confirmar Checkout</Button>
          </div>
        </div>
      </GenericDialog>
    </div>
  );
}
