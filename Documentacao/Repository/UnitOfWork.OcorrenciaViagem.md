# Documentação: UnitOfWork.OcorrenciaViagem.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O arquivo `UnitOfWork.OcorrenciaViagem.cs` é uma extensão parcial do `UnitOfWork` que adiciona repositories relacionados a ocorrências de viagens com lazy loading.

**Principais características:**

✅ **Partial Class**: Extensão do `UnitOfWork` principal  
✅ **Lazy Loading**: Repositories instanciados sob demanda  
✅ **Ocorrências de Viagem**: Repositories específicos para ocorrências

---

## Repositories Adicionados

### `OcorrenciaViagem`

**Descrição**: Repository para entidade `OcorrenciaViagem`

**Implementação**:
```csharp
public IOcorrenciaViagemRepository OcorrenciaViagem
{
    get
    {
        if (_ocorrenciaViagem == null)
            _ocorrenciaViagem = new OcorrenciaViagemRepository(_db);
        return _ocorrenciaViagem;
    }
}
```

**Lazy Loading**: Instanciado apenas quando acessado pela primeira vez

---

### `ViewOcorrenciasViagem`

**Descrição**: Repository para view `ViewOcorrenciasViagem`

**Uso**: Consultas otimizadas de ocorrências de viagens

---

### `ViewOcorrenciasAbertasVeiculo`

**Descrição**: Repository para view `ViewOcorrenciasAbertasVeiculo`

**Uso**: Consultas de ocorrências abertas agrupadas por veículo

---

## Interconexões

### Quem Usa Estes Repositories

- **OcorrenciaViagemController**: CRUD de ocorrências
- **DashboardVeiculosController**: Estatísticas de ocorrências
- **ViagemController**: Exibição de ocorrências em viagens

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do UnitOfWork.OcorrenciaViagem

**Arquivos Afetados**:
- `Repository/UnitOfWork.OcorrenciaViagem.cs`

**Impacto**: Documentação de referência para repositories de ocorrências

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
