const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const dirsToCreate = [
  'lib', 'store', 'types', 'components/layout', 'components/ui',
  'app/login', 'app/dashboard', 'app/dashboard/vendas', 
  'app/dashboard/financeiro', 'app/dashboard/fiscal', 'app/dashboard/estoque',
  'app/dashboard/compras', 'app/dashboard/clientes', 'app/dashboard/produtos',
  'app/dashboard/configuracoes'
];

dirsToCreate.forEach(dir => {
  const p = path.join(srcDir, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// 1. types/index.ts
fs.writeFileSync(path.join(srcDir, 'types', 'index.ts'), `
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}
`);

// 2. store/authStore.ts
fs.writeFileSync(path.join(srcDir, 'store', 'authStore.ts'), `
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
`);

// 3. lib/axios.ts
fs.writeFileSync(path.join(srcDir, 'lib', 'axios.ts'), `
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
`);

// 4. lib/queryClient.ts
fs.writeFileSync(path.join(srcDir, 'lib', 'queryClient.ts'), `
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});
`);

// 5. Providers
fs.writeFileSync(path.join(srcDir, 'components', 'Providers.tsx'), `
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
`);

// 6. Root Layout (app/layout.tsx update)
fs.writeFileSync(path.join(srcDir, 'app', 'layout.tsx'), `
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Império ERP - Enterprise",
  description: "Plataforma Global Enterprise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
`);

// 7. Login Page
fs.writeFileSync(path.join(srcDir, 'app', 'login', 'page.tsx'), `
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      // Mocked login for demonstration since backend might not have this exact user seeded
      if(data.email === 'admin@imperio.com' && data.password === '123456') {
         setAuth({ id: '1', name: 'Admin', email: data.email, role: 'ADMIN', companyId: 'comp-1' }, 'mock-jwt-token');
         router.push('/dashboard');
      } else {
         alert('Credenciais inválidas. Use admin@imperio.com / 123456');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">👑 Império ERP</h1>
          <p className="text-zinc-500 mt-2">Acesso Restrito Enterprise</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">E-mail</label>
            <input 
              {...register('email')}
              className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              placeholder="admin@imperio.com"
            />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Senha</label>
            <input 
              type="password"
              {...register('password')}
              className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" 
              placeholder="******"
            />
            {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
`);

// 8. Admin Layout Sidebar
fs.writeFileSync(path.join(srcDir, 'components', 'layout', 'Sidebar.tsx'), `
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingCart, Users, Package, 
  DollarSign, Receipt, FileText, Settings, LogOut 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Clientes', href: '/dashboard/clientes' },
  { icon: Package, label: 'Produtos', href: '/dashboard/produtos' },
  { icon: ShoppingCart, label: 'Vendas', href: '/dashboard/vendas' },
  { icon: DollarSign, label: 'Financeiro', href: '/dashboard/financeiro' },
  { icon: Receipt, label: 'Fiscal (NFe)', href: '/dashboard/fiscal' },
  { icon: FileText, label: 'Relatórios (BI)', href: '/dashboard/bi' },
  { icon: Settings, label: 'Configurações', href: '/dashboard/configuracoes' },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore(s => s.logout);

  return (
    <aside className="w-64 bg-zinc-900 text-white h-screen flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-zinc-800">
        <h1 className="text-xl font-bold tracking-wider">👑 IMPÉRIO</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={\`flex items-center px-6 py-3 text-sm transition-colors \${isActive ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}\`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
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
`);

// 9. Admin Layout Header
fs.writeFileSync(path.join(srcDir, 'components', 'layout', 'Header.tsx'), `
'use client';
import { useAuthStore } from '@/store/authStore';

export function Header() {
  const user = useAuthStore(s => s.user);

  return (
    <header className="h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center">
        <span className="text-sm text-zinc-500 font-medium">Ambiente Enterprise: Produção</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{user?.name || 'Administrador'}</span>
            <span className="text-xs text-zinc-500">{user?.role || 'System Admin'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
`);

// 10. Admin Layout Shell
fs.writeFileSync(path.join(srcDir, 'app', 'dashboard', 'layout.tsx'), `
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token || !user) {
      router.push('/login');
    }
  }, [token, user, router]);

  if (!token) return null; // Prevent flash

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-zinc-50 dark:bg-zinc-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
`);

// 11. Dashboard Home Page (Analytics Overview)
fs.writeFileSync(path.join(srcDir, 'app', 'dashboard', 'page.tsx'), `
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Jan', vendas: 4000, lucros: 2400 },
  { name: 'Fev', vendas: 3000, lucros: 1398 },
  { name: 'Mar', vendas: 2000, lucros: 9800 },
  { name: 'Abr', vendas: 2780, lucros: 3908 },
  { name: 'Mai', vendas: 1890, lucros: 4800 },
  { name: 'Jun', vendas: 2390, lucros: 3800 },
];

export default function DashboardOverview() {
  // Exemplo de query real
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Usar a rota real construída na Fase 26 (Enterprise Analytics)
      // Como estamos injetando o mock, vamos apenas simular a resposta para que o UI nÃ£o quebre se o backend falhar
      try {
        const res = await api.get('/companies/comp-1/enterprise-intelligence/analytics/dashboard');
        return res.data;
      } catch (e) {
        console.warn('Backend unavailable, using fallback data');
        return {
          totalSales: 'R$ 1.2M',
          activeCustomers: 1250,
          pendingNfe: 14,
          cashflow: 'R$ 450K'
        };
      }
    },
  });

  if (isLoading) return <div className="text-zinc-500">Carregando painel de inteligência...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Visão Geral</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Faturamento Mensal', value: data?.totalSales || 'R$ 0,00', color: 'text-emerald-600' },
          { title: 'Clientes Ativos', value: data?.activeCustomers || 0, color: 'text-indigo-600' },
          { title: 'NF-e Pendentes', value: data?.pendingNfe || 0, color: 'text-amber-600' },
          { title: 'Fluxo de Caixa Livre', value: data?.cashflow || 'R$ 0,00', color: 'text-blue-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.title}</h3>
            <p className={\`text-3xl font-bold mt-2 \${stat.color}\`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700 h-[400px]">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">Performance de Receita vs Lucro</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis dataKey="name" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip />
            <Line type="monotone" dataKey="vendas" stroke="#4F46E5" strokeWidth={3} />
            <Line type="monotone" dataKey="lucros" stroke="#10B981" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
`);

// 12. Mock Page for Vendas
fs.writeFileSync(path.join(srcDir, 'app', 'dashboard', 'vendas', 'page.tsx'), `
export default function VendasPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Gestão de Vendas</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm">
          Nova Venda
        </button>
      </div>
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700 p-8 text-center text-zinc-500">
        Módulo Vendas instanciado. A integração com \`/api/v1/sales/orders\` será implementada na arquitetura principal.
      </div>
    </div>
  );
}
`);

// Fix layout.tsx page.tsx globally for redirect to /login
fs.writeFileSync(path.join(srcDir, 'app', 'page.tsx'), `
import { redirect } from 'next/navigation';
export default function Home() {
  redirect('/login');
}
`);

console.log('Frontend base architecture scaffolded successfully.');
