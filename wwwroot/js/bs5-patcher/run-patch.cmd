@echo off
setlocal
cd /d %~dp0
echo [run] Instalando dependencias (bootstrap 5)...
npm install --no-audit --no-fund
if errorlevel 1 goto :err

echo [run] Aplicando patch (remover BS4 e injetar BS5)...
npm run patch
if errorlevel 1 goto :err

echo [run] Verificando que nao ha traços de BS4...
npm run verify
if errorlevel 1 goto :err

echo.
echo [SUCESSO] vendors.bundle.bs5.js gerado e verificado.
echo Local:
echo   D:\_Projeto FrotiXCompleto 2025\FrotiXSite.New\wwwroot\js\vendors.bundle.bs5.js
echo.
pause
exit /b 0

:err
echo.
echo [ERRO] O processo falhou. Veja as mensagens acima.
pause
exit /b 1
