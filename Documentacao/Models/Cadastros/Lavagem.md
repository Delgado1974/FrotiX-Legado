# Documentação: Lavagem.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `Lavagem` representa registros de lavagem de veículos. Vinculado a um veículo e motorista, com controle de data e horários.

## Estrutura do Model

```csharp
public class Lavagem
{
    [Key]
    public Guid LavagemId { get; set; }

    [Display(Name = "Data")]
    public DateTime? Data { get; set; }

    [Display(Name = "Horário Início")]
    public DateTime? HorarioInicio { get; set; }

    [Display(Name = "Horário Fim")]
    public DateTime? HorarioFim { get; set; }

    [Display(Name = "Veículo Lavado")]
    public Guid VeiculoId { get; set; }
    [ForeignKey("VeiculoId")]
    public virtual Veiculo? Veiculo { get; set; }

    [Display(Name = "Motorista")]
    public Guid MotoristaId { get; set; }
    [ForeignKey("MotoristaId")]
    public virtual Motorista? Motorista { get; set; }
}
```

## Notas Importantes

1. **Lavadores Múltiplos**: Uma lavagem pode ter múltiplos lavadores (tabela `LavadoresLavagem`)
2. **Duração**: Calculada como HorarioFim - HorarioInicio

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
