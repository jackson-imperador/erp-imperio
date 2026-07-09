# 👑 Império ERP

> Plataforma ERP SaaS multi-tenant de nível comercial.

**Versão Atual:** 1.0.0 (Release Candidate)

## Stack
- **Frontend**: Next.js + TypeScript + Zustand + TanStack Query
- **Backend**: NestJS + TypeScript + Prisma
- **Banco**: PostgreSQL + Redis
- **Storage**: MinIO
- **Infra**: Docker + Nginx + GitHub Actions + Prometheus + Grafana

## Estrutura
```
ERP IMPERIO/
├── frontend/     # Aplicação Next.js
├── backend/      # API NestJS
├── shared/       # Tipos compartilhados
├── infra/        # Docker, Nginx, Prometheus
├── scripts/      # Scripts de Automação (Backup)
├── docs/         # Documentação técnica
└── .github/      # CI/CD Workflows
```

## Implantação e Deploy

O sistema utiliza Docker Compose para orquestração.
Existem diferentes ambientes configurados via `.env.*`.

**Passos para Deploy em Produção:**
1. Configure as variáveis em `.env.production`.
2. Execute o build e inicie os containers:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

## Desenvolvimento
Consulte a documentação em `/docs/architecture/`.

