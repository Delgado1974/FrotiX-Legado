# Documentação: SetorPatrimonial.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `SetorPatrimonial` representa setores para controle patrimonial. Diferente de `SetorSolicitante`, é específico para patrimônios.

## Estrutura do Model

```csharp
public class SetorPatrimonial
{
    [Key]
    public Guid SetorId { get; set; }

    [Required]
    [StringLength(50)]
    [Display(Name = "Nome do Setor")]
    public string? NomeSetor { get; set; }

    public string? DetentorId { get; set; }
    public bool Status { get; set; }
    public bool SetorBaixa { get; set; }
}
```

## Notas Importantes

1. **Patrimonial**: Específico para controle patrimonial
2. **SetorBaixa**: Flag para setor de baixa de patrimônios

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
