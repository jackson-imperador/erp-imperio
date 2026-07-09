'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Building, 
  CreditCard, 
  Receipt, 
  Truck, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  Database, 
  PenTool, 
  BrainCircuit 
} from 'lucide-react';

const integrationModules = [
  { id: 'bancos', name: 'Bancos e Boletos', description: 'API e CNAB para emissão e baixa', icon: Building, href: '/dashboard/admin/integracoes/bancos', count: 3, active: 1 },
  { id: 'gateways', name: 'Gateways', description: 'Cartão de Crédito e PIX', icon: CreditCard, href: '/dashboard/admin/integracoes/gateways', count: 3, active: 1 },
  { id: 'fiscal', name: 'Fiscal', description: 'Emissão de NFe, NFCe, NFSe', icon: Receipt, href: '/dashboard/admin/integracoes/fiscal', count: 3, active: 1 },
  { id: 'transportadoras', name: 'Logística', description: 'Cotação e Etiquetas de Frete', icon: Truck, href: '/dashboard/admin/integracoes/transportadoras', count: 3, active: 1 },
  { id: 'whatsapp', name: 'WhatsApp', description: 'APIs Oficiais e Não Oficiais', icon: MessageSquare, href: '/dashboard/admin/integracoes/whatsapp', count: 3, active: 1 },
  { id: 'email', name: 'E-mail', description: 'Transacional e Marketing', icon: Mail, href: '/dashboard/admin/integracoes/email', count: 3, active: 1 },
  { id: 'sms', name: 'SMS', description: 'Tokens e Alertas via SMS', icon: Smartphone, href: '/dashboard/admin/integracoes/sms', count: 3, active: 1 },
  { id: 'storage', name: 'Storage S3', description: 'Armazenamento de Arquivos em Nuvem', icon: Database, href: '/dashboard/admin/integracoes/storage', count: 3, active: 1 },
  { id: 'assinatura', name: 'Assinatura', description: 'Assinatura Eletrônica e Digital', icon: PenTool, href: '/dashboard/admin/integracoes/assinatura', count: 3, active: 1 },
  { id: 'ia', name: 'IA (LLMs)', description: 'Modelos ChatGPT, Claude, Gemini', icon: BrainCircuit, href: '/dashboard/admin/integracoes/ia', count: 3, active: 1 },
];

export default function IntegracoesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Central de Integrações</h2>
        <p className="text-muted-foreground">Gerencie as conexões do ERP com provedores externos.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {integrationModules.map((module) => (
          <Link key={module.id} href={module.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {module.name}
                </CardTitle>
                <module.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {module.description}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary">{module.count} Provedores</Badge>
                  {module.active > 0 && <Badge variant="default" className="bg-green-500">{module.active} Ativo</Badge>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
