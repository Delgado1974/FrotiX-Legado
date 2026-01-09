# Documentação: RecursoController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `RecursoController` gerencia operações CRUD básicas de recursos do sistema (itens de menu/navegação).

**Principais características:**

✅ **CRUD Básico**: Listagem e exclusão  
✅ **Validação de Dependências**: Verifica controles de acesso antes de excluir  
✅ **Ordenação**: Lista ordenada por `Ordem`

**Nota**: Para funcionalidades completas de navegação, ver `NavigationController`.

---

## Endpoints API

### GET `/api/Recurso`

**Descrição**: Retorna lista de recursos ordenados por `Ordem`

**Response**:
```json
{
  "data": [
    {
      "recursoId": "guid",
      "nome": "Dashboard",
      "nomeMenu": "dashboard",
      "descricao": "Menu: dashboard",
      "ordem": 1
    }
  ]
}
```

---

### POST `/api/Recurso/Delete`

**Descrição**: Exclui recurso com validação

**Validações**: Verifica se há controles de acesso associados (`ControleAcesso.RecursoId`)

**Response**:
```json
{
  "success": false,
  "message": "Não foi possível remover o Recurso. Ele está associado a um ou mais usuários!"
}
```

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: Páginas de gestão de recursos
- **NavigationController**: Usa `Recurso` para navegação

### O Que Este Controller Chama

- **`_unitOfWork.Recurso`**: CRUD
- **`_unitOfWork.ControleAcesso`**: Validação de dependências

---

## Notas Importantes

1. **Relacionamento**: `NavigationController` gerencia funcionalidades completas de navegação
2. **Controle de Acesso**: Recursos têm relacionamento com `ControleAcesso` para permissões

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do RecursoController

**Arquivos Afetados**:
- `Controllers/RecursoController.cs`

**Impacto**: Documentação de referência para operações de recursos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
