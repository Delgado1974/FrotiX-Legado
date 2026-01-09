# Documentação: ViewEventos.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)
3. [Mapeamento Model ↔ Banco de Dados](#mapeamento-model--banco-de-dados)

---

## Visão Geral

O Model `ViewEventos` representa uma VIEW do banco de dados que consolida informações de eventos com dados relacionados de requisitantes, setores e custos de viagens relacionadas.

**Principais características:**

✅ **View do Banco**: Representa uma VIEW SQL  
✅ **Dados Consolidados**: Inclui informações de múltiplas tabelas  
✅ **Custo de Viagens**: Inclui custo total das viagens do evento

---

## Estrutura do Model

```csharp
public class ViewEventos
{
    public Guid EventoId { get; set; }
    public string? Nome { get; set; }
    public string? Descricao { get; set; }
    public int? QtdParticipantes { get; set; }
    public string? DataInicial { get; set; }      // Formatada
    public string? DataFinal { get; set; }        // Formatada
    public string? NomeRequisitante { get; set; }
    public string? NomeSetor { get; set; }
    public double? CustoViagem { get; set; }      // Custo total das viagens
    public string? Status { get; set; }
}
```

---

## Notas Importantes

1. **Custo Agregado**: `CustoViagem` é soma dos custos de todas as viagens do evento
2. **Datas Formatadas**: Vêm como string formatada

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
