# Documentação: SecaoPatrimonial.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `SecaoPatrimonial` representa seções dentro de setores patrimoniais. Hierarquia: Setor → Seção → Patrimônio.

## Estrutura do Model

```csharp
public class SecaoPatrimonial
{
    [Key]
    public Guid SecaoId { get; set; }

    [Required]
    [StringLength(50)]
    [Display(Name = "NomeSecao")]
    public string? NomeSecao { get; set; }

    public Guid SetorId { get; set; }
    [ForeignKey("SetorId")]
    public virtual SetorPatrimonial? SetorPatrimonial { get; set; }

    public bool Status { get; set; }
}
```

## Notas Importantes

1. **Hierarquia**: Sempre pertence a um SetorPatrimonial
2. **Patrimônios**: Patrimônios pertencem a Setor e Seção

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
