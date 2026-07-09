# Arquitetura de Banco de Dados — Império ERP

## PostgreSQL 16

### Estratégia Multi-Tenant
- **Schema-per-tenant**: Cada empresa tem seu próprio schema
- Schema `public`: Dados globais (planos, configurações)
- Schema `{tenant_slug}`: Dados isolados da empresa

### Tecnologia ORM
- **Prisma 5**: Migrações versionadas, type-safe queries

## Redis 7
- Refresh Tokens (com TTL)
- Cache de queries frequentes
- Sessões de usuário
- Filas BullMQ (jobs assíncronos)

## Armazenamento de Arquivos
- **MinIO** (self-hosted) ou **AWS S3**
- Buckets separados por tenant
- Documentos, imagens de produtos, NF-e, etc.
