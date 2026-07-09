'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useFinancialTransaction, useFinancialMutations, usePix, useBoleto } from '@/hooks/useFinancial';
import { FinancialStatusBadge } from '@/components/financial/FinancialWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GenericDialog } from '@/components/dialogs/GenericDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ArrowLeft, CheckCircle, XCircle, Printer, FileDown, QrCode, FileText
} from 'lucide-react';
import { PaymentMethod } from '@/types/financial';

export default function FinancialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: transaction, isLoading } = useFinancialTransaction(id);
  const { data: pixCharge } = usePix(id);
  const { data: boletoCharge } = useBoleto(id);
  
  const { cancelTransaction, payTransaction, generatePix, generateBoleto } = useFinancialMutations();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('PIX');

  const handleCancel = async () => {
    try {
      await cancelTransaction.mutateAsync({ id, reason: cancelReason });
      toast.success('Transação cancelada.');
      setCancelDialogOpen(false);
    } catch {
      toast.error('Erro ao cancelar transação.');
    }
  };

  const handlePay = async () => {
    try {
      await payTransaction.mutateAsync({ 
        id, 
        dto: { 
          amount: payAmount || (transaction?.amount || 0), 
          paymentDate: new Date().toISOString(),
          paymentMethod: payMethod,
          accountId: 'default'
        } 
      });
      toast.success('Pagamento/Recebimento registrado com sucesso!');
      setPayDialogOpen(false);
    } catch {
      toast.error('Erro ao registrar transação.');
    }
  };

  const handleGeneratePix = async () => {
    try {
      await generatePix.mutateAsync(id);
      toast.success('Cobrança PIX gerada com sucesso!');
    } catch {
      toast.error('Erro ao gerar PIX.');
    }
  };

  const handleGenerateBoleto = async () => {
    try {
      await generateBoleto.mutateAsync(id);
      toast.success('Boleto gerado com sucesso!');
    } catch {
      toast.error('Erro ao gerar Boleto.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">Transação não encontrada.</p>
        <Link href="/dashboard/financeiro"><Button variant="outline" className="mt-4">Voltar</Button></Link>
      </div>
    );
  }

  const isPayable = transaction.status === 'PENDING' || transaction.status === 'PARTIALLY_PAID' || transaction.status === 'OVERDUE';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/financeiro/contas-${transaction.type === 'PAYABLE' ? 'pagar' : 'receber'}`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Título #{transaction.referenceNumber || id.slice(0, 8)}
              </h1>
              <FinancialStatusBadge status={transaction.status} />
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              {transaction.type === 'RECEIVABLE' ? 'Conta a Receber' : 'Conta a Pagar'} • {transaction.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPayable && (
            <Button size="sm" onClick={() => {
              setPayAmount(transaction.amount - (transaction.paidAmount || 0));
              setPayDialogOpen(true);
            }}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Registrar {transaction.type === 'RECEIVABLE' ? 'Recebimento' : 'Pagamento'}
            </Button>
          )}
          {transaction.status !== 'CANCELLED' && transaction.status !== 'PAID' && (
            <Button size="sm" variant="destructive" onClick={() => setCancelDialogOpen(true)}>
              <XCircle className="w-4 h-4 mr-2" />Cancelar
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />Imprimir
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="pix" disabled={transaction.type === 'PAYABLE'}>PIX</TabsTrigger>
          <TabsTrigger value="boleto" disabled={transaction.type === 'PAYABLE'}>Boleto</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Informações Principais</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Documento</span><span className="font-medium">{transaction.referenceNumber || '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Emissão</span><span className="font-medium">{transaction.issueDate ? new Date(transaction.issueDate).toLocaleDateString('pt-BR') : '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Vencimento</span><span className="font-medium">{transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString('pt-BR') : '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Pagamento Realizado</span><span className="font-medium">{transaction.paymentDate ? new Date(transaction.paymentDate).toLocaleDateString('pt-BR') : 'Aguardando'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Método de Pagamento</span><span className="font-medium">{transaction.paymentMethod || '-'}</span></div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Valores</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Valor Original</span><span>R$ {(transaction.originalAmount || transaction.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Juros/Multa</span><span className="text-red-500">+R$ {((transaction.interestAmount || 0) + (transaction.penaltyAmount || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Descontos</span><span className="text-emerald-500">-R$ {(transaction.discountAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between font-medium"><span className="text-zinc-500">Total a Pagar/Receber</span><span>R$ {(transaction.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-2">
                  <span className="font-semibold">Valor Pago</span>
                  <span className="text-xl font-bold text-indigo-500">R$ {(transaction.paidAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pix">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center space-y-4">
            <QrCode className="w-12 h-12 text-zinc-400" />
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Cobrança via PIX</h3>
            
            {pixCharge ? (
              <div className="space-y-4 w-full max-w-sm">
                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex justify-center">
                  <img src={pixCharge.qrCode} alt="QR Code PIX" className="w-48 h-48 object-contain" />
                </div>
                <div>
                  <Label>PIX Copia e Cola</Label>
                  <Input readOnly value={pixCharge.qrCodeText} className="mt-1 font-mono text-xs" />
                </div>
              </div>
            ) : (
              <div>
                <p className="text-zinc-500 mb-4">Nenhuma cobrança PIX ativa para este título.</p>
                <Button onClick={handleGeneratePix}>Gerar Cobrança PIX</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="boleto">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center space-y-4">
            <FileText className="w-12 h-12 text-zinc-400" />
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Boleto Bancário</h3>
            
            {boletoCharge ? (
              <div className="space-y-4 w-full max-w-md">
                <div>
                  <Label>Linha Digitável</Label>
                  <Input readOnly value={boletoCharge.digitableLine} className="mt-1 font-mono text-center text-sm" />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => window.open(boletoCharge.url, '_blank')}>
                    <FileDown className="w-4 h-4 mr-2" />
                    Visualizar Boleto PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-zinc-500 mb-4">Nenhum boleto gerado para este título.</p>
                <Button onClick={handleGenerateBoleto}>Gerar Boleto</Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <GenericDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen} title="Cancelar Título" description="Esta ação estornará os valores se houver.">
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

      {/* Pay Dialog */}
      <GenericDialog open={payDialogOpen} onOpenChange={setPayDialogOpen} title={transaction?.type === 'RECEIVABLE' ? 'Baixar Recebimento' : 'Registrar Pagamento'} description="Informe o valor e a forma de pagamento.">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor a Baixar (R$)</Label>
              <Input type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(parseFloat(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label>Forma de Pagamento</Label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                className="w-full mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-800"
              >
                <option value="PIX">PIX</option>
                <option value="BOLETO">Boleto</option>
                <option value="BANK_TRANSFER">Transferência (TED/DOC)</option>
                <option value="CASH">Dinheiro</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPayDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handlePay}>Confirmar</Button>
          </div>
        </div>
      </GenericDialog>
    </div>
  );
}
