'use client';

import { SystemHealth, LicenseInfo, AdminDashboardMetrics } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Activity, Key, Users, Server, HardDrive, Database, AlertCircle } from 'lucide-react';

export function SystemStatusBadge({ status }: { status: SystemHealth['status'] }) {
  const config = {
    HEALTHY: { label: 'Operacional', variant: 'default' as const, color: 'bg-emerald-500 hover:bg-emerald-600' },
    DEGRADED: { label: 'Degradado', variant: 'outline' as const, color: 'text-amber-500 border-amber-500' },
    DOWN: { label: 'Inativo', variant: 'destructive' as const, color: '' },
  };
  const current = config[status] || config.DOWN;
  
  return <Badge variant={current.variant} className={current.color}>{current.label}</Badge>;
}

export function HealthStatusCard({ health }: { health?: SystemHealth | null }) {
  if (!health) return null;
  
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" /> Saúde do Sistema
        </h3>
        <SystemStatusBadge status={health.status} />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg flex flex-col gap-1">
          <span className="text-xs text-zinc-500 uppercase font-medium">Uptime</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{(health.uptime / 3600).toFixed(1)}h</span>
        </div>
        <div className="p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg flex flex-col gap-1">
          <span className="text-xs text-zinc-500 uppercase font-medium flex items-center gap-1"><Database className="w-3 h-3"/> DB</span>
          <span className={`font-bold ${health.database === 'OK' ? 'text-emerald-500' : 'text-rose-500'}`}>{health.database}</span>
        </div>
        <div className="p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg flex flex-col gap-1">
          <span className="text-xs text-zinc-500 uppercase font-medium flex items-center gap-1"><Server className="w-3 h-3"/> Cache</span>
          <span className={`font-bold ${health.cache === 'OK' ? 'text-emerald-500' : 'text-rose-500'}`}>{health.cache}</span>
        </div>
        <div className="p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg flex flex-col gap-1">
          <span className="text-xs text-zinc-500 uppercase font-medium flex items-center gap-1"><HardDrive className="w-3 h-3"/> Storage</span>
          <span className={`font-bold ${health.storage === 'OK' ? 'text-emerald-500' : 'text-rose-500'}`}>{health.storage}</span>
        </div>
      </div>
      
      <p className="text-xs text-zinc-500 mt-4 text-right">Versão: {health.version}</p>
    </div>
  );
}

export function AdminSummaryCards({ metrics }: { metrics?: AdminDashboardMetrics | null }) {
  const cards = [
    { title: 'Usuários Ativos', value: metrics?.activeUsers || 0, icon: Users, color: 'text-indigo-500' },
    { title: 'Requisições API', value: metrics?.totalApiRequests || 0, icon: Key, color: 'text-emerald-500' },
    { title: 'Falhas Webhook', value: metrics?.failedWebhooks || 0, icon: AlertCircle, color: 'text-amber-500' },
    { title: 'Armazenamento', value: `${((metrics?.storageUsedBytes || 0) / 1024 / 1024 / 1024).toFixed(2)} GB`, icon: HardDrive, color: 'text-zinc-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 ${c.color}`}>
            <c.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{c.title}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LicenseCard({ license }: { license?: LicenseInfo | null }) {
  if (!license) return null;
  const isTrial = license.status === 'TRIAL';
  
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-800 p-6 rounded-xl shadow-lg text-white">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="text-lg font-medium opacity-90 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Licença da Plataforma
          </h3>
          <h2 className="text-3xl font-bold mt-1">{license.planName}</h2>
        </div>
        <Badge variant="outline" className={`border-white/20 ${isTrial ? 'bg-amber-500/20 text-amber-200' : 'bg-white/10 text-white'}`}>
          {license.status}
        </Badge>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm opacity-90 mb-1">
            <span>Uso de Usuários</span>
            <span>{license.currentUsers} / {license.maxUsers}</span>
          </div>
          <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-400 rounded-full" 
              style={{ width: `${Math.min((license.currentUsers / license.maxUsers) * 100, 100)}%` }} 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm opacity-90 pt-4 border-t border-white/10">
          <div>
            <span className="block opacity-70">Válido até</span>
            <span className="font-semibold">{new Date(license.validUntil).toLocaleDateString('pt-BR')}</span>
          </div>
          <div>
            <span className="block opacity-70">White Label</span>
            <span className="font-semibold">{license.isWhiteLabel ? 'Ativado' : 'Desativado'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
