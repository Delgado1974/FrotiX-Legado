# Documentação: ViewOcorrenciasAbertasVeiculo.cs

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

O Model `ViewOcorrenciasAbertasVeiculo` representa uma **VIEW do banco de dados** que consolida informações de ocorrências de viagens que estão **abertas** (não resolvidas) agrupadas por veículo. Esta view facilita consultas rápidas de ocorrências pendentes sem necessidade de joins complexos.

**Principais características:**

✅ **View do Banco**: Representa uma VIEW SQL, não uma tabela  
✅ **Filtro Automático**: Apenas ocorrências abertas (Status = "Aberta")  
✅ **Dados Consolidados**: Inclui informações de veículo, motorista e viagem  
✅ **Cálculo de Urgência**: Inclui campo `DiasEmAberto` e classificação de urgência  
✅ **Otimização**: View pré-calculada para melhor performance em consultas frequentes

### Objetivo

A view `ViewOcorrenciasAbertasVeiculo` resolve o problema de:
- Consultar rapidamente ocorrências abertas por veículo
- Evitar joins complexos em múltiplas tabelas
- Calcular automaticamente dias em aberto
- Classificar urgência das ocorrências
- Exibir informações consolidadas em popups e listagens

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
Models/ViewOcorrenciasAbertasVeiculo.cs
```

### Arquivos Relacionados
- `Repository/ViewOcorrenciasAbertasVeiculoRepository.cs` - Acesso a dados
- `Repository/IRepository/IViewOcorrenciasAbertasVeiculoRepository.cs` - Interface
- `Controllers/OcorrenciaViagemController.cs` - Endpoints que usam a view
- `Pages/Viagens/Upsert.cshtml` - Popup de ocorrências abertas
- `wwwroot/js/cadastros/ViagemUpsert.js` - JavaScript que consome a API

---

## Estrutura do Model

```csharp
[Table("ViewOcorrenciasAbertasVeiculo")]
public class ViewOcorrenciasAbertasVeiculo
{
    [Key]
    public Guid OcorrenciaViagemId { get; set; }
    public Guid ViagemId { get; set; }
    public Guid VeiculoId { get; set; }
    public Guid? MotoristaId { get; set; }
    public string? Resumo { get; set; }
    public string? Descricao { get; set; }
    public string? ImagemOcorrencia { get; set; }
    public DateTime DataCriacao { get; set; }
    public string? UsuarioCriacao { get; set; }
    public string? Placa { get; set; }
    public string? DescricaoMarca { get; set; }
    public string? DescricaoModelo { get; set; }
    public string? VeiculoCompleto { get; set; }
    public DateTime? DataViagem { get; set; }
    public int? NoFichaVistoria { get; set; }
    public string? NomeMotorista { get; set; }
    public int? DiasEmAberto { get; set; }
    public string? Urgencia { get; set; }
    public string? CorUrgencia { get; set; }
}
```

**Propriedades Principais:**

- `OcorrenciaViagemId` (Guid): Chave primária da ocorrência
- `ViagemId` (Guid): ID da viagem relacionada
- `VeiculoId` (Guid): ID do veículo
- `MotoristaId` (Guid?): ID do motorista (opcional)
- `Resumo` (string?): Resumo da ocorrência
- `Descricao` (string?): Descrição detalhada
- `ImagemOcorrencia` (string?): Caminho da imagem da ocorrência
- `DataCriacao` (DateTime): Data de criação da ocorrência
- `Placa` (string?): Placa do veículo (da tabela Veiculo)
- `VeiculoCompleto` (string?): Descrição completa do veículo (Placa + Marca + Modelo)
- `DataViagem` (DateTime?): Data da viagem relacionada
- `NoFichaVistoria` (int?): Número da ficha de vistoria
- `NomeMotorista` (string?): Nome do motorista (da tabela Motorista)
- `DiasEmAberto` (int?): Quantidade de dias que a ocorrência está aberta (calculado)
- `Urgencia` (string?): Classificação de urgência ("Baixa", "Média", "Alta")
- `CorUrgencia` (string?): Cor CSS para exibição da urgência

---

## Mapeamento Model ↔ Banco de Dados

### View: `ViewOcorrenciasAbertasVeiculo`

**Tipo**: VIEW (não é tabela)

**SQL de Criação** (exemplo):
```sql
CREATE VIEW [dbo].[ViewOcorrenciasAbertasVeiculo]
AS
SELECT 
    ov.OcorrenciaViagemId,
    ov.ViagemId,
    ov.VeiculoId,
    ov.MotoristaId,
    ov.Resumo,
    ov.Descricao,
    ov.ImagemOcorrencia,
    ov.DataCriacao,
    ov.UsuarioCriacao,
    v.Placa,
    mv.Descricao AS DescricaoMarca,
    mov.Descricao AS DescricaoModelo,
    CONCAT(v.Placa, ' - ', mv.Descricao, ' ', mov.Descricao) AS VeiculoCompleto,
    vi.DataInicial AS DataViagem,
    vi.NoFichaVistoria,
    m.Nome AS NomeMotorista,
    DATEDIFF(DAY, ov.DataCriacao, GETDATE()) AS DiasEmAberto,
    CASE 
        WHEN DATEDIFF(DAY, ov.DataCriacao, GETDATE()) <= 3 THEN 'Baixa'
        WHEN DATEDIFF(DAY, ov.DataCriacao, GETDATE()) <= 7 THEN 'Média'
        ELSE 'Alta'
    END AS Urgencia,
    CASE 
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
WHERE ov.Status = 'Aberta' 
  AND (ov.StatusOcorrencia IS NULL OR ov.StatusOcorrencia = 1)
