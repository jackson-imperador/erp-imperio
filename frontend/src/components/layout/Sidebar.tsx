'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Users, Package, Building2,
  DollarSign, Receipt, FileText, Settings, LogOut, UserCog,
  Truck, Tags, Ruler, GitBranch, Landmark, ClipboardList, Activity, Key, ShieldCheck,
  MonitorSmartphone
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const menuSections = [
  {
    title: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { icon: Building2, label: 'Empresas', href: '/dashboard/empresas' },
      { icon: Users, label: 'Clientes', href: '/dashboard/clientes' },
      { icon: Truck, label: 'Fornecedores', href: '/dashboard/fornecedores' },
      { icon: Package, label: 'Produtos (Cadastro)', href: '/dashboard/produtos' },
      { icon: Package, label: 'Estoque', href: '/dashboard/estoque' },
      { icon: Package, label: 'Produtos (Estoque)', href: '/dashboard/estoque/produtos' },
      { icon: Package, label: 'Movimentações', href: '/dashboard/estoque/movimentacoes' },
      { icon: Tags, label: 'Categorias', href: '/dashboard/categorias' },
      { icon: Ruler, label: 'Unidades', href: '/dashboard/unidades' },
    ],
  },
  {
    title: 'Operações',
    items: [
      { icon: ShoppingCart, label: 'Vendas', href: '/dashboard/vendas' },
    ],
  },
  {
    title: 'Frente de Caixa (PDV)',
    items: [
      { icon: MonitorSmartphone, label: 'Dashboard PDV', href: '/dashboard/pdv' },
      { icon: ShoppingCart, label: 'Caixa Livre', href: '/dashboard/pdv/caixa' },
      { icon: Receipt, label: 'Terminais', href: '/dashboard/pdv/caixas' },
    ],
  },
  {
    title: 'Compras e Financeiro',
    items: [
      { icon: ClipboardList, label: 'Compras', href: '/dashboard/compras' },
      { icon: DollarSign, label: 'Financeiro', href: '/dashboard/financeiro' },
      { icon: DollarSign, label: 'A Receber', href: '/dashboard/financeiro/contas-receber' },
      { icon: DollarSign, label: 'A Pagar', href: '/dashboard/financeiro/contas-pagar' },
      { icon: Receipt, label: 'Fiscal', href: '/dashboard/fiscal' },
      { icon: Receipt, label: 'NF-e', href: '/dashboard/fiscal/nfe' },
      { icon: Receipt, label: 'NFC-e', href: '/dashboard/fiscal/nfce' },
      { icon: Receipt, label: 'NFS-e', href: '/dashboard/fiscal/nfse' },
    ],
  },
  {
    title: 'Recursos Humanos',
    items: [
      { icon: Users, label: 'Dashboard RH', href: '/dashboard/rh' },
      { icon: Users, label: 'Funcionários', href: '/dashboard/rh/funcionarios' },
      { icon: Users, label: 'Folha Pagamento', href: '/dashboard/rh/folha' },
      { icon: Users, label: 'eSocial', href: '/dashboard/rh/esocial' },
    ],
  },
  {
    title: 'Business Intelligence',
    items: [
      { icon: Activity, label: 'Executive (CEO)', href: '/dashboard/bi' },
      { icon: Activity, label: 'Financeiro', href: '/dashboard/bi/financeiro' },
      { icon: Activity, label: 'Comercial', href: '/dashboard/bi/comercial' },
      { icon: Activity, label: 'Previsões (IA)', href: '/dashboard/bi/previsoes' },
    ],
  },
  {
    title: 'Administração Global',
    items: [
      { icon: Settings, label: 'Painel Central', href: '/dashboard/admin' },
      { icon: Key, label: 'API Keys', href: '/dashboard/admin/apikeys' },
      { icon: ShieldCheck, label: 'Auditoria', href: '/dashboard/admin/auditoria' },
      { icon: ClipboardList, label: 'Licença', href: '/dashboard/admin/licenca' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { icon: UserCog, label: 'Usuários', href: '/dashboard/usuarios' },
      { icon: GitBranch, label: 'Perfis RBAC', href: '/dashboard/perfis' },
      { icon: Landmark, label: 'Centros de Custo', href: '/dashboard/centros-custo' },
      { icon: FileText, label: 'Relatórios (BI)', href: '/dashboard/bi' },
      { icon: Settings, label: 'Configurações', href: '/dashboard/configuracoes' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore(s => s.logout);

  return (
    <aside className="hidden md:flex w-64 bg-zinc-900 text-white h-screen flex-col">
      <div className="h-16 flex items-center justify-center border-b border-zinc-800">
        <h1 className="text-xl font-bold tracking-wider">👑 IMPÉRIO</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="px-6 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-6 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-zinc-800">
        <button onClick={logout} className="flex items-center text-sm text-zinc-400 hover:text-white w-full px-2 py-2">
          <LogOut className="w-5 h-5 mr-3" />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}
