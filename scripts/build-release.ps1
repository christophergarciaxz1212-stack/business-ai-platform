# JARVIS BUSINESS AI - Build de release (sem codigo-fonte)
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ReleaseDir = Join-Path $Root "release"
$ImagesDir = Join-Path $ReleaseDir "images"
$ReleaseScripts = Join-Path $Root "scripts\release"

Write-Host "=== Build de release JARVIS ===" -ForegroundColor Cyan

# 1. Limpar release anterior
if (Test-Path $ReleaseDir) { Remove-Item -Recurse -Force $ReleaseDir }
New-Item -ItemType Directory -Force -Path $ImagesDir | Out-Null

# 2. Build das imagens Docker
Push-Location $Root
Write-Host "Buildando imagens Docker..." -ForegroundColor Cyan
docker compose build
if ($LASTEXITCODE -ne 0) { Write-Host "ERRO no build" -ForegroundColor Red; exit 1 }

# 3. Exportar imagens
Write-Host "Exportando imagens..." -ForegroundColor Cyan
docker save -o "$ImagesDir\jarvis-backend.tar" jarvis-business-ai-backend:latest
docker save -o "$ImagesDir\jarvis-frontend.tar" jarvis-business-ai-frontend:latest

# 4. Copiar arquivos de release (sem codigo-fonte)
Copy-Item "$ReleaseScripts\setup.ps1" "$ReleaseDir\setup.ps1" -Force
Copy-Item "$ReleaseScripts\start.ps1" "$ReleaseDir\start.ps1" -Force
Copy-Item "$ReleaseScripts\docker-compose.yml" "$ReleaseDir\docker-compose.yml" -Force
Copy-Item "$Root\.env.example" "$ReleaseDir\.env.example" -Force

Pop-Location
Write-Host ""
Write-Host "=== Release gerado em: $ReleaseDir ===" -ForegroundColor Green
Write-Host "Compartilhe a pasta 'release' (sem codigo-fonte)." -ForegroundColor Yellow