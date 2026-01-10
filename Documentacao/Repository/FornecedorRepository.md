# Documentação: FornecedorRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `FornecedorRepository` é um repository específico para a entidade `Fornecedor`, seguindo o padrão padrão de repositories do sistema.

**Principais características:**

✅ **Herança**: Herda de `Repository<Fornecedor>`  
✅ **Interface Específica**: Implementa `IFornecedorRepository`  
✅ **Dropdown**: Método para lista de seleção por DescricaoFornecedor

---

## Métodos Específicos

### `GetFornecedorListForDropDown()`

**Descrição**: Retorna lista de fornecedores formatada para DropDownList

**Ordenação**: Por `DescricaoFornecedor`

**Formato**: `DescricaoFornecedor` como texto, `FornecedorId` como valor

---

### `Update(Fornecedor fornecedor)`

**Descrição**: Atualiza fornecedor com lógica específica

**Nota**: ⚠️ Chama `SaveChanges()` diretamente (inconsistente com padrão)

---

## Interconexões

### Quem Usa Este Repository

- **FornecedorController**: CRUD de fornecedores
- **ContratoController**: Para seleção de fornecedores em contratos
- **AtaRegistroPrecosController**: Para seleção de fornecedores em atas

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do FornecedorRepository

**Arquivos Afetados**:
- `Repository/FornecedorRepository.cs`

**Impacto**: Documentação de referência para repository de fornecedores

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
