# Documentação: DashboardLavagemController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `DashboardLavagemController` fornece endpoints para dashboard de lavagens, incluindo estatísticas gerais, análises por período e rankings.

**Principais características:**

✅ **Estatísticas Gerais**: Totais, veículos lavados, lavadores ativos, médias  
✅ **Análises**: Por dia da semana, horário, evolução mensal  
✅ **Rankings**: Top lavadores, veículos, motoristas  
✅ **Heatmap**: Heatmap dia/hora  
✅ **Análises Avançadas**: Por contrato, categoria, duração

---

## Endpoints API Principais

### GET `/api/DashboardLavagem/EstatisticasGerais`

**Descrição**: Estatísticas gerais de lavagens

**Parâmetros**: `dataInicio`, `dataFim` (opcionais, padrão: últimos 30 dias)

**Response**: Estatísticas completas incluindo comparação com período anterior

---

### GET `/api/DashboardLavagem/LavagensPorDiaSemana`

**Descrição**: Distribuição de lavagens por dia da semana

---

### GET `/api/DashboardLavagem/TopLavadores`

**Descrição**: Top N lavadores por número de lavagens

**Parâmetros**: `top` (int, default: 10)

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Dashboard/Lavagem.cshtml`

### O Que Este Controller Chama

- **`_context.Lavagem`**: CRUD de lavagens
- **`_context.LavadoresLavagem`**: Relacionamento lavador-lavagem

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do DashboardLavagemController

**Arquivos Afetados**:
- `Controllers/DashboardLavagemController.cs`

**Impacto**: Documentação de referência para dashboard de lavagens

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
