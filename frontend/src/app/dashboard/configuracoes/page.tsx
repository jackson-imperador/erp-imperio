'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState } from 'react';

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(false);

  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Credenciais de acesso atualizadas com sucesso!');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Configurações Gerais</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Gerencie as preferências da sua empresa e sistema
        </p>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>
                Atualize as informações principais do seu negócio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                  <Input id="nome_fantasia" defaultValue="Império Store" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razao_social">Razão Social</Label>
                  <Input id="razao_social" defaultValue="Império Comércio LTDA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" defaultValue="12.345.678/0001-90" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail de Contato</Label>
                  <Input id="email" type="email" defaultValue="contato@imperio.com.br" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Acesso e Segurança</CardTitle>
              <CardDescription>
                Atualize seu e-mail de login e modifique sua senha de acesso.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSecurity} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="login_email">E-mail de Login Atual</Label>
                  <Input id="login_email" type="email" defaultValue="admin@imperio.com.br" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_password">Senha Atual</Label>
                  <Input id="current_password" type="password" placeholder="Digite sua senha atual" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password">Nova Senha</Label>
                  <Input id="new_password" type="password" placeholder="Digite a nova senha" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
                  <Input id="confirm_password" type="password" placeholder="Confirme a nova senha" required />
                </div>
                <div className="pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Atualizando...' : 'Atualizar Credenciais'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tema e Cores</CardTitle>
              <CardDescription>
                Personalize a aparência do seu sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500 mb-4">Em breve você poderá alternar entre modos claro e escuro por aqui!</p>
              <Button disabled>Alterar Tema</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="faturamento" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Fiscais</CardTitle>
              <CardDescription>
                Padrões de emissão e impostos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500 mb-4">Acesse a aba Fiscal na barra lateral para configurações avançadas de notas.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
