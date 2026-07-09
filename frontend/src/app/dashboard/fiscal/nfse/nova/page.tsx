'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NovaNfsePage() {
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Emissão de NFS-e</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center py-20">
        <p className="text-zinc-500 mb-4">As notas de serviço são geradas automaticamente ao faturar uma Ordem de Serviço.</p>
        <Link href="/dashboard/vendas"><Button>Ir para OS</Button></Link>
      </div>
    </div>
  );
}
