# Build / package JARVIS BUSINESS AI for Windows
Write-Host "=== JARVIS BUSINESS AI - Build Windows ===" -ForegroundColor Cyan
$Root = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Verify Docker
try { docker --version | Out-Null } catch { Write-Host "ERRO: Docker nao encontrado." -ForegroundColor Red; exit 1 }

# Build images
Push-Location $Root
docker compose build
if ($LASTEXITCODE -ne 0) { Write-Host "ERRO no build das imagens" -ForegroundColor Red; exit 1 }
Pop-Location

Write-Host "=== Build concluido ===" -ForegroundColor Green
Write-Host "Execute scripts/start.ps1 para iniciar." -ForegroundColor Yellow