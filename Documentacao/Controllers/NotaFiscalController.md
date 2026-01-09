# Documentação: NotaFiscalController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `NotaFiscalController` gerencia operações CRUD de notas fiscais, incluindo gestão de glosas e integração com empenhos.

**Principais características:**

✅ **CRUD Completo**: Exclusão e gestão de glosas  
✅ **Integração com Empenhos**: Atualiza saldo de empenho ao excluir NF  
✅ **Glosas**: Sistema de gestão de glosas em notas fiscais

**Nota**: Controller implementado como partial class dividido em múltiplos arquivos.

---

## Endpoints API Principais

### POST `/api/NotaFiscal/Delete`

**Descrição**: Exclui nota fiscal e atualiza saldo do empenho

**Lógica**:
- Ao excluir NF, devolve valor líquido ao empenho: `SaldoFinal = SaldoFinal + (ValorNF - ValorGlosa)`

---

### GET `/api/NotaFiscal/GetGlosa`

**Descrição**: Obtém dados de glosa de uma nota fiscal

**Parâmetros**: `id` (Guid) - ID da nota fiscal

**Response**: Dados da glosa incluindo valor e motivo

---

### POST `/api/NotaFiscal/Glosa`

**Descrição**: Aplica glosa em nota fiscal

**Request Body**: `GlosaNota` com `NotaFiscalId`, `ValorGlosa`, `MotivoGlosa`

**Lógica**: Atualiza `ValorGlosa` e `MotivoGlosa` da NF e ajusta saldo do empenho

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/NotaFiscal/*.cshtml`
- **Pages**: `Pages/Empenho/*.cshtml` - Para gestão de NFs de empenhos

### O Que Este Controller Chama

- **`_unitOfWork.NotaFiscal`**: CRUD
- **`_unitOfWork.Empenho`**: Atualização de saldo

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do NotaFiscalController

**Arquivos Afetados**:
- `Controllers/NotaFiscalController.cs`
- `Controllers/NotaFiscalController.Partial.cs`

**Impacto**: Documentação de referência para operações de notas fiscais

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
