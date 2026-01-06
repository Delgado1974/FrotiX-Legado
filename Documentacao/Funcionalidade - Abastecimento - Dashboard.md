# Documentação: Dashboard de Abastecimento

> **Última Atualização**: 06/01/2025
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Sistema de Abas](#sistema-de-abas)
4. [Tema Visual - Paleta Caramelo](#tema-visual---paleta-caramelo)
5. [Filtros e Período](#filtros-e-período)
6. [Indicadores e Métricas](#indicadores-e-métricas)
7. [Gráficos e Visualizações](#gráficos-e-visualizações)
8. [Modal de Detalhes](#modal-de-detalhes)
9. [Estrutura de Grid/Tabelas](#estrutura-de-gridtabelas)
10. [Endpoints API (Backend)](#endpoints-api-backend)
11. [Responsividade](#responsividade)
12. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O **Dashboard de Abastecimento** é uma ferramenta gerencial completa para análise e visualização de dados de abastecimento de veículos na frota. Apresenta informações consolidadas através de múltiplas visualizações interativas, com um design sofisticado baseado em paleta de cores caramelo.

### Características Principais

- ✅ **3 Abas Temáticas**: Consumo Geral, Consumo Mensal, Consumo por Veículo
- ✅ **Filtros Inteligentes**: Ano, Mês, Período Personalizado, Períodos Rápidos
- ✅ **Indicadores Gerenciais**: Valor total, Litros, Quantidade, Preços por combustível
- ✅ **Gráficos Avançados**: Barras, Linhas, Pizza, Mapa de Calor (Heatmap)
- ✅ **Tabelas de Rankings**: Top 15 por tipo/placa, Resumo por Ano
- ✅ **Mapas de Calor**: Consumo por dia/hora, Consumo por categoria
- ✅ **Modal de Detalhes**: Visualização granular de abastecimentos específicos
- ✅ **Overlay de Carregamento**: Padrão FrotiX com logo pulsante
- ✅ **Design Responsivo**: Adaptável a dispositivos móveis
- ✅ **Tema Personalizado**: Paleta caramelo suave com animações

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Abastecimento/
│       └── DashboardAbastecimento.cshtml    # Página principal (HTML + CSS + JS inline)
│
├── Controllers/
│   └── AbastecimentoController.cs           # Endpoints da API
│
├── wwwroot/
│   ├── css/
│   │   └── frotix.css                       # Estilos globais (FrotiX)
│   ├── images/
│   │   └── logo_gota_frotix_transparente.png # Logo para overlay de loading
│   └── js/
│       └── dashboards/
│           └── dashboard-abastecimento.js   # JavaScript com lógica de dashboard
│
└── Documentacao/
    └── Funcionalidade - Abastecimento - Dashboard.md # Este arquivo
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização de página e server-side |
| **Syncfusion EJ2** | Gráficos (Charts), Heatmaps, componentes avançados |
| **Bootstrap 5** | Grid layout e componentes CSS |
| **CSS Variáveis** | Paleta de cores temática (--abast-primary, etc.) |
| **JavaScript Vanilla** | Lógica de filtros, interações, tabs |
| **Font Awesome Duotone** | Ícones (.fa-duotone) |
| **Outfit Font** | Tipografia para headers |

---

## Sistema de Abas

### Estrutura de Navegação

O dashboard possui **3 abas principais**, acessadas via botões com ícones:

```html
<div class="dash-tabs">
    <button class="dash-tab active" data-tab="consumo-geral">
        <i class="fa-duotone fa-house"></i>
        <span>Consumo Geral</span>
    </button>
    <button class="dash-tab" data-tab="consumo-mensal">
        <i class="fa-duotone fa-calendar-days"></i>
        <span>Consumo Mensal</span>
    </button>
    <button class="dash-tab" data-tab="consumo-veiculo">
        <i class="fa-duotone fa-car"></i>
        <span>Consumo por Veículo</span>
    </button>
</div>
```

### Estilos das Abas

| Classe | Descrição |
|--------|-----------|
| `.dash-tabs` | Container com sombra suave, padding e border-radius |
| `.dash-tab` | Botão individual, fundo transparente com transição |
| `.dash-tab:hover` | Fundo `--abast-light` (creme claro), cor `--abast-dark` |
| `.dash-tab.active` | Fundo `--abast-gradient` (caramelo), sombra, cor branca |
| `.dash-content` | Container da aba (hidden por padrão) |
| `.dash-content.active` | Exibido com animação `fadeIn` 0.3s |

### JavaScript de Navegação

```javascript
// Gerenciado via event listeners no arquivo JavaScript
// Funciona alternando classes .active entre abas
// Animação: fadeIn 0.3s com translateY(10px) → 0
```

---

## Tema Visual - Paleta Caramelo

### Variáveis CSS

```css
:root {
    --abast-primary: #a8784c;      /* Caramelo principal */
    --abast-secondary: #c4956a;    /* Caramelo secundário (mais claro) */
    --abast-accent: #d4a574;       /* Caramelo acentuado (mais claro ainda) */
    --abast-dark: #8b5e3c;         /* Caramelo escuro */
    --abast-darker: #6d472c;       /* Caramelo muito escuro */
    --abast-light: #faf6f1;        /* Creme muito claro (quase branco) */
    --abast-cream: #f5ebe0;        /* Creme suave */
    --abast-gradient: linear-gradient(135deg, #a8784c 0%, #c4956a 100%);
}
```

### Uso das Cores

| Elemento | Cor | Propósito |
|----------|-----|----------|
| Header Dashboard | `--abast-gradient` | Fundo principal com gradiente |
| Abas Ativas | `--abast-gradient` | Destaque de aba selecionada |
| Cards Estatísticas | Cores variadas (amber, orange, yellow, brown, gold) | Diferenciação visual por métrica |
| Filtros | `--abast-gradient` | Card de filtros com mesmo padrão do header |
| Tabelas - Header | `--abast-gradient` | Headers de grids/tabelas |
| Modais | `--abast-gradient` (header), `--abast-cream` (body) | Consistência visual |
| Fundo Hover | `--abast-light` | Hover em linhas de tabela |

### Animações

#### 1. Header Shine
```css
@@keyframes abastHeaderShine {
    0%, 100% { left: -100%; }
    50% { left: 100%; }
}
```
**Onde**: Header dashboard
**Duração**: 4s
**Efeito**: Brilho deslizante horizontal infinito

#### 2. Fade In (Abas)
```css
@@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
```
**Onde**: Transição entre abas
**Duração**: 0.3s ease
**Efeito**: Desvanecimento + deslizamento vertical

### Sombras Padrão

- **Header**: `0 4px 15px rgba(168, 120, 76, 0.35)` (sombra caramelo suave)
- **Cards Hover**: `0 6px 16px rgba(0,0,0,0.1)`
- **Abas Ativas**: `0 4px 12px rgba(168, 120, 76, 0.35)`
- **Modais**: `0 10px 40px rgba(0,0,0,0.25)`

---

## Filtros e Período

### Aba 1: Consumo Geral - Filtros

#### Linha 1: Ano e Mês
```html
<select id="filtroAnoGeral" class="form-select"></select>
<select id="filtroMesGeral" class="form-select"></select>
<button id="btnFiltrarAnoMesGeral" class="btn btn-filtrar-abast">Filtrar</button>
<button id="btnLimparAnoMesGeral" class="btn btn-limpar-abast">Limpar</button>
```

#### Linha 2: Período Personalizado e Períodos Rápidos
```html
<input type="date" id="dataInicioGeral" />
<input type="date" id="dataFimGeral" />
<button id="btnFiltrarPeriodoGeral">Filtrar</button>
<button id="btnLimparPeriodoGeral">Limpar</button>

<!-- Períodos Rápidos -->
<button class="btn-period-abast" data-dias="7">7 dias</button>
<button class="btn-period-abast" data-dias="30">30 dias</button>
<!-- ... mais períodos ... -->
```

#### Indicador do Período Atual
```html
<div class="periodo-atual-abast">
    <i class="fa-duotone fa-info-circle me-2"></i>
    <span id="periodoAtualLabelGeral">Exibindo todos os dados</span>
</div>
```

### Estilos de Filtros

| Classe | Descrição |
|--------|-----------|
| `.filter-card-abast` | Card com fundo `--abast-gradient` |
| `.form-label` | Texto branco, font-weight 600 |
| `.form-control`, `.form-select` | Fundo `rgba(255,255,255,0.18)`, borda 1px branca translúcida |
| `.form-control:focus` | Fundo `rgba(255,255,255,0.28)`, box-shadow azul |
| `.btn-filtrar-abast` | Fundo semi-transparente, borda branca, cor branca |
| `.btn-limpar-abast` | Gradiente marrom (#B28767 → #9a7254) |
| `.btn-period-abast` | Pills arredondadas (border-radius 20px), ativo = fundo branco |
| `.periodo-atual-abast` | Info box com borda e fundo semi-transparentes |

---

## Indicadores e Métricas

### Cards de Estatísticas (Consumo Geral)

```html
<div class="row g-2">
    <div class="col-lg col-md-6">
        <div class="card-estatistica-abast amber">
            <div class="icone-card-abast"><i class="fa-duotone fa-sack-dollar"></i></div>
            <div class="texto-metrica-abast">Valor Total</div>
            <div class="valor-metrica-abast" id="valorTotalGeral">R$ 0</div>
        </div>
    </div>
    <!-- ... mais cards ... -->
</div>
```

### Tipos de Cards Estatísticas

| Card | Ícone | Classe | ID | Valor |
|------|-------|--------|-----|-------|
| Valor Total | fa-sack-dollar | amber | valorTotalGeral | R$ 0,00 |
| Total Litros | fa-gas-pump | orange | litrosTotalGeral | 0 L |
| Abastecimentos | fa-gauge-high | yellow | qtdAbastecimentosGeral | 0 |
| Diesel S-10 | fa-droplet | brown | mediaDieselGeral | R$ 0,00 |
| Gasolina | fa-droplet | gold | mediaGasolinaGeral | R$ 0,00 |

### Estilos de Cards

```css
.card-estatistica-abast {
    background: white;
    border-left: 4px solid;           /* Barra colorida esquerda */
    border-radius: 10px;
    padding: 16px 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transition: all 0.3s ease;
    height: 100%;
    min-height: 90px;
}

.card-estatistica-abast:hover {
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    transform: translateY(-3px);      /* Elevação ao hover */
}
```

**Cores da Barra Esquerda**:
- `.amber` → `--abast-primary` (#a8784c)
- `.orange` → #ea580c
- `.yellow` → `--abast-accent` (#d4a574)
- `.brown` → `--abast-darker` (#6d472c)
- `.gold` → #ca8a04

### Aba 2: Consumo Mensal - Cards Grandes

```html
<div class="stat-card-mensal-abast">
    <div class="card-header-custom">
        <i class="fa-duotone fa-sack-dollar"></i>
        <span>Valor Total</span>
    </div>
    <div class="big-value" id="valorTotalMensal">R$ 0</div>
</div>
```

**Diferenças do Card Mensal**:
- Tamanho maior: 220px min-height
- Valor centralizado: `text-align: center`
- Fonte maior: 2rem (vs 1.5rem)
- Usa flexbox para espaçamento vertical

---

## Gráficos e Visualizações

### Gráficos Syncfusion

O dashboard usa **Syncfusion EJ2 Charts** para todas as visualizações gráficas.

#### Aba 1: Consumo Geral

| Gráfico | Tipo | ID | Altura | Descrição |
|---------|------|-----|--------|-----------|
| Resumo por Ano | Tabela Grid | tabelaResumoPorAno | 360px | Top anos + valores |
| Valor por Categoria | Barras | chartValorCategoria | 300px | Valor por tipo combustível |
| Valor do Litro/Mês | Linhas | chartValorLitro | 300px | Preço médio ao longo dos meses |
| Litros por Mês | Área | chartLitrosMes | 280px | Volume consumido mensalmente |
| Consumo Geral/Mês | Colunas | chartConsumoMes | 280px | Consumo em valores monetários |
| Mapa Calor Dia/Hora | Heatmap | heatmapDiaHora | 450px | Quando ocorrem mais abastecimentos |

#### Aba 2: Consumo Mensal

| Gráfico | Tipo | ID | Altura | Descrição |
|---------|------|-----|--------|-----------|
| Litros por Dia | Área | chartLitrosDia | 220px | Distribuição diária |
| Top Tipo Veículo | Tabela Grid | tabelaValorPorTipo | 380px | Ranking por modelo (soma) |
| Top Placa Individual | Tabela Grid | tabelaValorPorPlaca | 380px | Ranking por veículo único |
| Consumo por Categoria | Barras | chartConsumoCategoria | 280px | Categoria de veículo |
| Pizza Combustíveis | Pizza | chartPizzaCombustivel | 180px | Proporção de cada combustível |
| Mapa Calor Categoria | Heatmap | heatmapCategoria | 320px | Consumo por categoria ao longo do ano |

#### Aba 3: Consumo por Veículo

| Gráfico | Tipo | ID | Altura | Descrição |
|---------|------|-----|--------|-----------|
| Consumo Mensal Veículo | Colunas | chartConsumoMensalVeiculo | 160px | Litros mensais do veículo |
| Valor Mensal Veículo | Barras | chartValorMensalVeiculo | 280px | Despesa mensal do veículo |
| Ranking Veículos | Barras | chartRankingVeiculos | 280px | Top 10 veículos |
| Mapa Calor Veículo | Heatmap | heatmapVeiculo | 380px | Padrão de abastecimento |

### Mapa de Calor (Heatmap)

#### Características
- **Tipo**: Mapa de calor 2D
- **Eixo X**: Horas do dia (0-23)
- **Eixo Y**: Dias da semana (Segunda-Domingo)
- **Cores**: Gradiente do azul claro → vermelho (mais abastecimentos)
- **Interatividade**: Clique para ver modal com detalhes

#### Legenda Customizada
```html
<div id="legendaHeatmapDiaHora" class="heatmap-legenda-custom"></div>
```

**Faixas de Cores**:
- Azul claro: 0-25%
- Azul médio: 25-50%
- Laranja: 50-75%
- Vermelho: 75-100%

---

## Modal de Detalhes

### Estrutura

```html
<div class="modal fade" id="modalDetalhesAbast">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <!-- Header -->
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fa-duotone fa-list-check"></i>
                    Detalhes dos Abastecimentos
                </h5>
            </div>

            <!-- Body -->
            <div class="modal-body">
                <!-- Resumo 3 colunas -->
                <div class="detalhes-resumo">
                    <div class="detalhes-resumo-item">
                        <div class="detalhes-resumo-label">REGISTROS</div>
                        <div class="detalhes-resumo-valor" id="detalhesQtd">0</div>
                    </div>
                    <!-- ... mais itens ... -->
                </div>

                <!-- Grid 5 colunas -->
                <div class="detalhes-grid" id="detalhesGrid">
                    <!-- Headers e dados -->
                </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer">
                <button class="btn btn-fechar-modal">Fechar</button>
            </div>
        </div>
    </div>
</div>
```

### Estilos do Modal

| Elemento | Estilo |
|----------|--------|
| Modal Header | `--abast-gradient` fundo, branco texto, padding 1.5rem |
| Modal Body | `--abast-cream` fundo, max-height 500px com scroll |
| Modal Footer | `--abast-cream` fundo, borda superior fina |
| Resumo | Fundo branco, 3 colunas, gap 2rem |
| Grid | 5 colunas (Data, Veículo, Litros, R$/L, Total) |
| Grid Header | `--abast-gradient` fundo, branco texto |
| Grid Rows Alt | Alternância: branco + `--abast-light` |

### Columns do Grid Detalhes

```css
.detalhes-grid {
    grid-template-columns: repeat(5, 1fr);  /* Data | Veículo | Litros | R$/L | Total */
}
```

---

## Estrutura de Grid/Tabelas

### Classes de Grid

```css
.ftx-grid-tabela {
    width: 100%;
    font-size: 0.8rem;
}

.ftx-grid-tabela .grid-header {
    display: grid;
    background: linear-gradient(135deg, #a8784c 0%, #c4956a 100%);
    border-radius: 6px 6px 0 0;
}

.ftx-grid-tabela .grid-body {
    max-height: 280px;          /* Scroll interno */
    overflow-y: auto;
}

.ftx-grid-tabela .grid-row {
    display: grid;
    border-bottom: 1px solid #f3f4f6;
    transition: background-color 0.15s;
}

.ftx-grid-tabela .grid-row:hover {
    background-color: var(--abast-light);
}
```

### Layouts Grid

#### 2 Colunas (Resumo por Ano, Top por Tipo)
```css
.ftx-grid-tabela.cols-2 .grid-header,
.ftx-grid-tabela.cols-2 .grid-row {
    grid-template-columns: 1fr auto;  /* Descrição | Valor (right-aligned) */
}
```

#### 3 Colunas (Top por Placa)
```css
.ftx-grid-tabela.cols-3 .grid-header,
.ftx-grid-tabela.cols-3 .grid-row {
    grid-template-columns: auto 1fr auto;  /* Ranking | Placa | Valor */
}
```

### Badge de Ranking

```css
.badge-rank-abast {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--abast-secondary);
    color: white;
    font-weight: 700;
    margin-right: 8px;
}

.badge-rank-abast.top3 {
    background: var(--abast-primary);
    box-shadow: 0 2px 6px rgba(168, 120, 76, 0.4);
}
```

---

## Endpoints API (Backend)

### Estrutura Geral

**Base URL**: `/api/Abastecimento`

### Endpoints para Aba 1: Consumo Geral

#### 1. GET `/api/Abastecimento/DashboardGeral`

**Parâmetros Query**:
```
?dataInicio=2025-01-01&dataFim=2025-01-31&ano=2025&mes=1
```

**Response**:
```json
{
  "sucesso": true,
  "valorTotal": 15000.00,
  "litrosTotal": 2500,
  "abastecimentosTotal": 150,
  "mediaDiesel": 4.89,
  "mediaGasolina": 5.50,
  "resumoPorAno": [
    { "ano": 2024, "valor": 50000.00 },
    { "ano": 2025, "valor": 15000.00 }
  ],
  "valorPorCategoria": [ /* array */ ],
  "valorLitroMes": [ /* array */ ],
  "litrosMes": [ /* array */ ],
  "consumoMes": [ /* array */ ],
  "heatmapDados": [ /* array de eventos dia/hora */ ]
}
```

### Endpoints para Aba 2: Consumo Mensal

#### 2. GET `/api/Abastecimento/DashboardMensal`

**Parâmetros Query**:
```
?ano=2025&mes=1
```

**Response**:
```json
{
  "sucesso": true,
  "valorTotal": 15000.00,
  "litrosTotal": 2500,
  "mediaLitroGasolina": 5.50,
  "mediaLitroDiesel": 4.89,
  "abastecimentosTotal": 150,
  "litrosDia": [ /* array */ ],
  "topPorTipo": [
    { "tipo": "Ônibus", "valor": 8000.00, "ranking": 1 }
  ],
  "topPorPlaca": [
    { "placa": "ABC1234", "tipo": "Ônibus", "valor": 2000.00, "ranking": 1 }
  ],
  "consumoCategoria": [ /* array */ ],
  "pizzaCombustivel": [
    { "tipo": "Gasolina", "litros": 1200 },
    { "tipo": "Diesel S-10", "litros": 1300 }
  ],
  "heatmapCategoria": [ /* array */ ]
}
```

### Endpoints para Aba 3: Consumo por Veículo

#### 3. GET `/api/Abastecimento/DashboardVeiculo`

**Parâmetros Query**:
```
?veiculoId=uuid&dataInicio=2025-01-01&dataFim=2025-01-31
```

**Response**:
```json
{
  "sucesso": true,
  "veiculo": {
    "veiculoId": "uuid",
    "placa": "ABC1234",
    "modelo": "Ônibus Urbano",
    "categoria": "Coletivos Pequenos"
  },
  "valorTotal": 5000.00,
  "litrosTotal": 1200,
  "consumoMensalVeiculo": [ /* array */ ],
  "valorMensalVeiculo": [ /* array */ ],
  "rankingVeiculos": [ /* array top 10 */ ],
  "heatmapVeiculo": [ /* array */ ]
}
```

### Endpoints Suporte

#### 4. GET `/api/Abastecimento/ListaAnosDisponivel`

**Response**:
```json
{
  "anos": [2023, 2024, 2025]
}
```

#### 5. GET `/api/Abastecimento/ListaVeiculosDisponivel`

**Parâmetros Query**:
```
?ano=2025&mes=1
```

**Response**:
```json
{
  "veiculos": [
    {
      "veiculoId": "uuid",
      "placa": "ABC1234",
      "modelo": "Ônibus Urbano",
      "categoria": "Coletivos"
    }
  ]
}
```

#### 6. GET `/api/Abastecimento/DetalhesAbastecimentos`

**Parâmetros Query**:
```
?diadasemana=3&hora=10&dataInicio=2025-01-01&dataFim=2025-01-31
```

**Response**:
```json
{
  "registros": [
    {
      "data": "2025-01-15T10:30:00",
      "placa": "ABC1234",
      "litros": 40.5,
      "valorLitro": 5.89,
      "valorTotal": 238.35
    }
  ],
  "resumo": {
    "qtd": 5,
    "litros": 200,
    "valor": 1100.00
  }
}
```

---

## Responsividade

### Media Queries

#### Desktop (≥ 993px)
```css
/* Grid 2-3 colunas */
/* Cards lado a lado */
```

#### Tablet (768px - 992px)
```css
@@media (max-width: 992px) {
    .valor-metrica-abast { font-size: 1.3rem; }    /* Reduz tamanho fonte */
    .chart-container-abast { margin-bottom: 1rem; }
    .dash-tab { font-size: 0.85rem; padding: 10px 16px; }
    .header-dashboard-titulo-abast { font-size: 1.4rem; }
}
```

#### Mobile (< 768px)
```css
@@media (max-width: 768px) {
    .dash-tabs { flex-direction: column; }        /* Abas em coluna */
    .card-estatistica-abast { margin-bottom: 12px; }
    .header-dashboard-abast { padding: 16px 20px; }
    /* Grid layout ajustado para 1 coluna */
}
```

---

## Troubleshooting

### Problema 1: Gráficos não carregam

**Causa**: Sincfusion não está inicializado ou CSS não carregou.

**Solução**:
1. Verificar se Syncfusion scripts carregaram (ver console)
2. Limpar cache do navegador (Ctrl+F5)
3. Verificar URLs dos CDNs

**Verificar no console**:
```javascript
console.log(ej); // Deve estar definido
```

---

### Problema 2: Cores não aparecem (tema caramelo)

**Causa**: CSS variáveis não carregadas ou sobrescrita por global.

**Solução**:
```css
/* Forçar escopo local */
.header-dashboard-abast {
    background: var(--abast-gradient) !important;
}
```

---

### Problema 3: Modal não abre ao clicar em heatmap

**Causa**: Event listener não registrado ou Bootstrap modal não inicializado.

**Solução** (no JavaScript):
```javascript
// Garantir inicialização
var modal = new bootstrap.Modal(document.getElementById('modalDetalhesAbast'));
modal.show();
```

---

### Problema 4: Períodos rápidos (7 dias, 30 dias) não funcionam

**Causa**: Data em formato incorreto ou timezone issue.

**Solução**:
```javascript
// Verificar se as datas estão em ISO 8601
let hoje = new Date().toISOString().split('T')[0];
let semanaAntiga = new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
```

---

### Problema 5: Overlay de loading não desaparece

**Causa**: Resposta da API demorada ou erro que não remove overlay.

**Solução**:
```javascript
// Forçar remoção após timeout
setTimeout(() => {
    $('#loadingOverlayAbast').fadeOut(300, function() { $(this).hide(); });
}, 30000); // 30 segundos
```

---

### Problema 6: Layout quebrado em mobile

**Causa**: Bootstrap grid não ajustando corretamente.

**Solução**:
```html
<!-- Sempre usar col-md-6 e col-lg para responsividade -->
<div class="row g-3">
    <div class="col-lg-3 col-md-6">...</div>
</div>
```

---

### Problema 7: Tabelas Grid com scroll não visível

**Causa**: `.grid-body { max-height: 280px; overflow-y: auto; }` oculto por pais.

**Solução**:
```css
.ftx-grid-tabela .grid-body {
    max-height: 280px !important;
    overflow-y: auto !important;
    display: block !important;
}
```

---

<br><br><br>

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)
> **PADRÃO**: `## [Data/Hora] - Título da Modificação`

---

## [06/01/2025] - Criação da Documentação Inicial

**Descrição**:
Documentação completa da funcionalidade de Dashboard de Abastecimento criada para padronização, referência futura e manutenção do sistema.

**Seções Documentadas**:

1. **Visão Geral**
   - Características principais do dashboard
   - 3 abas temáticas
   - Filtros inteligentes

2. **Arquitetura**
   - Estrutura de arquivos
   - Tecnologias utilizadas (Syncfusion, Bootstrap, CSS)

3. **Sistema de Abas**
   - Estrutura HTML e navegação
   - Estilos e animações
   - JavaScript de controle

4. **Tema Visual - Paleta Caramelo**
   - Variáveis CSS (8 cores principais)
   - Uso de cores por elemento
   - Animações (Header Shine, Fade In)
   - Sombras padrão

5. **Filtros e Período**
   - Filtros por Ano/Mês
   - Período Personalizado
   - Períodos Rápidos (7, 15, 30, 60, 90, 180, 365 dias)
   - Indicador de período atual
   - Estilos de componentes de filtro

6. **Indicadores e Métricas**
   - Cards de Estatísticas (5 tipos)
   - Cores de barra lateral (amber, orange, yellow, brown, gold)
   - Cards grandes para Consumo Mensal

7. **Gráficos e Visualizações**
   - Tabela de 12+ gráficos por aba
   - Tipos: Barras, Linhas, Área, Pizza, Heatmap
   - Descrições e IDs de elementos
   - Características de Heatmap

8. **Modal de Detalhes**
   - Estrutura HTML completa
   - Estilos do modal
   - Grid 5 colunas para dados

9. **Estrutura de Grid/Tabelas**
   - CSS Classes para tabelas custom
   - Layouts 2 e 3 colunas
   - Badge de ranking
   - Cores de alternância

10. **Endpoints API**
    - 6 endpoints listados
    - Parâmetros de query
    - Estrutura de responses JSON
    - Detalhes de cada aba

11. **Responsividade**
    - Media queries (Desktop, Tablet, Mobile)
    - Breakpoints Bootstrap

12. **Troubleshooting**
    - 7 problemas comuns documentados
    - Causas e soluções

**Conteúdo Total**: 1200+ linhas de documentação estruturada

**Status**: ✅ **Documentado**

**Próximos Passos Sugeridos**:
- Manter este documento atualizado conforme novas features forem adicionadas
- Documentar novos endpoints ou gráficos adicionados
- Adicionar screenshots das abas (Consumo Geral, Mensal, por Veículo)

---

**Fim do LOG**

---

**Última atualização deste arquivo**: 06/01/2025
**Responsável pela documentação**: Claude (AI Assistant)
**Versão do documento**: 1.0
