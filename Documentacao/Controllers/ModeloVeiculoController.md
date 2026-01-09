# Documentação: ModeloVeiculoController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `ModeloVeiculoController` gerencia operações CRUD de modelos de veículos (Fiesta, Corolla, etc.) no sistema FrotiX.

**Principais características:**

✅ **CRUD Básico**: Listagem, exclusão e atualização de status  
✅ **Validação de Dependências**: Verifica veículos antes de excluir  
✅ **Relacionamento**: Include com `MarcaVeiculo` para exibir marca

---

## Endpoints API

### GET `/api/ModeloVeiculo`

**Descrição**: Retorna lista de modelos com informações de marca

**Response**: Lista de modelos com `MarcaVeiculo` incluído via `includeProperties`

**Quando é chamado**: 
- Pela página `Pages/ModeloVeiculo/Index.cshtml`
- Para popular dropdowns em cadastro de veículos

---

### POST `/api/ModeloVeiculo/Delete`

**Descrição**: Exclui modelo com validação

**Validações**: Verifica se há veículos associados (`Veiculo.ModeloId`)

---

### GET `/api/ModeloVeiculo/UpdateStatusModeloVeiculo`

**Descrição**: Alterna status ativo/inativo

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/ModeloVeiculo/Index.cshtml`
- **Pages**: `Pages/Veiculo/*.cshtml` - Para dropdowns

### O Que Este Controller Chama

- **`_unitOfWork.ModeloVeiculo`**: CRUD com include de `MarcaVeiculo`
- **`_unitOfWork.Veiculo`**: Validação de dependências

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do ModeloVeiculoController

**Arquivos Afetados**:
- `Controllers/ModeloVeiculoController.cs`

**Impacto**: Documentação de referência para operações de modelos de veículos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
