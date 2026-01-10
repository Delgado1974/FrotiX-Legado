# Documentação: IVeiculoRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A interface `IVeiculoRepository` define o contrato específico para operações de repositório de veículos, estendendo o contrato genérico `IRepository<Veiculo>`.

**Principais características:**

✅ **Herança**: Estende `IRepository<Veiculo>`  
✅ **Métodos Específicos**: Define métodos customizados para veículos  
✅ **DropDown Support**: Método para listas de seleção

---

## Estrutura da Interface

### Herança

```csharp
public interface IVeiculoRepository : IRepository<Veiculo>
```

**Herança**: `IRepository<Veiculo>` - Herda operações CRUD genéricas

---

## Métodos Específicos

### `GetVeiculoListForDropDown()`

**Descrição**: Retorna lista de veículos formatada para DropDownList

**Retorno**: `IEnumerable<SelectListItem>`

**Uso**: Para popular dropdowns em views Razor

---

### `Update(Veiculo veiculo)`

**Descrição**: Atualiza veículo com lógica específica

**Nota**: Oculto com `new` na implementação para sobrescrever método da classe base

**Comportamento**: Chama `SaveChanges()` diretamente (inconsistente com padrão)

---

## Interconexões

### Quem Implementa Esta Interface

- **VeiculoRepository**: Implementação concreta

### Quem Usa Esta Interface

- **VeiculoController**: Via `IUnitOfWork.Veiculo`
- **Views Razor**: Para dropdowns

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do IVeiculoRepository

**Arquivos Afetados**:
- `Repository/IRepository/IVeiculoRepository.cs`

**Impacto**: Documentação de referência para interface de veículos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
