'use client';

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSalesMutations } from '@/hooks/useSales';
import { useCrud } from '@/hooks/useCrud';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const itemSchema = z.object({
  productId: z.string().min(1, 'Selecione um produto'),
  quantity: z.number().min(1, 'Mínimo 1 unidade'),
  unitPrice: z.number().min(0.01, 'Preço deve ser maior que zero'),
  discount: z.number().min(0),
});

const orderSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente'),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Adicione pelo menos um item'),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function NovaVendaPage() {
  const router = useRouter();
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  const { createOrder } = useSalesMutations();
  
  // Real API calls passing the companyId
  const { items: customers } = useCrud<{ id: string; name: string }>(`/company/${companyId}/customers`, ['customers', companyId]);
  
  // Fetching inventory products to display in dropdown
  const { items: inventoryLevels } = useCrud<{ 
    id: string; 
    productId: string; 
    quantity: number; 
    product?: { name: string; salePrice: number } 
  }>(`/companies/${companyId}/inventory/levels`, ['inventory', companyId]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: '',
      notes: '',
      paymentMethod: 'PIX',
      items: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');

  const subtotal = (watchedItems || []).reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0) - (item.discount || 0),
    0
  );

  const onSubmit = async (data: OrderFormData) => {
    try {
      await createOrder.mutateAsync(data);
      toast.success('Pedido de venda criado com sucesso!');
      router.push('/dashboard/vendas');
    } catch {
      toast.error('Erro ao criar pedido de venda.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vendas">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Novo Pedido de Venda</h1>
          <p className="text-sm text-zinc-500 mt-1">Preencha todos os campos obrigatórios</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer & Payment */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Dados do Pedido</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Cliente *</Label>
              <select
                {...register('customerId')}
                className="w-full mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-800"
              >
                <option value="">Selecione um cliente</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.customerId && (
                <span className="text-red-500 text-xs mt-1">{errors.customerId.message}</span>
              )}
            </div>

            <div>
              <Label>Forma de Pagamento</Label>
              <select
                {...register('paymentMethod')}
                className="w-full mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-800"
              >
                <option value="PIX">PIX</option>
                <option value="BOLETO">Boleto</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="CARTAO_DEBITO">Cartão de Débito</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="TRANSFERENCIA">Transferência</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              {...register('notes')}
              placeholder="Observações opcionais sobre o pedido..."
              className="mt-1"
            />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Itens do Pedido</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, discount: 0 })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          </div>

          {errors.items?.root && (
            <span className="text-red-500 text-xs">{errors.items.root.message}</span>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-3 items-end p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700"
              >
                <div className="col-span-4">
                  <Label className="text-xs">Produto</Label>
                  <select
                    {...register(`items.${index}.productId`)}
                    className="w-full mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-900"
                  >
                    <option value="">Selecione</option>
                    {inventoryLevels.map((inv) => (
                      <option key={inv.productId} value={inv.productId}>
                        {inv.product?.name} (Estoque: {inv.quantity})
                      </option>
                    ))}
                    {inventoryLevels.length === 0 && (
                      <option disabled>Nenhum produto em estoque</option>
                    )}
                  </select>
                  {errors.items?.[index]?.productId && (
                    <span className="text-red-500 text-xs">{errors.items[index].productId?.message}</span>
                  )}
                </div>

                <div className="col-span-2">
                  <Label className="text-xs">Quantidade</Label>
                  <Input {...register(`items.${index}.quantity`, { valueAsNumber: true })} type="number" min={1} className="mt-1" />
                  {errors.items?.[index]?.quantity && (
                    <span className="text-red-500 text-xs">{errors.items[index].quantity?.message}</span>
                  )}
                </div>

                <div className="col-span-2">
                  <Label className="text-xs">Preço Unit.</Label>
                  <Input {...register(`items.${index}.unitPrice`, { valueAsNumber: true })} type="number" step="0.01" className="mt-1" />
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

          {/* Totals */}
          <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <div className="text-right space-y-1">
              <p className="text-sm text-zinc-500">Subtotal</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/vendas">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Criar Pedido'}
          </Button>
        </div>
      </form>
    </div>
  );
}
