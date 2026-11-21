# JARVIS BUSINESS AI — Design (MVP Fase 1)

Date: 2026-11-21. Status: approved by the user (provisional decisions documented below).

## Intent

Transformar o protótipo atual (Node/Express + React/Vite + Prisma não utilizado) em um **produto real e distribuível**: um instalador `.exe` que provisiona um ambiente Docker Compose (backend + frontend + Postgres + túnel Cloudflare) e expõe um assistente de configuração para que qualquer pessoa, sem programar, configure seu negócio, conecte o WhatsApp Business oficial (Meta Cloud API), escolha um modelo de IA gratuito (Gemini/Ollama) e ative um atendente virtual 24/7 com histórico, transferência para humano e logs.

Público: pequenos/médios negócios e revendedores do software. Sucesso = uma pessoa não técnica consegue instalar, configurar e receber uma resposta automática real no WhatsApp em < 30 minutos, sem pagar por IA ou infraestrutura.

## Goals, non-goals, anti-goals

**Goals (MVP):**
- Instalador `.exe` (Windows 10/11) que verifica Docker, sobe o Compose e abre o painel.
- Assistente de configuração em etapas (progresso, pular não obrigatórias).
- Auth multi-tenant (registro/login, JWT, isolamento por tenant_id + RLS no Postgres).
- Conexão Meta Cloud API (salvar credenciais criptografadas, webhook verify + receive, envio de resposta).
- Motor de IA com Gemini (free tier) e Ollama (local), seleção automática do melhor modelo gratuito disponível, fallback entre provedores.
- Personalidade/prompt por negócio + base de conhecimento (upload de docs/texto) usada na resposta.
- Memória contextual por cliente (histórico isolado por conversa).
- Transferência para humano (IA para de responder naquela conversa).
- Painel: Dashboard, Conversas (CRM), Clientes, Atendente IA, Modelos IA, WhatsApp, Base de conhecimento, Relatórios, Configurações, Ajuda.
- Logs de erro e auditoria.

**Non-goals (MVP, fica para fases posteriores):**
- Empacotamento Linux/macOS (arquitetura preparada, instalador não).
- App desktop nativo (Tauri/Electron) — usamos navegador + Docker.
- Atualizador automático.
- Multi-idioma.
- Integrações com sistemas externos (agenda, estoque) além de webhook genérico.
- App mobile.

**Anti-goals (o que tornaria o MVP uma falha mesmo funcionando):**
- Prometer 24/7 em PC desligado.
- Usar APIs não-oficiais do WhatsApp (bloqueio de número).
- Inventar preços/disponibilidade (IA deve usar apenas base de conhecimento).
- Vazar dados entre tenants.
- Exigir que o usuário configure túnel/domínio manualmente.

## Constraints

- Plataforma inicial: Windows 10/11 (Docker Desktop ou Docker Engine via WSL2). Linux/macOS: arquitetura compatível, instalador não incluso no MVP.
- Tudo gratuito: IA via Gemini free tier (rate limits documentados) e Ollama local. Sem assinaturas pagas obrigatórias.
- WhatsApp: Meta Cloud API oficial (requer conta Meta Business + número verificado + webhook HTTPS). Túnel via Cloudflare (gratuito, URL efêmera) por padrão; domínio próprio opcional.
- Banco: Postgres 16 em container, com Row-Level Security por tenant.
- Sem dependências de caminhos absolutos da máquina de dev; tudo via variáveis de ambiente e volumes Docker.
- LGPD: mecanismos de consulta/exportação/exclusão de dados do cliente.

## Approach (decisões)

