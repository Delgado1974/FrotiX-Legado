# Script de Validacao de Documentacao
# Verifica se arquivos alterados tem documentacao atualizada

param(
    [switch]$PreCommit = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

# Cores para output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

Write-Info "================================================================"
Write-Info "  Validando Documentacao (Pre-Commit Hook)                    "
Write-Info "================================================================"
Write-Host ""

# Mapeamento de arquivos para documentacoes
$MapeamentoDocs = @{
    # Models
    "Models/.*\.cs$" = "Documentacao/Models/"
    "Models/Cadastros/.*\.cs$" = "Documentacao/Models/Cadastros/"
    "Models/Views/.*\.cs$" = "Documentacao/Models/Views/"
    "Models/Estatisticas/.*\.cs$" = "Documentacao/Models/Estatisticas/"
    "Models/DTO/.*\.cs$" = "Documentacao/Models/DTO/"
    "Models/FontAwesome/.*\.cs$" = "Documentacao/Models/FontAwesome/"
    "Models/Planilhas/.*\.cs$" = "Documentacao/Models/Planilhas/"

    # Controllers
    "Controllers/.*\.cs$" = "Documentacao/Controllers/"

    # Pages
    "Pages/.*\.cshtml$" = "Documentacao/Pages/"
    "Pages/.*\.cshtml\.cs$" = "Documentacao/Pages/"

    # Services
    "Services/.*\.cs$" = "Documentacao/Services/"

    # Helpers
    "Helpers/.*\.cs$" = "Documentacao/Helpers/"

    # Repository
    "Repository/.*\.cs$" = "Documentacao/Repository/"

    # Data
    "Data/.*\.cs$" = "Documentacao/Data/"

    # JavaScript
    "wwwroot/js/.*\.js$" = "Documentacao/JavaScript/"
    "wwwroot/js/cadastros/.*\.js$" = "Documentacao/JavaScript/cadastros/"

    # CSS
    "wwwroot/css/.*\.css$" = "Documentacao/CSS/"
}

# Funcao para encontrar documentacao correspondente
function Get-DocumentacaoPath {
    param([string]$FilePath)

    foreach ($pattern in $MapeamentoDocs.Keys) {
        if ($FilePath -match $pattern) {
            $basePath = $MapeamentoDocs[$pattern]
            $fileName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
            $docPath = Join-Path $basePath "$fileName.md"

            if (Test-Path $docPath) {
                return $docPath
            }
        }
    }

    return $null
}

# Obter arquivos alterados
if ($PreCommit) {
    # Modo pre-commit: verifica arquivos staged
    Write-Info "Modo: Pre-Commit (verificando arquivos staged)"
    $arquivosAlterados = git diff --cached --name-only --diff-filter=ACM
} else {
    # Modo normal: verifica arquivos modificados no working directory
    Write-Info "Modo: Validacao Geral (verificando arquivos modificados)"
    $arquivosAlterados = git diff --name-only --diff-filter=ACM
}

if (-not $arquivosAlterados) {
    Write-Success "OK: Nenhum arquivo alterado encontrado."
    exit 0
}

Write-Info "Arquivos alterados encontrados: $($arquivosAlterados.Count)"
Write-Host ""

$arquivosSemDoc = @()
$arquivosComDocDesatualizada = @()
$arquivosComDocAtualizada = @()

foreach ($arquivo in $arquivosAlterados) {
    # Verificar se e um arquivo que requer documentacao
    $requerDoc = $false
    $tipoArquivo = ""

    if ($arquivo -match "\.(cs|cshtml|js|css)$") {
        $requerDoc = $true

        if ($arquivo -match "\.cs$") { $tipoArquivo = "C#" }
        elseif ($arquivo -match "\.cshtml$") { $tipoArquivo = "Razor Page" }
        elseif ($arquivo -match "\.js$") { $tipoArquivo = "JavaScript" }
        elseif ($arquivo -match "\.css$") { $tipoArquivo = "CSS" }
    }

    if (-not $requerDoc) {
        continue
    }

    $docPath = Get-DocumentacaoPath -FilePath $arquivo

    if (-not $docPath) {
        Write-Warning "AVISO: $arquivo ($tipoArquivo) - SEM DOCUMENTACAO"
        $arquivosSemDoc += $arquivo
    } else {
        # Verificar se documentacao foi atualizada recentemente
        $arquivoModificado = (Get-Item $arquivo).LastWriteTime
        $docModificada = (Get-Item $docPath).LastWriteTime

        # Se documentacao foi modificada apos o arquivo, esta OK
        # Se arquivo foi modificado ha menos de 5 minutos, dar margem
        $diferenca = $docModificada - $arquivoModificado

        if ($diferenca.TotalMinutes -lt -5) {
            Write-Error "ERRO: $arquivo ($tipoArquivo) - DOCUMENTACAO DESATUALIZADA"
            Write-Error "   Arquivo modificado: $($arquivoModificado.ToString('dd/MM/yyyy HH:mm:ss'))"
            Write-Error "   Doc modificada: $($docModificada.ToString('dd/MM/yyyy HH:mm:ss'))"
            Write-Error "   Doc em: $docPath"
            $arquivosComDocDesatualizada += @{
                Arquivo = $arquivo
                Doc = $docPath
                ArquivoModificado = $arquivoModificado
                DocModificada = $docModificada
            }
        } else {
            if ($Verbose) {
                Write-Success "OK: $arquivo ($tipoArquivo) - Documentacao atualizada"
            }
            $arquivosComDocAtualizada += $arquivo
        }
    }
}

Write-Host ""
Write-Info "================================================================"
Write-Info "  RESUMO DA VALIDACAO                                          "
Write-Info "================================================================"
Write-Host ""

Write-Success "OK: Arquivos com documentacao atualizada: $($arquivosComDocAtualizada.Count)"
Write-Warning "AVISO: Arquivos sem documentacao: $($arquivosSemDoc.Count)"
Write-Error "ERRO: Arquivos com documentacao desatualizada: $($arquivosComDocDesatualizada.Count)"

if ($arquivosSemDoc.Count -gt 0) {
    Write-Host ""
    Write-Warning "Arquivos sem documentacao:"
    foreach ($arquivo in $arquivosSemDoc) {
        Write-Warning "  - $arquivo"
    }
}

if ($arquivosComDocDesatualizada.Count -gt 0) {
    Write-Host ""
    Write-Error "!!! ATENCAO: DOCUMENTACAO DESATUALIZADA !!!"
    Write-Host ""
    Write-Error "Os seguintes arquivos foram modificados mas suas documentacoes nao foram atualizadas:"
    Write-Host ""

    foreach ($item in $arquivosComDocDesatualizada) {
        Write-Error "Arquivo: $($item.Arquivo)"
        Write-Error "  Documentacao: $($item.Doc)"
        Write-Error "  Arquivo modificado em: $($item.ArquivoModificado.ToString('dd/MM/yyyy HH:mm:ss'))"
        Write-Error "  Doc modificada em: $($item.DocModificada.ToString('dd/MM/yyyy HH:mm:ss'))"
        Write-Host ""
    }

    Write-Error "ACAO NECESSARIA:"
    Write-Error "   1. Atualize as documentacoes listadas acima"
    Write-Error "   2. Atualize a secao 'PARTE 2: LOG DE MODIFICACOES' em cada documentacao"
    Write-Error "   3. Commite as alteracoes junto com o codigo"
    Write-Host ""

    if ($PreCommit) {
        Write-Host ""
        Write-Error "COMMIT BLOQUEADO: Documentacao desatualizada ou ausente!"
        Write-Host ""
        Write-Error "Por favor:"
        Write-Error "  1. Atualize as documentacoes listadas acima"
        Write-Error "  2. Adicione entrada na secao 'PARTE 2: LOG DE MODIFICACOES'"
        Write-Error "  3. Commite novamente"
        Write-Host ""
        Write-Host "Consulte .claude/Claude.md para diretrizes completas." -ForegroundColor Cyan
        exit 1
    } else {
        Write-Warning "Execute este script novamente apos atualizar as documentacoes"
    }
}

if ($arquivosSemDoc.Count -gt 0 -or $arquivosComDocDesatualizada.Count -gt 0) {
    Write-Host ""
    Write-Host "DICA: Consulte .claude/Claude.md para diretrizes de documentacao" -ForegroundColor Cyan
    exit 1
} else {
    Write-Host ""
    Write-Success "Todas as documentacoes estao atualizadas!"
    exit 0
}
