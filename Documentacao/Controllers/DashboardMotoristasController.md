# Documentação: DashboardMotoristasController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `DashboardMotoristasController` fornece endpoints para dashboard de motoristas, incluindo estatísticas gerais, análises por período, rankings e distribuições.

**Principais características:**

✅ **Estatísticas Gerais**: Totais, viagens, KM, horas, abastecimentos  
✅ **Rankings**: Top 10 por viagens, KM, horas, abastecimentos, multas, performance  
✅ **Distribuições**: Por tipo, status, tempo de empresa  
✅ **Análises**: Por período (ano/mês ou data início/fim)  
✅ **Heatmap**: Heatmap de viagens por motorista

---

## Endpoints API Principais

### GET `/api/DashboardMotoristas/ObterAnosMesesDisponiveis`

**Descrição**: Obtém anos e meses disponíveis para filtro

**Otimizações**: Busca de tabelas estatísticas primeiro, fallback para tabela original

---

### GET `/api/DashboardMotoristas/ObterEstatisticasGerais`

**Descrição**: Estatísticas gerais de motoristas

**Parâmetros**: `dataInicio`, `dataFim`, `ano`, `mes`, `motoristaId`

---

### GET `/api/DashboardMotoristas/ObterTop10PorViagens`

**Descrição**: Top 10 motoristas por número de viagens

---

### GET `/api/DashboardMotoristas/ObterTop10PorKm`

**Descrição**: Top 10 motoristas por quilometragem

---

### GET `/api/DashboardMotoristas/ObterMotoristasComCnhProblema`

**Descrição**: Lista motoristas com problemas na CNH

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Dashboard/Motoristas.cshtml`

### O Que Este Controller Chama

- **`_context`**: DbContext para consultas diretas
- **`_context.EstatisticaGeralMensal`**: Tabelas estatísticas otimizadas

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do DashboardMotoristasController

**Arquivos Afetados**:
- `Controllers/DashboardMotoristasController.cs`

**Impacto**: Documentação de referência para dashboard de motoristas

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
