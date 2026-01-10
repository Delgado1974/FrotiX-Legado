# Documentação: NotaFiscalRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `NotaFiscalRepository` é um repository específico para a entidade `NotaFiscal`, seguindo o padrão padrão de repositories do sistema.

**Principais características:**

✅ **Herança**: Herda de `Repository<NotaFiscal>`  
✅ **Interface Específica**: Implementa `INotaFiscalRepository`  
✅ **Dropdown**: Método para lista de seleção por NumeroNF

---

## Métodos Específicos

### `GetNotaFiscalListForDropDown()`

**Descrição**: Retorna lista de notas fiscais formatada para DropDownList

**Ordenação**: Por `NumeroNF`

**Formato**: `NumeroNF` como texto, `NotaFiscalId` como valor

---

### `Update(NotaFiscal notaFiscal)`

**Descrição**: Atualiza nota fiscal com lógica específica

**Nota**: ⚠️ Chama `SaveChanges()` diretamente (inconsistente com padrão)

---

## Interconexões

### Quem Usa Este Repository

- **NotaFiscalController**: CRUD de notas fiscais
- **EmpenhoController**: Para vincular notas fiscais a empenhos

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do NotaFiscalRepository

**Arquivos Afetados**:
- `Repository/NotaFiscalRepository.cs`

**Impacto**: Documentação de referência para repository de notas fiscais

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
