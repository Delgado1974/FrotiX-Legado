# Documentação: ViewContratoFornecedor.cs

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

O Model `ViewContratoFornecedor` representa uma VIEW do banco de dados que consolida informações de contratos com dados de fornecedores. VIEW simples usada para lookups e dropdowns.

---

## Estrutura do Model

```csharp
public class ViewContratoFornecedor
{
    public Guid ContratoId { get; set; }
    public string? Descricao { get; set; }
    public string? TipoContrato { get; set; }
}
```

**Propriedades:**

- `ContratoId` (Guid): ID do contrato
- `Descricao` (string?): Descrição do contrato (geralmente inclui fornecedor)
- `TipoContrato` (string?): Tipo do contrato

---

## Notas Importantes

1. **VIEW Simples**: Apenas campos essenciais
2. **Lookup**: Usada para dropdowns de contratos

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
