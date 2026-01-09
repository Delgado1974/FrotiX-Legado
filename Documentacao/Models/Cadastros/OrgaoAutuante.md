# Documentação: OrgaoAutuante.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `OrgaoAutuante` representa órgãos que aplicam multas (ex: DETRAN, Polícia Rodoviária Federal). Cadastro simples com sigla e nome.

## Estrutura do Model

```csharp
public class OrgaoAutuante
{
    [Key]
    public Guid OrgaoAutuanteId { get; set; }

    [Required]
    [StringLength(50)]
    [Display(Name = "Sigla")]
    public string? Sigla { get; set; }

    [Required]
    [StringLength(100)]
    [Display(Name = "Nome")]
    public string? Nome { get; set; }
}
```

## Interconexões

Multas e EmpenhoMulta têm OrgaoAutuanteId vinculado.

## Notas Importantes

1. **Cadastro Simples**: Apenas sigla e nome
2. **Sigla Única**: Considerar constraint UNIQUE na sigla

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
