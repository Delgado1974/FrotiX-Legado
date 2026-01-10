# Documentação: MotoristaContratoRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `MotoristaContratoRepository` é um repository específico para a entidade `MotoristaContrato`, que representa o relacionamento muitos-para-muitos entre motoristas e contratos.

**Principais características:**

✅ **Herança**: Herda de `Repository<MotoristaContrato>`  
✅ **Interface Específica**: Implementa `IMotoristaContratoRepository`  
✅ **Chave Composta**: Usa `MotoristaId` + `ContratoId` como chave composta  
⚠️ **Dropdown Incompleto**: Método `GetMotoristaContratoListForDropDown()` está comentado

---

## Métodos Específicos

### `GetMotoristaContratoListForDropDown()`

**Descrição**: ⚠️ **MÉTODO INCOMPLETO** - Retorna lista vazia (código comentado)

**Status**: Método implementado mas código comentado

**Código Comentado**:
```csharp
//Text = i.Placa,
//Value = i.VeiculoId.ToString()
```

**Nota**: Método retorna `SelectListItem` vazio

---

### `Update(MotoristaContrato motoristaContrato)`

**Descrição**: Atualiza relacionamento motorista-contrato com lógica específica

**Busca**: Usa chave composta `(MotoristaId, ContratoId)` para buscar entidade

**Nota**: ⚠️ Chama `SaveChanges()` diretamente (inconsistente com padrão)

---

## Interconexões

### Quem Usa Este Repository

- **ContratoController**: Para gerenciar motoristas vinculados a contratos
- **MotoristaController**: Para gerenciar contratos vinculados a motoristas

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do MotoristaContratoRepository

**Arquivos Afetados**:
- `Repository/MotoristaContratoRepository.cs`

**Impacto**: Documentação de referência para repository de relacionamento motorista-contrato

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
