# Documentação: EstatisticaGeralMensal.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Estrutura do Model](#estrutura-do-model)
5. [Mapeamento Model ↔ Banco de Dados](#mapeamento-model--banco-de-dados)
6. [Interconexões](#interconexões)
7. [Lógica de Negócio](#lógica-de-negócio)
8. [Exemplos de Uso](#exemplos-de-uso)

---

## Visão Geral

O Model `EstatisticaGeralMensal` representa estatísticas consolidadas mensais de toda a frota, incluindo dados de motoristas, viagens, multas e abastecimentos. É uma tabela de agregação pré-calculada para melhor performance em dashboards e relatórios.

**Principais características:**

✅ **Agregação Mensal**: Dados consolidados por mês/ano  
✅ **Múltiplas Métricas**: Motoristas, viagens, multas, abastecimentos  
✅ **Performance**: Pré-calculado para consultas rápidas  
✅ **Dashboard**: Usado em dashboards gerais

### Objetivo

O `EstatisticaGeralMensal` resolve o problema de:
- Agregar dados de múltiplas entidades em uma única consulta
- Melhorar performance de dashboards
- Facilitar comparações mensais
- Reduzir carga no banco em consultas frequentes

---

## Estrutura do Model

```csharp
[Table("EstatisticaGeralMensal")]
public class EstatisticaGeralMensal
{
    [Key]
    public Guid Id { get; set; }

    public int Ano { get; set; }
    public int Mes { get; set; }

    // Motoristas
    public int TotalMotoristas { get; set; }
    public int MotoristasAtivos { get; set; }
    public int MotoristasInativos { get; set; }
    public int Efetivos { get; set; }
    public int Feristas { get; set; }
    public int Cobertura { get; set; }

    // Viagens
    public int TotalViagens { get; set; }
    public decimal KmTotal { get; set; }
    public decimal HorasTotais { get; set; }

    // Multas
    public int TotalMultas { get; set; }
    public decimal ValorTotalMultas { get; set; }

    // Abastecimentos
    public int TotalAbastecimentos { get; set; }

    // Controle
    public DateTime DataAtualizacao { get; set; }
}
```

**Propriedades:**

- **Período**: Ano, Mes
- **Motoristas**: Total, Ativos, Inativos, Efetivos, Feristas, Cobertura
- **Viagens**: Total, KM Total, Horas Totais
- **Multas**: Total, Valor Total
- **Abastecimentos**: Total
- **Controle**: DataAtualizacao

---

## Mapeamento Model ↔ Banco de Dados

### Tabela: `EstatisticaGeralMensal`

**Tipo**: Tabela de agregação

**Chaves e Índices**:
- **PK**: `Id` (CLUSTERED)
- **IX**: `IX_EstatisticaGeralMensal_Ano_Mes` (Ano, Mes) - Para consultas por período

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **Dashboard Controllers** → Consulta Estatísticas

**Quando**: Dashboard precisa de dados gerais  
**Por quê**: Retornar estatísticas consolidadas rapidamente

```csharp
var estatisticas = _unitOfWork.EstatisticaGeralMensal
    .GetAll(e => e.Ano == ano && e.Mes == mes)
    .FirstOrDefault();
```

---

## Lógica de Negócio

### Cálculo de Estatísticas

Estatísticas são calculadas periodicamente (job/processo) e armazenadas:

```csharp
var estatistica = new EstatisticaGeralMensal
{
    Ano = DateTime.Now.Year,
    Mes = DateTime.Now.Month,
    TotalMotoristas = _unitOfWork.Motorista.GetAll().Count(),
    MotoristasAtivos = _unitOfWork.Motorista.GetAll(m => m.Status == true).Count(),
    TotalViagens = _unitOfWork.Viagem.GetAll(v => 
        v.DataInicial.Year == ano && v.DataInicial.Month == mes).Count(),
    // ... outros cálculos
};
```

---

## Notas Importantes

1. **Pré-calculado**: Dados são calculados periodicamente, não em tempo real
2. **Atualização**: Campo `DataAtualizacao` indica quando foi calculado
3. **Performance**: Consultas muito mais rápidas que agregar em tempo real

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
