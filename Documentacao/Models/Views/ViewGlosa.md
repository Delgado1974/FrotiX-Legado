# Documentação: ViewGlosa.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

VIEW complexa que consolida informações de glosas (descontos) em manutenções baseadas em itens de contrato. Calcula dias de glosa e valores de desconto. Usa `[Keyless]` pois é uma view sem chave primária.

## Estrutura do Model

```csharp
[Keyless]
public class ViewGlosa
{
    public string PlacaDescricao { get; set; }
    public Guid ContratoId { get; set; }
    public Guid ManutencaoId { get; set; }
    public string NumOS { get; set; }
    public string ResumoOS { get; set; }
    
    // Datas formatadas (dd/MM/yyyy)
    public string DataSolicitacao { get; set; }
    public string DataDisponibilidade { get; set; }
    public string DataRecolhimento { get; set; }
    public string DataRecebimentoReserva { get; set; }
    public string DataDevolucaoReserva { get; set; }
    public string DataEntrega { get; set; }
    
    // Datas cruas
    public DateTime DataSolicitacaoRaw { get; set; }
    public DateTime? DataDisponibilidadeRaw { get; set; }
    public DateTime? DataDevolucaoRaw { get; set; }
    
    public string StatusOS { get; set; }
    public Guid VeiculoId { get; set; }
    public string DescricaoVeiculo { get; set; }
    public string Sigla { get; set; }
    public string CombustivelDescricao { get; set; }
    public string Placa { get; set; }
    public string Reserva { get; set; }
    
    // Itens do contrato
    public string Descricao { get; set; }
    public int? Quantidade { get; set; }
    public double? ValorUnitario { get; set; }
    public string DataDevolucao { get; set; }
    
    // Cálculos
    public int DiasGlosa { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorGlosa { get; set; }
    public int Dias { get; set; }
    
    // UI
    public string Habilitado { get; set; }
    public string Icon { get; set; }
    public int? NumItem { get; set; }
    public string HabilitadoEditar { get; set; }
}
```

## Interconexões

Controllers de glosa e relatórios financeiros usam esta view para calcular e exibir glosas.

## Notas Importantes

1. **Keyless**: View sem chave primária (`[Keyless]`)
2. **Cálculos**: DiasGlosa e ValorGlosa são calculados na view
3. **Datas Duplas**: Formatadas (string) e raw (DateTime) para diferentes usos

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
