# Documentação: PatrimonioRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `PatrimonioRepository` é um repository específico para a entidade `Patrimonio`, seguindo o padrão padrão de repositories do sistema.

**Principais características:**

✅ **Herança**: Herda de `Repository<Patrimonio>`  
✅ **Interface Específica**: Implementa `IPatrimonioRepository`  
✅ **Dropdown**: Método para lista de seleção por NPR

---

## Métodos Específicos

### `GetPatrimonioListForDropDown()`

**Descrição**: Retorna lista de patrimônios formatada para DropDownList

**Ordenação**: Por `NumeroSerie`

**Formato**: `NPR` como texto, `PatrimonioId` como valor

---

### `Update(Patrimonio patrimonio)`

**Descrição**: Atualiza patrimônio com lógica específica

**Nota**: ⚠️ Chama `SaveChanges()` diretamente (inconsistente com padrão)

---

## Interconexões

### Quem Usa Este Repository

- **PatrimonioController**: CRUD de patrimônios
- **Controllers de Relatórios**: Para consultas de patrimônio

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do PatrimonioRepository

**Arquivos Afetados**:
- `Repository/PatrimonioRepository.cs`

**Impacto**: Documentação de referência para repository de patrimônio

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
