# Documentação: ItensManutencao.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `ItensManutencao` representa itens individuais de uma ordem de serviço de manutenção. Podem ser criados a partir de ocorrências de viagem ou diretamente na manutenção.

**Principais características:**

✅ **Itens de OS**: Itens individuais de uma ordem de serviço  
✅ **Origem de Ocorrências**: Podem vir de ocorrências de viagem  
✅ **Status**: Controle de status do item  
✅ **Imagem**: Suporte a imagem da ocorrência

## Estrutura do Model

```csharp
public class ItensManutencao
{
    [Key]
    public Guid ItemManutencaoId { get; set; }

    public string? TipoItem { get; set; }
    public string? NumFicha { get; set; }
    public DateTime? DataItem { get; set; }
    public string? Resumo { get; set; }
    public string? Descricao { get; set; }
    public string? Status { get; set; }
    public string? ImagemOcorrencia { get; set; }

    public Guid? ManutencaoId { get; set; }
    [ForeignKey("ManutencaoId")]
    public virtual Manutencao Manutencao { get; set; }

    public Guid? MotoristaId { get; set; }
    [ForeignKey("MotoristaId")]
    public virtual Motorista Motorista { get; set; }

    public Guid? ViagemId { get; set; }
    [ForeignKey("ViagemId")]
    public virtual Viagem Viagem { get; set; }

    [NotMapped]
    public string NumOS { get; set; }

    [NotMapped]
    public string DataOS { get; set; }
}
```

## Interconexões

Controllers de manutenção usam para gerenciar itens de OS.

## Notas Importantes

1. **Origem**: Item pode vir de ocorrência de viagem (ViagemId) ou ser criado diretamente
2. **TipoItem**: Indica tipo do item (ex: "Ocorrência", "Manutenção Preventiva")

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
