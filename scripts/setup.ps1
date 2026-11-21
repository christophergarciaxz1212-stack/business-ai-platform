# JARVIS BUSINESS AI - Instalador automatico (Windows)
# Instala dependencias (Node.js, Docker Desktop), configura o ambiente e sobe os servicos.

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Definition

function Write-Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Ok($msg) { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  [!] $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "  [X] $msg" -ForegroundColor Red }

# --- 1. Verificar SO ---
Write-Step "Verificando sistema operacional"
$os = (Get-CimInstance Win32_OperatingSystem).Caption
if ($os -notmatch "Windows 10|Windows 11") {
    Write-Warn "Sistema detectado: $os. Recomendado Windows 10/11."
} else {
    Write-Ok "Sistema: $os"
}

# --- 2. Verificar/instalar Node.js ---
Write-Step "Verificando Node.js"
$nodeOk = $false
try {
    $v = node --version 2>$null
    if ($v) { $nodeOk = $true; Write-Ok "Node.js $v ja instalado" }
} catch {}
if (-not $nodeOk) {
    Write-Warn "Node.js nao encontrado. Instalando via winget..."
    try {
        winget install --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
        $env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')
        Write-Ok "Node.js instalado"
    } catch {
        Write-Err "Falha ao instalar Node.js. Instale manualmente: https://nodejs.org"
        exit 1
    }
}

# --- 3. Verificar/instalar Docker Desktop ---
Write-Step "Verificando Docker"
$dockerOk = $false
try {
    docker --version 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $dockerOk = $true; Write-Ok "Docker ja instalado" }
} catch {}
if (-not $dockerOk) {
    Write-Warn "Docker nao encontrado. Instalando Docker Desktop..."
    try {
        winget install --id Docker.DockerDesktop --silent --accept-package-agreements --accept-source-agreements
        Write-Ok "Docker Desktop instalado. Reinicie o computador e execute novamente."
        Write-Warn "Apos reiniciar, abra o Docker Desktop e aguarde inicializar, depois execute este script novamente."
        exit 0
    } catch {
        Write-Err "Falha ao instalar Docker Desktop. Instale manualmente: https://www.docker.com/products/docker-desktop/"
        Start-Process "https://www.docker.com/products/docker-desktop/"
        exit 1
    }
}

# Verificar se Docker esta rodando
Write-Step "Verificando se Docker esta rodando"
$dockerRunning = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        docker info 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) { $dockerRunning = $true; break }
    } catch {}
    Start-Sleep -Seconds 3
}
if (-not $dockerRunning) {
    Write-Warn "Docker nao esta rodando. Iniciando Docker Desktop..."
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
    for ($i = 0; $i -lt 30; $i++) {
        try {
            docker info 2>$null | Out-Null
            if ($LASTEXITCODE -eq 0) { $dockerRunning = $true; break }
        } catch {}
        Start-Sleep -Seconds 3
        Write-Host "  Aguardando Docker... ($i/30)" -ForegroundColor DarkGray
    }
}
if (-not $dockerRunning) {
    Write-Err "Docker nao iniciou. Abra o Docker Desktop manualmente e tente novamente."
    exit 1
}
Write-Ok "Docker rodando"

# --- 4. Configurar .env ---
Write-Step "Configurando ambiente (.env)"
$envFile = Join-Path $Root ".env"
if (-not (Test-Path $envFile)) {
    # Gerar chaves seguras automaticamente
    function New-Secret($len) {
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        -join ((1..$len) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    }
    $jwtSecret = New-Secret 64
    $jwtRefresh = New-Secret 64
    $encKey = -join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })

    $content = @"
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://jarvis:jarvis@postgres:5432/jarvis?schema=public
JWT_SECRET=$jwtSecret
JWT_REFRESH_SECRET=$jwtRefresh
ENCRYPTION_KEY=$encKey
CORS_ORIGIN=http://localhost:8080
LOG_LEVEL=info
VERIFY_TOKEN=whatsapp_verify_token_secure_2025
PUBLIC_URL=
POSTGRES_USER=jarvis
POSTGRES_PASSWORD=jarvis
POSTGRES_DB=jarvis
"@
    Set-Content -Path $envFile -Value $content -Encoding UTF8
    Write-Ok ".env criado com chaves seguras geradas automaticamente"
} else {
    Write-Ok ".env ja existe, mantendo configuracao"
}

# --- 5. Subir servicos ---
Write-Step "Subindo servicos JARVIS (Docker Compose)"
Push-Location $Root
docker compose up -d --build
if ($LASTEXITCODE -ne 0) {
    Write-Err "Falha ao subir servicos. Verifique os logs: docker compose logs"
    Pop-Location
    exit 1
}
Write-Ok "Servicos iniciados"

# --- 6. Aguardar backend ---
Write-Step "Aguardando backend ficar pronto"
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
    Start-Sleep -Seconds 2
    if ($i % 5 -eq 0) { Write-Host "  Aguardando... ($i/60)" -ForegroundColor DarkGray }
}
if (-not $ready) {
    Write-Warn "Backend demorou a responder. Verifique: docker compose logs backend"
} else {
    Write-Ok "Backend pronto"
}

# --- 7. Criar atalhos ---
Write-Step "Criando atalhos"
$desktop = [Environment]::GetFolderPath('Desktop')
$startMenu = [Environment]::GetFolderPath('Programs')
$wshell = New-Object -ComObject WScript.Shell

# Atalho para iniciar
$sc = $wshell.CreateShortcut("$desktop\JARVIS BUSINESS AI.lnk")
$sc.TargetPath = "powershell.exe"
$sc.Arguments = "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Root\scripts\start.ps1`""
$sc.WorkingDirectory = $Root
$sc.Description = "Iniciar JARVIS BUSINESS AI"
$sc.Save()
Write-Ok "Atalho criado na area de trabalho"

# Atalho para parar
$sc2 = $wshell.CreateShortcut("$desktop\JARVIS - Parar.lnk")
$sc2.TargetPath = "powershell.exe"
$sc2.Arguments = "-ExecutionPolicy Bypass -Command `"cd '$Root'; docker compose down`""
$sc2.WorkingDirectory = $Root
$sc2.Description = "Parar JARVIS BUSINESS AI"
$sc2.Save()
Write-Ok "Atalho de parada criado"

# --- 8. Abrir navegador ---
Write-Step "Abrindo JARVIS"
Start-Process "http://localhost:8080"
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  JARVIS BUSINESS AI instalado com sucesso!" -ForegroundColor Green
Write-Host "  Acesse: http://localhost:8080" -ForegroundColor Green
Write-Host "  Registre sua conta e conclua o onboarding." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Pop-Location