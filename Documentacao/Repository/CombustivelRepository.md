# Documentação: CombustivelRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `CombustivelRepository` é um repository específico para a entidade `Combustivel`, com método de dropdown que filtra apenas combustíveis ativos.

**Principais características:**

✅ **Herança**: Herda de `Repository<Combustivel>`  
✅ **Interface Específica**: Implementa `ICombustivelRepository`  
✅ **Filtro de Status**: Dropdown filtra apenas combustíveis ativos

---

## Métodos Específicos

### `GetCombustivelListForDropDown()`

**Descrição**: Retorna lista de combustíveis ativos formatada para DropDownList

**Filtro**: Apenas combustíveis com `Status == true`

**Ordenação**: Por `Descricao`

**Formato**: `Descricao` como texto, `CombustivelId` como valor

---

### `Update(Combustivel combustivel)`

**Descrição**: Atualiza combustível com lógica específica

**Nota**: ⚠️ Chama `SaveChanges()` diretamente (inconsistente com padrão)

---

## Interconexões

### Quem Usa Este Repository

- **CombustivelController**: CRUD de combustíveis
- **AbastecimentoController**: Para seleção de combustíveis em abastecimentos

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do CombustivelRepository

**Arquivos Afetados**:
- `Repository/CombustivelRepository.cs`

**Impacto**: Documentação de referência para repository de combustíveis

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
