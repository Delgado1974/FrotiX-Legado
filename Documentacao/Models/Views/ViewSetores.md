# Documentação: ViewSetores.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)

---

## Visão Geral

O Model `ViewSetores` representa uma VIEW do banco de dados que lista setores solicitantes com hierarquia (setor pai). VIEW simples para dropdowns e listagens.

---

## Estrutura do Model

```csharp
public class ViewSetores
{
    public Guid SetorSolicitanteId { get; set; }
    public string? Nome { get; set; }
    public Guid? SetorPaiId { get; set; }
}
```

**Propriedades:**

- `SetorSolicitanteId` (Guid): ID do setor
- `Nome` (string?): Nome do setor
- `SetorPaiId` (Guid?): ID do setor pai (para hierarquia)

---

## Notas Importantes

1. **Hierarquia**: Campo SetorPaiId permite estrutura hierárquica
2. **Lookup**: VIEW simples para dropdowns

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
