# Documentação: ViewRequisitantes.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)

---

## Visão Geral

O Model `ViewRequisitantes` representa uma VIEW do banco de dados simples para listagem de requisitantes. VIEW de lookup usada em dropdowns.

---

## Estrutura do Model

```csharp
public class ViewRequisitantes
{
    public Guid RequisitanteId { get; set; }
    public string? Requisitante { get; set; }
}
```

**Propriedades:**

- `RequisitanteId` (Guid): ID do requisitante
- `Requisitante` (string?): Nome do requisitante

---

## Notas Importantes

1. **VIEW Simples**: Apenas ID e nome
2. **Lookup**: Usada para dropdowns

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
