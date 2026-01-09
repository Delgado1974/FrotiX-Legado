# Documentação: MotoristaContrato.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `MotoristaContrato` representa a tabela de relacionamento N-N entre Motoristas e Contratos. Chave primária composta por MotoristaId + ContratoId.

## Estrutura do Model

```csharp
public class MotoristaContrato
{
    [Key, Column(Order = 0)]
    public Guid MotoristaId { get; set; }

    [Key, Column(Order = 1)]
    public Guid ContratoId { get; set; }
}
```

## Mapeamento Model ↔ Banco de Dados

### Tabela: `MotoristaContrato`

**Tipo**: Tabela de relacionamento N-N

**Chave Composta**: MotoristaId + ContratoId

## Notas Importantes

1. **Relacionamento N-N**: Um motorista pode estar em múltiplos contratos
2. **Chave Composta**: PK composta por ambas as FKs

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
