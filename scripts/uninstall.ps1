# JARVIS BUSINESS AI - Desinstalador
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "=== Desinstalando JARVIS BUSINESS AI ===" -ForegroundColor Cyan
Push-Location $Root
docker compose down -v
Pop-Location

# Remove atalhos
$desktop = [Environment]::GetFolderPath('Desktop')
Remove-Item "$desktop\JARVIS BUSINESS AI.lnk" -ErrorAction SilentlyContinue
Remove-Item "$desktop\JARVIS - Parar.lnk" -ErrorAction SilentlyContinue

Write-Host "Servicos parados e volumes removidos." -ForegroundColor Green
Write-Host "Para remover os arquivos, delete a pasta: $Root" -ForegroundColor Yellow