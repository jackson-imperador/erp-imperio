'use client';

import { useState } from 'react';
import { useStockMovements, useInventoryMutations, useWarehouses, useInventory } from '@/hooks/useInventory';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { GenericDialog } from '@/components/dialogs/GenericDialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Settings2 } from 'lucide-react';
import { StockMovement } from '@/types/inventory';

export default function AjustesPage() {
  const { data: movements = [], isLoading } = useStockMovements({ type: 'ADJUSTMENT' });
  const { data: warehouses = [] } = useWarehouses();
  const { data: products = [] } = useInventory();
  const { executeAdjustment, isMutating } = useInventoryMutations();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    warehouseId: '',
    productId: '',
    quantity: 0,
    reason: ''
  });

  const handleAdjustment = async () => {
    if (!formData.warehouseId || !formData.productId || formData.quantity === 0 || !formData.reason) {
      toast.error('Preencha os campos obrigatórios corretamente.');
      return;
    }
    try {
      await executeAdjustment.mutateAsync(formData);
      toast.success('Ajuste de estoque realizado com sucesso!');
      setDialogOpen(false);
    } catch {
      toast.error('Erro ao ajustar estoque.');
    }
  };

  const columns = [
    { key: 'createdAt', header: 'Data/Hora', render: (r: StockMovement) => new Date(r.createdAt).toLocaleString('pt-BR') },
    { key: 'productName', header: 'Produto' },
    { key: 'quantity', header: 'Quantidade Ajustada', render: (r: StockMovement) => <span className={r.quantity > 0 ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>{r.quantity > 0 ? `+${r.quantity}` : r.quantity}</span> },
    { key: 'warehouseName', header: 'Depósito' },
    { key: 'observation', header: 'Motivo', render: (r: StockMovement) => r.observation || '-' },
    { key: 'createdByName', header: 'Responsável', render: (r: StockMovement) => r.createdByName || 'Sistema' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Ajustes de Estoque</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Entradas ou saídas manuais para correção de saldo (Avarias, perdas, sobras)
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Settings2 className="w-4 h-4 mr-2" />Novo Ajuste
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={movements} columns={columns} isLoading={isLoading} />
      </div>

      <GenericDialog open={dialogOpen} onOpenChange={setDialogOpen} title="Ajuste de Estoque" description="Ajustes manuais ficam registrados na auditoria do sistema.">
        <div className="space-y-4">
          <div>
            <Label>Depósito</Label>
            <select
              value={formData.warehouseId}
              onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
              className="w-full mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-800"
            >
              <option value="">Selecione...</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Produto</Label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-800"
            >
              <option value="">Selecione o produto...</option>
              {products.map((p) => <option key={p.productId} value={p.productId}>{p.productName} (Saldo: {p.availableQuantity})</option>)}
            </select>
          </div>
          <div>
            <Label>Quantidade do Ajuste (Use negativo para perda/saída)</Label>
            <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} className="mt-1" />
          </div>
          <div>
            <Label>Motivo do Ajuste *</Label>
            <Input value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="mt-1" placeholder="Ex: Quebra, Vencimento, Sobra física..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdjustment} disabled={isMutating || !formData.reason || formData.quantity === 0}>Lançar Ajuste</Button>
          </div>
        </div>
      </GenericDialog>
    </div>
  );
}
