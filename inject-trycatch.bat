
@echo off
setlocal ENABLEEXTENSIONS
REM FrotiX Try/Catch Injector runner
REM Uso: inject-trycatch.bat "D:\src\FrotiX.Web" [--preview]
set TARGET=%~1
if "%TARGET%"=="" (
  echo Uso: %~nx0 "CAMINHO_DO_PROJETO_ASPNETCORE" [--preview]
  exit /b 1
)
set PREVIEW=false
if /I "%~2"=="--preview" set PREVIEW=true

REM Ajuste a linha abaixo para o caminho onde voce colocou o EXE
set EXE=%~dp0FxTryCatchInjector.exe

if not exist "%EXE%" (
  echo ERRO: Nao encontrei o EXE em "%EXE%".
  echo Coloque o FxTryCatchInjector.exe ao lado deste .BAT.
  exit /b 2
)

"%EXE%" --dir "%TARGET%" --dry-run %PREVIEW% --exclude "*Designer.cs;*.g.cs;*.generated.cs;*AssemblyInfo.cs;*GlobalUsings.g.cs"
exit /b %ERRORLEVEL%
