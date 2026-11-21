# Arquitetura — BUSINESS AI

## Visão geral
Plataforma multi-tenant de atendimento automatizado via WhatsApp Business (Meta Cloud API) com IA gratuita (Gemini/Ollama), painel CRM, histórico, transferência para humano e base de conhecimento.

## Componentes
1. **Frontend (React + Vite + Tailwind + Framer Motion)** — SPA servida por nginx. Rotas protegidas, design preto/branco minimalista.
2. **Backend (Node 20 + Express + Prisma)** — API REST + webhook. Módulos: auth, tenants, whatsapp, ai, conversations, knowledge, dashboard.
3. **Banco (PostgreSQL 16)** — multi-tenant com `tenant_id` + RLS.
4. **Túnel (cloudflared)** — expõe webhook HTTPS (URL efêmera) para a Meta.

## Multi-tenant
- `User` ↔ `Tenant` via `TenantMember` (roles: owner/admin/agent).
- Todas as tabelas de negócio têm `tenant_id NOT NULL`.
- RLS policy `tenant_id = current_setting('app.tenant_id')`.
- Backend seta `SET LOCAL app.tenant_id` por request autenticado via `withTenant`.

## Fluxo de mensagens
1. Cliente envia mensagem no WhatsApp.
2. Meta envia POST para webhook (via túnel).
3. Backend valida, identifica tenant pelo `phone_number_id`.
4. Deduplicação por `message_id`.
5. Get/create customer + conversation.
6. Se human takeover ativo → não responde.
7. Gera resposta via IA (com fallback entre provedores).
8. Armazena mensagem + envia via Meta Cloud API.
9. Painel atualiza via polling.

## Segurança
- Senhas bcrypt (cost 12).
- JWT access (15m) + refresh (7d) httpOnly cookie.
- Credenciais criptografadas AES-256-GCM.
- Rate limiting por IP e por tenant.
- Helmet, CORS, validação zod.
- RLS no Postgres.
- LGPD: exportação/exclusão de dados do cliente.