# Documentação: Administração - Dashboard

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Filtros e Períodos](#filtros-e-períodos)
4. [Indicadores KPI](#indicadores-kpi)
5. [Gráficos e Visualizações](#gráficos-e-visualizações)
6. [Endpoints API](#endpoints-api)
7. [Frontend](#frontend)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O **Dashboard de Administração** é uma ferramenta analítica estratégica que consolida dados de toda a operação do sistema FrotiX. Diferente dos dashboards operacionais (como o de Veículos ou Abastecimento), este painel foca em métricas macro de gestão, normalização de dados, eficiência da frota e custos operacionais.

### Características Principais

- ✅ **Visão Holística**: Consolida dados de veículos, motoristas e viagens.
- ✅ **Filtro de Período Flexível**: Permite análises de 7 a 365 dias ou personalizadas.
- ✅ **Heatmap de Utilização**: Visualização de viagens por dia da semana e hora.
- ✅ **Análise de Normalização**: Monitora a qualidade dos dados (viagens normalizadas vs originais).
- ✅ **Benchmarking**: Compara frota própria vs terceirizada e identifica veículos/motoristas top performers.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Administracao/
│       ├── DashboardAdministracao.cshtml    # View (HTML + CSS)
│       └── DashboardAdministracao.cshtml.cs # PageModel
│
├── Controllers/
│   └── AdministracaoController.cs           # API de Dados Analíticos
│
├── wwwroot/
│   ├── js/
│   │   └── administracao.js                 # Lógica Frontend (Charts)
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **Chart.js** | Biblioteca gráfica leve (diferente do Syncfusion usado em outros módulos) |
| **ASP.NET Core API** | Agregação e processamento de dados |
| **Entity Framework Core** | Consultas otimizadas com `AsNoTracking` e projeções |
| **CSS Grid/Flexbox** | Layout responsivo dos cards e gráficos |

---

## Filtros e Períodos

O dashboard possui um controle central de período que afeta todos os gráficos simultaneamente.

**Controles**:
- Data Início e Data Fim (Inputs nativos)
- Botões de Atalho: 7 dias, 30 dias, 90 dias, 6 meses, 1 ano.
- Botão Atualizar.

**Inicialização (`administracao.js`)**:
```javascript
function inicializarFiltros() {
    const hoje = new Date();
    const dataFim = hoje.toISOString().split('T')[0];
    const dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    document.getElementById('dataInicio').value = dataInicio;
    document.getElementById('dataFim').value = dataFim;
}
```

---

## Indicadores KPI

Os cards superiores exibem totais consolidados.

- **Veículos Ativos**: Total de veículos com status ativo.
- **Motoristas Ativos**: Total de motoristas com status ativo.
- **Viagens no Período**: Total de viagens realizadas no intervalo selecionado.
- **Total KM Rodados**: Soma da quilometragem de todas as viagens no período.

---

## Gráficos e Visualizações

### 1. Estatísticas de Normalização
Gráficos de Pizza e Barras que mostram a saúde dos dados.
- **Pizza**: Proporção de viagens que passaram pelo processo de normalização.
- **Barras**: Tipos de normalização aplicados (ex: "Ajuste KM", "Correção Horário").

### 2. Distribuição por Tipo de Uso
Analisa como a frota é utilizada com base no campo `TipoUso` ou na propriedade `VeiculoProprio` (fallback).

### 3. Heatmap de Viagens
Matriz 7x24 que mostra a intensidade de uso da frota.
- **Eixo Y**: Dias da semana (Segunda a Domingo).
- **Eixo X**: Horas do dia (00h a 23h).
- **Células**: Coloridas conforme intensidade (Verde claro a escuro).

### 4. Rankings (Top 10)
- **Veículos por KM**: Veículos que mais rodaram.
- **Motoristas por KM**: Motoristas que mais conduziram.

### 5. Custos e Eficiência
- **Custo por Finalidade**: Custo médio por tipo de viagem.
- **Próprios vs Terceirizados**: Comparativo de volume e custo.
- **Eficiência da Frota**: Veículos com menor custo por KM.
- **Evolução Mensal**: Linha do tempo dos custos (Combustível, Motorista, Lavador).

---

## Endpoints API

O controller `AdministracaoController` fornece endpoints específicos para cada gráfico, retornando JSON otimizado.

### 1. GET `/api/Administracao/ObterResumoGeralFrota`
Retorna os contadores para os cards KPI.

### 2. GET `/api/Administracao/ObterEstatisticasNormalizacao`
Retorna dados de viagens normalizadas vs originais.

### 3. GET `/api/Administracao/ObterHeatmapViagens`
Retorna matriz 7x24 de contagem de viagens.

**Implementação (`AdministracaoController.cs`)**:
```csharp
[HttpGet]
[Route("api/Administracao/ObterHeatmapViagens")]
public async Task<IActionResult> ObterHeatmapViagens(DateTime? dataInicio, DateTime? dataFim)
{
    // ... filtros ...
    var viagens = await _context.Viagem
        .AsNoTracking()
        .Where(...)
        .Select(v => new { DiaSemana = (int)v.DataInicial.Value.DayOfWeek, Hora = v.HoraInicio.Value.Hour })
        .ToListAsync();

    // Processamento em memória para matriz 7x24
    var matriz = new int[7][];
    // ... lógica de preenchimento ...
    return Ok(new { sucesso = true, dados = new { matriz } });
}
```

### 4. GET `/api/Administracao/ObterTop10VeiculosPorKm`
### 5. GET `/api/Administracao/ObterEvolucaoMensalCustos`
Retorna dados agrupados por mês para o gráfico de linha.

---

## Frontend

### Carregamento Assíncrono Paralelo
Para performance, o dashboard dispara todas as requisições simultaneamente usando `Promise.allSettled`.

**Código (`administracao.js`)**:
```javascript
async function carregarTodosGraficos() {
    mostrarLoadingCards();

    const resultados = await Promise.allSettled([
        carregarResumoGeral(),
        carregarEstatisticasNormalizacao(),
        carregarHeatmap(),
        // ... outros carregamentos
    ]);

    // ... tratamento de erros
}
```

### Renderização com Chart.js
Diferente do restante do sistema que usa Syncfusion, este dashboard utiliza **Chart.js**.

**Exemplo de Configuração**:
```javascript
chartNormalizacaoPizza = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Originais', 'Normalizadas'],
        datasets: [{
            data: [resumo.viagensOriginais, resumo.viagensNormalizadas],
            backgroundColor: [cores[0], cores[3]],
            // ...
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
    }
});
```

---

## Troubleshooting

### Problema: Gráficos vazios ("Sem dados")
**Sintoma**: Cards de gráficos exibem mensagem de "Sem dados" ou ficam em branco.
**Causa**: O filtro de data padrão (30 dias) pode não cobrir períodos com viagens na base de dados.
**Solução**: Tentar ampliar o período para "1 ano" usando os botões de atalho.

### Problema: Heatmap todo cinza
**Sintoma**: Tabela de calor aparece, mas sem cores.
**Causa**: Valores retornados são todos 0 ou erro na lógica de cálculo de cor (`obterCorHeatmap`).
**Verificação**: Inspecionar resposta da API `/api/Administracao/ObterHeatmapViagens`.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial do Dashboard de Administração.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
