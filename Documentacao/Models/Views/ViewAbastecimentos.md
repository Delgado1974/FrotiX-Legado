# Documentação: ViewAbastecimentos.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)
3. [Mapeamento Model ↔ Banco de Dados](#mapeamento-model--banco-de-dados)
4. [Interconexões](#interconexões)
5. [Lógica de Negócio](#lógica-de-negócio)

---

## Visão Geral

O Model `ViewAbastecimentos` representa uma VIEW do banco de dados que consolida informações de abastecimentos com dados relacionados de veículos, motoristas, combustíveis e unidades. Facilita consultas e listagens sem necessidade de joins complexos.

**Principais características:**

✅ **View do Banco**: Representa uma VIEW SQL  
✅ **Dados Consolidados**: Inclui informações de múltiplas tabelas  
✅ **Formatação**: Alguns campos já vêm formatados (Data, Hora, valores monetários)  
✅ **Cálculo de Consumo**: Inclui campo de consumo calculado

---

## Estrutura do Model

```csharp
public class ViewAbastecimentos
{
    public Guid AbastecimentoId { get; set; }
    public DateTime? DataHora { get; set; }
    public String? Data { get; set; }              // Formatada (dd/MM/yyyy)
    public String? Hora { get; set; }             // Formatada (HH:mm)
    public string? Placa { get; set; }
    public string? TipoVeiculo { get; set; }
    public string? Nome { get; set; }             // Nome do motorista
    public string? MotoristaCondutor { get; set; }
    public string? TipoCombustivel { get; set; }
    public string? Sigla { get; set; }             // Sigla da unidade
    public string? Litros { get; set; }            // Formatado
    public string? ValorUnitario { get; set; }     // Formatado (R$)
    public string? ValorTotal { get; set; }        // Formatado (R$)
    public string? Consumo { get; set; }           // Formatado
    public decimal? ConsumoGeral { get; set; }     // Valor numérico
    public int KmRodado { get; set; }
    public Guid VeiculoId { get; set; }
    public Guid CombustivelId { get; set; }
    public Guid UnidadeId { get; set; }
    public Guid MotoristaId { get; set; }
}
```

**Propriedades Principais:**

- **Identificação**: AbastecimentoId
- **Data/Hora**: DataHora (raw), Data (formatada), Hora (formatada)
- **Veículo**: Placa, TipoVeiculo, VeiculoId
- **Motorista**: Nome, MotoristaCondutor, MotoristaId
- **Combustível**: TipoCombustivel, CombustivelId
- **Unidade**: Sigla, UnidadeId
- **Valores**: Litros, ValorUnitario, ValorTotal (formatados como string)
- **Consumo**: Consumo (formatado), ConsumoGeral (numérico)
- **KM**: KmRodado

---

## Mapeamento Model ↔ Banco de Dados

### View: `ViewAbastecimentos`

**Tipo**: VIEW (não é tabela)

**SQL de Criação** (exemplo):
```sql
CREATE VIEW [dbo].[ViewAbastecimentos]
AS
SELECT 
    a.AbastecimentoId,
    a.DataHora,
    CONVERT(VARCHAR, a.DataHora, 103) AS Data,  -- Formato dd/MM/yyyy
    CONVERT(VARCHAR, a.DataHora, 108) AS Hora, -- Formato HH:mm:ss
    v.Placa,
    v.Categoria AS TipoVeiculo,
    m.Nome,
    -- ... outros campos
    CAST(a.Litros AS VARCHAR) AS Litros,
    FORMAT(a.ValorUnitario, 'C', 'pt-BR') AS ValorUnitario,
    FORMAT((a.Litros * a.ValorUnitario), 'C', 'pt-BR') AS ValorTotal,
    -- Cálculo de consumo
    CAST(ROUND(a.KmRodado / NULLIF(a.Litros, 0), 2) AS VARCHAR) AS Consumo,
    ROUND(a.KmRodado / NULLIF(a.Litros, 0), 2) AS ConsumoGeral
FROM Abastecimento a
INNER JOIN Veiculo v ON a.VeiculoId = v.VeiculoId
INNER JOIN Motorista m ON a.MotoristaId = m.MotoristaId
INNER JOIN Combustivel c ON a.CombustivelId = c.CombustivelId
LEFT JOIN Unidade u ON v.UnidadeId = u.UnidadeId
```

**Tabelas Envolvidas**:
- `Abastecimento` (tabela principal)
- `Veiculo` (JOIN)
- `Motorista` (JOIN)
- `Combustivel` (JOIN)
- `Unidade` (LEFT JOIN)

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **AbastecimentoController.Get()** → Lista Abastecimentos

**Quando**: Página de listagem de abastecimentos  
**Por quê**: Retornar abastecimentos com dados consolidados

```csharp
[HttpGet]
public IActionResult Get()
{
    var dados = _unitOfWork.ViewAbastecimentos.GetAll()
        .OrderByDescending(va => va.DataHora)
        .ToList();
    
    return Ok(new { data = dados });
}
```

#### 2. **AbastecimentoController.AbastecimentoVeiculos()** → Filtra por Veículo

**Quando**: Consulta abastecimentos de um veículo específico  
**Por quê**: Retornar histórico de abastecimentos do veículo

```csharp
[Route("AbastecimentoVeiculos")]
[HttpGet]
public IActionResult AbastecimentoVeiculos(Guid Id)
{
    var dados = _unitOfWork.ViewAbastecimentos.GetAll()
        .Where(va => va.VeiculoId == Id)
        .OrderByDescending(va => va.DataHora)
        .ToList();
    
    return Ok(new { data = dados });
}
```

---

## Lógica de Negócio

### Cálculo de Consumo

A view calcula consumo (km/litro) automaticamente:

```sql
ROUND(a.KmRodado / NULLIF(a.Litros, 0), 2) AS ConsumoGeral
```

**Lógica**:
- `NULLIF(a.Litros, 0)`: Evita divisão por zero
- `ROUND(..., 2)`: Arredonda para 2 casas decimais
- Resultado: KM por litro

### Formatação de Valores

Valores monetários são formatados na view:

```sql
FORMAT(a.ValorUnitario, 'C', 'pt-BR') AS ValorUnitario
```

**Resultado**: "R$ 5,89" em vez de 5.89

---

## Exemplos de Uso

### Cenário 1: Listar Abastecimentos com Filtros

**Situação**: Página precisa listar abastecimentos com filtros múltiplos

**Código**:
```csharp
var query = _unitOfWork.ViewAbastecimentos.GetAll();

if (!string.IsNullOrEmpty(placa))
    query = query.Where(v => v.Placa.Contains(placa));

if (veiculoId.HasValue)
    query = query.Where(v => v.VeiculoId == veiculoId.Value);

if (dataInicial.HasValue)
    query = query.Where(v => v.DataHora >= dataInicial.Value);

var abastecimentos = query
    .OrderByDescending(v => v.DataHora)
    .ToList();
```

**Resultado**: Lista filtrada de abastecimentos com dados consolidados

---

## Troubleshooting

### Problema: Valores formatados não podem ser ordenados

**Sintoma**: Ordenação por ValorTotal não funciona corretamente

**Causa**: Campo `ValorTotal` é string formatada ("R$ 5,89")

**Solução**: Usar campo numérico calculado ou ordenar por `DataHora` e formatar no frontend

---

## Notas Importantes

1. **Read-Only**: VIEW, não permite INSERT/UPDATE/DELETE
2. **Formatação**: Alguns campos já vêm formatados (strings)
3. **Performance**: View otimizada para consultas frequentes
4. **Consumo**: Calculado automaticamente (km/litro)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação de documentação extensiva do modelo `ViewAbastecimentos`

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
