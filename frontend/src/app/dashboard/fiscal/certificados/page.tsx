'use client';

import { useCertificates } from '@/hooks/useFiscal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';
import { DigitalCertificate } from '@/types/fiscal';

export default function CertificadosPage() {
  const { data: certificates = [], isLoading } = useCertificates();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Certificados Digitais</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão de certificados e-CNPJ (A1 e A3) para emissão fiscal
          </p>
        </div>
        <Button size="sm"><Key className="w-4 h-4 mr-2" />Instalar Novo Certificado</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-zinc-500">Carregando certificados...</p>
        ) : certificates.length === 0 ? (
          <p className="text-zinc-500 col-span-full">Nenhum certificado instalado.</p>
        ) : (
          certificates.map((cert: DigitalCertificate) => (
            <div key={cert.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Badge variant={cert.status === 'ACTIVE' ? 'default' : 'destructive'} className={cert.status === 'ACTIVE' ? 'bg-emerald-500' : ''}>
                  {cert.status}
                </Badge>
              </div>
              <Key className="w-8 h-8 text-indigo-500 mb-4" />
              <h3 className="font-semibold text-zinc-900 dark:text-white line-clamp-1" title={cert.subjectName}>{cert.subjectName}</h3>
              <p className="text-xs text-zinc-500 mt-1 truncate">Emissor: {cert.issuerName}</p>
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Válido de:</span>
                  <span className="font-medium">{new Date(cert.validFrom).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Válido até:</span>
                  <span className="font-medium text-rose-500">{new Date(cert.validTo).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
