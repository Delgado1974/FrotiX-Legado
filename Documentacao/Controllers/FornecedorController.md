# Documentação: FornecedorController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `FornecedorController` gerencia operações CRUD de fornecedores no sistema FrotiX.

**Principais características:**

✅ **CRUD Básico**: Listagem, exclusão e atualização de status  
✅ **Validação de Dependências**: Verifica contratos antes de excluir  
✅ **Status**: Alterna entre ativo/inativo

---

## Endpoints API

### GET `/api/Fornecedor`

**Descrição**: Retorna lista de todos os fornecedores

**Response**: Lista de fornecedores

**Quando é chamado**: 
- Pela página `Pages/Fornecedor/Index.cshtml`
- Para popular dropdowns em outras páginas

---

### POST `/api/Fornecedor/Delete`

**Descrição**: Exclui fornecedor com validação

**Validações**: Verifica se há contratos associados (`Contrato.FornecedorId`)

**Response**:
```json
{
  "success": false,
  "message": "Existem contratos associados a esse fornecedor"
}
```

---

### GET `/api/Fornecedor/UpdateStatusFornecedor`

**Descrição**: Alterna status ativo/inativo

**Parâmetros**: `Id` (Guid)

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Fornecedor/Index.cshtml`
- **Pages**: `Pages/Contrato/*.cshtml` - Para dropdowns

### O Que Este Controller Chama

- **`_unitOfWork.Fornecedor`**: CRUD
- **`_unitOfWork.Contrato`**: Validação de dependências

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do FornecedorController

**Arquivos Afetados**:
- `Controllers/FornecedorController.cs`

**Impacto**: Documentação de referência para operações de fornecedores

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
