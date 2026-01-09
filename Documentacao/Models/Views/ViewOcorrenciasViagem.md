# Documentação: ViewOcorrenciasViagem.cs

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
9. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O Model `ViewOcorrenciasViagem` representa uma **VIEW do banco de dados** que consolida informações completas de ocorrências de viagens, incluindo dados da ocorrência, viagem, veículo e motorista. Esta view facilita consultas detalhadas sem necessidade de joins complexos.

**Principais características:**

✅ **View do Banco**: Representa uma VIEW SQL, não uma tabela  
✅ **Dados Consolidados**: Inclui informações de ocorrência, viagem, veículo e motorista  
✅ **Todas as Ocorrências**: Inclui ocorrências abertas e fechadas  
✅ **Cálculo de Urgência**: Inclui campo `DiasEmAberto` e classificação de urgência  
✅ **Otimização**: View pré-calculada para melhor performance em consultas frequentes

### Objetivo

A view `ViewOcorrenciasViagem` resolve o problema de:
- Consultar rapidamente todas as ocorrências de uma viagem
- Evitar joins complexos em múltiplas tabelas
- Acessar informações consolidadas em uma única consulta
- Calcular automaticamente dias em aberto
- Classificar urgência das ocorrências

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Entity Framework Core | 5.0+ | Mapeamento da view |
| SQL Server | - | View no banco de dados |

### Padrões de Design

- **View Pattern**: View SQL para otimização de consultas
- **Read-Only Model**: Model apenas para leitura (não permite INSERT/UPDATE/DELETE)

---

## Estrutura de Arquivos

### Arquivo Principal
```
Models/ViewOcorrenciasViagem.cs
```

### Arquivos Relacionados
- `Repository/ViewOcorrenciasViagemRepository.cs` - Acesso a dados
- `Repository/IRepository/IViewOcorrenciasViagemRepository.cs` - Interface
- `Controllers/OcorrenciaViagemController.cs` - Endpoints que usam a view
- `Pages/Ocorrencia/Ocorrencias.cshtml` - Página de gestão de ocorrências

---

## Estrutura do Model

```csharp
[Table("ViewOcorrenciasViagem")]
public class ViewOcorrenciasViagem
{
    [Key]
    public Guid OcorrenciaViagemId { get; set; }
    public Guid ViagemId { get; set; }
    public Guid VeiculoId { get; set; }
    public Guid? MotoristaId { get; set; }
    public string? Resumo { get; set; }
    public string? Descricao { get; set; }
    public string? ImagemOcorrencia { get; set; }
    public string? Status { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime? DataBaixa { get; set; }
    public string? UsuarioCriacao { get; set; }
    public string? UsuarioBaixa { get; set; }
    public Guid? ItemManutencaoId { get; set; }
    public string? Observacoes { get; set; }
    public DateTime? DataInicial { get; set; }
    public DateTime? DataFinal { get; set; }
    public DateTime? HoraInicio { get; set; }
    public DateTime? HoraFim { get; set; }
    public int? NoFichaVistoria { get; set; }
    public string? Origem { get; set; }
    public string? Destino { get; set; }
    public string? FinalidadeViagem { get; set; }
    public string? StatusViagem { get; set; }
    public string? Placa { get; set; }
    public string? DescricaoMarca { get; set; }
    public string? DescricaoModelo { get; set; }
    public string? VeiculoCompleto { get; set; }
    public string? MarcaModelo { get; set; }
    public string? NomeMotorista { get; set; }
    public string? FotoMotorista { get; set; }
    public int? DiasEmAberto { get; set; }
    public string? Urgencia { get; set; }
    public string? CorUrgencia { get; set; }
}
```

**Propriedades Principais:**

- **Dados da Ocorrência**: `OcorrenciaViagemId`, `Resumo`, `Descricao`, `Status`, `DataCriacao`, `DataBaixa`
- **Dados da Viagem**: `ViagemId`, `DataInicial`, `DataFinal`, `HoraInicio`, `HoraFim`, `Origem`, `Destino`, `FinalidadeViagem`, `StatusViagem`, `NoFichaVistoria`
- **Dados do Veículo**: `VeiculoId`, `Placa`, `DescricaoMarca`, `DescricaoModelo`, `VeiculoCompleto`, `MarcaModelo`
- **Dados do Motorista**: `MotoristaId`, `NomeMotorista`, `FotoMotorista`
- **Cálculos**: `DiasEmAberto`, `Urgencia`, `CorUrgencia`

---

## Mapeamento Model ↔ Banco de Dados

### View: `ViewOcorrenciasViagem`

