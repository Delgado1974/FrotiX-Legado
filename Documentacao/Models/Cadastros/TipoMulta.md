# Documentação: TipoMulta.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `TipoMulta` representa tipos de multas de trânsito com informações do código de trânsito (artigo, descrição, código Denatran).

## Estrutura do Model

```csharp
public class TipoMulta
{
    [Key]
    public Guid TipoMultaId { get; set; }

    [Required]
    [StringLength(100)]
    [Display(Name = "Artigo/Parágrafo/Inciso")]
    public string? Artigo { get; set; }

    [Required]
    [Display(Name = "Descrição")]
    public string? Descricao { get; set; }

    [Required]
    [Display(Name = "Infração")]
    public string? Infracao { get; set; }

    [Display(Name = "Código Denatran")]
    public string? CodigoDenatran { get; set; }

    [Display(Name = "Desdobramento Denatran")]
    public string? Desdobramento { get; set; }
}
```

## Interconexões

Multas têm TipoMultaId vinculado.

## Notas Importantes

1. **Código Denatran**: Código oficial do Denatran
2. **Artigo**: Artigo do CTB (Código de Trânsito Brasileiro)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
