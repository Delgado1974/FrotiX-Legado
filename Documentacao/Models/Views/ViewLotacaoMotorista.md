# Documentação: ViewLotacaoMotorista.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)

---

## Visão Geral

O Model `ViewLotacaoMotorista` representa uma VIEW do banco de dados que consolida informações de lotações de motoristas em unidades, incluindo status de lotação, motivos e motorista de cobertura.

---

## Estrutura do Model

```csharp
public class ViewLotacaoMotorista
{
    public Guid UnidadeId { get; set; }
    public Guid LotacaoMotoristaId { get; set; }
    public Guid MotoristaId { get; set; }
    public bool Lotado { get; set; }
    public string? Motivo { get; set; }
    public string? Unidade { get; set; }
    public string? DataInicial { get; set; }       // Formatada
    public string? DataFim { get; set; }          // Formatada
    public string? MotoristaCobertura { get; set; }
}
```

**Propriedades Principais:**

- **Lotação**: LotacaoMotoristaId, Lotado, Motivo
- **Unidade**: UnidadeId, Unidade (nome)
- **Motorista**: MotoristaId
- **Cobertura**: MotoristaCobertura (nome do motorista de cobertura)
- **Período**: DataInicial, DataFim (formatadas)

---

## Notas Importantes

1. **Lotação**: Campo `Lotado` indica se motorista está lotado na unidade
2. **Cobertura**: MotoristaCobertura é o motorista que cobre durante ausência

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
