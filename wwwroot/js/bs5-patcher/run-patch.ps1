# Executar com:  clique direito > Run with PowerShell  (ou via terminal)
$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

Write-Host "[run] Instalando dependencias (bootstrap 5)..." -ForegroundColor Cyan
npm install --no-audit --no-fund

Write-Host "[run] Aplicando patch (remover BS4 e injetar BS5)..." -ForegroundColor Cyan
npm run patch

Write-Host "[run] Verificando que nao ha traços de BS4..." -ForegroundColor Cyan
npm run verify

Write-Host ""
Write-Host "[SUCESSO] vendors.bundle.bs5.js gerado e verificado." -ForegroundColor Green
Write-Host "Local:"
Write-Host "  D:\_Projeto FrotiXCompleto 2025\FrotiXSite.New\wwwroot\js\vendors.bundle.bs5.js"
