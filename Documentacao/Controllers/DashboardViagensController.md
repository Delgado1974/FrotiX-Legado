# Documentação: DashboardViagensController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `DashboardViagensController` fornece endpoints para dashboards de viagens, incluindo estatísticas gerais, análises por período, filtros de outliers e comparações com períodos anteriores.

**Principais características:**

✅ **Estatísticas Gerais**: Totais, custos, KM, médias  
✅ **Filtro de Outliers**: Filtra viagens com KM > 2000 (erros)  
✅ **Comparação Períodos**: Compara período atual com anterior  
✅ **Análises**: Por dia da semana, status, veículo, motorista, etc.  
✅ **Exportação PDF**: Geração de relatórios em PDF

**Nota**: Controller implementado como partial class dividido em múltiplos arquivos.

---

## Endpoints API Principais

### GET `/api/DashboardViagens/ObterEstatisticasGerais`

**Descrição**: **ENDPOINT PRINCIPAL** - Estatísticas gerais de viagens

**Parâmetros**: 
- `dataInicio` (DateTime opcional) - Padrão: 30 dias atrás
- `dataFim` (DateTime opcional) - Padrão: hoje

**Filtros de Outliers**:
- KM máximo por viagem: 2000 km
- Filtra viagens com `KmFinal < KmInicial`
- Filtra viagens com diferença > 2000 km

**Response**: Estatísticas completas incluindo comparação com período anterior

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Dashboard/Viagens.cshtml`
- **JavaScript**: Dashboards e gráficos

### O Que Este Controller Chama

- **`_context.Viagem`**: Consultas diretas ao DbContext
- **`_userManager`**: Informações de usuários

---

## Notas Importantes

1. **Filtro de Outliers**: Constante `KM_MAXIMO_POR_VIAGEM = 2000`
2. **Comparação**: Calcula período anterior automaticamente
3. **Custos**: Calculados apenas para viagens "Realizada"

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do DashboardViagensController

**Arquivos Afetados**:
- `Controllers/DashboardViagensController.cs`
- `Controllers/DashboardViagensController_ExportacaoPDF.cs`

**Impacto**: Documentação de referência para dashboards de viagens

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
