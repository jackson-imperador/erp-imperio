import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import Providers from '@/components/Providers';
import { PwaRegister } from '@/components/pwa/PwaRegister';
import { BottomNav } from '@/components/layout/BottomNav';

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Império ERP",
  description: "Plataforma ERP SaaS Enterprise",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Império ERP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50`}>
        <PwaRegister />
        <Providers>
          {children}
          <BottomNav />
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
