# Documentação: VeiculoAta.md

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

Tabela de relacionamento N-N entre Veículos e Atas de Registro de Preços. Chave primária composta.

## Estrutura do Model

```csharp
public class VeiculoAta
{
    [Key, Column(Order = 0)]
    public Guid VeiculoId { get; set; }

    [Key, Column(Order = 1)]
    public Guid AtaId { get; set; }
}
```

## Notas Importantes

1. **Relacionamento N-N**: Um veículo pode estar em múltiplas atas
2. **Chave Composta**: PK composta

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
