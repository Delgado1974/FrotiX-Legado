# Documentação: Manutencao.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `Manutencao` representa ordens de serviço (OS) de manutenção de veículos. Controla todo o ciclo de vida da manutenção, desde solicitação até devolução, incluindo veículo reserva quando necessário.

**Principais características:**

✅ **Ciclo Completo**: Solicitação → Disponibilidade → Recolhimento → Entrega → Devolução  
✅ **Veículo Reserva**: Suporta empréstimo de veículo reserva durante manutenção  
✅ **Múltiplas Datas**: Controle detalhado de cada etapa  
✅ **Auditoria**: Campos de usuário e data para cada operação  
✅ **Preventiva**: Flag para manutenção preventiva

## Estrutura do Model

```csharp
public class Manutencao
{
    [Key]
    public Guid ManutencaoId { get; set; }

    // Identificação
    [StringLength(50)]
    [Display(Name = "Número da OS")]
    public string? NumOS { get; set; }

    [StringLength(500)]
    [Display(Name = "Resumo da OS")]
    public string? ResumoOS { get; set; }

    [Display(Name = "Status")]
    public string? StatusOS { get; set; }

    [Display(Name = "Man.Preventiva")]
    public bool ManutencaoPreventiva { get; set; }

    [Display(Name = "Quilometragem Manutenção")]
    public int? QuilometragemManutencao { get; set; }

    // Datas do ciclo
    [Display(Name = "Data da Solicitação")]
    public DateTime? DataSolicitacao { get; set; }

    [Display(Name = "Data da Disponibilização")]
    public DateTime? DataDisponibilidade { get; set; }

    [Display(Name = "Data de Recolhimento")]
    public DateTime? DataRecolhimento { get; set; }

    [Display(Name = "Data de Entrega")]
    public DateTime? DataEntrega { get; set; }

    [Display(Name = "Data da Devolução")]
    public DateTime? DataDevolucao { get; set; }

    // Veículo reserva
    [Display(Name = "Carro Reserva")]
    public bool ReservaEnviado { get; set; }

    [Display(Name = "Data da Entrega do Reserva")]
    public DateTime? DataRecebimentoReserva { get; set; }

    [Display(Name = "Data da Devolução do Reserva")]
    public DateTime? DataDevolucaoReserva { get; set; }

    // Relacionamentos
    [Display(Name = "Veículo")]
    public Guid? VeiculoId { get; set; }
    [ForeignKey("VeiculoId")]
    public virtual Veiculo? Veiculo { get; set; }

    [Display(Name = "Veículo Reserva")]
    public Guid? VeiculoReservaId { get; set; }
    [ForeignKey("VeiculoReservaId")]
    public virtual Veiculo? VeiculoReserva { get; set; }

    // Auditoria
    public DateTime? DataCriacao { get; set; }
    public DateTime? DataAlteracao { get; set; }
    public DateTime? DataFinalizacao { get; set; }
    public DateTime? DataCancelamento { get; set; }
    public string? IdUsuarioCriacao { get; set; }
    public string? IdUsuarioAlteracao { get; set; }
    public string? IdUsuarioFinalizacao { get; set; }
    public string? IdUsuarioCancelamento { get; set; }
}
```

## Interconexões

Controllers de manutenção usam este modelo para CRUD completo de ordens de serviço.

## Lógica de Negócio

### Fluxo de Manutenção

1. **Solicitação**: DataSolicitacao preenchida
2. **Disponibilidade**: DataDisponibilidade quando veículo está disponível para recolhimento
3. **Recolhimento**: DataRecolhimento quando veículo é recolhido
4. **Entrega**: DataEntrega quando manutenção é concluída
5. **Devolução**: DataDevolucao quando veículo é devolvido

### Veículo Reserva

Se `ReservaEnviado = true`:
- VeiculoReservaId indica qual veículo foi emprestado
- DataRecebimentoReserva e DataDevolucaoReserva controlam empréstimo

## Notas Importantes

1. **StatusOS**: Valores comuns: "Solicitada", "Em Andamento", "Finalizada", "Cancelada"
2. **Preventiva**: ManutencaoPreventiva indica se é manutenção preventiva ou corretiva
3. **Quilometragem**: QuilometragemManutencao registra KM na data da manutenção

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