1. **Formato:** instalador `.exe` (Inno Setup ou NSIS) que verifica/instala Docker Desktop (ou WSL2+Docker Engine), copia o Compose, sobe os serviços e abre `http://localhost:8080`. Serviços: `frontend` (nginx servindo build React), `backend` (Node 20), `postgres`, `cloudflared` (túnel).
2. **Multi-tenant com isolamento:** uma instalação serve N empresas. Auth por email/senha (bcrypt + JWT). Cada tabela de negócio tem `tenant_id NOT NULL`. RLS policy `tenant_id = current_setting('app.tenant_id')` aplicada no Postgres. Backend seta `SET LOCAL app.tenant_id` por request via middleware. Credenciais (tokens Meta, chaves API) criptografadas com AES-256-GCM usando chave derivada de segredo do tenant + pepper de instalação (armazenado em volume Docker, não em código).
3. **WhatsApp oficial:** backend recebe `GET /webhook` (verify) e `POST /webhook` (mensagens). Identifica tenant pelo `phone_number_id` recebido. Envia resposta via `POST https://graph.facebook.com/v20.0/{phone_number_id}/messages`. Deduplicação por `message_id` (idempotência). Fila assíncrona (BullMQ + Redis) — *ou* fila em memória no MVP se Redis for pesado; decisão: usar fila em memória com persistência em DB e retry, para reduzir containers. Revisitar Redis se necessário.
4. **IA:** gerenciador de provedores (Gemini, Ollama, compatíveis OpenAI). Endpoint "selecionar melhor modelo gratuito": lista modelos, filtra gratuitos, testa conexão, escolhe por prioridade (local Ollama disponível > Gemini free). Fallback: se provedor falhar, tenta próximo configurado. System prompt montado a partir de: personalidade + dados do negócio + trechos relevantes da base de conhecimento (busca por palavras-chave simples no MVP; vetorial depois).
5. **Base de conhecimento:** upload de texto/PDF (extrair texto), chunking simples, busca por keyword. IA instruída a responder apenas com base nos chunks + dados cadastrados; se não souber, informar e oferecer humano.
6. **Memória contextual:** histórico de mensagens por `conversation_id` (cliente+instância), últimos N turnos no prompt, com limite de tokens.
7. **Transferência para humano:** flag `human_takeover` por conversa; enquanto ativa, IA não responde; notificação no painel (polling/SSE).
8. **Túnel:** container `cloudflared` com `tunnel --url http://backend:3000`, captura URL dos logs e expõe via API ao frontend para o usuário colar no painel Meta. Domínio próprio: instruções nas configurações.

## Design (arquitetura)

```
[Instalador .exe]
   └─ verifica Docker ── sobe docker compose
        ├─ frontend (nginx, build React)  :8080
        ├─ backend (Node 20, Express)     :3000 (interno)
        ├─ postgres (16, volume)          :5432 (interno)
        └─ cloudflared (túnel)           -> URL pública
```

Backend módulos:
- `auth` (register/login/JWT/refresh)
- `tenants` (perfil da empresa)
- `whatsapp` (credenciais criptografadas, webhook, envio)
- `ai` (provedores, seleção, geração, fallback)
- `knowledge` (upload, chunking, busca)
- `conversations` (clientes, mensagens, histórico, takeover)
- `dashboard` (métricas agregadas)
- `logs` (erros, auditoria)

Frontend: React 18 + Vite + Tailwind + shadcn/ui (ou componentes próprios), rotas protegidas, design preto/branco minimalista com animações (framer-motion).

Banco (Prisma): User, Tenant, WhatsAppConfig, AIConfig, Provider, Customer, Conversation, Message, KnowledgeDoc, KnowledgeChunk, Appointment?, Report?, AuditLog, ErrorLog. Todas as tabelas de negócio com `tenant_id`.

Segurança:
- Senhas: bcrypt (cost 12).
- JWT access (15min) + refresh (7d) em httpOnly cookie.
- Rate limiting por IP e por tenant.
- Validação de entrada (zod).
- Helmet, CORS restrito, body limit.
- Criptografia de credenciais (AES-256-GCM).
- RLS no Postgres.
- Logs de auditoria (login, mudança de config, takeover).
- LGPD: endpoints de exportação e exclusão de dados do cliente.

## Specification

### Inputs (configuração do negócio)
| Input | Type | Required | Constraints | Default |
|---|---|---|---|---|
| companyName | string | yes | 1-120 chars | — |
| segment | enum | yes | lista | other |
| description | string | no | ≤2000 | "" |
| phone | string | no | E.164 | "" |
| address | string | no | ≤500 | "" |
| workingHours | json | no | — | 24/7 |
| timezone | string (IANA) | no | IANA tz | detectado do navegador |
| products/services | array | no | — | [] |
| faq | array | no | — | [] |
| policies | string | no | ≤5000 | "" |

### Outputs (webhook / atendimento)
| Case | Result | Shape |
|---|---|---|
| Mensagem recebida válida | 200 EVENT_RECEIVED; processa async | {status} |
| Verify token ok | 200 challenge | text |
| Verify token inválido | 403 | — |
| IA indisponível | mensagem de fallback + log; tenta fallback | {response, provider, fallback:true} |
| Takeover ativo | IA não responde; notifica painel | — |

### Edge cases
| Case | Input | Expected |
|---|---|---|
| Mensagem duplicada (retry Meta) | mesmo message_id | processada uma vez (idempotência) |
| Mídia (imagem/doc/áudio) | message com media | registra, responde com texto padrão "recebi sua mídia" |
| Fora do horário | msg fora do expediente | mensagem de ausência automática |
| Concorrência | 2 msgs simultâneas do mesmo cliente | fila serializa por conversa |
| Timeout IA | >30s | fallback ou mensagem de erro amigável |
| Tenant não encontrado (phone_number_id desconhecido) | webhook desconhecido | 200 (não vazar) + log |

