# Documentação: RelatoriosController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `RelatoriosController` gerencia exportação de PDFs do Dashboard Economildo, incluindo múltiplos tipos de relatórios (heatmaps, distribuições, comparativos).

**Principais características:**

✅ **Exportação PDF**: Geração de relatórios em PDF  
✅ **Múltiplos Tipos**: Heatmap viagens, heatmap passageiros, usuários por mês/turno, comparativos, etc.  
✅ **Filtros**: Por MOB, mês, ano  
✅ **Serviço PDF**: Usa `RelatorioEconomildoPdfService` para geração

---

## Endpoints API Principais

### GET `/api/Relatorios/ExportarEconomildo`

**Descrição**: Exporta relatório Economildo para PDF

**Parâmetros**:
- `tipo` (TipoRelatorioEconomildo) - Tipo de relatório
- `mob` (string opcional) - MOB do veículo
- `mes` (int opcional)
- `ano` (int opcional)

**Tipos Suportados**:
- `HeatmapViagens` - Heatmap de distribuição de viagens
- `HeatmapPassageiros` - Heatmap de distribuição de passageiros
- `UsuariosMes` - Usuários por mês
- `UsuariosTurno` - Usuários por turno
- `ComparativoMob` - Comparativo entre MOBs
- `UsuariosDiaSemana` - Usuários por dia da semana
- `DistribuicaoHorario` - Distribuição por horário
- `TopVeiculos` - Top veículos

**Response**: Arquivo PDF

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Dashboard/Economildo.cshtml`
- **JavaScript**: Botões de exportação

### O Que Este Controller Chama

- **`_context.ViagensEconomildo`**: Dados de viagens Economildo
- **`_pdfService`**: Geração de PDFs
- **`_unitOfWork`**: Acesso a dados

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do RelatoriosController

**Arquivos Afetados**:
- `Controllers/RelatoriosController.cs`

**Impacto**: Documentação de referência para exportação de relatórios

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
