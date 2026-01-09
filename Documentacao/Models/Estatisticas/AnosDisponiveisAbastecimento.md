# Documentação: AnosDisponiveisAbastecimento.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)
3. [Mapeamento Model ↔ Banco de Dados](#mapeamento-model--banco-de-dados)
4. [Interconexões](#interconexões)

---

## Visão Geral

O Model `AnosDisponiveisAbastecimento` representa os anos disponíveis para consulta de abastecimentos, incluindo contagem total de abastecimentos por ano. Usado para popular dropdowns de filtro por ano.

**Principais características:**

✅ **Lookup de Anos**: Lista anos disponíveis  
✅ **Contagem**: Total de abastecimentos por ano  
✅ **Chave Simples**: Ano como chave primária

---

## Estrutura do Model

```csharp
[Table("AnosDisponiveisAbastecimento")]
public class AnosDisponiveisAbastecimento
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public int Ano { get; set; }

    public int TotalAbastecimentos { get; set; }

    public DateTime DataAtualizacao { get; set; }
}
```

**Características Especiais:**

- `DatabaseGeneratedOption.None`: Ano não é auto-incrementado, é o valor real do ano
- Chave primária é o próprio ano (int)

---

## Interconexões

### Quem Chama Este Arquivo

Controllers de abastecimento usam para popular dropdown de anos:

```csharp
var anos = _unitOfWork.AnosDisponiveisAbastecimento
    .GetAll()
    .OrderByDescending(a => a.Ano)
    .Select(a => new SelectListItem
    {
        Value = a.Ano.ToString(),
        Text = a.Ano.ToString()
    })
    .ToList();
```

---

## Notas Importantes

1. **Lookup Table**: Tabela de referência para anos disponíveis
2. **Chave Int**: Ano como chave primária (não Guid)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
