'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePurchases } from '@/hooks/usePurchases';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { PurchaseStatusBadge, PurchaseSummaryCards } from '@/components/purchases/PurchaseWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseFilters } from '@/types/purchases';
import { Plus, FileDown, Filter, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

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

  const [isImporting, setIsImporting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingXmlData, setPendingXmlData] = useState<any>(null);

  const handleConfirmPayment = async (isCashPayment: boolean) => {
    const companyId = useAuthStore.getState().user?.companyId;
    if (!pendingXmlData || !companyId) return;
    setIsImporting(true);
    toast.loading('Sincronizando produtos, estoque e finanças...');

    try {
      const response = await api.post(`/companies/${companyId}/purchasing/import-xml`, {
        products: pendingXmlData.products,
        fileName: pendingXmlData.fileName,
        isCashPayment
      });

      const { addedProductsCount, existingProductsCount } = response.data.data || response.data;
      toast.dismiss();
      toast.success(
        `XML importado com sucesso! ${addedProductsCount} produtos novos criados, ${existingProductsCount} produtos atualizados no estoque.`
      );
      window.location.reload();
    } catch (err: any) {
      toast.dismiss();
      toast.error('Erro ao processar o XML no servidor.');
    } finally {
      setIsImporting(false);
      setIsPaymentModalOpen(false);
      setPendingXmlData(null);
    }
  };

  const handleXmlImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const xmlData = event.target?.result as string;
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlData, "text/xml");

          const detNodes = xmlDoc.getElementsByTagName("det");
          const products = Array.from(detNodes).map(det => {
            const prodNode = det.getElementsByTagName("prod")[0];
            return {
              codigo: prodNode?.getElementsByTagName("cProd")[0]?.textContent || '',
              nome: prodNode?.getElementsByTagName("xProd")[0]?.textContent || '',
              ncm: prodNode?.getElementsByTagName("NCM")[0]?.textContent || '',
              cfop: prodNode?.getElementsByTagName("CFOP")[0]?.textContent || '',
              unidade: prodNode?.getElementsByTagName("uCom")[0]?.textContent || '',
              quantidade: parseFloat(prodNode?.getElementsByTagName("qCom")[0]?.textContent || '0'),
              valorUnitario: parseFloat(prodNode?.getElementsByTagName("vUnCom")[0]?.textContent || '0'),
              valorTotal: parseFloat(prodNode?.getElementsByTagName("vProd")[0]?.textContent || '0'),
              codigoBarras: prodNode?.getElementsByTagName("cEAN")[0]?.textContent || '',
            };
          });

          if (products.length === 0) {
            toast.error('Nenhum produto encontrado neste XML.');
            return;
          }

          setPendingXmlData({ products, fileName: file.name });
          setIsPaymentModalOpen(true);
        } catch (error) {
          toast.error('Erro ao ler o arquivo XML.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

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
          <Button size="sm" variant="secondary" onClick={handleXmlImport}>
            <Upload className="w-4 h-4 mr-2" />Importar XML (NFe)
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

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Condição de Pagamento</h2>
              <p className="text-sm text-zinc-500 mt-1">Como esta compra foi realizada?</p>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                Encontramos {pendingXmlData?.products.length} produtos no XML. O sistema sincronizará o cadastro, estoque e contas a pagar automaticamente.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleConfirmPayment(true)}
                  disabled={isImporting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex flex-col h-auto py-3"
                >
                  <span className="font-semibold block text-base mb-1">À Vista</span>
                  <span className="text-xs text-indigo-100 font-normal">Já pago (Baixado)</span>
                </Button>
                
                <Button
                  onClick={() => handleConfirmPayment(false)}
                  disabled={isImporting}
                  variant="outline"
                  className="w-full border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex flex-col h-auto py-3"
                >
                  <span className="font-semibold block text-base mb-1">À Prazo</span>
                  <span className="text-xs text-zinc-500 font-normal">Lançar no Contas a Pagar</span>
                </Button>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setPendingXmlData(null);
                }}
                disabled={isImporting}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
