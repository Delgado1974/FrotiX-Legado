# Documentação: Dashboard de Veículos

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

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

1. **Visão Geral**:
   - Foco: Inventário.
   - Dados: Quantidade de veículos, distribuição por categoria, status, idade da frota.
   - Carregamento: Automático ao abrir a página.

2. **Uso dos Veículos**:
   - Foco: Operacional.
   - Dados: Viagens realizadas, KM rodado, litros abastecidos.
   - Carregamento: Sob demanda (Lazy Load) ao clicar na aba.

3. **Custos**:
   - Foco: Financeiro.
   - Dados: Custo de abastecimento vs Manutenção.
   - Carregamento: Sob demanda (Lazy Load) ao clicar na aba.

---

## Tema Visual - Paleta Verde Sage

O dashboard utiliza um tema exclusivo baseado em tons de verde, definido via CSS Variables.

### Variáveis CSS

```css
:root {
    --veic-primary: #5f8575;      /* Verde Sage Principal */
    --veic-secondary: #7aa390;    /* Sage Claro */
    --veic-accent: #8fb8a4;       /* Acento */
    --veic-dark: #4a6b5c;         /* Verde Escuro */
    --veic-darker: #3a5548;       /* Verde Oliva Escuro */
    --veic-light: #f0f7f4;        /* Fundo Claro */
    --veic-cream: #e8f2ed;        /* Creme Esverdeado */
    --veic-gradient: linear-gradient(135deg, #5f8575 0%, #7aa390 100%);
}
```

### Identidade Visual
- **Header**: Gradiente com animação *shine* (brilho passando).
- **Cards KPI**: Borda lateral colorida indicando a categoria da métrica (Sage, Olive, Mint, Teal, Amber).
- **Gráficos**: Paleta de cores harmonizada com o tema.

---

## Filtros e Período

A aba **Uso dos Veículos** possui um sistema de filtros robusto:

1. **Filtro de Ano/Mês**:
   - Dropdown de Ano carregado dinamicamente com base nos dados.
   - Seleção inteligente: Tenta pré-selecionar o ano e mês mais recentes com dados.

2. **Período Personalizado**:
   - Seleção de Data Início e Fim.
   - Botões de "Períodos Rápidos": 7, 15, 30, 60, 90, 180, 365 dias.

3. **Indicador de Contexto**:
   - Um box informativo mostra qual filtro está ativo no momento (ex: "Período: Junho/2025").

---

## Indicadores e Métricas

### Aba 1: Visão Geral
- **Total da Frota**: Contagem absoluta.
- **Ativos/Inativos**: Saúde da frota.
- **Reserva/Efetivos**: Disponibilidade operacional.
- **Idade Média**: Média em anos (Ano Atual - Ano Fabricação).

### Aba 2: Uso
- **Total de Viagens**: Contagem de viagens no período.
- **KM Rodado**: Soma da diferença (Km Final - Km Inicial).
- **Litros**: Volume total abastecido.
- **Valor Abastecimento**: Custo total em combustível.

### Aba 3: Custos
- **Custo Abastecimento**: Valor total.
- **Custo Manutenção**: Quantidade de ordens (valor financeiro não disponível na modelagem atual).

---

## Gráficos e Visualizações

Todos os gráficos são renderizados usando a biblioteca **Syncfusion EJ2**.

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

Tabelas estilizadas com CSS Grid para melhor performance e layout.

- **Top 10 KM**: Veículos com maior quilometragem acumulada.
- **Top 10 Viagens**: Veículos mais utilizados.
- **Eficiência**:
    - **Mais Eficientes**: Maior média km/l (destaque verde).
    - **Menos Eficientes**: Menor média km/l (destaque vermelho).

---

## Endpoints API (Backend)

O controller `DashboardVeiculosController` centraliza a lógica de negócio.

### 1. GET `/api/DashboardVeiculos/DashboardDados`
Retorna dados para a aba **Visão Geral**.
- **Payload**: Sem parâmetros.
- **Retorno**: Totais de frota, distribuições (categoria, status, modelo), Top 10 KM.

### 2. GET `/api/DashboardVeiculos/DashboardUso`
Retorna dados para a aba **Uso dos Veículos**.
- **Parâmetros**:
    - `ano` (int, opcional)
    - `mes` (int, opcional)
    - `dataInicio` (DateTime, opcional)
    - `dataFim` (DateTime, opcional)
- **Retorno**: Totais filtrados, Top 10 Viagens, Top 10 Consumo, Gráficos mensais.

### 3. GET `/api/DashboardVeiculos/DashboardCustos`
Retorna dados para a aba **Custos**.
- **Parâmetros**: `ano` (int)
- **Retorno**: Comparativo mensal de custos, custo por categoria.

---

## Troubleshooting

### Problema: Gráficos não carregam
**Sintoma**: Espaços em branco onde deveriam estar os gráficos.
**Causa**: Scripts do Syncfusion não carregaram ou licença inválida.
**Solução**: Verificar console do navegador por erros de script ou "License validation failed".

### Problema: Aba de Uso vazia ou zerada
**Sintoma**: Cards mostram "0".
**Causa**: Filtro padrão (ano atual) pode não ter dados se a base for antiga.
**Solução**: O sistema tenta buscar automaticamente o último ano com dados, mas verifique se o dropdown de Ano foi populado.

### Problema: Loading infinito
**Sintoma**: Overlay "Carregando..." não desaparece.
**Causa**: Erro 500 na API.
**Solução**: Verificar logs do backend. O frontend tem tratamento de erro (`mostrarErro`), mas em falhas de rede pode travar.

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
