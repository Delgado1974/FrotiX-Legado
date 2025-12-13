@echo off
REM --- FrotiX Try/Catch Injector: EXECUCAO DIRETA (APLICAR) ---
REM Nao requer parametros. Ajustado para seu caminho.
set "TARGET=D:\FrotiX\_Projeto FrotiXCompleto 2025\FrotiXSite"
set "EXE=D:\FrotiX\_Projeto FrotiXCompleto 2025\FrotiXSite\FxTryCatchInjector.exe"

if not exist "%EXE%" (
  echo ERRO: Nao encontrei o EXE em: "%EXE%"
  echo Copie o FxTryCatchInjector.exe para a pasta raiz do projeto.
  pause
  exit /b 2
)

REM Executa aplicando as mudancas, criando .bak dos .cs alterados
"%EXE%" --dir "%TARGET%" --apply --exclude "*Designer.cs;*.g.cs;*.generated.cs;*AssemblyInfo.cs;*GlobalUsings.g.cs"
set ERR=%ERRORLEVEL%

if %ERR% NEQ 0 (
  echo Falha (cod %ERR%). Veja mensagens acima.
) else (
  echo Concluido com sucesso.
)
pause
exit /b %ERR%
