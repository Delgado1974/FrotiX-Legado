# Documentação: MovimentacaoPatrimonio.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `MovimentacaoPatrimonio` representa movimentações de patrimônios entre setores e seções. Controla transferências e mudanças de localização.

## Estrutura do Model

```csharp
public class MovimentacaoPatrimonio
{
    [Key]
    public Guid MovimentacaoPatrimonioId { get; set; }

    [Display(Name = "Data")]
    public DateTime? DataMovimentacao { get; set; }

    public string? ResponsavelMovimentacao { get; set; }

    // Origem
    public Guid? SetorOrigemId { get; set; }
    public Guid? SecaoOrigemId { get; set; }

    // Destino
    public Guid? SetorDestinoId { get; set; }
    public Guid? SecaoDestinoId { get; set; }

    public Guid? PatrimonioId { get; set; }
}
```

## Interconexões

Controllers de patrimônio usam para registrar movimentações.

## Notas Importantes

1. **Origem e Destino**: Setor e Seção de origem e destino
2. **Responsável**: Campo para identificar responsável pela movimentação

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