**Tipo**: VIEW (não é tabela)

**SQL de Criação** (exemplo):
```sql
CREATE VIEW [dbo].[ViewOcorrenciasViagem]
AS
SELECT 
    ov.OcorrenciaViagemId,
    ov.ViagemId,
    ov.VeiculoId,
    ov.MotoristaId,
    ov.Resumo,
    ov.Descricao,
    ov.ImagemOcorrencia,
    ov.Status,
    ov.DataCriacao,
    ov.DataBaixa,
    ov.UsuarioCriacao,
    ov.UsuarioBaixa,
    ov.ItemManutencaoId,
    ov.Observacoes,
    vi.DataInicial,
    vi.DataFinal,
    vi.HoraInicio,
    vi.HoraFim,
    vi.NoFichaVistoria,
    vi.Origem,
    vi.Destino,
    vi.Finalidade AS FinalidadeViagem,
    vi.Status AS StatusViagem,
    v.Placa,
    mv.Descricao AS DescricaoMarca,
    mov.Descricao AS DescricaoModelo,
    CONCAT(v.Placa, ' - ', mv.Descricao, ' ', mov.Descricao) AS VeiculoCompleto,
    CONCAT(mv.Descricao, ' ', mov.Descricao) AS MarcaModelo,
    m.Nome AS NomeMotorista,
    m.Foto AS FotoMotorista,
    CASE 
        WHEN ov.DataBaixa IS NULL THEN DATEDIFF(DAY, ov.DataCriacao, GETDATE())
        ELSE NULL
    END AS DiasEmAberto,
    CASE 
        WHEN ov.DataBaixa IS NOT NULL THEN NULL
        WHEN DATEDIFF(DAY, ov.DataCriacao, GETDATE()) <= 3 THEN 'Baixa'
        WHEN DATEDIFF(DAY, ov.DataCriacao, GETDATE()) <= 7 THEN 'Média'
        ELSE 'Alta'
    END AS Urgencia,
    CASE 
        WHEN ov.DataBaixa IS NOT NULL THEN NULL
        WHEN DATEDIFF(DAY, ov.DataCriacao, GETDATE()) <= 3 THEN 'green'
        WHEN DATEDIFF(DAY, ov.DataCriacao, GETDATE()) <= 7 THEN 'orange'
        ELSE 'red'
    END AS CorUrgencia
FROM OcorrenciaViagem ov
INNER JOIN Viagem vi ON ov.ViagemId = vi.ViagemId
INNER JOIN Veiculo v ON ov.VeiculoId = v.VeiculoId
LEFT JOIN MarcaVeiculo mv ON v.MarcaId = mv.MarcaVeiculoId
LEFT JOIN ModeloVeiculo mov ON v.ModeloId = mov.ModeloVeiculoId
LEFT JOIN Motorista m ON ov.MotoristaId = m.MotoristaId
```

**Mapeamento Model ↔ Banco**:

| Campo no Model | Campo no Banco | Tipo SQL | Tipo C# | Nullable | Descrição |
|----------------|----------------|----------|---------|----------|-----------|
| `OcorrenciaViagemId` | `OcorrenciaViagemId` | `uniqueidentifier` | `Guid` | ❌ | Chave primária |
| `ViagemId` | `ViagemId` | `uniqueidentifier` | `Guid` | ❌ | ID da viagem |
| `Status` | `Status` | `nvarchar(20)` | `string?` | ✅ | Status da ocorrência |
| `DataBaixa` | `DataBaixa` | `datetime2` | `DateTime?` | ✅ | Data de baixa |
| `UsuarioBaixa` | `UsuarioBaixa` | `nvarchar(100)` | `string?` | ✅ | Usuário que baixou |
| `DataInicial` | `DataInicial` (Viagem) | `datetime2` | `DateTime?` | ✅ | Data inicial da viagem |
| `Origem` | `Origem` (Viagem) | `nvarchar(200)` | `string?` | ✅ | Origem da viagem |
| `Destino` | `Destino` (Viagem) | `nvarchar(200)` | `string?` | ✅ | Destino da viagem |
| `FinalidadeViagem` | `Finalidade` (Viagem) | `nvarchar(100)` | `string?` | ✅ | Finalidade |
| `StatusViagem` | `Status` (Viagem) | `nvarchar(50)` | `string?` | ✅ | Status da viagem |
| `FotoMotorista` | `Foto` (Motorista) | `varbinary(max)` | `string?` | ✅ | Foto do motorista |

