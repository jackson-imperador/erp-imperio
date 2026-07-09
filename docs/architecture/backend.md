# Arquitetura Backend — Império ERP

## Framework: NestJS 10

## Padrões Aplicados
- **Repository Pattern**: Abstração da camada de dados
- **DTO Pattern**: Validação e transformação de entrada
- **Guard Pattern**: Autenticação e autorização por rota
- **Interceptor Pattern**: Transformação de resposta e logging
- **Filter Pattern**: Tratamento centralizado de exceções

## Fluxo de uma Request
```
Request → Middleware (Tenant) → Guard (JWT + Roles) → Pipe (Validation)
       → Controller → Service → Repository → Prisma → PostgreSQL
       → Response (Interceptor envelope)
```

## Módulos
Cada módulo segue a estrutura:
- `controllers/` — Rotas HTTP
- `services/` — Lógica de negócio
- `repositories/` — Acesso ao banco via Prisma
- `dto/` — Objetos de transferência de dados
- `entities/` — Representação das entidades
- `*.module.ts` — Declaração do módulo NestJS
