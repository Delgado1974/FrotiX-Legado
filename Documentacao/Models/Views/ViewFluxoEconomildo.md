# Documentação: ViewFluxoEconomildo.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

VIEW que consolida informações de viagens do sistema Economildo (sistema de transporte público). Inclui dados de veículos, motoristas, horários e quantidade de passageiros.

## Estrutura do Model

```csharp
public class ViewFluxoEconomildo
{
    public Guid VeiculoId { get; set; }
    public Guid ViagemEconomildoId { get; set; }
    public Guid MotoristaId { get; set; }
    public string? TipoCondutor { get; set; }
    public DateTime? Data { get; set; }
    public string? MOB { get; set; }              // Identificador MOB
    public string? HoraInicio { get; set; }      // Formatada
    public string? HoraFim { get; set; }         // Formatada
    public int? QtdPassageiros { get; set; }
    public string? NomeMotorista { get; set; }
    public string? DescricaoVeiculo { get; set; }
}
```

## Notas Importantes

1. **Sistema Economildo**: Integração com sistema de transporte público
2. **MOB**: Identificador do sistema Economildo
3. **Passageiros**: Campo QtdPassageiros específico deste tipo de viagem

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
