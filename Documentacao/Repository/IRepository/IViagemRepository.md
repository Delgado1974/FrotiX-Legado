# Documentação: IViagemRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A interface `IViagemRepository` define o contrato específico para operações de repositório de viagens, incluindo métodos para normalização, paginação e busca de recorrências.

**Principais características:**

✅ **Herança**: Estende `IRepository<Viagem>`  
✅ **Normalização**: Métodos para correção de origens/destinos  
✅ **Paginação**: Query otimizada para eventos  
✅ **Recorrências**: Busca de viagens relacionadas

---

## Métodos Específicos

### `GetViagemListForDropDown()`

**Descrição**: Retorna lista de viagens para DropDownList

---

### `Update(Viagem viagem)`

**Descrição**: Atualiza viagem com lógica específica

---

### `GetDistinctOrigensAsync()`

**Descrição**: Retorna lista distinta de origens

---

### `GetDistinctDestinosAsync()`

**Descrição**: Retorna lista distinta de destinos

---

### `CorrigirOrigemAsync(...)`

**Descrição**: Corrige múltiplas origens para um valor único

---

### `CorrigirDestinoAsync(...)`

**Descrição**: Corrige múltiplos destinos para um valor único

---

### `BuscarViagensRecorrenciaAsync(Guid id)`

**Descrição**: Busca viagens de recorrência relacionadas

---

### `GetViagensEventoPaginadoAsync(...)`

**Descrição**: Query otimizada para lista paginada de viagens de evento

---

### `GetQuery(...)`

**Descrição**: Retorna IQueryable para composição

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do IViagemRepository

**Arquivos Afetados**:
- `Repository/IRepository/IViagemRepository.cs`

**Impacto**: Documentação de referência para interface de viagens

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
