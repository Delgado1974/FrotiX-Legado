# Documentação: ViewLotacoes.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)

---

## Visão Geral

O Model `ViewLotacoes` representa uma VIEW do banco de dados que consolida informações de lotações de motoristas em unidades, incluindo categoria, nome da unidade e motorista.

---

## Estrutura do Model

```csharp
public class ViewLotacoes
{
    public Guid LotacaoMotoristaId { get; set; }
    public Guid MotoristaId { get; set; }
    public Guid UnidadeId { get; set; }
    public string? NomeCategoria { get; set; }
    public string? Unidade { get; set; }
    public string? Motorista { get; set; }
    public string? DataInicio { get; set; }      // Formatada
    public bool Lotado { get; set; }
}
```

---

## Notas Importantes

1. **Categoria**: NomeCategoria indica tipo de lotação
2. **Status**: Campo Lotado indica se está lotado

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
