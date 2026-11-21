# BUSINESS AI — Fase A: Backend Core (Auth, Tenant, Banco, Config)

> For the executing agent: use godmode:inline-execution or godmode:delegated-execution
> to run this plan task by task. Steps use checkboxes for tracking.

**Goal:** Criar o backend Node 20 + Express + Prisma + Postgres com auth multi-tenant (JWT), isolamento por `tenant_id` + RLS, e endpoints de perfil do negócio, testável via Jest/Supertest.

**Design:** docs/plans/2026-11-21-BusinessAI-business-ai-design.md

**Architecture:** Monolito modular em camadas (routes → controllers → services → repositories via Prisma). Multi-tenant via `TenantMember` many-to-many e RLS no Postgres. Credenciais criptografadas com AES-256-GCM. JWT access+refresh.

**Stack:** Node 20, Express 4.19, Prisma 5, PostgreSQL 16, bcrypt 5, jsonwebtoken 9, zod 3, pino 9, helmet, cors, cookie-parser, jest, supertest, tsx (dev).

## Global Constraints
- ESM não: CommonJS (`require`) para compatibilidade com o código existente; `type: commonjs`.
- Todas as tabelas de negócio têm `tenant_id UUID NOT NULL`.
- RLS policy: `tenant_id = current_setting('app.tenant_id', true)::uuid`. Backend seta `SET LOCAL app.tenant_id` por request autenticado.
- Senhas: bcrypt cost 12.
- JWT: access 15m, refresh 7d em httpOnly cookie `refreshToken`.
- Validação de entrada com zod em todas as rotas.
- Erros: formato `{ error: string, code?: string }`, nunca stack em produção.
- Logs: pino JSON, nível via env `LOG_LEVEL`.
- Sem caminhos absolutos; tudo via env (`DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, `PORT`, `CORS_ORIGIN`).
- Porta padrão 3000 (interna); frontend proxy em dev.

## Review Focus
- Registro com email duplicado: deve retornar 409, não 500.
- Request sem token: 401, e nenhuma query ao banco de negócio.
- Cross-tenant: usuário A com token não pode ler dados do tenant B (403/404).
- Refresh token expirado/inválido: 401 e cookie limpo.
- RLS desativado por engano: teste de integração deve falhar se policy ausente.

## Sources
- Prisma 5: https://www.prisma.io/docs (checked 2026-11-21)
- Postgres RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- bcrypt: https://github.com/kelektiv/node.bcrypt.js
- zod: https://zod.dev

## File Map
| File | Action | Responsibility |
|---|---|---|
| `backend/package.json` | Modify | deps + scripts |
| `backend/.env.example` | Create | template de env |
| `backend/tsconfig.json` | Create | (JS com JSDoc) — na verdade usar JS puro; omitir |
| `backend/src/server.js` | Modify | bootstrap, middlewares, rotas, graceful shutdown |
| `backend/src/config.js` | Create | carrega/valida env |
| `backend/src/db.js` | Create | PrismaClient singleton |
| `backend/src/logger.js` | Create | pino |
| `backend/src/crypto.js` | Create | AES-256-GCM encrypt/decrypt |
| `backend/src/middleware/auth.js` | Create | JWT verify + set tenant context |
| `backend/src/middleware/tenantContext.js` | Create | SET LOCAL app.tenant_id |
| `backend/src/middleware/errorHandler.js` | Create | handler global |
| `backend/src/middleware/rateLimit.js` | Create | express-rate-limit |
| `backend/src/middleware/validate.js` | Create | zod middleware |
| `backend/src/routes/auth.js` | Create | /api/auth/* |
| `backend/src/routes/tenants.js` | Create | /api/tenants/* |
| `backend/src/controllers/authController.js` | Create | register/login/refresh/logout |
| `backend/src/controllers/tenantController.js` | Create | perfil do negócio |
| `backend/src/services/authService.js` | Create | lógica auth |
| `backend/src/services/tenantService.js` | Create | lógica tenant |
| `backend/src/validators/auth.js` | Create | zod schemas |
| `backend/src/validators/tenant.js` | Create | zod schemas |
| `backend/prisma/schema.prisma` | Modify | schema multi-tenant |
| `backend/prisma/migrations/...` | Create | migração + RLS SQL |
| `backend/tests/auth.test.js` | Create | testes auth |
| `backend/tests/tenant.test.js` | Create | testes tenant + isolamento |
| `backend/jest.config.js` | Create | config jest |

---

### Task 1: Setup do projeto backend

**Files:**
- Modify: `backend/package.json`
- Create: `backend/.env.example`
- Create: `backend/jest.config.js`
- Create: `backend/src/config.js`

**Covers:** infra base.

**Interfaces:**
- Produces: `config` object (port, databaseUrl, jwtSecret, jwtRefreshSecret, encryptionKey, corsOrigin, logLevel, nodeEnv) in `backend/src/config.js`.

- [ ] **Step 1: Atualizar package.json**

Adicionar deps: express 4.19.2, @prisma/client 5.22.0, bcrypt 5.1.1, jsonwebtoken 9.0.2, zod 3.23.8, pino 9.5.0, pino-pretty 11.3.0, helmet 8.0.0, cors 2.8.5, cookie-parser 1.4.7, express-rate-limit 7.4.1, dotenv 16.4.5. Dev: prisma 5.22.0, jest 29.7.0, supertest 7.0.0, nodemon 3.1.7.

- [ ] **Step 2: Criar .env.example**

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://BusinessAI:BusinessAI@localhost:5432/BusinessAI?schema=public
JWT_SECRET=change-me-at-least-32-chars
JWT_REFRESH_SECRET=change-me-refresh-at-least-32-chars
ENCRYPTION_KEY=32-bytes-hex-or-base64
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

- [ ] **Step 3: Criar config.js** que valida env com zod e exporta `config`. Falha rápido se faltar.

- [ ] **Step 4: Criar jest.config.js** (testEnvironment node, setupFilesAfterEach, globalSetup para DB).

- [ ] **Step 5: Commit**

---

### Task 2: Prisma schema + migração inicial

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/0_init/migration.sql` (via prisma migrate dev)

**Covers:** modelo de dados multi-tenant.

**Interfaces:**
- Produces: PrismaClient models: User, Tenant, TenantMember, WhatsAppConfig (stub), AiConfig (stub), Customer, Conversation, Message, KnowledgeDoc, KnowledgeChunk, AuditLog, ErrorLog.

- [ ] **Step 1: Escrever schema.prisma** com todos os modelos, `tenant_id` em tabelas de negócio, índices, unique constraints (User.email, Tenant.slug).

- [ ] **Step 2: Rodar `npx prisma migrate dev --name init`** para gerar migração.

- [ ] **Step 3: Adicionar RLS SQL** em migration customizada: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY; CREATE POLICY tenant_isolation ON ... USING (tenant_id = current_setting('app.tenant_id', true)::uuid);` para cada tabela de negócio. Aplicar via `prisma migrate` raw ou script `prisma/rls.sql` executado no deploy.

- [ ] **Step 4: Commit**

---

### Task 3: Utilitários (logger, crypto, db)

**Files:**
- Create: `backend/src/logger.js`
- Create: `backend/src/crypto.js`
- Create: `backend/src/db.js`

- [ ] **Step 1: logger.js** — pino com pretty em dev.

- [ ] **Step 2: crypto.js** — `encrypt(plaintext): string` e `decrypt(ciphertext): string` usando AES-256-GCM com IV aleatório, formato `iv:tag:ciphertext` (base64). Chave de `config.encryptionKey` (32 bytes).

- [ ] **Step 3: Escrever teste crypto.test.js** verificando round-trip e falha com chave errada.

- [ ] **Step 4: db.js** — PrismaClient singleton com graceful shutdown.

- [ ] **Step 5: Commit**

---

### Task 4: Auth (register, login, refresh, logout)

**Files:**
- Create: `backend/src/validators/auth.js`
- Create: `backend/src/services/authService.js`
- Create: `backend/src/controllers/authController.js`
- Create: `backend/src/routes/auth.js`
- Modify: `backend/src/server.js` (registrar rota)

**Covers:** acceptance: registro, login, refresh, logout, isolamento.

**Interfaces:**
- Consumes: `prisma` from `src/db.js`, `config` from `src/config.js`, `encrypt` (futuro).
- Produces: `register({email,password,name})`, `login({email,password})`, `refresh(refreshToken)`, `logout(refreshToken)` in authService; rotas POST /api/auth/register, /login, /refresh, /logout.

- [ ] **Step 1: Escrever auth.test.js** com casos: register ok (201), email duplicado (409), login ok (200 + cookies), login senha errada (401), refresh ok, refresh inválido (401), logout.

- [ ] **Step 2: Implementar validators (zod)** para register/login.

- [ ] **Step 3: Implementar authService** com bcrypt hash, criação de User + Tenant + TenantMember(owner), emissão de tokens.

- [ ] **Step 4: Implementar authController + routes**.

- [ ] **Step 5: Rodar testes → pass. Commit.**

---

### Task 5: Middleware de autenticação e tenant context

**Files:**
- Create: `backend/src/middleware/auth.js`
- Create: `backend/src/middleware/tenantContext.js`
- Create: `backend/src/middleware/errorHandler.js`
- Create: `backend/src/middleware/validate.js`
- Create: `backend/src/middleware/rateLimit.js`

- [ ] **Step 1: auth middleware** — extrai Bearer token do header, verifica JWT, anexa `req.user = {id, email}` e `req.tenantId` (do claim). 401 se inválido.

- [ ] **Step 2: tenantContext middleware** — após auth, executa `prisma.$executeRaw` `SET LOCAL app.tenant_id = ...` dentro de uma transação, ou usa `prisma.$transaction` com `SET LOCAL`. Garantir que toda query de negócio rode dentro desse contexto.

- [ ] **Step 3: errorHandler** — captura erros zod (400), prisma known (mapeia P2002→409), genéricos (500 com log).

- [ ] **Step 4: validate middleware** — `validate(schema)` valida req.body.

- [ ] **Step 5: rateLimit** — 60 req/min por IP (global), 10/min por IP em /auth.

- [ ] **Step 6: Testes de middleware** (sem token, token inválido).

- [ ] **Step 7: Commit.**

---

### Task 6: Tenant profile (negócio)

**Files:**
- Create: `backend/src/validators/tenant.js`
- Create: `backend/src/services/tenantService.js`
- Create: `backend/src/controllers/tenantController.js`
- Create: `backend/src/routes/tenants.js`
- Modify: `backend/src/server.js`

**Covers:** acceptance: configurar informações do negócio.

**Interfaces:**
- Produces: GET /api/tenants/me, PATCH /api/tenants/me (atualiza companyName, segment, description, phone, address, workingHours, timezone, products, services, faq, policies).

- [ ] **Step 1: Escrever tenant.test.js** — criar tenant no registro, GET me retorna dados, PATCH atualiza, cross-tenant 403.

- [ ] **Step 2: Implementar.**

- [ ] **Step 3: Rodar testes → pass. Commit.**

---

### Task 7: Server bootstrap + graceful shutdown

**Files:**
- Modify: `backend/src/server.js`

- [ ] **Step 1: Bootstrap** com middlewares (helmet, cors, cookie-parser, json, rateLimit, errorHandler), rotas, health check GET /health, graceful shutdown (SIGTERM/SIGINT) fechando Prisma.

- [ ] **Step 2: Teste smoke** (GET /health 200).

- [ ] **Step 3: Commit.**

---

### Task 8: Integração — rodar suite completa

- [ ] **Step 1: `npm test`** → todos passam.
- [ ] **Step 2: `npx prisma validate`** ok.
- [ ] **Step 3: Commit final da fase.**
