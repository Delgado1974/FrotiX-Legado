# Documentação: CombustivelController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `CombustivelController` gerencia operações CRUD de tipos de combustível (Gasolina, Etanol, etc.) no sistema FrotiX.

**Principais características:**

✅ **CRUD Básico**: Listagem, exclusão e atualização de status  
✅ **Validação de Dependências**: Verifica veículos antes de excluir  
✅ **Status**: Alterna entre ativo/inativo

---

## Endpoints API

### GET `/api/Combustivel`

**Descrição**: Retorna lista de todos os tipos de combustível

**Response**:
```json
{
  "data": [
    {
      "combustivelId": "guid",
      "descricao": "Gasolina",
      "status": true
    }
  ]
}
```

**Quando é chamado**: 
- Pela página `Pages/Combustivel/Index.cshtml`
- Para popular dropdowns em outras páginas

---

### POST `/api/Combustivel/Delete`

**Descrição**: Exclui tipo de combustível com validação

**Validações**: Verifica se há veículos associados (`Veiculo.CombustivelId`)

**Response**:
```json
{
  "success": false,
  "message": "Existem veículos associados a essa combustível"
}
```

---

### GET `/api/Combustivel/UpdateStatusCombustivel`

**Descrição**: Alterna status ativo/inativo

**Parâmetros**: `Id` (Guid)

**Response**:
```json
{
  "success": true,
  "message": "Atualizado Status do Tipo de Combustível [Nome: Gasolina] (Ativo)",
  "type": 0
}
```

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Combustivel/Index.cshtml`
- **Pages**: `Pages/Abastecimento/*.cshtml` - Para filtros
- **Pages**: `Pages/Veiculo/*.cshtml` - Para dropdowns

### O Que Este Controller Chama

- **`_unitOfWork.Combustivel`**: CRUD
- **`_unitOfWork.Veiculo`**: Validação de dependências

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do CombustivelController

**Arquivos Afetados**:
- `Controllers/CombustivelController.cs`

**Impacto**: Documentação de referência para operações de combustíveis

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
