# Documentação: EmpenhoController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `EmpenhoController` gerencia operações CRUD de empenhos, incluindo listagem por contrato ou ata e validação de dependências.

**Principais características:**

✅ **CRUD Completo**: Listagem e exclusão  
✅ **Filtros**: Por contrato ou ata  
✅ **Validação de Dependências**: Verifica notas fiscais e movimentações antes de excluir

---

## Endpoints API Principais

### GET `/api/Empenho`

**Descrição**: Lista empenhos de um contrato ou ata

**Parâmetros**:
- `Id` (Guid) - ID do contrato ou ata
- `instrumento` (string) - "contrato" ou "ata"

**Response**: Lista de empenhos com valores formatados

---

### POST `/api/Empenho/Delete`

**Descrição**: Exclui empenho com validação

**Validações**:
- Verifica se há notas fiscais associadas (`NotaFiscal.EmpenhoId`)
- Verifica se há movimentações associadas (`MovimentacaoEmpenho.EmpenhoId`)

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Contrato/*.cshtml`
- **Pages**: `Pages/Ata/*.cshtml`

### O Que Este Controller Chama

- **`_unitOfWork.ViewEmpenhos`**: View otimizada
- **`_unitOfWork.Empenho`**: CRUD
- **`_unitOfWork.NotaFiscal`**: Validação de dependências
- **`_unitOfWork.MovimentacaoEmpenho`**: Validação de dependências

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do EmpenhoController

**Arquivos Afetados**:
- `Controllers/EmpenhoController.cs`

**Impacto**: Documentação de referência para operações de empenhos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
