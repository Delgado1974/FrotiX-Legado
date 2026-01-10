# Documentação: EmpenhoRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `EmpenhoRepository` é um repository específico para a entidade `Empenho`, com método de dropdown que faz JOIN com Contrato para exibir informações completas.

**Principais características:**

✅ **Herança**: Herda de `Repository<Empenho>`  
✅ **Interface Específica**: Implementa `IEmpenhoRepository`  
✅ **JOIN com Contrato**: Dropdown inclui informações do contrato relacionado

---

## Métodos Específicos

### `GetEmpenhoListForDropDown()`

**Descrição**: Retorna lista de empenhos formatada para DropDownList com JOIN em Contrato

**JOIN**: Faz `Join` entre `Empenho` e `Contrato` via `ContratoId`

**Ordenação**: Por `NotaEmpenho`

**Formato**: `"{NotaEmpenho}({AnoContrato}/{NumeroContrato})"` como texto, `ContratoId` como valor

**Nota**: ⚠️ Retorna `ContratoId` como valor, não `EmpenhoId`

**Uso**:
```csharp
var empenhos = unitOfWork.Empenho.GetEmpenhoListForDropDown();
// Retorna: "12345(2026/001)" como texto, ContratoId como valor
```

---

### `Update(Empenho empenho)`

**Descrição**: Atualiza empenho com lógica específica

**Nota**: ⚠️ Chama `SaveChanges()` diretamente (inconsistente com padrão)

---

## Interconexões

### Quem Usa Este Repository

- **EmpenhoController**: CRUD de empenhos
- **NotaFiscalController**: Para seleção de empenhos em notas fiscais

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do EmpenhoRepository

**Arquivos Afetados**:
- `Repository/EmpenhoRepository.cs`

**Impacto**: Documentação de referência para repository de empenhos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
