# Documentação: EstatisticaVeiculoDto.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Estrutura do Model](#estrutura-do-model)
5. [Interconexões](#interconexões)
6. [Lógica de Negócio](#lógica-de-negócio)
7. [Exemplos de Uso](#exemplos-de-uso)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O DTO `EstatisticaVeiculoDto` contém estatísticas detalhadas de viagens de um veículo para validação inteligente. É usado pela IA evolutiva do sistema para calibrar alertas baseados no histórico do veículo, detectando anomalias através de análise estatística (Z-Score, percentis).

**Principais características:**

✅ **Estatísticas Completas**: Média, mediana, desvio padrão, percentis  
✅ **Análise de Anomalias**: Z-Score para detectar valores fora do padrão  
✅ **Classificação Automática**: Níveis de anomalia (Normal, Leve, Moderada, Severa)  
✅ **Validação de Dados**: Verifica se há dados suficientes para análise  
✅ **IA Evolutiva**: Suporta sistema de validação inteligente

### Objetivo

O `EstatisticaVeiculoDto` resolve o problema de:
- Detectar viagens com valores anômalos (KM ou duração)
- Calibrar alertas baseados no histórico do veículo
- Validar dados de forma inteligente usando estatística
- Reduzir falsos positivos em validações
- Adaptar validações ao padrão de uso de cada veículo

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| C# | 9.0+ | Cálculos estatísticos |
| ASP.NET Core | 5.0+ | APIs de validação |

### Padrões de Design

- **DTO Pattern**: Transferência de dados estatísticos
- **Strategy Pattern**: Diferentes níveis de anomalia
- **Statistical Analysis**: Análise estatística (Z-Score, percentis)

---

## Estrutura de Arquivos

### Arquivo Principal
```
Models/DTO/EstatisticaVeiculoDto.cs
```

### Arquivos Relacionados
- Services de validação inteligente
- Controllers de viagem que usam validação
- `Models/VeiculoPadraoViagem.cs` - Model relacionado

---

## Estrutura do Model

```csharp
public class EstatisticaVeiculoDto
{
    // Identificação
    public Guid VeiculoId { get; set; }
    public string Placa { get; set; }
    public string Descricao { get; set; }
    
    // Contagem
    public int TotalViagens { get; set; }
    
    // Estatísticas de KM
    public double KmMedio { get; set; }
    public double KmMediano { get; set; }
    public double KmDesvioPadrao { get; set; }
    public int KmMinimo { get; set; }
    public int KmMaximo { get; set; }
    public double KmPercentil95 { get; set; }
    public double KmPercentil99 { get; set; }
    
    // Estatísticas de Duração
    public double DuracaoMediaMinutos { get; set; }
    public double DuracaoMedianaMinutos { get; set; }
    public double DuracaoDesvioPadraoMinutos { get; set; }
    public int DuracaoMinimaMinutos { get; set; }
    public int DuracaoMaximaMinutos { get; set; }
    public double DuracaoPercentil95Minutos { get; set; }
    
    // Metadados
    public DateTime? DataViagemMaisAntiga { get; set; }
    public DateTime? DataViagemMaisRecente { get; set; }
    
    // Propriedades calculadas
    public bool DadosSuficientes => TotalViagens >= 10;
    public bool DadosMinimos => TotalViagens >= 3;
    
    // Métodos de análise
    public double CalcularZScoreKm(int kmRodado);
    public double CalcularZScoreDuracao(int duracaoMinutos);
    public NivelAnomalia ClassificarKm(int kmRodado);
    public NivelAnomalia ClassificarDuracao(int duracaoMinutos);
}
```

**Propriedades Principais:**

- **Identificação**: VeiculoId, Placa, Descricao
- **Estatísticas de KM**: Média, mediana, desvio padrão, min/max, percentis
- **Estatísticas de Duração**: Média, mediana, desvio padrão, min/max, percentis
- **Validação**: DadosSuficientes (>=10), DadosMinimos (>=3)

### Enum: `NivelAnomalia`

```csharp
public enum NivelAnomalia
{
    SemDados = 0,      // Não há dados suficientes
    Normal = 1,        // Dentro do padrão
    Leve = 2,          // Z-Score 1.5-2.5
    Moderada = 3,      // Z-Score 2.5-3.5 - requer confirmação
    Severa = 4         // Z-Score > 3.5 - requer justificativa
}
```

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **Services de Validação** → Calcula Estatísticas

**Quando**: Sistema precisa validar viagem  
**Por quê**: Obter estatísticas para comparação

```csharp
public EstatisticaVeiculoDto CalcularEstatisticas(Guid veiculoId)
{
    var viagens = _unitOfWork.Viagem
        .GetAll(v => v.VeiculoId == veiculoId && v.Status == "Finalizada")
        .ToList();
    
    return new EstatisticaVeiculoDto
    {
        VeiculoId = veiculoId,
        TotalViagens = viagens.Count,
        KmMedio = viagens.Average(v => v.KmRodado ?? 0),
        // ... outros cálculos
    };
}
```

#### 2. **Controllers de Viagem** → Valida Antes de Salvar

**Quando**: Usuário cria/edita viagem  
**Por quê**: Validar se valores estão dentro do padrão

```csharp
var estatisticas = _estatisticaService.CalcularEstatisticas(veiculoId);
var nivelAnomalia = estatisticas.ClassificarKm(viagem.KmRodado);

if (nivelAnomalia == NivelAnomalia.Severa)
{
    // Requer justificativa
    return BadRequest("KM rodado muito acima do padrão. Justificativa obrigatória.");
}
```

---

## Lógica de Negócio

### Cálculo de Z-Score

Z-Score mede quantos desvios padrão um valor está da média:

```csharp
public double CalcularZScoreKm(int kmRodado)
{
    if (KmDesvioPadrao <= 0 || TotalViagens < 3) return 0;
    return (kmRodado - KmMedio) / KmDesvioPadrao;
}
```

**Interpretação**:
- Z < 1.5: Normal
- 1.5 ≤ Z < 2.5: Leve anomalia
- 2.5 ≤ Z < 3.5: Moderada anomalia
- Z ≥ 3.5: Severa anomalia

### Classificação de Anomalias

```csharp
public NivelAnomalia ClassificarKm(int kmRodado)
{
    if (!DadosMinimos) return NivelAnomalia.SemDados;
    
    var zScore = Math.Abs(CalcularZScoreKm(kmRodado));
    
    if (zScore > 3.5) return NivelAnomalia.Severa;
    if (zScore > 2.5) return NivelAnomalia.Moderada;
    if (zScore > 1.5) return NivelAnomalia.Leve;
    return NivelAnomalia.Normal;
}
```

---

## Exemplos de Uso

### Cenário 1: Validar KM de Viagem

**Situação**: Usuário cadastra viagem com KM suspeito

**Código**:
```csharp
var estatisticas = CalcularEstatisticas(veiculoId);
var nivel = estatisticas.ClassificarKm(viagem.KmRodado);

switch (nivel)
{
    case NivelAnomalia.Severa:
        // Bloquear ou exigir justificativa
        break;
    case NivelAnomalia.Moderada:
        // Alertar usuário
        break;
    case NivelAnomalia.Normal:
        // Permitir normalmente
        break;
}
```

---

## Troubleshooting

### Problema: Z-Score sempre retorna 0

**Sintoma**: Análise não detecta anomalias

**Causa**: Desvio padrão = 0 ou poucos dados

**Solução**: Verificar se há pelo menos 3 viagens e desvio padrão > 0

---

## Notas Importantes

1. **Dados Mínimos**: Requer pelo menos 3 viagens para análise básica
2. **Dados Suficientes**: Requer pelo menos 10 viagens para análise confiável
3. **Z-Score Absoluto**: Usa valor absoluto (ignora se acima ou abaixo)
4. **Percentis**: Percentil 95/99 ajudam a identificar outliers

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação de documentação extensiva do DTO `EstatisticaVeiculoDto`

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
