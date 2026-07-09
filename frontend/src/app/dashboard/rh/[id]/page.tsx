'use client';

import { use } from 'react';
import Link from 'next/link';
import { useEmployee } from '@/hooks/useHr';
import { EmployeeStatusBadge } from '@/components/hr/HrWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Briefcase, FileText } from 'lucide-react';

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: employee, isLoading } = useEmployee(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">Colaborador não encontrado.</p>
        <Link href="/dashboard/rh/funcionarios"><Button variant="outline" className="mt-4">Voltar</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/rh/funcionarios">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 font-bold text-xl">
              {employee.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {employee.name}
                </h1>
                <EmployeeStatusBadge status={employee.status} />
              </div>
              <p className="text-sm text-zinc-500 mt-1">
                Matrícula: {employee.registration} • CPF: {employee.cpf}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Dados Cadastrais</TabsTrigger>
          <TabsTrigger value="contract">Contrato e Salário</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">E-mail:</span><span className="font-medium">{employee.email || '-'}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Telefone:</span><span className="font-medium">{employee.phone || '-'}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Data de Nascimento:</span><span className="font-medium">-</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Estado Civil:</span><span className="font-medium">-</span></div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contract">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" /> Informações Contratuais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">Cargo:</span><span className="font-medium">{employee.positionName}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Departamento:</span><span className="font-medium">{employee.departmentName}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Data Admissão:</span><span className="font-medium">{new Date(employee.admissionDate).toLocaleDateString('pt-BR')}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Salário Base:</span><span className="font-medium text-emerald-500">R$ {(employee.baseSalary || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 col-span-full">
                <span className="text-zinc-500">Status eSocial (S-2200):</span>
                <span className="font-bold text-indigo-500">{employee.esocialStatus}</span>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="documents">
           <div className="bg-white dark:bg-zinc-900 p-10 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
             <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
             <p className="text-zinc-500">Repositório de documentos digitais (RG, CPF, Comprovante de Residência, ASO).</p>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