```

**Mapeamento Model ↔ Banco**:

| Campo no Model | Campo no Banco | Tipo SQL | Tipo C# | Nullable | Descrição |
|----------------|----------------|----------|---------|----------|-----------|
| `OcorrenciaViagemId` | `OcorrenciaViagemId` | `uniqueidentifier` | `Guid` | ❌ | Chave primária |
| `ViagemId` | `ViagemId` | `uniqueidentifier` | `Guid` | ❌ | ID da viagem |
| `VeiculoId` | `VeiculoId` | `uniqueidentifier` | `Guid` | ❌ | ID do veículo |
| `MotoristaId` | `MotoristaId` | `uniqueidentifier` | `Guid?` | ✅ | ID do motorista |
| `Resumo` | `Resumo` | `nvarchar(max)` | `string?` | ✅ | Resumo da ocorrência |
| `Descricao` | `Descricao` | `nvarchar(max)` | `string?` | ✅ | Descrição completa |
| `ImagemOcorrencia` | `ImagemOcorrencia` | `nvarchar(max)` | `string?` | ✅ | Caminho da imagem |
| `DataCriacao` | `DataCriacao` | `datetime2` | `DateTime` | ❌ | Data de criação |
| `UsuarioCriacao` | `UsuarioCriacao` | `nvarchar(100)` | `string?` | ✅ | Usuário que criou |
| `Placa` | `Placa` | `nvarchar(10)` | `string?` | ✅ | Placa do veículo |
| `DescricaoMarca` | `Descricao` (MarcaVeiculo) | `nvarchar(50)` | `string?` | ✅ | Marca do veículo |
| `DescricaoModelo` | `Descricao` (ModeloVeiculo) | `nvarchar(50)` | `string?` | ✅ | Modelo do veículo |
| `VeiculoCompleto` | `VeiculoCompleto` (calculado) | `nvarchar(max)` | `string?` | ✅ | Placa + Marca + Modelo |
| `DataViagem` | `DataInicial` (Viagem) | `datetime2` | `DateTime?` | ✅ | Data da viagem |
| `NoFichaVistoria` | `NoFichaVistoria` | `int` | `int?` | ✅ | Número da ficha |
| `NomeMotorista` | `Nome` (Motorista) | `nvarchar(100)` | `string?` | ✅ | Nome do motorista |
| `DiasEmAberto` | `DiasEmAberto` (calculado) | `int` | `int?` | ✅ | Dias desde criação |
| `Urgencia` | `Urgencia` (calculado) | `nvarchar(20)` | `string?` | ✅ | Classificação |
| `CorUrgencia` | `CorUrgencia` (calculado) | `nvarchar(20)` | `string?` | ✅ | Cor CSS |

**Filtros da View**:
- `ov.Status = 'Aberta'`: Apenas ocorrências abertas
- `ov.StatusOcorrencia IS NULL OR ov.StatusOcorrencia = 1`: Confirma que está aberta

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

#### 1. **OcorrenciaViagemController.ListarAbertasPorVeiculo()** → Lista Ocorrências Abertas

**Quando**: Usuário visualiza popup de ocorrências abertas em um veículo  
**Por quê**: Retornar apenas ocorrências abertas do veículo específico

```csharp
[HttpGet]
[Route("ListarAbertasPorVeiculo")]
public IActionResult ListarAbertasPorVeiculo(Guid veiculoId)
{
    var ocorrencias = _unitOfWork.ViewOcorrenciasAbertasVeiculo
        .GetAll(o => o.VeiculoId == veiculoId)
        .OrderByDescending(o => o.DataCriacao)
        .ToList();
    
    return Ok(new { success = true, data = ocorrencias });
}
```

#### 2. **OcorrenciaViagemController.ContarAbertasPorVeiculo()** → Conta Ocorrências

**Quando**: Sistema precisa saber quantas ocorrências abertas um veículo tem  
**Por quê**: Exibir badge com contador ou validar antes de operações

```csharp
[HttpGet]
[Route("ContarAbertasPorVeiculo")]
public IActionResult ContarAbertasPorVeiculo(Guid veiculoId)
{
    var count = _unitOfWork.ViewOcorrenciasAbertasVeiculo
        .GetAll(o => o.VeiculoId == veiculoId)
        .Count();
    
    return Ok(new { success = true, count = count });
}
```

#### 3. **Pages/Viagens/Upsert.cshtml** → Popup de Ocorrências

**Quando**: Usuário seleciona um veículo na tela de viagem  
**Por quê**: Exibir ocorrências abertas do veículo antes de confirmar viagem

```javascript
// JavaScript em ViagemUpsert.js
function carregarOcorrenciasAbertas(veiculoId) {
    $.ajax({
        url: '/api/OcorrenciaViagem/ListarAbertasPorVeiculo',
        data: { veiculoId: veiculoId },
        success: function(response) {
            if (response.success && response.data.length > 0) {
                // Exibe popup com ocorrências
                exibirPopupOcorrencias(response.data);
            }
        }
    });
}
```

### O Que Este Arquivo Usa

- **View SQL**: `ViewOcorrenciasAbertasVeiculo` no banco de dados
- **Tabelas**: `OcorrenciaViagem`, `Viagem`, `Veiculo`, `MarcaVeiculo`, `ModeloVeiculo`, `Motorista`

### Fluxo de Dados

```
Usuário seleciona veículo
    ↓
