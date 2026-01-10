# Documentação: UnidadeRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `UnidadeRepository` é um repository específico para a entidade `Unidade`, com método de dropdown que filtra apenas unidades ativas.

**Principais características:**

✅ **Herança**: Herda de `Repository<Unidade>`  
✅ **Interface Específica**: Implementa `IUnidadeRepository`  
✅ **Filtro de Status**: Dropdown filtra apenas unidades ativas  
✅ **Formatação**: Combina Sigla e Descrição no texto

---

## Métodos Específicos

### `GetUnidadeListForDropDown()`

**Descrição**: Retorna lista de unidades ativas formatada para DropDownList

**Filtro**: Apenas unidades com `Status == true`

**Ordenação**: Por `Sigla + " - " + Descricao`

**Formato**: `"{Sigla} - {Descricao}"` como texto, `UnidadeId` como valor

---

### `Update(Unidade unidade)`

**Descrição**: Atualiza unidade com lógica específica

**Nota**: ⚠️ Chama `SaveChanges()` diretamente (inconsistente com padrão)

---

## Interconexões

### Quem Usa Este Repository

- **UnidadeController**: CRUD de unidades e lotações
- **Controllers de Relacionamentos**: Para seleção de unidades

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do UnidadeRepository

**Arquivos Afetados**:
- `Repository/UnidadeRepository.cs`

**Impacto**: Documentação de referência para repository de unidades

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
