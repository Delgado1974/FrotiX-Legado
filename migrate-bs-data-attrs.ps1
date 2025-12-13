<#
.SYNOPSIS
  Migra atributos Bootstrap 4 -> 5 em arquivos .cshtml:
  data-toggle -> data-bs-toggle
  data-target -> data-bs-target
  (opcional) outros: data-dismiss, data-parent, data-ride, data-slide, etc.

.PARAMETER Root
  Pasta raiz onde procurar arquivos.

.PARAMETER Include
  Padrões de arquivo (default: *.cshtml).

.PARAMETER Exclude
  Padrões para excluir.

.PARAMETER DryRun
  Mostra o que seria alterado (padrío: $true). Use -DryRun:$false para aplicar.

.PARAMETER Extended
  Aplica mapeamentos estendidos (além de toggle/target), ex.: data-dismiss -> data-bs-dismiss, etc.

.PARAMETER Backup
  Cria backup por arquivo antes de gravar (padrío: $true).

.PARAMETER MaxExamples
  Quantas linhas de exemplo mostrar por arquivo no DryRun.

.EXAMPLE
  .\migrate-bs-data-attrs.ps1 -Root "D:\MeuProjeto" -DryRun

.EXAMPLE
  .\migrate-bs-data-attrs.ps1 -Root "D:\MeuProjeto" -DryRun:$false -Extended
#>

param(
  [string]$Root = ".",
  [string[]]$Include = @("*.cshtml"),
  [string[]]$Exclude = @(),
  [switch]$DryRun = $true,
  [switch]$Extended = $false,
  [switch]$Backup = $true,
  [int]$MaxExamples = 3
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function New-Stamp { (Get-Date).ToString("yyyyMMdd-HHmmss") }

# --- Mapas de substituição ---
# Somente renomeio de atributo (não mexo no valor).
# Uso \b para não pegar "data-bs-toggle" etc.
$coreMap = @(
  @{ Pattern = '\bdata-toggle\b';  Replace = 'data-bs-toggle';  Note='toggle'  },
  @{ Pattern = '\bdata-target\b';  Replace = 'data-bs-target';  Note='target'  }
)

$extendedMap = @(
  @{ Pattern = '\bdata-dismiss\b';    Replace = 'data-bs-dismiss';    Note='dismiss' },
  @{ Pattern = '\bdata-parent\b';     Replace = 'data-bs-parent';     Note='parent'  },
  @{ Pattern = '\bdata-ride\b';       Replace = 'data-bs-ride';       Note='ride'    },
  @{ Pattern = '\bdata-slide-to\b';   Replace = 'data-bs-slide-to';   Note='slide-to'},
  @{ Pattern = '\bdata-slide\b';      Replace = 'data-bs-slide';      Note='slide'   },
  @{ Pattern = '\bdata-interval\b';   Replace = 'data-bs-interval';   Note='interval'},
  @{ Pattern = '\bdata-keyboard\b';   Replace = 'data-bs-keyboard';   Note='keyboard'},
  @{ Pattern = '\bdata-backdrop\b';   Replace = 'data-bs-backdrop';   Note='backdrop'},
  # Tooltips / Popovers (se você usa via data-attrs)
  @{ Pattern = '\bdata-placement\b';  Replace = 'data-bs-placement';  Note='placement'},
  @{ Pattern = '\bdata-container\b';  Replace = 'data-bs-container';  Note='container'},
  @{ Pattern = '\bdata-animation\b';  Replace = 'data-bs-animation';  Note='animation'},
  @{ Pattern = '\bdata-delay\b';      Replace = 'data-bs-delay';      Note='delay'    },
  @{ Pattern = '\bdata-html\b';       Replace = 'data-bs-html';       Note='html'     },
  @{ Pattern = '\bdata-boundary\b';   Replace = 'data-bs-boundary';   Note='boundary' },
  @{ Pattern = '\bdata-content\b';    Replace = 'data-bs-content';    Note='content'  },
  @{ Pattern = '\bdata-title\b';      Replace = 'data-bs-title';      Note='title'    }
)

# >>> FIX: achatar os mapas (flat), nada de array aninhado
$maps = @()
$maps += $coreMap
if ($Extended) { $maps += $extendedMap }

# --- coleta de arquivos ---
$files = Get-ChildItem -LiteralPath $Root -Recurse -File -Include $Include -ErrorAction Stop |
  Where-Object {
    if ($Exclude.Count -gt 0) {
      foreach ($ex in $Exclude) { if ($_.FullName -like "*$ex*") { return $false } }
    }
    return $true
  }

if (!$files) {
  Write-Host "[info] Nenhum arquivo encontrado em '$Root' com Include=$($Include -join ', ')" -ForegroundColor Yellow
  exit 0
}

[int]$totalFilesChanged = 0
[int]$totalReplacements = 0
$stamp = New-Stamp

foreach ($f in $files) {
  $original = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8
  $content  = $original
  $countsPerFile = @{}

  # >>> FIX: iterar diretamente em $maps
  foreach ($m in $maps) {
    $pattern = $m.Pattern
    $replace = $m.Replace
    $note    = $m.Note

    $matches = [System.Text.RegularExpressions.Regex]::Matches($content, $pattern)
    $n = $matches.Count
    if ($n -gt 0) {
      $countsPerFile[$note] = $n
      # aplicar substituição
      $content = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, $replace)
    }
  }

  if ($content -ne $original) {
    $changed = $true
    $totalFilesChanged++
    $fileRepl = ($countsPerFile.Keys | ForEach-Object { "$_=$($countsPerFile[$_])" }) -join ", "
    Write-Host "[change] $($f.FullName)" -ForegroundColor Cyan
    Write-Host "         -> $fileRepl" -ForegroundColor DarkCyan

    if ($DryRun) {
      # exemplos (linhas) – pega as primeiras ocorrências por padrío
      $examples = 0
      foreach ($m in $maps) {  # >>> FIX: aqui também
        if ($examples -ge $MaxExamples) { break }
        $pattern = $m.Pattern
        $sel = Select-String -Path $f.FullName -Pattern $pattern -CaseSensitive:$false | Select-Object -First 1
        if ($sel) {
          Write-Host ("         ex: {0}:{1}:  {2}" -f $sel.Path, $sel.LineNumber, ($sel.Line.Trim())) -ForegroundColor DarkGray
          $examples++
        }
      }
    }
    else {
      if ($Backup) {
        $bak = "$($f.FullName).bak_bs4to5_$stamp"
        Copy-Item -LiteralPath $f.FullName -Destination $bak -Force
      }
      Set-Content -LiteralPath $f.FullName -Value $content -Encoding UTF8
      $repCount = 0; foreach($k in $countsPerFile.Keys){ $repCount += $countsPerFile[$k] }
      $totalReplacements += $repCount
    }
  }
}

Write-Host ""
if ($DryRun) {
  Write-Host "[dry-run] Arquivos que seriam alterados: $totalFilesChanged" -ForegroundColor Yellow
  Write-Host "          Para aplicar, rode novamente com: -DryRun:`$false" -ForegroundColor Yellow
} else {
  Write-Host "[done] Arquivos alterados: $totalFilesChanged | Substituições totais: $totalReplacements" -ForegroundColor Green
  if ($Backup) { Write-Host "       Backups: *.bak_bs4to5_$stamp (ao lado dos arquivos originais)" -ForegroundColor Green }
}
