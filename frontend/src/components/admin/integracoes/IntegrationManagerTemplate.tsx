'use client';

import { useState } from 'react';
import { IntegrationCategory, IntegrationProvider } from '@/types/integrations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GenericDialog } from '@/components/dialogs/GenericDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Activity, Shield, RefreshCw, Power } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IntegrationManagerTemplateProps {
  category: IntegrationCategory;
}

export function IntegrationManagerTemplate({ category }: IntegrationManagerTemplateProps) {
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConfigure = (provider: IntegrationProvider) => {
    setSelectedProvider(provider);
    setIsDialogOpen(true);
  };

  const renderHealthBadge = (healthStatus: string) => {
    switch (healthStatus) {
      case 'ONLINE': return <Badge variant="default" className="bg-green-500">Online</Badge>;
      case 'OFFLINE': return <Badge variant="destructive">Offline</Badge>;
      case 'DEGRADED': return <Badge variant="secondary" className="bg-yellow-500">Degradado</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{category.name}</h2>
        <p className="text-muted-foreground">{category.description}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {category.providers.map((provider) => (
          <Card key={provider.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center gap-2">
                  {provider.name}
                </CardTitle>
                <Badge variant={provider.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {provider.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <CardDescription>{provider.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status Health:</span>
                  {renderHealthBadge(provider.healthStatus)}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Circuit Breaker:</span>
                  <span className={provider.circuitBreakerStatus === 'CLOSED' ? 'text-green-500' : 'text-red-500'}>
                    {provider.circuitBreakerStatus}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" onClick={() => handleConfigure(provider)}>
                <Settings className="mr-2 h-4 w-4" />
                Configurar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedProvider && (
        <IntegrationConfigDialog 
          provider={selectedProvider} 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
        />
      )}
    </div>
  );
}

function IntegrationConfigDialog({ provider, open, onOpenChange }: { provider: IntegrationProvider, open: boolean, onOpenChange: (o: boolean) => void }) {
  const form = useForm<any>({
    defaultValues: {
      status: provider.status,
      credentials: {},
      webhooks: { url: '', activeEvents: [] },
      resilience: { rateLimitRequests: 100, rateLimitWindowS: 60, retryCount: 3, timeoutMs: 5000, circuitBreakerErrorThreshold: 5 }
    }
  });

  const onSubmit = (data: any) => {
    console.log('Salvando configuracao', data);
    toast.success(`${provider.name} configurado com sucesso!`);
    onOpenChange(false);
  };

  const handleTestConnection = () => {
    toast.info('Testando conexão com o provedor...', { duration: 2000 });
    setTimeout(() => {
      toast.success('Conexão bem sucedida!');
    }, 2000);
  };

  return (
    <GenericDialog open={open} onOpenChange={onOpenChange} title={`Configurar ${provider.name}`}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="credentials"><Shield className="w-4 h-4 mr-2"/>Credenciais</TabsTrigger>
            <TabsTrigger value="webhooks"><Activity className="w-4 h-4 mr-2"/>Webhooks</TabsTrigger>
            <TabsTrigger value="resilience"><RefreshCw className="w-4 h-4 mr-2"/>Resiliência</TabsTrigger>
          </TabsList>
          
          <TabsContent value="credentials" className="space-y-4 pt-4">
            <div className="flex items-center justify-between p-4 border rounded-md mb-4 bg-muted/50">
              <div className="space-y-0.5">
                <Label>Status do Provedor</Label>
                <div className="text-sm text-muted-foreground">Ative ou desative esta integração</div>
              </div>
              <Select 
                defaultValue={form.getValues('status')} 
                onValueChange={(val) => form.setValue('status', val as any)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {provider.fields.map((field) => (
              <div key={field.name} className="space-y-1">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input 
                  id={field.name}
                  type={field.type === 'password' ? 'password' : 'text'}
                  placeholder={field.placeholder}
                  {...form.register(`credentials.${field.name}`)}
                />
              </div>
            ))}

            <Button type="button" variant="secondary" onClick={handleTestConnection} className="w-full mt-4">
              <Power className="w-4 h-4 mr-2" />
              Testar Conexão
            </Button>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4 pt-4">
            <div className="space-y-1">
              <Label>Webhook URL</Label>
              <Input placeholder="https://api.seuerp.com/webhooks/provedor" {...form.register('webhooks.url')} />
            </div>
            <div className="space-y-1">
              <Label>Webhook Secret (Assinatura)</Label>
              <Input type="password" placeholder="Chave secreta para validação" {...form.register('webhooks.secret')} />
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Eventos suportados: payment.created, payment.updated, etc.
            </div>
          </TabsContent>

          <TabsContent value="resilience" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Rate Limit (Reqs)</Label>
                <Input type="number" {...form.register('resilience.rateLimitRequests')} />
              </div>
              <div className="space-y-1">
                <Label>Rate Limit Window (s)</Label>
                <Input type="number" {...form.register('resilience.rateLimitWindowS')} />
              </div>
              <div className="space-y-1">
                <Label>Retry Count</Label>
                <Input type="number" {...form.register('resilience.retryCount')} />
              </div>
              <div className="space-y-1">
                <Label>Timeout (ms)</Label>
                <Input type="number" {...form.register('resilience.timeoutMs')} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Circuit Breaker Error Threshold</Label>
                <Input type="number" {...form.register('resilience.circuitBreakerErrorThreshold')} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit">Salvar Configuração</Button>
        </div>
      </form>
    </GenericDialog>
  );
}
