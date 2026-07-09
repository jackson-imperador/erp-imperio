# Visão Geral da Arquitetura — Império ERP

## Padrão Arquitetural
- **Monólito Modular** no backend (NestJS)
- **Feature-Sliced Design** no frontend (Next.js)
- **Multi-tenant**: Schema-per-tenant no PostgreSQL
- **Autenticação**: JWT + Refresh Token com rotação
- **RBAC**: Role-Based Access Control granular por módulo

## Módulos de Negócio
1. Auth & Usuários
2. Tenants (Empresas)
3. Financeiro
4. Estoque
5. Vendas / CRM
6. Compras
7. RH
8. Relatórios

Consulte os demais arquivos desta pasta para detalhes de cada camada.
