# Documentação: RecursoRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `RecursoRepository` é um repository específico para a entidade `Recurso`, que representa recursos do sistema para controle de acesso.

**Principais características:**

✅ **Herança**: Herda de `Repository<Recurso>`  
✅ **Interface Específica**: Implementa `IRecursoRepository`  
✅ **Dropdown**: Método para lista de seleção por Nome

---

## Métodos Específicos

### `GetRecursoListForDropDown()`

**Descrição**: Retorna lista de recursos formatada para DropDownList

**Ordenação**: Por `Nome`

**Formato**: `Nome` como texto, `RecursoId` como valor

---

### `Update(Recurso recurso)`

**Descrição**: Atualiza recurso com lógica específica

**Nota**: ⚠️ Chama `SaveChanges()` diretamente (inconsistente com padrão)

---

## Interconexões

### Quem Usa Este Repository

- **RecursoController**: CRUD de recursos do sistema
- **ControleAcessoController**: Para seleção de recursos em permissões
- **Sistema de Menu Dinâmico**: Para gerar menu baseado em recursos

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do RecursoRepository

**Arquivos Afetados**:
- `Repository/RecursoRepository.cs`

**Impacto**: Documentação de referência para repository de recursos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
