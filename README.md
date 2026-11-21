# BUSINESS AI — Plataforma de Atendimento Automatizado

Software para automação de atendimento via WhatsApp Business (Meta Cloud API) integrado a modelos de IA gratuitos (Google Gemini / Ollama), com painel de controle, histórico de conversas, transferência para humano e base de conhecimento.

## Stack
- Backend: Node.js 20 + Express + Prisma + PostgreSQL
- Frontend: React 18 + Vite + Tailwind
- Infra: Docker Compose (Postgres, backend, frontend/nginx, cloudflared)
- IA: Gemini (free tier) e Ollama (local)

## Instalação automática (Windows)
Execute como Administrador:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
```
O script instala Node.js e Docker Desktop (se necessário), gera chaves seguras, sobe os serviços e cria atalhos.
1. Instale o Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Copie `.env.example` para `.env` e ajuste as chaves.
3. Execute: `docker compose up -d --build`
4. Acesse http://localhost:8080
5. Registre sua conta e conclua o onboarding.

## Desenvolvimento local (backend)
```bash
cd backend
npm install --include=dev
cp .env.example .env   # configure DATABASE_URL=file:./test.db para SQLite
npx prisma generate
npx prisma migrate dev --schema prisma/schema.sqlite.prisma
node src/server.js
```

## Testes
```bash
cd backend
NODE_ENV=test DATABASE_URL=file:./test.db npm test
```

## Documentação
- [Arquitetura](docs/architecture.md)
- [Instalação Windows](docs/instalacao-windows.md)
- [Guia de uso](docs/guia-uso.md)