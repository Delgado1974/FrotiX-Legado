# Documentação: LavadoresLavagem.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

Tabela de relacionamento N-N entre Lavagens e Lavadores. Uma lavagem pode ter múltiplos lavadores. Chave primária composta.

## Estrutura do Model

```csharp
public class LavadoresLavagem
{
    [Key, Column(Order = 0)]
    public Guid LavagemId { get; set; }
    [ForeignKey("LavagemId")]
    public virtual Lavagem? Lavagem { get; set; }

    [Key, Column(Order = 1)]
    public Guid LavadorId { get; set; }
    [ForeignKey("LavadorId")]
    public virtual Lavador? Lavador { get; set; }
}
```

## Notas Importantes

1. **Múltiplos Lavadores**: Uma lavagem pode ter vários lavadores
2. **Chave Composta**: PK composta por LavagemId + LavadorId

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
