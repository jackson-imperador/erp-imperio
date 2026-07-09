'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NovaNfcePage() {
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">PDV - Emissão NFC-e</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center py-20">
        <p className="text-zinc-500 mb-4">O Frente de Caixa (PDV) está disponível no módulo de vendas em formato dedicado.</p>
        <Link href="/dashboard/vendas"><Button>Acessar PDV</Button></Link>
      </div>
    </div>
  );
}