### Acceptance criteria (MVP Fase 1)
- [ ] Instalador .exe sobe todos os containers e abre o painel em Windows limpo.
- [ ] Usuário registra conta e cria empresa (assistente em etapas, progresso, pular).
- [ ] Conecta Meta Cloud API (salva credenciais criptografadas, webhook verify ok).
- [ ] Configura IA (Gemini free ou Ollama), teste de conexão ok.
- [ ] "Selecionar melhor modelo gratuito" configura automaticamente.
- [ ] Envia mensagem de outro telefone → recebe resposta da IA em < 15s.
- [ ] Histórico de conversa persiste e é visível no painel.
- [ ] Transferência para humano desativa IA naquela conversa.
- [ ] Isolamento: usuário B não vê dados do usuário A (teste automatizado).
- [ ] Reiniciar containers → dados e configurações persistem.
- [ ] Logs de erro registrados e visíveis.

### Out of scope (MVP)
- Instalador Linux/macOS, atualizador, multi-idioma, vetorial search, integrações externas, app mobile.

## Decisions

- Formato .exe + Docker Compose (decisão do usuário).
- Túnel Cloudflare híbrido (decisão do usuário: sem domínio próprio).
- Multi-tenant com RLS (decisão do agente, justificada por "banco por conta" + distribuição comercial).
- Fila em memória com persistência em DB no MVP (decisão do agente: reduzir containers); Redis se carga exigir.
- Busca de conhecimento por keyword no MVP (decisão do agente); vetorial depois.
- Formato .exe + Docker Compose (decisão do usuário).
- Túnel Cloudflare híbrido (decisão do usuário: sem domínio próprio).
- Multi-tenant com RLS (decisão do agente, justificada por "banco por conta" + distribuição comercial).
- Fila em memória com persistência em DB no MVP (decisão do agente: reduzir containers); Redis se carga exigir.
- Busca de conhecimento por keyword no MVP (decisão do agente); vetorial depois.
- Mono-painel web (não app desktop) no MVP.

**Decisões do builder check #2 (agente):**
6. Deployment: modelo híbrido. Self-hosted por padrão (cada instalação cria o primeiro tenant no onboarding; registro público desabilitado por default via `ALLOW_PUBLIC_REGISTRATION=false`), mas código multi-tenant mantido para hospedagem centralizada/reseller. RLS permanece load-bearing.
7. Docker: instalador detecta Docker e, se ausente, guia o usuário a instalar o Docker Desktop oficial (não instala silenciosamente). Acceptance "Windows limpo" requer Docker Desktop.
8. Meta app: modo híbrido (global da instalação por padrão + opção de credenciais próprias). (reafirma #4)
9. Ollama: host (não container), via `host.docker.internal`. (reafirma #2)
10. Túnel: trycloudflare efêmero aceito no MVP, com banner no painel quando a URL muda + instrução de atualizar no Meta. Opção avançada: Cloudflare named tunnel (conta gratuita) para URL estável.
11. Roles: multi-user com roles owner/admin/agent via TenantMember. (reafirma #1)
1. Ownership multi-tenant: modelo many-to-many via `TenantMember(userId, tenantId, role)` com roles `owner/admin/agent`. Um login pode pertencer a vários tenants (reseller) e um tenant pode ter vários usuários (equipe). RLS por `tenant_id`.
2. Ollama: NÃO containerizado no MVP (imagem/modelo pesados). Detectado no host; se ausente, onboarding recomenda Gemini free. CPU-only, sem GPU passthrough no MVP.
3. WhatsApp: 1 tenant pode ter N `phone_number_id` (1:N). Webhook roteia `phone_number_id` → `WhatsAppConfig` → `tenant_id`.
4. Meta app: modo híbrido — app global da instalação por padrão (verify token + app secret em config de instalação), com opção de credenciais próprias por tenant. Validar `X-Hub-Signature-256` quando app secret disponível.
5. Timezone: campo `timezone` (IANA) no perfil do negócio, default detectado do navegador (`America/Sao_Paulo` fallback). Usado para horário de funcionamento e mensagens de ausência.

## Sources

- Meta Cloud API / Webhooks: https://developers.facebook.com/docs/whatsapp/cloud-api (verificado 2026-11-21).
- Cloudflare Tunnel (trycloudflare): https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/ (verificado 2026-11-21).
- Google Gemini API free tier: https://ai.google.dev/pricing (verificado 2026-11-21).
- Ollama: https://ollama.com (verificado 2026-11-21).
- Postgres RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html.
- LGPD: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm.