JavaScript chama API
    ↓
OcorrenciaViagemController.ListarAbertasPorVeiculo()
    ↓
ViewOcorrenciasAbertasVeiculoRepository.GetAll()
    ↓
VIEW SQL: ViewOcorrenciasAbertasVeiculo
    ↓
Retorna lista de ocorrências abertas
    ↓
JSON para frontend
    ↓
Popup exibe ocorrências
```

---

## Lógica de Negócio

### Cálculo de Dias em Aberto

A view calcula automaticamente quantos dias a ocorrência está aberta:

```sql
DATEDIFF(DAY, ov.DataCriacao, GETDATE()) AS DiasEmAberto
```

**Lógica**:
- `DataCriacao`: Data em que a ocorrência foi criada
- `GETDATE()`: Data/hora atual
- `DATEDIFF(DAY, ...)`: Diferença em dias

### Classificação de Urgência

A view classifica automaticamente a urgência baseada nos dias em aberto:

```sql
CASE 
    WHEN DATEDIFF(DAY, ov.DataCriacao, GETDATE()) <= 3 THEN 'Baixa'
    WHEN DATEDIFF(DAY, ov.DataCriacao, GETDATE()) <= 7 THEN 'Média'
    ELSE 'Alta'
END AS Urgencia
```

**Regras**:
- **Baixa**: ≤ 3 dias em aberto (cor verde)
- **Média**: 4-7 dias em aberto (cor laranja)
- **Alta**: > 7 dias em aberto (cor vermelha)

### Filtro de Ocorrências Abertas

A view filtra apenas ocorrências que estão realmente abertas:

```sql
WHERE ov.Status = 'Aberta' 
  AND (ov.StatusOcorrencia IS NULL OR ov.StatusOcorrencia = 1)
