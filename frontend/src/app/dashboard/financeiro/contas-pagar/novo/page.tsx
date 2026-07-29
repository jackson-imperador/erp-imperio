'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFinancialMutations } from '@/hooks/useFinancial';
import { useCrud } from '@/hooks/useCrud';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  amount: z.number().min(0.01, 'Valor inválido'),
  dueDate: z.string().min(1, 'Vencimento obrigatório'),
  supplierId: z.string().optional(),
});

export default function NovoPagamentoPage() {
  const router = useRouter();
  const { createTransaction, isMutating } = useFinancialMutations();
  const companyId = useAuthStore((s) => s.user?.companyId || '');

  // FIX 1: usar rota correta do backend (/company/ singular, não /companies/)
  const { items: suppliers } = useCrud<{ id: string; name: string }>(
    `/company/${companyId}/suppliers`,
    ['suppliers']
  );

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, description: '', dueDate: '', supplierId: '' },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      // FIX 2+3: montar payload somente com campos que existem no CreatePayableDto
      // Remover: type, categoryId (inexistentes no DTO)
      // Remover supplierId se vazio (evita falha no @IsUUID())
      // FIX 4: converter dueDate para ISO 8601 completo
      const payload: Record<string, unknown> = {
        description: data.description,
        amount: data.amount,
        dueDate: new Date(data.dueDate).toISOString(),
      };

      if (data.supplierId && data.supplierId.trim() !== '') {
        payload.supplierId = data.supplierId;
      }

      await createTransaction.mutateAsync(payload as any);
      toast.success('Obrigação criada com sucesso!');
      router.push('/dashboard/financeiro/contas-pagar');
    } catch {
      toast.error('Erro ao criar obrigação.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/financeiro/contas-pagar">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Nova Obrigação a Pagar</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Descrição *</Label>
            <Input {...register('description')} className="mt-1" />
            {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
          </div>
          <div>
            <Label>Valor (R$) *</Label>
            <Input {...register('amount', { valueAsNumber: true })} type="number" step="0.01" className="mt-1" />
            {errors.amount && <span className="text-red-500 text-xs">{errors.amount.message}</span>}
          </div>
          <div>
            <Label>Vencimento *</Label>
            <Input {...register('dueDate')} type="date" className="mt-1" />
            {errors.dueDate && <span className="text-red-500 text-xs">{errors.dueDate.message}</span>}
          </div>
          <div className="md:col-span-2">
            <Label>Fornecedor</Label>
            <select {...register('supplierId')} className="w-full mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-800">
              <option value="">Selecione</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Link href="/dashboard/financeiro/contas-pagar"><Button type="button" variant="outline">Cancelar</Button></Link>
          <Button type="submit" disabled={isMutating}>{isMutating ? 'Salvando...' : 'Criar Obrigação'}</Button>
        </div>
      </form>
    </div>
  );
}
