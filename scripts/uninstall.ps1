# BUSINESS AI - Desinstalador
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "=== Desinstalando BUSINESS AI ===" -ForegroundColor Cyan
Push-Location $Root
docker compose down -v
Pop-Location

# Remove atalhos
$desktop = [Environment]::GetFolderPath('Desktop')
Remove-Item "$desktop\BUSINESS AI.lnk" -ErrorAction SilentlyContinue
Remove-Item "$desktop\BusinessAI - Parar.lnk" -ErrorAction SilentlyContinue

Write-Host "Servicos parados e volumes removidos." -ForegroundColor Green
Write-Host "Para remover os arquivos, delete a pasta: $Root" -ForegroundColor Yellow