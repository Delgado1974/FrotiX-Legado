# Documentação: Dashboards de Viagens e Eventos

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Dashboard de Viagens](#dashboard-de-viagens)
3. [Dashboard de Eventos](#dashboard-de-eventos)
4. [Arquitetura](#arquitetura)
5. [Endpoints API](#endpoints-api)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O módulo de Viagens conta com dois painéis analíticos principais:
1. **Dashboard de Viagens** (`Pages/Viagens/DashboardViagens.cshtml`): Focado em custos, quilometragem e volume operacional de viagens.
2. **Dashboard de Eventos** (`Pages/Viagens/DashboardEventos.cshtml`): Focado em eventos corporativos, número de participantes e setores solicitantes.

Ambos utilizam **Syncfusion Charts** para visualização de dados e seguem um padrão visual "Clean" inspirado em PowerBI.

---

## Dashboard de Viagens

### Funcionalidades
- **Filtros Temporais**: Seleção por Ano/Mês, intervalo personalizado ou períodos rápidos (7, 15, 30 dias).
- **Cards de KPI**: Custo Total, Total de Viagens, Custo Médio, KM Total, KM Médio.
- **Gráficos**:
  - Distribuição de Status (Pie Chart)
  - Evolução de Custos (Area Chart)
  - Viagens por Dia da Semana (Column Chart)
  - Heatmap de Horários (Tabela de Calor)
- **Rankings (Top 10)**: Motoristas, Veículos, Requisitantes e Setores que mais viajam.

### Estrutura HTML (Exemplo de Card)
```html
<div class="col">
    <div id="cardCustoTotal" class="card-estatistica-dash card-borda-azul">
        <div class="icone-card-dash icone-azul"><i class="fa-duotone fa-sack-dollar"></i></div>
        <small class="texto-metrica">Custo Total</small>
        <h3 class="valor-metrica mb-0" id="statCustoTotal">R$ 0,00</h3>
        <small class="variacao-metrica variacao-neutra" id="variacaoCusto">-</small>
    </div>
</div>
```

---

## Dashboard de Eventos

### Funcionalidades
- **KPIs de Eventos**: Total de Eventos, Ativos, Concluídos, Cancelados.
- **Métricas de Participação**: Total e Média de Participantes.
- **Gráficos**:
  - Status dos Eventos.
  - Top 10 Setores Solicitantes.
  - Evolução Mensal.
- **Tabelas Analíticas**: Detalhamento por Setor e Requisitante.

### Loading e Performance
Ambos os dashboards utilizam um overlay de carregamento padrão (`ftx-spin-overlay`) enquanto os dados são processados assincronamente.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Viagens/
│       ├── DashboardViagens.cshtml      # View Analítica de Viagens
│       ├── DashboardEventos.cshtml      # View Analítica de Eventos
│
├── wwwroot/
│   ├── js/
│   │   └── dashboards/
│   │       ├── dashboard-viagens.js     # Lógica JS (Syncfusion, AJAX)
│   │       ├── dashboard-eventos.js     # Lógica JS Eventos
```

### Tecnologias Utilizadas
| Tecnologia | Uso |
|------------|-----|
| **Syncfusion EJ2 Charts** | Renderização de gráficos (Pie, Column, Area) |
| **Chart.js** | (Em alguns legados, mas migrando para Syncfusion) |
| **Bootstrap 5** | Grid system e Cards |
| **jQuery AJAX** | Busca de dados no backend |

---

## Endpoints API

### Viagens
- `GET /api/DashboardViagens/ObterKpis`: Retorna os números para os cards (Custo, KM, Qtd).
- `GET /api/DashboardViagens/ObterGraficos`: Retorna datasets para os gráficos.
- `GET /api/DashboardViagens/ObterTop10`: Retorna listas de ranking.

### Eventos
- `GET /api/DashboardEventos/ObterEstatisticas`: Retorna KPIs e dados de gráficos para eventos.

---

## Troubleshooting

### Gráficos não renderizam (Espaço em branco)
**Causa**: O script do Syncfusion (`ej2-charts.min.js`) não carregou ou o container do gráfico tem altura 0.
**Solução**: Verifique se o CDN do Syncfusion está acessível e se as divs dos gráficos possuem `style="height: 350px;"` definido.

### Dados zerados nos cards
**Causa**: Filtro de data muito restritivo ou falha na API.
**Solução**: Tente selecionar "Todos os Anos" / "Todos os Meses". Se persistir, verifique o console do navegador para erros 500 no endpoint `/api/Dashboard...`.

### Erro "ej is not defined"
**Causa**: A ordem de carregamento dos scripts está incorreta.
**Solução**: `ej2-base.min.js` deve ser carregado antes de qualquer outro script EJ2.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial dos Dashboards de Viagens e Eventos.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
