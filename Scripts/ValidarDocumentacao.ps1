# Script de Validação de Documentação
# Verifica se arquivos alterados têm documentação atualizada

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

Write-Info "╔═══════════════════════════════════════════════════════════════╗"
Write-Info "║  Validação de Documentação - FrotiX                          ║"
Write-Info "╚═══════════════════════════════════════════════════════════════╝"
Write-Host ""

# Mapeamento de arquivos para documentações
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

# Função para encontrar documentação correspondente
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
    Write-Info "Modo: Validação Geral (verificando arquivos modificados)"
    $arquivosAlterados = git diff --name-only --diff-filter=ACM
}

if (-not $arquivosAlterados) {
    Write-Success "✅ Nenhum arquivo alterado encontrado."
    exit 0
}

Write-Info "Arquivos alterados encontrados: $($arquivosAlterados.Count)"
Write-Host ""

$arquivosSemDoc = @()
$arquivosComDocDesatualizada = @()
$arquivosComDocAtualizada = @()

foreach ($arquivo in $arquivosAlterados) {
    # Verificar se é um arquivo que requer documentação
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
        Write-Warning "⚠️  $arquivo ($tipoArquivo) - SEM DOCUMENTAÇÃO"
        $arquivosSemDoc += $arquivo
    } else {
        # Verificar se documentação foi atualizada recentemente
        $arquivoModificado = (Get-Item $arquivo).LastWriteTime
        $docModificada = (Get-Item $docPath).LastWriteTime
        
        # Se documentação foi modificada após o arquivo, está OK
        # Se arquivo foi modificado há menos de 5 minutos, dar margem
        $diferenca = $docModificada - $arquivoModificado
        
        if ($diferenca.TotalMinutes -lt -5) {
            Write-Error "❌ $arquivo ($tipoArquivo) - DOCUMENTAÇÃO DESATUALIZADA"
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
                Write-Success "✅ $arquivo ($tipoArquivo) - Documentação atualizada"
            }
            $arquivosComDocAtualizada += $arquivo
        }
    }
}

Write-Host ""
Write-Info "╔═══════════════════════════════════════════════════════════════╗"
Write-Info "║  RESUMO DA VALIDAÇÃO                                          ║"
Write-Info "╚═══════════════════════════════════════════════════════════════╝"
Write-Host ""

Write-Success "✅ Arquivos com documentação atualizada: $($arquivosComDocAtualizada.Count)"
Write-Warning "⚠️  Arquivos sem documentação: $($arquivosSemDoc.Count)"
Write-Error "❌ Arquivos com documentação desatualizada: $($arquivosComDocDesatualizada.Count)"

if ($arquivosSemDoc.Count -gt 0) {
    Write-Host ""
    Write-Warning "Arquivos sem documentação:"
    foreach ($arquivo in $arquivosSemDoc) {
        Write-Warning "  - $arquivo"
    }
}

if ($arquivosComDocDesatualizada.Count -gt 0) {
    Write-Host ""
    Write-Error "⚠️⚠️⚠️  ATENÇÃO: DOCUMENTAÇÃO DESATUALIZADA ⚠️⚠️⚠️"
    Write-Host ""
    Write-Error "Os seguintes arquivos foram modificados mas suas documentações não foram atualizadas:"
    Write-Host ""
    
    foreach ($item in $arquivosComDocDesatualizada) {
        Write-Error "Arquivo: $($item.Arquivo)"
        Write-Error "  Documentação: $($item.Doc)"
        Write-Error "  Arquivo modificado em: $($item.ArquivoModificado.ToString('dd/MM/yyyy HH:mm:ss'))"
        Write-Error "  Doc modificada em: $($item.DocModificada.ToString('dd/MM/yyyy HH:mm:ss'))"
        Write-Host ""
    }
    
    Write-Error "🔴 AÇÃO NECESSÁRIA:"
    Write-Error "   1. Atualize as documentações listadas acima"
    Write-Error "   2. Atualize a seção 'PARTE 2: LOG DE MODIFICAÇÕES' em cada documentação"
    Write-Error "   3. Commite as alterações junto com o código"
    Write-Host ""
    
    if ($PreCommit) {
        Write-Error "🚫 COMMIT BLOQUEADO: Documentação desatualizada detectada!"
        exit 1
    } else {
        Write-Warning "⚠️  Execute este script novamente após atualizar as documentações"
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
