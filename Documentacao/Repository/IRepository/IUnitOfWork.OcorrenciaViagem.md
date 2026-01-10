# Documentação: IUnitOfWork.OcorrenciaViagem.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O arquivo `IUnitOfWork.OcorrenciaViagem.cs` é uma extensão parcial da interface `IUnitOfWork` que adiciona propriedades para repositories relacionados a ocorrências de viagens.

**Principais características:**

✅ **Partial Interface**: Extensão da `IUnitOfWork` principal  
✅ **Ocorrências de Viagem**: Propriedades para repositories de ocorrências

---

## Propriedades Adicionadas

### `IOcorrenciaViagemRepository OcorrenciaViagem`

**Descrição**: Repository para entidade `OcorrenciaViagem`

**Uso**: CRUD de ocorrências de viagens

---

### `IViewOcorrenciasViagemRepository ViewOcorrenciasViagem`

**Descrição**: Repository para view `ViewOcorrenciasViagem`

**Uso**: Consultas otimizadas de ocorrências de viagens

---

### `IViewOcorrenciasAbertasVeiculoRepository ViewOcorrenciasAbertasVeiculo`

**Descrição**: Repository para view `ViewOcorrenciasAbertasVeiculo`

**Uso**: Consultas de ocorrências abertas agrupadas por veículo

---

## Interconexões

### Quem Usa Estas Propriedades

- **Controllers**: Via `IUnitOfWork` injetado
- **Services**: Para operações de negócio

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do IUnitOfWork.OcorrenciaViagem

**Arquivos Afetados**:
- `Repository/IRepository/IUnitOfWork.OcorrenciaViagem.cs`

**Impacto**: Documentação de referência para interface de ocorrências

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
