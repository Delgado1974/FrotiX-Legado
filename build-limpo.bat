# Criar conteúdo do script build-limpo.bat com limpeza + restore + inicia Visual Studio com Debug.Start

bat_script = """@echo off
echo 🔄 Limpando pastas bin e obj...

for /d /r %%i in (bin obj) do (
    if exist "%%i" (
        echo Apagando %%i...
        rmdir /s /q "%%i"
    )
)

echo ✅ Restaurando pacotes NuGet...
dotnet restore

echo ▶ Iniciando projeto no modo Depuração (IIS Express)...

:: Abre a solução atual no Visual Studio com o comando Debug.Start
start "" "%ProgramFiles%\\Microsoft Visual Studio\\2022\\Preview\\Common7\\IDE\\devenv.exe" "%~dp0FrotiX.sln" /Command "Debug.Start"

exit
"""

bat_path = "/mnt/data/build-limpo.bat"
with open(bat_path, "w", encoding="utf-8") as f:
    f.write(bat_script)

bat_path