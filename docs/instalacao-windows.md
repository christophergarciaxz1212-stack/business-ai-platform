# Instalação no Windows

## Requisitos
- Windows 10 ou 11.
- Docker Desktop instalado e rodando: https://www.docker.com/products/docker-desktop/
- 4 GB de RAM livres.

## Instalação
1. Baixe o instalador `BusinessAI-Setup.exe` (ou clone o repositório).
2. Execute o instalador e escolha o diretório.
3. O atalho "BUSINESS AI" será criado na área de trabalho.
4. Execute o atalho. Ele verifica o Docker, cria o `.env` (se ausente) e sobe os serviços.
5. Acesse http://localhost:8080 e registre sua conta.

## Configuração inicial
- Conclua o onboarding (pode pular etapas não obrigatórias).
- Conecte o WhatsApp em "WhatsApp" (Phone Number ID + Access Token da Meta).
- Configure o webhook na Meta com a URL exibida (túnel Cloudflare).
- Selecione um modelo de IA em "Modelos de IA" → "Selecionar melhor modelo gratuito".
- Personalize o atendente em "Atendente IA".

## Limitações conhecidas
- O túnel Cloudflare gera uma URL efêmera que muda a cada reinício: atualize o webhook na Meta quando mudar.
- O atendimento depende da máquina/servidor estar ligado e com Docker rodando.
- Ollama (IA local) deve ser instalado no host se desejado: https://ollama.com