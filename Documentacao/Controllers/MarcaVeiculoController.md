# Documentação: MarcaVeiculoController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `MarcaVeiculoController` gerencia operações CRUD de marcas de veículos (Ford, Chevrolet, etc.) no sistema FrotiX.

**Principais características:**

✅ **CRUD Básico**: Listagem, exclusão e atualização de status  
✅ **Validação de Dependências**: Verifica modelos antes de excluir  
✅ **Status**: Alterna entre ativo/inativo

---

## Endpoints API

### GET `/api/MarcaVeiculo`

**Descrição**: Retorna lista de todas as marcas de veículos

**Response**:
```json
{
  "data": [
    {
      "marcaId": "guid",
      "descricaoMarca": "Ford",
      "status": true
    }
  ]
}
```

**Quando é chamado**: 
- Pela página `Pages/MarcaVeiculo/Index.cshtml`
- Para popular dropdowns em cadastro de veículos

---

### POST `/api/MarcaVeiculo/Delete`

**Descrição**: Exclui marca com validação

**Validações**: Verifica se há modelos associados (`ModeloVeiculo.MarcaId`)

**Response**:
```json
{
  "success": false,
  "message": "Existem modelos associados a essa marca"
}
```

---

### GET `/api/MarcaVeiculo/UpdateStatusMarcaVeiculo`

**Descrição**: Alterna status ativo/inativo

**Parâmetros**: `Id` (Guid)

**Response**:
```json
{
  "success": true,
  "message": "Atualizado Status da Marca [Nome: Ford] (Ativo)",
  "type": 0
}
```

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/MarcaVeiculo/Index.cshtml`
- **Pages**: `Pages/Veiculo/*.cshtml` - Para dropdowns

### O Que Este Controller Chama

- **`_unitOfWork.MarcaVeiculo`**: CRUD
- **`_unitOfWork.ModeloVeiculo`**: Validação de dependências

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do MarcaVeiculoController

**Arquivos Afetados**:
- `Controllers/MarcaVeiculoController.cs`

**Impacto**: Documentação de referência para operações de marcas de veículos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
