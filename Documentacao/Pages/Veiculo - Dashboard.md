# Documentação: Dashboard de Veículos

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.2

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Sistema de Abas](#sistema-de-abas)
4. [Tema Visual - Paleta Verde Sage](#tema-visual---paleta-verde-sage)
5. [Filtros e Período](#filtros-e-período)
6. [Indicadores e Métricas](#indicadores-e-métricas)
7. [Gráficos e Visualizações](#gráficos-e-visualizações)
8. [Tabelas de Dados](#tabelas-de-dados)
9. [Endpoints API (Backend)](#endpoints-api-backend)
10. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O **Dashboard de Veículos** é a central de inteligência para gestão da frota. Ele oferece uma visão completa e segmentada em três pilares principais: **Visão Geral** (inventário da frota), **Uso dos Veículos** (viagens e abastecimentos) e **Custos** (análise financeira).

### Características Principais

- ✅ **3 Abas Temáticas**: Visão Geral, Uso dos Veículos e Custos.
- ✅ **Design Temático**: Paleta de cores "Verde Sage" (sálvia) e Oliva, transmitindo robustez e sustentabilidade.
- ✅ **Filtros Avançados**: Filtro por Ano, Mês e Período Personalizado na aba de Uso.
- ✅ **Indicadores KPI**: Cards coloridos com métricas chave (Total Frota, Ativos, Custos, etc.).
- ✅ **Rankings**: Tabelas Top 10 para identificar veículos que mais rodam, mais gastam ou são mais eficientes.
- ✅ **Gráficos Syncfusion**: Visualizações interativas (Pizza, Barras, Área).

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Veiculo/
│       ├── DashboardVeiculos.cshtml         # View Principal (HTML + CSS inline)
│       └── DashboardVeiculos.cshtml.cs      # PageModel (Backend básico)
│
├── Controllers/
│   └── DashboardVeiculosController.cs       # API Controller (Lógica pesada)
│
├── wwwroot/
│   ├── js/
│   │   └── dashboards/
│   │       └── dashboard-veiculos.js        # Lógica Frontend (AJAX, Charts)
│   └── css/
│       └── frotix.css                       # Estilos globais
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Estrutura da página |
| **Syncfusion EJ2 Charts** | Gráficos (Pizza, Área, Coluna) |
| **Bootstrap 5** | Grid System e Responsividade |
| **Font Awesome Duotone** | Ícones |
| **jQuery** | Manipulação do DOM e AJAX |

---

## Sistema de Abas

O dashboard é dividido em 3 contextos distintos, alternados via JavaScript sem recarregar a página.

**Implementação (JS)**:

```javascript
function initTabs()
{
    $('.dash-tab-veic').on('click', function ()
    {
        const tabId = $(this).data('tab');

        // Atualiza classes das abas
        $('.dash-tab-veic').removeClass('active');
        $(this).addClass('active');

        // Mostra conteúdo correto
        $('.dash-content-veic').removeClass('active');
        $(`#tab-${tabId}`).addClass('active');

        // Carrega dados se necessário
        if (tabId === 'uso-veiculos' && !filtrosUsoInicializados)
        {
            inicializarFiltrosUso();
        } else if (tabId === 'custos' && !dadosCustos)
        {
            carregarDadosCustos();
        }
    });
}
```

---

## Tema Visual - Paleta Verde Sage

O dashboard utiliza um tema exclusivo baseado em tons de verde, definido via CSS Variables.

### Variáveis CSS (`DashboardVeiculos.cshtml`)

```css
:root {
    --veic-primary: #5f8575;
    --veic-secondary: #7aa390;
    --veic-accent: #8fb8a4;
    --veic-dark: #4a6b5c;
    --veic-darker: #3a5548;
    --veic-light: #f0f7f4;
    --veic-cream: #e8f2ed;
    --veic-gradient: linear-gradient(135deg, #5f8575 0%, #7aa390 100%);
}
```

---

## Filtros e Período

A aba **Uso dos Veículos** possui um sistema de filtros robusto que tenta adivinhar o contexto mais relevante para o usuário.

**Inicialização Inteligente (`inicializarFiltrosUso`)**:

```javascript
function inicializarFiltrosUso()
{
    mostrarLoading('Carregando estatísticas de uso...');

    // Primeira chamada: obter anos disponíveis
    $.ajax({
        url: '/api/DashboardVeiculos/DashboardUso',
        method: 'GET',
        data: {},
        success: function (data)
        {
            const anos = data.anosDisponiveis || [];

            if (anos.length === 0)
            {
                // ... (tratamento sem dados)
                return;
            }

            // Ano com último registro (primeiro da lista, ordenado desc)
            const anoMaisRecente = anos[0];

            // Preencher select de anos e pré-selecionar o mais recente
            preencherSelectAnos('#filtroAnoUso', anos, anoMaisRecente);
            $('#filtroAnoUso').val(anoMaisRecente.toString());

            // Buscar dados DO ANO MAIS RECENTE para determinar o mês mais recente
            $.ajax({
                url: '/api/DashboardVeiculos/DashboardUso',
                method: 'GET',
                data: { ano: anoMaisRecente },
                success: function (dataAno)
                {
                    let mesSelecionado = '';
                    const viagensPorMes = dataAno.viagensPorMes || [];

                    // Encontrar o último mês com dados (maior número de mês com valor > 0)
                    if (viagensPorMes.length > 0)
                    {
                        const mesesComDados = viagensPorMes
                            .filter(item => item.total > 0)
                            .map(item => item.mes)
                            .sort((a, b) => b - a); // Ordenar decrescente

                        if (mesesComDados.length > 0)
                        {
                            mesSelecionado = mesesComDados[0].toString();
                        }
                    }

                    // Pré-selecionar mês se encontrado
                    if (mesSelecionado)
                    {
                        $('#filtroMesUso').val(mesSelecionado);
                        filtroUsoAtual = { tipo: 'anoMes', ano: anoMaisRecente.toString(), mes: mesSelecionado };
                    } else
                    {
                        filtroUsoAtual = { tipo: 'anoMes', ano: anoMaisRecente.toString(), mes: '' };
                    }

                    // Atualizar label de período
                    atualizarPeriodoAtualLabel();

                    // Carregar dados com filtros aplicados
                    dadosUso = dataAno;
                    filtrosUsoInicializados = true;
                    atualizarCardsUso(dataAno.totais);
                    renderizarGraficosUso(dataAno);
                    renderizarTabelasUso(dataAno);
                    esconderLoading();
                }
            });
        }
    });
}
```

---

## Indicadores e Métricas

Os cards de KPI (Key Performance Indicators) são atualizados dinamicamente via JavaScript.

**HTML dos Cards**:
```html
<div class="card-estatistica-veic sage">
    <div class="icone-card-veic"><i class="fa-duotone fa-cars"></i></div>
    <div class="texto-metrica-veic">Total da Frota</div>
    <div class="valor-metrica-veic" id="totalVeiculos">0</div>
</div>
```

**Atualização JS (`atualizarCardsGerais`)**:

```javascript
function atualizarCardsGerais(totais)
{
    $('#totalVeiculos').text(totais.totalVeiculos.toLocaleString('pt-BR'));
    $('#veiculosAtivos').text(totais.veiculosAtivos.toLocaleString('pt-BR'));
    $('#veiculosInativos').text(totais.veiculosInativos.toLocaleString('pt-BR'));
    $('#veiculosReserva').text(totais.veiculosReserva.toLocaleString('pt-BR'));
    $('#veiculosEfetivos').text(totais.veiculosEfetivos.toLocaleString('pt-BR'));
    $('#veiculosProprios').text(totais.veiculosProprios.toLocaleString('pt-BR'));
    $('#veiculosLocados').text(totais.veiculosLocados.toLocaleString('pt-BR'));
    $('#idadeMedia').text(totais.idadeMedia.toFixed(1) + ' anos');
    $('#valorMensalTotal').text(formatarMoeda(totais.valorMensalTotal));
}
```

---

## Gráficos e Visualizações

Todos os gráficos são renderizados usando a biblioteca **Syncfusion EJ2**.

### Exemplo: Renderização de Gráfico de Pizza (Donut)

```javascript
function renderizarChartPie(containerId, dados, cores = CORES_VEIC.chart)
{
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const chart = new ej.charts.AccumulationChart({
        series: [{
            dataSource: dados,
            xName: 'x',
            yName: 'y',
            innerRadius: '50%',
            palettes: cores,
            dataLabel: {
                visible: true,
                position: 'Outside',
                name: 'x',
                font: { fontWeight: '600', size: '11px' },
                connectorStyle: { length: '10px', type: 'Curve' }
            },
            explode: true,
            explodeOffset: '5%',
            explodeIndex: 0
        }],
        legendSettings: {
            visible: true,
            position: 'Bottom',
            textStyle: { size: '11px' }
        },
        tooltip: {
            enable: true,
            format: '${point.x}: <b>${point.y}</b>'
        },
        background: 'transparent',
        enableSmartLabels: true
    });
    chart.appendTo(container);
}
```

| Aba | Gráfico | Tipo | Descrição |
|-----|---------|------|-----------|
| **Geral** | Por Categoria | Pizza (Donut) | Distribuição da frota |
| **Geral** | Por Status | Pizza (Donut) | Ativos vs Inativos |
| **Geral** | Top 15 Modelos | Barras Horizontais | Modelos mais comuns |
| **Geral** | Idade da Frota | Colunas | Veículos por ano de fabricação |
| **Uso** | Viagens por Mês | Área (Spline) | Evolução temporal de viagens |
| **Uso** | Abastecimento Mensal | Área (Spline) | Evolução de custos de combustível |
| **Custos** | Comparativo Mensal | Colunas Agrupadas | Abastecimento vs Manutenção |

---

## Tabelas de Dados

Tabelas estilizadas com CSS Grid para melhor performance e layout (não usam `<table>` tradicional).

**Estrutura HTML/JS**:

```javascript
// Tabela Top KM
let htmlTopKm = '';
if (data.topKm && data.topKm.length > 0)
{
    data.topKm.forEach((v, i) =>
    {
        const badgeClass = i < 3 ? 'top3' : '';
        htmlTopKm += `
            <div class="grid-row">
                <div class="grid-cell"><span class="badge-rank-veic ${badgeClass}">${i + 1}</span></div>
                <div class="grid-cell">
                    <strong>${v.placa}</strong>
                    <small class="d-block text-muted">${v.modelo}</small>
                </div>
                <div class="grid-cell text-end"><strong>${v.km.toLocaleString('pt-BR')} km</strong></div>
            </div>
        `;
    });
} else
{
    htmlTopKm = '<div class="grid-row"><div class="grid-cell" style="grid-column: span 3; text-align: center;">Nenhum dado encontrado</div></div>';
}
$('#tabelaTopKm').html(htmlTopKm);
```

---

## Endpoints API (Backend)

O controller `DashboardVeiculosController.cs` centraliza a lógica de negócio.

### 1. GET `/api/DashboardVeiculos/DashboardDados`
Retorna dados para a aba **Visão Geral**.

**Lógica (C#)**:

```csharp
[Route("DashboardDados")]
[HttpGet]
public IActionResult DashboardDados()
{
    try
    {
        var veiculos = _unitOfWork.ViewVeiculos.GetAll().ToList();
        var veiculosModel = _unitOfWork.Veiculo.GetAll().ToList();

        // Totais gerais
        var totalVeiculos = veiculos.Count;
        var veiculosAtivos = veiculos.Count(v => v.Status == true);

        // ... (outros totais)

        // Distribuição por categoria
        var porCategoria = veiculos
            .Where(v => !string.IsNullOrEmpty(v.Categoria))
            .GroupBy(v => v.Categoria)
            .Select(g => new
            {
                categoria = g.Key,
                quantidade = g.Count()
            })
            .OrderByDescending(c => c.quantidade)
            .ToList();

        // ... (outros agrupamentos)

        var resultado = new
        {
            totais = new
            {
                totalVeiculos,
                veiculosAtivos,
                // ...
            },
            porCategoria,
            // ...
        };

        return Ok(resultado);
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("DashboardVeiculosController.cs", "DashboardDados", error);
        return StatusCode(500, new { message = "Erro ao carregar dados do dashboard" });
    }
}
```

### 2. GET `/api/DashboardVeiculos/DashboardUso`
Retorna dados para a aba **Uso dos Veículos**.

**Parâmetros**: `ano`, `mes`, `dataInicio`, `dataFim`.

**Lógica de Filtro (C#)**:

```csharp
[Route("DashboardUso")]
[HttpGet]
public IActionResult DashboardUso(int? ano, int? mes, DateTime? dataInicio, DateTime? dataFim)
{
    // Construir query de viagens
    var queryViagens = _unitOfWork.Viagem.GetAll()
        .Where(v => v.DataInicial.HasValue);

    // Construir query de abastecimentos
    var queryAbastecimentos = _unitOfWork.ViewAbastecimentos.GetAll()
        .Where(a => a.DataHora.HasValue);

    // Aplicar filtro por período personalizado (prioridade)
    if (dataInicio.HasValue && dataFim.HasValue)
    {
        var dataFimAjustada = dataFim.Value.Date.AddDays(1).AddSeconds(-1);
        queryViagens = queryViagens.Where(v => v.DataInicial.Value >= dataInicio.Value && v.DataInicial.Value <= dataFimAjustada);
        queryAbastecimentos = queryAbastecimentos.Where(a => a.DataHora.Value >= dataInicio.Value && a.DataHora.Value <= dataFimAjustada);
    }
    // Senão, aplicar filtro por ano/mês
    else
    {
        if (ano.HasValue && ano > 0)
        {
            queryViagens = queryViagens.Where(v => v.DataInicial.Value.Year == ano.Value);
            queryAbastecimentos = queryAbastecimentos.Where(a => a.DataHora.Value.Year == ano.Value);
        }

        if (mes.HasValue && mes > 0)
        {
            queryViagens = queryViagens.Where(v => v.DataInicial.Value.Month == mes.Value);
            queryAbastecimentos = queryAbastecimentos.Where(a => a.DataHora.Value.Month == mes.Value);
        }
    }
    // ...
}
```

---

## Troubleshooting

### Problema: Gráficos não carregam (Espaço em branco)
**Sintoma**: Espaços em branco onde deveriam estar os gráficos.
**Causa**: Scripts do Syncfusion não carregaram ou licença inválida.
**Solução**: Verificar console do navegador por erros de script ou "License validation failed".
```html
<!-- Certifique-se que estes scripts estão carregados em _Layout ou na Section Scripts -->
<script src="https://cdn.syncfusion.com/ej2/23.1.36/ej2-charts/dist/global/ej2-charts.min.js"></script>
```

### Problema: Aba de Uso vazia ou zerada
**Sintoma**: Cards mostram "0" mesmo sabendo que há dados.
**Causa**: O filtro automático pode ter falhado em encontrar o ano recente, ou a API retornou timeout.
**Diagnóstico**: Verificar a chamada AJAX `/api/DashboardVeiculos/DashboardUso` no Network do DevTools. Se retornou 200, verificar o JSON de resposta (`anosDisponiveis`).

### Problema: Loading infinito
**Sintoma**: Overlay "Carregando..." não desaparece.
**Causa**: Erro 500 na API e o callback `error` do AJAX não escondeu o loading ou ocorreu um erro de JS antes.
**Verificação no JS**:
```javascript
error: function (xhr, status, error) {
    console.error('Erro:', error);
    esconderLoading(); // << Esta função deve ser chamada sempre
    mostrarErro('Mensagem');
}
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial do Dashboard de Veículos.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
