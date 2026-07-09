'use client';

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePurchaseMutations } from '@/hooks/usePurchases';
import { useCrud } from '@/hooks/useCrud';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const itemSchema = z.object({
  productId: z.string().min(1, 'Selecione um produto'),
  quantity: z.number().min(1, 'Mínimo 1'),
  unitCost: z.number().min(0.01, 'Custo deve ser maior que zero'),
  discount: z.number().min(0),
});

const purchaseSchema = z.object({
  supplierId: z.string().min(1, 'Selecione um fornecedor'),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  shippingCost: z.number().min(0),
  items: z.array(itemSchema).min(1, 'Adicione pelo menos um item'),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

export default function NovoPedidoCompraPage() {
  const router = useRouter();
  const { createOrder } = usePurchaseMutations();
  const { items: suppliers } = useCrud<{ id: string; name: string }>('/suppliers', ['suppliers']);
  const { items: products } = useCrud<{ id: string; name: string }>('/products', ['products']);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplierId: '',
      notes: '',
      paymentTerms: '30 dias',
      expectedDeliveryDate: '',
      shippingCost: 0,
      items: [{ productId: '', quantity: 1, unitCost: 0, discount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');
  const watchedShipping = watch('shippingCost');

  const subtotal = (watchedItems || []).reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitCost || 0) - (item.discount || 0),
    0
  );
  const total = subtotal + (watchedShipping || 0);

  const onSubmit = async (data: PurchaseFormData) => {
    try {
      await createOrder.mutateAsync(data);
      toast.success('Pedido de compra criado com sucesso!');
      router.push('/dashboard/compras');
    } catch {
      toast.error('Erro ao criar pedido de compra.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/compras">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Novo Pedido de Compra</h1>
          <p className="text-sm text-zinc-500 mt-1">Preencha os dados do pedido ao fornecedor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Supplier & Terms */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Dados do Pedido</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Fornecedor *</Label>
              <select
                {...register('supplierId')}
                className="w-full mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-800"
              >
                <option value="">Selecione</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors.supplierId && <span className="text-red-500 text-xs mt-1">{errors.supplierId.message}</span>}
            </div>
            <div>
              <Label>Condição de Pagamento</Label>
              <select
                {...register('paymentTerms')}
                className="w-full mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-800"
              >
                <option value="À vista">À vista</option>
                <option value="15 dias">15 dias</option>
                <option value="30 dias">30 dias</option>
                <option value="45 dias">45 dias</option>
                <option value="60 dias">60 dias</option>
                <option value="90 dias">90 dias</option>
              </select>
            </div>
            <div>
              <Label>Previsão de Entrega</Label>
              <Input type="date" {...register('expectedDeliveryDate')} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Frete (R$)</Label>
              <Input {...register('shippingCost', { valueAsNumber: true })} type="number" step="0.01" className="mt-1" />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea {...register('notes')} placeholder="Observações do pedido..." className="mt-1" />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Itens do Pedido</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1, unitCost: 0, discount: 0 })}>
              <Plus className="w-4 h-4 mr-2" />Adicionar Item
            </Button>
          </div>
          {errors.items?.root && <span className="text-red-500 text-xs">{errors.items.root.message}</span>}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-3 items-end p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700">
                <div className="col-span-4">
                  <Label className="text-xs">Produto</Label>
                  <select
                    {...register(`items.${index}.productId`)}
                    className="w-full mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-900"
                  >
                    <option value="">Selecione</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {errors.items?.[index]?.productId && <span className="text-red-500 text-xs">{errors.items[index].productId?.message}</span>}
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Quantidade</Label>
                  <Input {...register(`items.${index}.quantity`, { valueAsNumber: true })} type="number" min={1} className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Custo Unit.</Label>
                  <Input {...register(`items.${index}.unitCost`, { valueAsNumber: true })} type="number" step="0.01" className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Desconto</Label>
                  <Input {...register(`items.${index}.discount`, { valueAsNumber: true })} type="number" step="0.01" className="mt-1" />
                </div>
                <div className="col-span-2 flex justify-end">
                  {fields.length > 1 && (
                    <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <div className="text-right space-y-1">
              <p className="text-sm text-zinc-500">Subtotal: R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-zinc-500">Frete: R$ {(watchedShipping || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                Total: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/compras"><Button type="button" variant="outline">Cancelar</Button></Link>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Criar Pedido de Compra'}</Button>
        </div>
      </form>
    </div>
  );
}