**Tabelas Envolvidas**:
- `OcorrenciaViagem` (tabela principal)
- `Viagem` (JOIN)
- `Veiculo` (JOIN)
- `MarcaVeiculo` (LEFT JOIN)
- `ModeloVeiculo` (LEFT JOIN)
- `Motorista` (LEFT JOIN)

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **OcorrenciaViagemController.ListarPorViagem()** → Lista Ocorrências de uma Viagem

**Quando**: Usuário visualiza detalhes de uma viagem  
**Por quê**: Retornar todas as ocorrências relacionadas à viagem

```csharp
[HttpGet]
[Route("ListarPorViagem/{viagemId}")]
public IActionResult ListarPorViagem(Guid viagemId)
{
    var ocorrencias = _unitOfWork.ViewOcorrenciasViagem
        .GetAll(o => o.ViagemId == viagemId)
        .OrderByDescending(o => o.DataCriacao)
        .ToList();
    
    return Ok(new { success = true, data = ocorrencias });
}
```

#### 2. **OcorrenciaViagemController.ListarGestao()** → Lista para Gestão

**Quando**: Página de gestão de ocorrências é carregada  
**Por quê**: Listar todas as ocorrências com filtros

```csharp
[HttpGet]
[Route("ListarGestao")]
public IActionResult ListarGestao(string veiculoId = null, string statusId = null)
{
    var query = _unitOfWork.ViewOcorrenciasViagem.GetAll();
    
    if (!string.IsNullOrEmpty(veiculoId))
        query = query.Where(o => o.VeiculoId == Guid.Parse(veiculoId));
    
    if (!string.IsNullOrEmpty(statusId))
        query = query.Where(o => o.Status == statusId);
    
    var ocorrencias = query.OrderByDescending(o => o.DataCriacao).ToList();
    return Ok(new { success = true, data = ocorrencias });
}
```

---

## Lógica de Negócio

### Cálculo de Dias em Aberto

A view calcula dias em aberto apenas para ocorrências não baixadas:

```sql
CASE 
    WHEN ov.DataBaixa IS NULL THEN DATEDIFF(DAY, ov.DataCriacao, GETDATE())
    ELSE NULL
END AS DiasEmAberto
```

**Lógica**:
- Se `DataBaixa` é NULL: Calcula dias desde criação até hoje
- Se `DataBaixa` não é NULL: Retorna NULL (ocorrência já foi baixada)

### Classificação de Urgência

A view classifica urgência apenas para ocorrências abertas:

```sql
CASE 
    WHEN ov.DataBaixa IS NOT NULL THEN NULL
    WHEN DATEDIFF(DAY, ov.DataCriacao, GETDATE()) <= 3 THEN 'Baixa'
    WHEN DATEDIFF(DAY, ov.DataCriacao, GETDATE()) <= 7 THEN 'Média'
    ELSE 'Alta'
END AS Urgencia
```

**Regras**:
- **NULL**: Ocorrência já foi baixada
- **Baixa**: ≤ 3 dias em aberto
- **Média**: 4-7 dias em aberto
- **Alta**: > 7 dias em aberto

---

## Exemplos de Uso

### Cenário 1: Listar Ocorrências de uma Viagem

**Situação**: Usuário visualiza detalhes de uma viagem e precisa ver ocorrências

**Código**:
```csharp
var ocorrencias = _unitOfWork.ViewOcorrenciasViagem
    .GetAll(o => o.ViagemId == viagemId)
    .OrderByDescending(o => o.DataCriacao)
    .Select(o => new {
        o.Resumo,
        o.Descricao,
        o.Status,
        o.DataCriacao,
        o.VeiculoCompleto,
        o.NomeMotorista,
        o.DiasEmAberto,
        o.Urgencia
    })
    .ToList();
```

**Resultado**: Lista completa de ocorrências da viagem com informações consolidadas

---

## Troubleshooting

### Problema: View não retorna dados esperados

**Sintoma**: Consulta à view não retorna resultados ou retorna dados incorretos

**Causa**: JOINs podem estar excluindo registros ou filtros incorretos

**Solução**: Verificar integridade referencial e filtros da view SQL

---

## Notas Importantes

1. **Read-Only**: Esta é uma VIEW, não permite INSERT/UPDATE/DELETE diretamente
2. **Todas as Ocorrências**: Inclui abertas e fechadas (diferente de `ViewOcorrenciasAbertasVeiculo`)
3. **Performance**: View otimizada para consultas frequentes
4. **Cálculos Dinâmicos**: `DiasEmAberto`, `Urgencia` calculados em tempo real

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação de documentação extensiva do modelo `ViewOcorrenciasViagem`

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
