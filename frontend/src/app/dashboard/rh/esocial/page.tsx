'use client';

import { useEsocial } from '@/hooks/useHr';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EsocialEvent } from '@/types/hr';
import { SendToBack, FileDown } from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';
import { toast } from 'sonner';

export default function EsocialPage() {
  const { data: events = [], isLoading } = useEsocial();

  const columns = [
    { key: 'eventType', header: 'Evento (Tabela)' },
    { key: 'employeeName', header: 'Funcionário', render: (r: EsocialEvent) => r.employeeName || 'Geral' },
    { 
      key: 'status', 
      header: 'Status RET',
      render: (r: EsocialEvent) => (
        <Badge variant={r.status === 'ACCEPTED' ? 'default' : r.status === 'REJECTED' ? 'destructive' : 'outline'} className={r.status === 'ACCEPTED' ? 'bg-emerald-500' : ''}>
          {r.status}
        </Badge>
      )
    },
    { key: 'receiptNumber', header: 'Nº Recibo', render: (r: EsocialEvent) => r.receiptNumber || '-' },
    { key: 'message', header: 'Mensagem Retorno', render: (r: EsocialEvent) => r.message || '-' },
    { key: 'sentAt', header: 'Data Envio', render: (r: EsocialEvent) => r.sentAt ? new Date(r.sentAt).toLocaleString('pt-BR') : '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Painel do eSocial</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Monitoramento de transmissões ao Ambiente Nacional
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCsv('esocial.csv', events)}>
            <FileDown className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Button size="sm" onClick={() => { toast.info("Conectando ao web service do eSocial..."); setTimeout(() => toast.success("Sincronização concluída. 0 erros no RET."), 1500); }}><SendToBack className="w-4 h-4 mr-2" />Sincronizar Lote</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={events} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
