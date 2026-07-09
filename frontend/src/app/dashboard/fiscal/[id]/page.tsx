'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useFiscalDocument, useFiscalMutations, useFiscalEvents } from '@/hooks/useFiscal';
import { FiscalStatusBadge, FiscalTimeline } from '@/components/fiscal/FiscalWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GenericDialog } from '@/components/dialogs/GenericDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ArrowLeft, XCircle, Printer, FileDown, Send, FileCode, MessageSquarePlus
} from 'lucide-react';
import { fiscalService } from '@/lib/services/fiscal.service';
import { useAuthStore } from '@/store/authStore';

export default function FiscalDocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const companyId = useAuthStore(s => s.user?.companyId || '');
  const { data: document, isLoading } = useFiscalDocument(id);
  const { data: events = [], isLoading: isLoadingEvents } = useFiscalEvents(id);
  
  const { transmitDocument, cancelDocument, issueCce } = useFiscalMutations();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  const [cceDialogOpen, setCceDialogOpen] = useState(false);
  const [cceCorrection, setCceCorrection] = useState('');

  const handleTransmit = async () => {
    try {
      await transmitDocument.mutateAsync(id);
      toast.success('Documento enviado para SEFAZ.');
    } catch {
      toast.error('Erro ao transmitir documento.');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelDocument.mutateAsync({ id, reason: cancelReason });
      toast.success('Solicitação de cancelamento enviada.');
      setCancelDialogOpen(false);
    } catch {
      toast.error('Erro ao cancelar.');
    }
  };

  const handleCce = async () => {
    try {
      await issueCce.mutateAsync({ id, correction: cceCorrection });
      toast.success('Carta de correção emitida com sucesso.');
      setCceDialogOpen(false);
    } catch {
      toast.error('Erro ao emitir CC-e.');
    }
  };

  const handleDownloadXml = async () => {
    try {
      const blob = await fiscalService.downloadXml(companyId, id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document?.accessKey || 'documento'}.xml`;
      a.click();
    } catch {
      toast.error('Erro ao baixar XML.');
    }
  };

  const handleDownloadDanfe = async () => {
    try {
      const blob = await fiscalService.downloadDanfe(companyId, id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `DANFE_${document?.accessKey || 'documento'}.pdf`;
      a.click();
    } catch {
      toast.error('Erro ao baixar DANFE.');
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

  if (!document) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">Documento não encontrado.</p>
        <Link href="/dashboard/fiscal"><Button variant="outline" className="mt-4">Voltar</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/fiscal/${document.type.toLowerCase()}`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {document.type} #{document.number} - Série {document.series}
              </h1>
              <FiscalStatusBadge status={document.status} />
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              Chave de Acesso: {document.accessKey || 'Não gerada'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(document.status === 'DRAFT' || document.status === 'REJECTED') && (
            <Button size="sm" onClick={handleTransmit} disabled={transmitDocument.isPending}>
              <Send className="w-4 h-4 mr-2" />Transmitir
            </Button>
          )}
          {document.status === 'AUTHORIZED' && (
            <>
              <Button size="sm" variant="outline" onClick={() => setCceDialogOpen(true)}>
                <MessageSquarePlus className="w-4 h-4 mr-2" />CC-e
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setCancelDialogOpen(true)}>
                <XCircle className="w-4 h-4 mr-2" />Cancelar
              </Button>
              <Button size="sm" variant="secondary" onClick={handleDownloadDanfe}>
                <FileDown className="w-4 h-4 mr-2" />PDF (DANFE)
              </Button>
              <Button size="sm" variant="secondary" onClick={handleDownloadXml}>
                <FileCode className="w-4 h-4 mr-2" />XML
              </Button>
            </>
          )}
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />Imprimir
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detalhes do Documento</TabsTrigger>
          <TabsTrigger value="timeline">Histórico SEFAZ</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Informações Principais</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Modelo</span><span className="font-medium">{document.type}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Número / Série</span><span className="font-medium">{document.number} / {document.series}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Emissão</span><span className="font-medium">{document.issueDate ? new Date(document.issueDate).toLocaleString('pt-BR') : '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Autorização</span><span className="font-medium">{document.authorizationDate ? new Date(document.authorizationDate).toLocaleString('pt-BR') : '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Protocolo</span><span className="font-medium">{document.protocol || '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Ambiente</span><span className="font-medium">{document.environment}</span></div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Destinatário & Valores</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Nome/Razão Social</span><span className="font-medium">{document.customerName || '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">CPF/CNPJ</span><span className="font-medium">{document.customerDocument || '-'}</span></div>
                <div className="flex justify-between mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">Total Impostos</span>
                  <span className="text-rose-500">R$ {(document.taxAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-2">
                  <span className="font-semibold">Valor Total da Nota</span>
                  <span className="text-xl font-bold text-indigo-500">R$ {(document.totalAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-6">Eventos SEFAZ</h3>
            <FiscalTimeline events={events} isLoading={isLoadingEvents} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <GenericDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen} title="Cancelar Documento" description="O cancelamento só pode ser feito dentro do prazo legal estabelecido pela SEFAZ.">
        <div className="space-y-4">
          <div>
            <Label>Justificativa de Cancelamento (Mínimo 15 caracteres)</Label>
            <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Informe a justificativa detalhada..." className="mt-1" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Voltar</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelReason.length < 15}>Transmitir Cancelamento</Button>
          </div>
        </div>
      </GenericDialog>

      {/* CC-e Dialog */}
      <GenericDialog open={cceDialogOpen} onOpenChange={setCceDialogOpen} title="Carta de Correção (CC-e)" description="A Carta de Correção não pode alterar valores, impostos, data de emissão ou dados do destinatário que impliquem em alteração de impostos.">
        <div className="space-y-4">
          <div>
            <Label>Correção a ser considerada (Mínimo 15 caracteres)</Label>
            <Input value={cceCorrection} onChange={(e) => setCceCorrection(e.target.value)} placeholder="Informe a correção..." className="mt-1" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCceDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCce} disabled={cceCorrection.length < 15}>Emitir CC-e</Button>
          </div>
        </div>
      </GenericDialog>
    </div>
  );
}
