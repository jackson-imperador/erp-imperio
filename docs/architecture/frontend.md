# Arquitetura Frontend — Império ERP

## Framework: Next.js 14 (App Router)

## Padrões Aplicados
- **Feature Slice**: Lógica agrupada por módulo de negócio
- **Atomic Design**: UI components em atoms/molecules/organisms
- **Repository Pattern**: Services abstraem chamadas à API
- **BFF (Backend For Frontend)**: API Routes do Next.js como proxy seguro

## Gerenciamento de Estado
- **Zustand**: Estado global (auth, tenant, UI)
- **TanStack Query**: Estado do servidor (cache, revalidação)
- **React Hook Form**: Estado de formulários

## Fluxo de Autenticação
```
Login → AuthService → POST /api/v1/auth/login
     → Armazena tokens (httpOnly cookies)
     → Zustand auth.store atualizado
     → Redirect para dashboard
```
