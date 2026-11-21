# Guia de Uso

## 1. Painel de Configurações
Ao iniciar o sistema, acesse a interface web (padrão `http://localhost:5173`).

- **Provedor de IA**: Escolha entre Gemini ou Ollama.
- **Chave de API**: Se usar Gemini, insira sua chave válida.
- **URL Base**: Se usar Ollama, insira a URL do seu servidor local.

## 2. Funcionamento
O sistema recebe mensagens via Webhook da Meta, encaminha para a IA configurada e responde automaticamente via API do WhatsApp.

## 3. Segurança
- O sistema possui limite de taxa (rate limiting).
- Não compartilhe suas credenciais da Meta ou chaves de IA.