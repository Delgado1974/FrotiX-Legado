# Documentação: ViewOcorrencia.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

VIEW que consolida informações de ocorrências de viagens com dados relacionados de veículos, motoristas e viagens.

## Estrutura do Model

```csharp
public class ViewOcorrencia
{
    public Guid VeiculoId { get; set; }
    public Guid ViagemId { get; set; }
    public int? NoFichaVistoria { get; set; }
    public string? DataInicial { get; set; }     // Formatada
    public string? NomeMotorista { get; set; }
    public string? DescricaoVeiculo { get; set; }
    public string? ResumoOcorrencia { get; set; }
    public string? StatusOcorrencia { get; set; }
    public Guid? MotoristaId { get; set; }
    public string? ImagemOcorrencia { get; set; }
    public Guid? ItemManutencaoId { get; set; }
    public string? DescricaoOcorrencia { get; set; }
    public string? DescricaoSolucaoOcorrencia { get; set; }
}
```

## Notas Importantes

1. **Ocorrências**: Consolida dados de ocorrências de viagens
2. **Manutenção**: ItemManutencaoId indica se foi convertida em item de manutenção

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