```

**Lógica**:
- `Status = 'Aberta'`: Status textual deve ser "Aberta"
- `StatusOcorrencia IS NULL OR StatusOcorrencia = 1`: Confirmação booleana

---

## Exemplos de Uso

### Cenário 1: Verificar Ocorrências Abertas ao Selecionar Veículo

**Situação**: Usuário está criando uma viagem e seleciona um veículo

**Código Frontend**:
```javascript
$('#VeiculoId').on('change', function() {
    var veiculoId = $(this).val();
    
    // Verifica ocorrências abertas
    $.ajax({
        url: '/api/OcorrenciaViagem/ContarAbertasPorVeiculo',
        data: { veiculoId: veiculoId },
        success: function(response) {
            if (response.success && response.count > 0) {
                // Exibe alerta
                alert(`Este veículo possui ${response.count} ocorrência(s) aberta(s).`);
                
                // Carrega detalhes
                carregarOcorrenciasAbertas(veiculoId);
            }
        }
    });
});
```

**Resultado**: Sistema alerta usuário sobre ocorrências abertas antes de confirmar viagem

### Cenário 2: Listar Todas as Ocorrências Abertas de um Veículo

**Situação**: Página de gestão precisa listar ocorrências abertas

**Código Backend**:
```csharp
[HttpGet]
[Route("ListarAbertasPorVeiculo")]
public IActionResult ListarAbertasPorVeiculo(Guid veiculoId)
{
    var ocorrencias = _unitOfWork.ViewOcorrenciasAbertasVeiculo
        .GetAll(o => o.VeiculoId == veiculoId)
        .OrderByDescending(o => o.DataCriacao)
        .Select(o => new {
            o.OcorrenciaViagemId,
            o.Resumo,
            o.Descricao,
            o.DataCriacao,
            o.DiasEmAberto,
            o.Urgencia,
            o.CorUrgencia,
            o.VeiculoCompleto,
            o.NomeMotorista
        })
        .ToList();
    
    return Ok(new { success = true, data = ocorrencias });
}
```

**Resultado**: Lista completa de ocorrências abertas com informações consolidadas

### Cenário 3: Dashboard com Contadores por Urgência

**Situação**: Dashboard precisa exibir quantas ocorrências abertas por nível de urgência

**Código**:
```csharp
var ocorrencias = _unitOfWork.ViewOcorrenciasAbertasVeiculo
    .GetAll()
    .GroupBy(o => o.Urgencia)
    .Select(g => new {
        Urgencia = g.Key,
        Quantidade = g.Count()
    })
    .ToList();

// Resultado:
// { Urgencia: "Baixa", Quantidade: 5 }
// { Urgencia: "Média", Quantidade: 3 }
// { Urgencia: "Alta", Quantidade: 2 }
```

**Resultado**: Estatísticas de ocorrências por nível de urgência

---

## Troubleshooting

### Problema: View retorna vazio mesmo com ocorrências abertas

**Sintoma**: Consulta à view não retorna resultados mesmo existindo ocorrências abertas

**Causa Possível 1**: Filtro da view está muito restritivo

**Diagnóstico**:
```sql
-- Verificar ocorrências diretamente na tabela
SELECT * FROM OcorrenciaViagem 
WHERE Status = 'Aberta' 
  AND (StatusOcorrencia IS NULL OR StatusOcorrencia = 1)

