# Documentação: CorridasTaxiLeg.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `CorridasTaxiLeg` representa corridas de táxi legislativo. Sistema específico para controle de corridas de táxi com avaliação, glosas e controle de tempo.

## Estrutura do Model

```csharp
public class CorridasTaxiLeg
{
    [Key]
    public Guid CorridaId { get; set; }

    public string? QRU { get; set; }
    public string? Origem { get; set; }
    public string? Setor { get; set; }
    public string? DescSetor { get; set; }
    public string? Unidade { get; set; }
    public string? DescUnidade { get; set; }
    public int? QtdPassageiros { get; set; }
    public string? MotivoUso { get; set; }

    // Datas e horários
    public DateTime? DataAgenda { get; set; }
    public DateTime? DataFinal { get; set; }
    public string? HoraAgenda { get; set; }
    public string? HoraAceite { get; set; }
    public string? HoraLocal { get; set; }
    public string? HoraInicio { get; set; }
    public string? HoraFinal { get; set; }

    // Dados da corrida
    public double? KmReal { get; set; }
    public int? QtdEstrelas { get; set; }
    public string? Avaliacao { get; set; }
    public int? Duracao { get; set; }
    public int? Espera { get; set; }
    public string? OrigemCorrida { get; set; }
    public string? DestinoCorrida { get; set; }

    // Glosa
    public bool Glosa { get; set; }
    public double? ValorGlosa { get; set; }
}
```

## Notas Importantes

1. **Táxi Legislativo**: Sistema específico para corridas de táxi
2. **Avaliação**: Campos QtdEstrelas e Avaliacao para avaliação do serviço
3. **Glosa**: Suporte a glosas (descontos)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
