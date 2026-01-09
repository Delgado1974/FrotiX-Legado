# Documentação: ViewVeiculos.cs

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

O Model `ViewVeiculos` representa uma VIEW do banco de dados que consolida informações completas de veículos, incluindo dados do veículo, marca/modelo, unidade, consumo médio, contrato/ata e informações de alteração.

**Principais características:**

✅ **View do Banco**: Representa uma VIEW SQL  
✅ **Dados Consolidados**: Inclui informações de múltiplas tabelas  
✅ **Cálculo de Consumo**: Inclui consumo médio calculado  
✅ **Contrato/Ata**: Informações de vinculação com contratos e atas

---

## Estrutura do Model

```csharp
public class ViewVeiculos
{
    public Guid VeiculoId { get; set; }
    public string? Placa { get; set; }
    public bool? Economildo { get; set; }
    public int? Quilometragem { get; set; }
    public string? VeiculoCompleto { get; set; }  // Placa + (Marca/Modelo)
    public string? MarcaModelo { get; set; }     // Marca/Modelo
    public string? Sigla { get; set; }           // Sigla da unidade
    public string? Descricao { get; set; }       // Descrição do combustível
    public decimal? Consumo { get; set; }        // Consumo médio calculado
    public string? OrigemVeiculo { get; set; }   // Próprio/Locação
    public string? DataAlteracao { get; set; }   // Formatada
    public string? NomeCompleto { get; set; }    // Usuário que alterou
    public string? VeiculoReserva { get; set; }  // Efetivo/Reserva
    public bool? Status { get; set; }
    public Guid? CombustivelId { get; set; }
    public long? RowNum { get; set; }             // ROW_NUMBER para paginação
    public Guid? ContratoId { get; set; }
    public Guid? AtaId { get; set; }
    public string? ContratoVeiculo { get; set; }
    public string? AtaVeiculo { get; set; }
    public bool? VeiculoProprio { get; set; }
    public Guid? ItemVeiculoAtaId { get; set; }
    public Guid? ItemVeiculoId { get; set; }
    public double? ValorMensal { get; set; }
    // ... outros campos
}
```

**Propriedades Principais:**

- **Veículo**: VeiculoId, Placa, Quilometragem, Status
- **Descrição**: VeiculoCompleto, MarcaModelo
- **Unidade**: Sigla
- **Combustível**: Descricao, CombustivelId
- **Consumo**: Consumo (médio calculado)
- **Contrato/Ata**: ContratoId, AtaId, ContratoVeiculo, AtaVeiculo
- **Auditoria**: DataAlteracao, NomeCompleto

---

## Mapeamento Model ↔ Banco de Dados

### View: `ViewVeiculos`

**Tipo**: VIEW (não é tabela)

**Tabelas Envolvidas**:
- `Veiculo` (tabela principal)
- `MarcaVeiculo` (JOIN)
- `ModeloVeiculo` (JOIN)
- `Unidade` (LEFT JOIN)
- `Combustivel` (LEFT JOIN)
- `AspNetUsers` (LEFT JOIN)
- `ViewContratoFornecedor_Veiculos` (LEFT JOIN)
- `ViewAtaFornecedor` (LEFT JOIN)

**Cálculos na View**:
- `VeiculoCompleto`: CONCAT(Placa, ' (', Marca, '/', Modelo, ')')
- `Consumo`: AVG(KmRodado / Litros) dos abastecimentos
- `OrigemVeiculo`: CASE WHEN VeiculoProprio = 1 THEN 'Próprio' ELSE 'Locação' END

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **VeiculoController.Get()** → Lista Veículos

**Quando**: Página de listagem de veículos  
**Por quê**: Retornar veículos com dados consolidados

```csharp
var veiculos = _unitOfWork.ViewVeiculos.GetAll()
    .Where(v => v.Status == true)
    .OrderBy(v => v.Placa)
    .ToList();
```

---

## Notas Importantes

1. **View Complexa**: Múltiplos JOINs e cálculos
2. **Consumo Médio**: Calculado a partir de abastecimentos
3. **Contrato/Ata**: Informações de vinculação incluídas
4. **RowNum**: Campo para paginação (ROW_NUMBER)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
