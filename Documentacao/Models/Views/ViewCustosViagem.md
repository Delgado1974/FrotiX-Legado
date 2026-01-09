# Documentação: ViewCustosViagem.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)
3. [Mapeamento Model ↔ Banco de Dados](#mapeamento-model--banco-de-dados)
4. [Interconexões](#interconexões)

---

## Visão Geral

O Model `ViewCustosViagem` representa uma VIEW do banco de dados que consolida informações de viagens com custos detalhados (motorista, veículo, combustível). Usada para análises de custos e relatórios financeiros.

**Principais características:**

✅ **View do Banco**: Representa uma VIEW SQL  
✅ **Custos Detalhados**: CustoMotorista, CustoVeiculo, CustoCombustivel  
✅ **Datas Formatadas**: Algumas datas vêm formatadas como string  
✅ **Análise Financeira**: Focada em informações de custos

---

## Estrutura do Model

```csharp
public class ViewCustosViagem
{
    public Guid ViagemId { get; set; }
    public Guid? MotoristaId { get; set; }
    public Guid? VeiculoId { get; set; }
    public Guid? SetorSolicitanteId { get; set; }
    public int? NoFichaVistoria { get; set; }
    
    // Datas formatadas
    public string? DataInicial { get; set; }
    public string? DataFinal { get; set; }
    public string? HoraInicio { get; set; }
    public string? HoraFim { get; set; }
    
    public string? Finalidade { get; set; }
    public int? KmInicial { get; set; }
    public int? KmFinal { get; set; }
    public int? Quilometragem { get; set; }
    public string? Status { get; set; }
    public string? DescricaoVeiculo { get; set; }
    public string? NomeMotorista { get; set; }
    
    // Custos formatados (string)
    public string? CustoMotorista { get; set; }
    public string? CustoVeiculo { get; set; }
    public string? CustoCombustivel { get; set; }
    
    public bool StatusAgendamento { get; set; }
    public long? RowNum { get; set; }
    
    [NotMapped]
    public IFormFile FotoUpload { get; set; }
}
```

**Propriedades Principais:**

- **Custos**: CustoMotorista, CustoVeiculo, CustoCombustivel (formatados como string)
- **Viagem**: ViagemId, NoFichaVistoria, Status, Finalidade
- **Datas**: Formatadas como string para exibição

---

## Interconexões

### Quem Chama Este Arquivo

Controllers de relatórios de custos e análises financeiras usam esta view.

---

## Notas Importantes

1. **Custos Formatados**: Valores vêm como string formatada (R$)
2. **Análise Financeira**: Focada em informações de custos
3. **FotoUpload**: Campo `[NotMapped]` para upload (não vem da view)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
