'use client';

import { useFiscalDashboard } from '@/hooks/useFiscal';
import { FiscalSummaryCards } from '@/components/fiscal/FiscalWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Plus } from 'lucide-react';
import Link from 'next/link';

export default function FiscalDashboardPage() {
  const { data: metrics, isLoading } = useFiscalDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard Fiscal</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão unificada de documentos eletrônicos e obrigações acessórias
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />Relatório PDF
          </Button>
          <Link href="/dashboard/fiscal/nfe">
            <Button size="sm"><Plus className="w-4 h-4 mr-2" />Nova NF-e</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        </div>
      ) : (
        <>
          <FiscalSummaryCards metrics={metrics} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Acesso Rápido - Documentos</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/dashboard/fiscal/nfe" className="p-4 border rounded-lg hover:border-indigo-500 transition-colors">
                  <p className="font-medium text-indigo-600 dark:text-indigo-400">NF-e / NFC-e</p>
                  <p className="text-xs text-zinc-500 mt-1">Vendas e mercadorias</p>
                </Link>
                <Link href="/dashboard/fiscal/nfse" className="p-4 border rounded-lg hover:border-emerald-500 transition-colors">
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">NFS-e</p>
                  <p className="text-xs text-zinc-500 mt-1">Prestação de serviços</p>
                </Link>
                <Link href="/dashboard/fiscal/cte" className="p-4 border rounded-lg hover:border-amber-500 transition-colors">
                  <p className="font-medium text-amber-600 dark:text-amber-400">CT-e / MDF-e</p>
                  <p className="text-xs text-zinc-500 mt-1">Transportes e fretes</p>
                </Link>
                <Link href="/dashboard/fiscal/lotes" className="p-4 border rounded-lg hover:border-blue-500 transition-colors">
                  <p className="font-medium text-blue-600 dark:text-blue-400">Monitor SEFAZ</p>
                  <p className="text-xs text-zinc-500 mt-1">Lotes e processamentos</p>
                </Link>
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Acesso Rápido - Obrigações</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/dashboard/fiscal/sped" className="p-4 border rounded-lg hover:border-purple-500 transition-colors">
                  <p className="font-medium text-purple-600 dark:text-purple-400">SPED Fiscal</p>
                  <p className="text-xs text-zinc-500 mt-1">ICMS e IPI</p>
                </Link>
                <Link href="/dashboard/fiscal/reinf" className="p-4 border rounded-lg hover:border-rose-500 transition-colors">
                  <p className="font-medium text-rose-600 dark:text-rose-400">EFD-Reinf</p>
                  <p className="text-xs text-zinc-500 mt-1">Retenções e impostos</p>
                </Link>
                <Link href="/dashboard/fiscal/esocial" className="p-4 border rounded-lg hover:border-teal-500 transition-colors">
                  <p className="font-medium text-teal-600 dark:text-teal-400">eSocial</p>
                  <p className="text-xs text-zinc-500 mt-1">Eventos trabalhistas</p>
                </Link>
                <Link href="/dashboard/fiscal/certificados" className="p-4 border rounded-lg hover:border-zinc-500 transition-colors">
                  <p className="font-medium text-zinc-600 dark:text-zinc-400">Certificados A1/A3</p>
                  <p className="text-xs text-zinc-500 mt-1">Gestão de assinaturas</p>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
