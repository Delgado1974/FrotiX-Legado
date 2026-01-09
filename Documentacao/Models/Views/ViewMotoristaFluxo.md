# Documentação: ViewMotoristaFluxo.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)

---

## Visão Geral

O Model `ViewMotoristaFluxo` representa uma VIEW do banco de dados simples para listagem de motoristas em fluxos de trabalho. VIEW de lookup usada em dropdowns e seleções.

---

## Estrutura do Model

```csharp
public class ViewMotoristaFluxo
{
    public string? MotoristaId { get; set; }     // String em vez de Guid
    public string? NomeMotorista { get; set; }
}
```

**Nota Especial**: Campo `MotoristaId` é string em vez de Guid (pode ser para compatibilidade com algum sistema externo).

---

## Notas Importantes

1. **VIEW Simples**: Apenas ID e nome
2. **ID como String**: Diferente do padrão (Guid)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
