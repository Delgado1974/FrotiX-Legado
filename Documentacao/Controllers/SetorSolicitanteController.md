# Documentação: SetorSolicitanteController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `SetorSolicitanteController` gerencia operações CRUD de setores solicitantes (setores que solicitam viagens), incluindo estrutura hierárquica pai-filho.

**Principais características:**

✅ **CRUD Completo**: Exclusão e atualização de status  
✅ **Hierarquia**: Suporta estrutura pai-filho  
✅ **Validação de Dependências**: Verifica setores filhos antes de excluir

**Nota**: Controller implementado como partial class dividido em múltiplos arquivos.

---

## Endpoints API

### POST `/api/SetorSolicitante/Delete`

**Descrição**: Exclui setor solicitante com validação

**Validações**: Verifica se há setores filhos associados (`SetorPaiId`)

**Response**:
```json
{
  "success": false,
  "message": "Existem setores filho associados a esse Setor pai"
}
```

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/SetorSolicitante/Index.cshtml`
- **Pages**: `Pages/Requisitante/*.cshtml` - Para dropdowns

### O Que Este Controller Chama

- **`_unitOfWork.SetorSolicitante`**: CRUD

---

## Notas Importantes

1. **Partial Class**: Controller dividido em múltiplos arquivos
2. **Hierarquia**: Suporta estrutura pai-filho via `SetorPaiId`

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do SetorSolicitanteController

**Arquivos Afetados**:
- `Controllers/SetorSolicitanteController.cs`
- `Controllers/SetorSolicitanteController.GetAll.cs`
- `Controllers/SetorSolicitanteController.UpdateStatus.cs`

**Impacto**: Documentação de referência para operações de setores solicitantes

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
