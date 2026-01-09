# Documentação: SetorController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `SetorController` gerencia operações CRUD de setores patrimoniais, incluindo relacionamento com detentores (usuários).

**Principais características:**

✅ **CRUD Completo**: Listagem, exclusão e atualização de status  
✅ **Detentores**: Relacionamento com usuários (detentores do setor)  
✅ **Validação de Dependências**: Verifica seções antes de excluir  
✅ **Combo**: Endpoint específico para popular dropdowns

---

## Endpoints API

### GET `/api/Setor/ListaSetores`

**Descrição**: Retorna lista de setores com informações de detentor

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "setorId": "guid",
      "nomeSetor": "TI",
      "nomeCompleto": "João Silva",
      "status": true,
      "setorBaixa": false
    }
  ]
}
```

**Quando é chamado**: Pela página de gestão de setores

---

### GET `/api/Setor/ListaSetoresCombo`

**Descrição**: Retorna lista simplificada para dropdowns

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "text": "TI",
      "value": "guid"
    }
  ]
}
```

---

### POST `/api/Setor/Delete`

**Descrição**: Exclui setor com validação

**Validações**: Verifica se há seções associadas (`SecaoPatrimonial.SetorId`)

---

### GET `/api/Setor/UpdateStatusSetor`

**Descrição**: Alterna status ativo/inativo

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: Páginas de gestão patrimonial
- **Pages**: Outras páginas para dropdowns

### O Que Este Controller Chama

- **`_unitOfWork.SetorPatrimonial`**: CRUD
- **`_unitOfWork.SecaoPatrimonial`**: Validação de dependências
- **`_unitOfWork.AspNetUsers`**: Join para detentores

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do SetorController

**Arquivos Afetados**:
- `Controllers/SetorController.cs`

**Impacto**: Documentação de referência para operações de setores patrimoniais

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
