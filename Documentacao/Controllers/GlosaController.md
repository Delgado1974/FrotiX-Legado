# Documentação: GlosaController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `GlosaController` gerencia operações de glosa (desconto) em contratos, incluindo listagem resumida e detalhada com suporte a Syncfusion DataGrid e exportação Excel.

**Principais características:**

✅ **Listagem Resumida**: Resumo de glosas por contrato/mês/ano  
✅ **Listagem Detalhada**: Detalhes completos de glosas  
✅ **Syncfusion DataGrid**: Suporte completo a filtros, ordenação, paginação  
✅ **Exportação Excel**: Exportação para XLSX usando ClosedXML

---

## Endpoints API Principais

### GET `/glosa/resumo`

**Descrição**: Lista resumo de glosas com suporte a Syncfusion DataGrid

**Parâmetros**:
- `contratoId` (Guid)
- `ano` (int)
- `mes` (int)
- `DataManagerRequest` (query) - Para filtros, ordenação, paginação do Syncfusion

**Response**: `DataResult` compatível com Syncfusion DataGrid

---

### GET `/glosa/detalhes`

**Descrição**: Lista detalhes de glosas com suporte a Syncfusion DataGrid

**Parâmetros**: Mesmos de `/resumo`

---

### GET `/glosa/export/resumo`

**Descrição**: Exporta resumo de glosas para Excel

**Parâmetros**: `contratoId`, `mes`, `ano`

**Response**: Arquivo XLSX

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: Páginas de gestão de glosas
- **Syncfusion DataGrid**: Para listagem interativa

### O Que Este Controller Chama

- **`_service`**: `IGlosaService` para lógica de negócio
- **`ClosedXML`**: Para geração de Excel

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do GlosaController

**Arquivos Afetados**:
- `Controllers/GlosaController.cs`

**Impacto**: Documentação de referência para operações de glosas

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
