'use client';

import { useState } from 'react';
import { useBankStatements, useFinancialTransactions, useFinancialMutations } from '@/hooks/useFinancial';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { BankStatement, FinancialTransaction } from '@/types/financial';

export default function ConciliacaoPage() {
  const { data: statements = [], isLoading: isLoadingStatements } = useBankStatements();
  const { data: transactions = [], isLoading: isLoadingTransactions } = useFinancialTransactions({ status: 'PAID' });
  const { reconcileStatement } = useFinancialMutations();

  const [selectedStatement, setSelectedStatement] = useState<string | null>(null);

  const pendingStatements = statements.filter(s => !s.reconciled);

  const handleReconcile = async (transactionId: string) => {
    if (!selectedStatement) return;
    try {
      await reconcileStatement.mutateAsync({ statementId: selectedStatement, transactionId });
      toast.success('Conciliação realizada com sucesso!');
      setSelectedStatement(null);
    } catch {
      toast.error('Erro ao conciliar.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Conciliação Bancária</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Vincule movimentações bancárias (OFX) aos títulos do ERP
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Pending Statements */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Extratos Pendentes</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {isLoadingStatements ? (
              <p className="text-zinc-500">Carregando...</p>
            ) : pendingStatements.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4 text-center">Nenhum extrato pendente.</p>
            ) : (
              pendingStatements.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => setSelectedStatement(s.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedStatement === s.id ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{s.description}</p>
                      <p className="text-xs text-zinc-500 mt-1">{new Date(s.date).toLocaleDateString('pt-BR')} • {s.documentNumber}</p>
                    </div>
                    <Badge variant={s.type === 'CREDIT' ? 'default' : 'destructive'} className={s.type === 'CREDIT' ? 'bg-emerald-500' : ''}>
                      R$ {s.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Available Transactions to Link */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {selectedStatement ? 'Selecione o Título Correspondente' : 'Títulos no ERP'}
          </h2>
          {!selectedStatement && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm rounded-lg border border-amber-200 dark:border-amber-800">
              Selecione um extrato na lista ao lado para iniciar a conciliação.
            </div>
          )}
          
          <div className={!selectedStatement ? 'opacity-50 pointer-events-none' : ''}>
            <GenericDataTable 
              data={transactions} 
              isLoading={isLoadingTransactions}
              columns={[
                { key: 'referenceNumber', header: 'Doc' },
                { key: 'description', header: 'Descrição' },
                { 
                  key: 'amount', 
                  header: 'Valor',
                  render: (r: FinancialTransaction) => `R$ ${(r.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                },
                {
                  key: 'actions',
                  header: '',
                  render: (r: FinancialTransaction) => (
                    <Button size="sm" variant="outline" onClick={() => handleReconcile(r.id)}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />Vincular
                    </Button>
                  )
                }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
