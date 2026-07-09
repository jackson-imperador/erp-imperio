# Arquitetura de Segurança — Império ERP

## Camadas de Segurança

1. **TLS/HTTPS** — Obrigatório em produção via Nginx
2. **Helmet.js** — Headers HTTP seguros
3. **Rate Limiting** — Throttle por IP e por usuário autenticado
4. **CORS** — Configurado por domínio explicitamente permitido
5. **JWT** — Access Token (15min) + Refresh Token com rotação
6. **Argon2** — Hash de senhas (resistente a GPU/ASIC attacks)
7. **class-validator** — Validação rigorosa de todos os DTOs
8. **Prisma** — Queries parametrizadas (previne SQL Injection)
9. **Sanitização** — XSS prevenido no frontend
10. **Audit Log** — Registro imutável de ações sensíveis
11. **Isolamento de Tenant** — Dados de um tenant nunca acessíveis por outro
