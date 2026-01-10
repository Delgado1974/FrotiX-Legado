# Documentação: IAbastecimentoRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A interface `IAbastecimentoRepository` define o contrato específico para operações de repositório de abastecimentos, estendendo o contrato genérico `IRepository<Abastecimento>`.

**Principais características:**

✅ **Herança**: Estende `IRepository<Abastecimento>`  
✅ **Métodos Específicos**: Define métodos customizados para abastecimentos

---

## Estrutura da Interface

### Herança

```csharp
public interface IAbastecimentoRepository : IRepository<Abastecimento>
```

---

## Métodos Específicos

### `GetAbastecimentoListForDropDown()`

**Descrição**: Retorna lista de abastecimentos para DropDownList

**Retorno**: `IEnumerable<SelectListItem>`

---

### `Update(Abastecimento abastecimento)`

**Descrição**: Atualiza abastecimento com lógica específica

---

## Interconexões

### Quem Implementa Esta Interface

- **AbastecimentoRepository**: Implementação concreta

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do IAbastecimentoRepository

**Arquivos Afetados**:
- `Repository/IRepository/IAbastecimentoRepository.cs`

**Impacto**: Documentação de referência para interface de abastecimentos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
