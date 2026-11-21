# BUSINESS AI - Launcher (Windows)
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Check Docker
try {
    docker --version | Out-Null
} catch {
    Write-Host "Docker nao encontrado. Instale o Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Red
    Start-Process "https://www.docker.com/products/docker-desktop/"
    exit 1
}

# Ensure .env exists
if (-not (Test-Path "$Root\.env")) {
    Copy-Item "$Root\.env.example" "$Root\.env"
    Write-Host "Arquivo .env criado. Edite as chaves JWT/ENCRYPTION antes de continuar." -ForegroundColor Yellow
}

Push-Location $Root
Write-Host "Subindo servicos BusinessAI..." -ForegroundColor Cyan
docker compose up -d --build
if ($LASTEXITCODE -ne 0) { Write-Host "Falha ao subir servicos." -ForegroundColor Red; exit 1 }

Write-Host "Aguardando backend..." -ForegroundColor Cyan
for ($i=0; $i -lt 30; $i++) {
    try { Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 2 | Out-Null; break } catch { Start-Sleep -Seconds 2 }
}

Write-Host "BusinessAI disponivel em http://localhost:8080" -ForegroundColor Green
Start-Process "http://localhost:8080"
Pop-Location