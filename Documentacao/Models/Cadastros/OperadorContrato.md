# Documentação: OperadorContrato.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

Tabela de relacionamento N-N entre Operadores e Contratos. Chave primária composta.

## Estrutura do Model

```csharp
public class OperadorContrato
{
    [Key, Column(Order = 0)]
    public Guid OperadorId { get; set; }

    [Key, Column(Order = 1)]
    public Guid ContratoId { get; set; }
}
```

## Notas Importantes

1. **Relacionamento N-N**: Um operador pode estar em múltiplos contratos
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
