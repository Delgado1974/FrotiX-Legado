# Documentação: IOcorrenciaViagemRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A interface `IOcorrenciaViagemRepository` define o contrato específico para operações de repositório de ocorrências de viagens, **sem herdar de `IRepository<T>`**.

**Principais características:**

✅ **Interface Específica**: Não estende `IRepository<OcorrenciaViagem>`  
✅ **CRUD Customizado**: Define métodos CRUD específicos  
✅ **Suporte a Includes**: Suporta eager loading

---

## Métodos Definidos

### `GetAll(...)`

**Descrição**: Retorna todas as ocorrências com filtro e includes opcionais

---

### `GetFirstOrDefault(...)`

**Descrição**: Retorna primeira ocorrência que satisfaz o filtro

**Nota**: `filter` é obrigatório

---

### `Add(OcorrenciaViagem entity)`

**Descrição**: Adiciona ocorrência ao contexto

---

### `Remove(OcorrenciaViagem entity)`

**Descrição**: Remove ocorrência do contexto

---

### `Update(OcorrenciaViagem entity)`

**Descrição**: Atualiza ocorrência no contexto

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do IOcorrenciaViagemRepository

**Arquivos Afetados**:
- `Repository/IRepository/IOcorrenciaViagemRepository.cs`

**Impacto**: Documentação de referência para interface customizada de ocorrências

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
