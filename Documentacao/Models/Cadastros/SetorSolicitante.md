# Documentação: SetorSolicitante.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `SetorSolicitante` representa setores que solicitam viagens. Suporta hierarquia através de SetorPaiId.

## Estrutura do Model

```csharp
public class SetorSolicitante
{
    [Key]
    public Guid SetorSolicitanteId { get; set; }

    [Required]
    [StringLength(200)]
    [Display(Name = "Nome do Setor")]
    public string? Nome { get; set; }

    [StringLength(50)]
    [Display(Name = "Sigla")]
    public string? Sigla { get; set; }

    [Display(Name = "CNH")]
    public Guid? SetorPaiId { get; set; }  // Hierarquia

    [Required]
    [Display(Name = "Ramal")]
    public int? Ramal { get; set; }

    [Display(Name = "Ativo/Inativo")]
    public bool Status { get; set; }

    public DateTime? DataAlteracao { get; set; }
    public string? UsuarioIdAlteracao { get; set; }
}
```

## Notas Importantes

1. **Hierarquia**: SetorPaiId permite estrutura hierárquica
2. **Ramal**: Ramal telefônico do setor

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