-- Comparar com resultado da view
SELECT * FROM ViewOcorrenciasAbertasVeiculo
```

**Solução**: Verificar se filtros da view estão corretos. Pode ser necessário ajustar WHERE clause.

**Causa Possível 2**: JOINs estão excluindo registros

**Diagnóstico**:
```sql
-- Verificar se há ocorrências sem viagem ou veículo
SELECT ov.* 
FROM OcorrenciaViagem ov
LEFT JOIN Viagem vi ON ov.ViagemId = vi.ViagemId
LEFT JOIN Veiculo v ON ov.VeiculoId = v.VeiculoId
WHERE ov.Status = 'Aberta'
  AND (vi.ViagemId IS NULL OR v.VeiculoId IS NULL)
```

**Solução**: Verificar integridade referencial. Ocorrências devem ter ViagemId e VeiculoId válidos.

**Código Relacionado**: View SQL no banco de dados

---

### Problema: DiasEmAberto está incorreto

**Sintoma**: Campo `DiasEmAberto` mostra valor diferente do esperado

**Causa**: Cálculo na view pode estar usando timezone incorreto ou `DataCriacao` está errada

**Diagnóstico**:
```sql
-- Verificar cálculo manual
SELECT 
    OcorrenciaViagemId,
    DataCriacao,
    GETDATE() AS DataAtual,
    DATEDIFF(DAY, DataCriacao, GETDATE()) AS DiasCalculado,
    DiasEmAberto
FROM ViewOcorrenciasAbertasVeiculo
```

**Solução**: Verificar se `DataCriacao` está sendo salva corretamente e se timezone do servidor está correto.

---

### Problema: Urgencia não está sendo calculada

**Sintoma**: Campo `Urgencia` está NULL ou sempre retorna mesmo valor

**Causa**: CASE statement na view pode ter problema

**Diagnóstico**:
```sql
-- Verificar lógica do CASE
SELECT 
    DiasEmAberto,
    Urgencia,
    CASE 
        WHEN DiasEmAberto <= 3 THEN 'Baixa'
        WHEN DiasEmAberto <= 7 THEN 'Média'
        ELSE 'Alta'
    END AS UrgenciaCalculada
FROM ViewOcorrenciasAbertasVeiculo
```

**Solução**: Verificar se CASE statement na view está correto. Pode ser necessário recriar a view.

---

## Validações

### Validação de Dados

A view não valida dados, apenas consolida. Validações devem ser feitas nas tabelas origem:
- `OcorrenciaViagem`: Validações de campos obrigatórios
- `Viagem`: Validações de integridade
- `Veiculo`: Validações de placa, etc.

---

## Notas Importantes

1. **Read-Only**: Esta é uma VIEW, não permite INSERT/UPDATE/DELETE diretamente
2. **Performance**: View é otimizada para consultas frequentes de ocorrências abertas
3. **Atualização Automática**: View reflete mudanças nas tabelas origem automaticamente
4. **Filtro Fixo**: View sempre filtra apenas ocorrências abertas
5. **Cálculos Dinâmicos**: `DiasEmAberto`, `Urgencia` e `CorUrgencia` são calculados em tempo real

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação de documentação extensiva do modelo `ViewOcorrenciasAbertasVeiculo` seguindo padrão FrotiX

**Arquivos Afetados**:
- `Documentacao/Models/Views/ViewOcorrenciasAbertasVeiculo.md` (criado)

**Impacto**: Documentação completa da view de ocorrências abertas para facilitar manutenção e entendimento

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

## Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 2.0 | 08/01/2026 | Documentação inicial completa |
| 1.0 | - | Versão inicial do código |

---

## Referências

- [Documentação OcorrenciaViagem](./OcorrenciaViagem.md)
- [Documentação ViewOcorrenciasViagem](./ViewOcorrenciasViagem.md)
- [Documentação Pages/Viagens - Upsert](../Pages/Viagens%20-%20Upsert.md) (se existir)

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
