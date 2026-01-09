# Documentação: AbastecimentoPendente.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 📋 Índice

1. [Objetivos](#objetivos)
2. [Arquivos Envolvidos](#arquivos-envolvidos)
3. [Estrutura do Model](#estrutura-do-model)
4. [Mapeamento Model ↔ Banco de Dados](#mapeamento-model--banco-de-dados)
5. [Quem Chama e Por Quê](#quem-chama-e-por-quê)
6. [Problema → Solução → Código](#problema--solução--código)
7. [Fluxo de Funcionamento](#fluxo-de-funcionamento)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Objetivos

O Model `AbastecimentoPendente` representa registros temporários de abastecimentos que foram importados de planilhas Excel/QCard mas que **não puderam ser processados automaticamente** devido a erros de validação, dados faltantes ou inconsistências.

**Principais objetivos:**

✅ Armazenar dados brutos da importação antes da validação  
✅ Identificar e classificar tipos de pendências (placa não encontrada, motorista inválido, KM inconsistente, etc.)  
✅ Permitir correção manual ou automática de pendências  
✅ Fornecer sugestões inteligentes de correção baseadas em histórico  
✅ Rastrear origem da importação (arquivo, linha original)  
✅ Controlar status da pendência (Pendente, Resolvida, Ignorada)

---

## 📁 Arquivos Envolvidos

### Arquivo Principal
- **`Models/AbastecimentoPendente.cs`** - Model Entity Framework Core

### Arquivos que Utilizam
- **`Controllers/AbastecimentoController.Pendencias.cs`** - Endpoints para listar e gerenciar pendências
- **`Controllers/AbastecimentoController.Import.cs`** - Processamento de importação que cria registros de pendência
- **`Pages/Abastecimento/Pendencias.cshtml`** - Interface de gestão de pendências
- **`Pages/Abastecimento/Pendencias.cshtml.cs`** - PageModel da página de pendências
- **`Repository/AbastecimentoPendenteRepository.cs`** - Acesso a dados (se existir)
- **`Data/FrotiXDbContext.cs`** - Configuração do DbSet

---

## 🏗️ Estrutura do Model

```csharp
public class AbastecimentoPendente
{
    // ✅ Chave primária
    public Guid AbastecimentoPendenteId { get; set; }

    // ✅ Dados originais da planilha (todos nullable para evitar erro de leitura NULL)
    public int? AutorizacaoQCard { get; set; }
    public string? Placa { get; set; }
    public int? CodMotorista { get; set; }
    public string? NomeMotorista { get; set; }
    public string? Produto { get; set; }
    public DateTime? DataHora { get; set; }
    public int? KmAnterior { get; set; }
    public int? Km { get; set; }
    public int? KmRodado { get; set; }
    public double? Litros { get; set; }
    public double? ValorUnitario { get; set; }

    // ✅ IDs identificados (podem ser nulos se não encontrados)
    public Guid? VeiculoId { get; set; }
    public Guid? MotoristaId { get; set; }
    public Guid? CombustivelId { get; set; }

    // ✅ Descrição das pendências/erros
    [MaxLength(2000)]
    public string? DescricaoPendencia { get; set; }

    // ✅ Tipo principal do erro (para facilitar filtros)
    [MaxLength(50)]
    public string? TipoPendencia { get; set; }

    // ✅ Sugestão de correção (para erros de KM)
    public bool TemSugestao { get; set; }
    [MaxLength(20)]
    public string? CampoCorrecao { get; set; }
    public int? ValorAtualErrado { get; set; }
    public int? ValorSugerido { get; set; }
    [MaxLength(500)]
    public string? JustificativaSugestao { get; set; }
    public double? MediaConsumoVeiculo { get; set; }

    // ✅ Controle
    public DateTime DataImportacao { get; set; }
    public int NumeroLinhaOriginal { get; set; }
    [MaxLength(255)]
    public string? ArquivoOrigem { get; set; }

    // ✅ Status da pendência: 0 = Pendente, 1 = Resolvida, 2 = Ignorada
    public int Status { get; set; }

    // ✅ Relacionamentos virtuais (opcionais) - NÃO VALIDAR
    [ForeignKey("VeiculoId")]
    [ValidateNever]
    public virtual Veiculo? Veiculo { get; set; }

    [ForeignKey("MotoristaId")]
    [ValidateNever]
    public virtual Motorista? Motorista { get; set; }

    [ForeignKey("CombustivelId")]
    [ValidateNever]
    public virtual Combustivel? Combustivel { get; set; }
}
```

---

## 🗄️ Mapeamento Model ↔ Banco de Dados

### Estrutura SQL da Tabela

```sql
CREATE TABLE [dbo].[AbastecimentoPendente] (
    [AbastecimentoPendenteId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    
    -- Dados originais da planilha
    [AutorizacaoQCard] INT NULL,
    [Placa] NVARCHAR(10) NULL,
    [CodMotorista] INT NULL,
    [NomeMotorista] NVARCHAR(200) NULL,
    [Produto] NVARCHAR(100) NULL,
    [DataHora] DATETIME2 NULL,
    [KmAnterior] INT NULL,
    [Km] INT NULL,
    [KmRodado] INT NULL,
    [Litros] FLOAT NULL,
    [ValorUnitario] FLOAT NULL,
    
    -- IDs identificados
    [VeiculoId] UNIQUEIDENTIFIER NULL,
    [MotoristaId] UNIQUEIDENTIFIER NULL,
    [CombustivelId] UNIQUEIDENTIFIER NULL,
    
    -- Descrição e tipo de pendência
    [DescricaoPendencia] NVARCHAR(2000) NULL,
    [TipoPendencia] NVARCHAR(50) NULL,
    
    -- Sugestões de correção
    [TemSugestao] BIT NOT NULL DEFAULT 0,
    [CampoCorrecao] NVARCHAR(20) NULL,
    [ValorAtualErrado] INT NULL,
    [ValorSugerido] INT NULL,
    [JustificativaSugestao] NVARCHAR(500) NULL,
    [MediaConsumoVeiculo] FLOAT NULL,
    
    -- Controle
    [DataImportacao] DATETIME2 NOT NULL,
    [NumeroLinhaOriginal] INT NOT NULL,
    [ArquivoOrigem] NVARCHAR(255) NULL,
    
    -- Status: 0 = Pendente, 1 = Resolvida, 2 = Ignorada
    [Status] INT NOT NULL DEFAULT 0,
    
    -- Foreign Keys
    CONSTRAINT [FK_AbastecimentoPendente_Veiculo] 
        FOREIGN KEY ([VeiculoId]) REFERENCES [Veiculo]([VeiculoId]),
    CONSTRAINT [FK_AbastecimentoPendente_Motorista] 
        FOREIGN KEY ([MotoristaId]) REFERENCES [Motorista]([MotoristaId]),
    CONSTRAINT [FK_AbastecimentoPendente_Combustivel] 
        FOREIGN KEY ([CombustivelId]) REFERENCES [Combustivel]([CombustivelId])
);

-- Índices para performance
CREATE INDEX [IX_AbastecimentoPendente_Status] 
    ON [AbastecimentoPendente]([Status]);
CREATE INDEX [IX_AbastecimentoPendente_TipoPendencia] 
    ON [AbastecimentoPendente]([TipoPendencia]);
CREATE INDEX [IX_AbastecimentoPendente_DataImportacao] 
    ON [AbastecimentoPendente]([DataImportacao]);
CREATE INDEX [IX_AbastecimentoPendente_VeiculoId] 
    ON [AbastecimentoPendente]([VeiculoId]);
```

### Tabela Comparativa

| Campo Model | Tipo Model | Campo SQL | Tipo SQL | Nullable | Observações |
|-------------|------------|-----------|----------|----------|-------------|
| `AbastecimentoPendenteId` | `Guid` | `AbastecimentoPendenteId` | `UNIQUEIDENTIFIER` | ❌ | Chave primária |
| `AutorizacaoQCard` | `int?` | `AutorizacaoQCard` | `INT` | ✅ | Número da autorização QCard |
| `Placa` | `string?` | `Placa` | `NVARCHAR(10)` | ✅ | Placa do veículo |
| `CodMotorista` | `int?` | `CodMotorista` | `INT` | ✅ | Código do motorista na planilha |
| `NomeMotorista` | `string?` | `NomeMotorista` | `NVARCHAR(200)` | ✅ | Nome do motorista |
| `Produto` | `string?` | `Produto` | `NVARCHAR(100)` | ✅ | Tipo de combustível |
| `DataHora` | `DateTime?` | `DataHora` | `DATETIME2` | ✅ | Data e hora do abastecimento |
| `KmAnterior` | `int?` | `KmAnterior` | `INT` | ✅ | Quilometragem anterior |
| `Km` | `int?` | `Km` | `INT` | ✅ | Quilometragem atual |
| `KmRodado` | `int?` | `KmRodado` | `INT` | ✅ | KM rodado (calculado) |
| `Litros` | `double?` | `Litros` | `FLOAT` | ✅ | Quantidade de litros |
| `ValorUnitario` | `double?` | `ValorUnitario` | `FLOAT` | ✅ | Valor por litro |
| `VeiculoId` | `Guid?` | `VeiculoId` | `UNIQUEIDENTIFIER` | ✅ | FK para Veiculo |
| `MotoristaId` | `Guid?` | `MotoristaId` | `UNIQUEIDENTIFIER` | ✅ | FK para Motorista |
| `CombustivelId` | `Guid?` | `CombustivelId` | `UNIQUEIDENTIFIER` | ✅ | FK para Combustivel |
| `DescricaoPendencia` | `string?` | `DescricaoPendencia` | `NVARCHAR(2000)` | ✅ | Descrição detalhada do erro |
| `TipoPendencia` | `string?` | `TipoPendencia` | `NVARCHAR(50)` | ✅ | Tipo do erro (ex: "PlacaNaoEncontrada") |
| `TemSugestao` | `bool` | `TemSugestao` | `BIT` | ❌ | Indica se há sugestão de correção |
| `CampoCorrecao` | `string?` | `CampoCorrecao` | `NVARCHAR(20)` | ✅ | Campo que precisa ser corrigido |
| `ValorAtualErrado` | `int?` | `ValorAtualErrado` | `INT` | ✅ | Valor atual incorreto |
| `ValorSugerido` | `int?` | `ValorSugerido` | `INT` | ✅ | Valor sugerido para correção |
| `JustificativaSugestao` | `string?` | `JustificativaSugestao` | `NVARCHAR(500)` | ✅ | Explicação da sugestão |
| `MediaConsumoVeiculo` | `double?` | `MediaConsumoVeiculo` | `FLOAT` | ✅ | Média de consumo do veículo |
| `DataImportacao` | `DateTime` | `DataImportacao` | `DATETIME2` | ❌ | Data/hora da importação |
| `NumeroLinhaOriginal` | `int` | `NumeroLinhaOriginal` | `INT` | ❌ | Número da linha na planilha original |
| `ArquivoOrigem` | `string?` | `ArquivoOrigem` | `NVARCHAR(255)` | ✅ | Nome do arquivo importado |
| `Status` | `int` | `Status` | `INT` | ❌ | 0=Pendente, 1=Resolvida, 2=Ignorada |

### Índices e Constraints

**Índices:**
- `IX_AbastecimentoPendente_Status` - Para filtrar por status
- `IX_AbastecimentoPendente_TipoPendencia` - Para filtrar por tipo de erro
- `IX_AbastecimentoPendente_DataImportacao` - Para ordenar por data de importação
- `IX_AbastecimentoPendente_VeiculoId` - Para JOINs com Veiculo

**Foreign Keys:**
- `FK_AbastecimentoPendente_Veiculo` → `Veiculo(VeiculoId)`
- `FK_AbastecimentoPendente_Motorista` → `Motorista(MotoristaId)`
- `FK_AbastecimentoPendente_Combustivel` → `Combustivel(CombustivelId)`

**Triggers:** Nenhum trigger associado a esta tabela.

---

## 🔗 Quem Chama e Por Quê

### 1. **AbastecimentoController.Import.cs** → Cria Pendências

**Quando:** Durante o processo de importação de planilhas Excel/QCard  
**Por quê:** Quando uma linha da planilha não pode ser processada automaticamente devido a erros de validação

```csharp
// ✅ Exemplo: Placa não encontrada
var pendencia = new AbastecimentoPendente
{
    AbastecimentoPendenteId = Guid.NewGuid(),
    Placa = linhaPlaca, // Placa que não existe no banco
    DescricaoPendencia = $"Placa '{linhaPlaca}' não encontrada no sistema",
    TipoPendencia = "PlacaNaoEncontrada",
    Status = 0, // Pendente
    DataImportacao = DateTime.Now,
    NumeroLinhaOriginal = numeroLinha,
    ArquivoOrigem = nomeArquivo
};
_unitOfWork.AbastecimentoPendente.Add(pendencia);
```

### 2. **AbastecimentoController.Pendencias.cs** → Lista e Gerencia Pendências

**Quando:** Usuário acessa a página de pendências ou faz requisições AJAX  
**Por quê:** Exibir pendências para correção manual ou automática

```csharp
[HttpGet]
[Route("ListarPendencias")]
public IActionResult ListarPendencias()
{
    // ✅ Busca apenas pendências não resolvidas (Status = 0)
    var pendencias = _unitOfWork.AbastecimentoPendente.GetAll()
        .Where(p => p.Status == 0)
        .OrderByDescending(p => p.DataImportacao)
        .ThenBy(p => p.NumeroLinhaOriginal)
        .ToList();
    
    // ✅ Converte para DTO para o frontend
    var resultado = pendencias.Select(p => new PendenciaDTO { ... });
    return Json(new { data = resultado });
}
```

### 3. **Pages/Abastecimento/Pendencias.cshtml** → Interface Visual

**Quando:** Usuário navega para `/Abastecimento/Pendencias`  
**Por quê:** Exibir tabela de pendências com opções de correção

```javascript
// ✅ JavaScript que chama o endpoint
function loadPendencias() {
    $.ajax({
        url: '/api/abastecimento/listarpendencias',
        success: function(response) {
            // Preenche DataTable com pendências
            dataTable.clear().rows.add(response.data).draw();
        }
    });
}
```

---

## 🛠️ Problema → Solução → Código

### Problema 1: Importação de Planilha com Dados Inválidos

**Problema:** Durante a importação de abastecimentos, algumas linhas contêm dados inválidos (placa não existe, motorista não encontrado, KM inconsistente). Não podemos simplesmente ignorar essas linhas, pois podem ser dados válidos que precisam de correção.

**Solução:** Criar registros temporários em `AbastecimentoPendente` para cada linha com erro, armazenando os dados originais e uma descrição do problema encontrado.

**Código:**

```csharp
// ✅ Em AbastecimentoController.Import.cs
private void ProcessarLinhaAbastecimento(DataRow linha, int numeroLinha, string nomeArquivo)
{
    try
    {
        var placa = linha["Placa"]?.ToString();
        
        // ✅ Tenta encontrar veículo
        var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v => v.Placa == placa);
        
        if (veiculo == null)
        {
            // ✅ Cria pendência: Placa não encontrada
            var pendencia = new AbastecimentoPendente
            {
                AbastecimentoPendenteId = Guid.NewGuid(),
                Placa = placa,
                AutorizacaoQCard = Convert.ToInt32(linha["AutorizacaoQCard"]),
                NomeMotorista = linha["NomeMotorista"]?.ToString(),
                Produto = linha["Produto"]?.ToString(),
                DataHora = Convert.ToDateTime(linha["DataHora"]),
                KmAnterior = Convert.ToInt32(linha["KmAnterior"]),
                Km = Convert.ToInt32(linha["Km"]),
                Litros = Convert.ToDouble(linha["Litros"]),
                ValorUnitario = Convert.ToDouble(linha["ValorUnitario"]),
                DescricaoPendencia = $"Placa '{placa}' não encontrada no sistema",
                TipoPendencia = "PlacaNaoEncontrada",
                Status = 0, // Pendente
                DataImportacao = DateTime.Now,
                NumeroLinhaOriginal = numeroLinha,
                ArquivoOrigem = nomeArquivo
            };
            
            _unitOfWork.AbastecimentoPendente.Add(pendencia);
            return; // Não processa esta linha
        }
        
        // ✅ Se encontrou veículo, continua processamento normal...
    }
    catch (Exception ex)
    {
        // ✅ Em caso de erro inesperado, também cria pendência
        var pendenciaErro = new AbastecimentoPendente
        {
            DescricaoPendencia = $"Erro ao processar linha: {ex.Message}",
            TipoPendencia = "ErroProcessamento",
            Status = 0,
            DataImportacao = DateTime.Now,
            NumeroLinhaOriginal = numeroLinha,
            ArquivoOrigem = nomeArquivo
        };
        _unitOfWork.AbastecimentoPendente.Add(pendenciaErro);
    }
}
```

### Problema 2: Sugestões Inteligentes de Correção de KM

**Problema:** Quando o KM informado está inconsistente (ex: KM atual menor que KM anterior), o sistema precisa sugerir um valor correto baseado no histórico do veículo.

**Solução:** Calcular média de consumo e KM rodado do veículo e sugerir um valor baseado nessa média.

**Código:**

```csharp
// ✅ Em AbastecimentoController.Import.cs
private void ValidarKM(AbastecimentoPendente pendencia, Veiculo veiculo)
{
    if (pendencia.KmAnterior.HasValue && pendencia.Km.HasValue)
    {
        if (pendencia.Km.Value < pendencia.KmAnterior.Value)
        {
            // ✅ KM inconsistente: atual menor que anterior
            
            // ✅ Busca último KM registrado do veículo
            var ultimoAbastecimento = _unitOfWork.Abastecimento
                .GetAll(a => a.VeiculoId == veiculo.VeiculoId)
                .OrderByDescending(a => a.DataAbastecimento)
                .FirstOrDefault();
            
            if (ultimoAbastecimento != null)
            {
                // ✅ Calcula média de KM rodado por abastecimento
                var abastecimentosAnteriores = _unitOfWork.Abastecimento
                    .GetAll(a => a.VeiculoId == veiculo.VeiculoId && a.KmRodado.HasValue)
                    .OrderByDescending(a => a.DataAbastecimento)
                    .Take(10)
                    .ToList();
                
                var mediaKmRodado = abastecimentosAnteriores
                    .Where(a => a.KmRodado.HasValue)
                    .Average(a => a.KmRodado.Value);
                
                // ✅ Sugere KM baseado na média
                var kmSugerido = (int)(pendencia.KmAnterior.Value + mediaKmRodado);
                
                pendencia.TemSugestao = true;
                pendencia.CampoCorrecao = "Km";
                pendencia.ValorAtualErrado = pendencia.Km.Value;
                pendencia.ValorSugerido = kmSugerido;
                pendencia.JustificativaSugestao = 
                    $"KM atual ({pendencia.Km}) menor que anterior ({pendencia.KmAnterior}). " +
                    $"Sugestão baseada na média de {mediaKmRodado:F0} km rodados por abastecimento.";
                pendencia.MediaConsumoVeiculo = mediaKmRodado;
            }
        }
    }
}
```

### Problema 3: Resolução Automática de Pendências

**Problema:** Após corrigir os dados (ex: cadastrar nova placa), o usuário precisa resolver a pendência manualmente, criando o abastecimento.

**Solução:** Endpoint que tenta processar a pendência novamente após correção dos dados.

**Código:**

```csharp
// ✅ Em AbastecimentoController.Pendencias.cs
[HttpPost]
[Route("ResolverPendencia/{id}")]
public IActionResult ResolverPendencia(Guid id)
{
    try
    {
        var pendencia = _unitOfWork.AbastecimentoPendente.GetFirstOrDefault(p => p.AbastecimentoPendenteId == id);
        
        if (pendencia == null)
            return Json(new { success = false, message = "Pendência não encontrada" });
        
        // ✅ Valida se todos os dados necessários estão presentes
        if (!pendencia.VeiculoId.HasValue || !pendencia.CombustivelId.HasValue || !pendencia.MotoristaId.HasValue)
        {
            return Json(new { 
                success = false, 
                message = "Dados incompletos. Verifique se veículo, motorista e combustível foram identificados." 
            });
        }
        
        // ✅ Cria abastecimento a partir da pendência
        var abastecimento = new Abastecimento
        {
            AbastecimentoId = Guid.NewGuid(),
            VeiculoId = pendencia.VeiculoId.Value,
            MotoristaId = pendencia.MotoristaId.Value,
            CombustivelId = pendencia.CombustivelId.Value,
            DataAbastecimento = pendencia.DataHora ?? DateTime.Now,
            KmAnterior = pendencia.KmAnterior ?? 0,
            Km = pendencia.Km ?? pendencia.KmAnterior ?? 0,
            KmRodado = pendencia.KmRodado ?? (pendencia.Km - pendencia.KmAnterior) ?? 0,
            Litros = pendencia.Litros ?? 0,
            ValorUnitario = pendencia.ValorUnitario ?? 0,
            ValorTotal = (pendencia.Litros ?? 0) * (pendencia.ValorUnitario ?? 0)
        };
        
        _unitOfWork.Abastecimento.Add(abastecimento);
        
        // ✅ Marca pendência como resolvida
        pendencia.Status = 1; // Resolvida
        _unitOfWork.AbastecimentoPendente.Update(pendencia);
        
        _unitOfWork.Save();
        
        return Json(new { success = true, message = "Pendência resolvida e abastecimento criado com sucesso" });
    }
    catch (Exception ex)
    {
        Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "ResolverPendencia", ex);
        return Json(new { success = false, message = ex.Message });
    }
}
```

---

## 🔄 Fluxo de Funcionamento

### Fluxo 1: Importação com Erros

```
1. Usuário faz upload de planilha Excel/QCard
   ↓
2. AbastecimentoController.Import.cs processa linha por linha
   ↓
3. Para cada linha:
   ├─ Valida placa → Se não encontrada → Cria AbastecimentoPendente
   ├─ Valida motorista → Se não encontrado → Cria AbastecimentoPendente
   ├─ Valida combustível → Se não encontrado → Cria AbastecimentoPendente
   ├─ Valida KM → Se inconsistente → Cria AbastecimentoPendente com sugestão
   └─ Se tudo OK → Cria Abastecimento normalmente
   ↓
4. Salva todas as pendências no banco
   ↓
5. Retorna resumo: X abastecimentos criados, Y pendências geradas
```

### Fluxo 2: Gestão de Pendências

```
1. Usuário acessa /Abastecimento/Pendencias
   ↓
2. Pendencias.cshtml.cs carrega lista de veículos/motoristas/combustíveis
   ↓
3. JavaScript chama /api/abastecimento/listarpendencias
   ↓
4. AbastecimentoController.Pendencias.cs retorna pendências com Status = 0
   ↓
5. DataTable exibe pendências com filtros por tipo
   ↓
6. Usuário pode:
   ├─ Corrigir dados manualmente (ex: cadastrar nova placa)
   ├─ Aplicar sugestão automática (se houver)
   ├─ Resolver pendência → Cria Abastecimento
   └─ Ignorar pendência → Marca Status = 2
```

### Fluxo 3: Resolução de Pendência

```
1. Usuário clica em "Resolver" em uma pendência
   ↓
2. JavaScript valida se dados estão completos (VeiculoId, MotoristaId, CombustivelId)
   ↓
3. Se incompleto → Exibe alerta pedindo correção
   ↓
4. Se completo → Chama /api/abastecimento/resolverpendencia/{id}
   ↓
5. Controller valida dados novamente
   ↓
6. Cria Abastecimento a partir dos dados da pendência
   ↓
7. Marca pendência como Resolvida (Status = 1)
   ↓
8. Salva no banco
   ↓
9. Retorna sucesso e atualiza DataTable
```

---

## 🔍 Troubleshooting

### Erro: "Placa não encontrada" mas placa existe no banco

**Causa:** Diferença de maiúsculas/minúsculas ou espaços extras na comparação.

**Solução:**
```csharp
// ✅ Normalizar antes de comparar
var placaNormalizada = placa?.Trim().ToUpper();
var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v => 
    v.Placa.Trim().ToUpper() == placaNormalizada);
```

### Erro: Pendências duplicadas na mesma importação

**Causa:** Mesma linha sendo processada múltiplas vezes.

**Solução:**
```csharp
// ✅ Verificar se já existe pendência para esta linha
var pendenciaExistente = _unitOfWork.AbastecimentoPendente
    .GetFirstOrDefault(p => 
        p.NumeroLinhaOriginal == numeroLinha && 
        p.ArquivoOrigem == nomeArquivo);
        
if (pendenciaExistente == null)
{
    // Cria nova pendência
}
```

### Erro: Performance lenta ao listar muitas pendências

**Causa:** Falta de índices ou carregamento de relacionamentos desnecessários.

**Solução:**
```csharp
// ✅ Usar AsNoTracking e projetar apenas campos necessários
var pendencias = _unitOfWork.AbastecimentoPendente
    .GetAll(p => p.Status == 0)
    .AsNoTracking() // ✅ Não rastreia mudanças
    .Select(p => new PendenciaDTO
    {
        // Apenas campos necessários
    })
    .ToList();
```

### Erro: Sugestão de KM incorreta

**Causa:** Média calculada com poucos dados ou dados antigos.

**Solução:**
```csharp
// ✅ Filtrar apenas abastecimentos recentes (últimos 6 meses)
var abastecimentosRecentes = _unitOfWork.Abastecimento
    .GetAll(a => 
        a.VeiculoId == veiculoId && 
        a.DataAbastecimento >= DateTime.Now.AddMonths(-6) &&
        a.KmRodado.HasValue)
    .OrderByDescending(a => a.DataAbastecimento)
    .Take(10)
    .ToList();
```

---

## 📊 Endpoints API Resumidos

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/abastecimento/listarpendencias` | Lista todas as pendências não resolvidas |
| `POST` | `/api/abastecimento/resolverpendencia/{id}` | Resolve uma pendência criando o abastecimento |
| `POST` | `/api/abastecimento/ignorarpendencia/{id}` | Marca pendência como ignorada (Status = 2) |
| `POST` | `/api/abastecimento/aplicarsugestao/{id}` | Aplica sugestão automática de correção |
| `GET` | `/api/abastecimento/estatisticaspendencias` | Retorna estatísticas de pendências por tipo |

---

## 📝 Notas Importantes

1. **Todos os campos de dados originais são nullable** para evitar erros ao ler planilhas com valores NULL.

2. **Relacionamentos virtuais usam `[ValidateNever]`** para evitar validação do Entity Framework em campos que podem estar nulos temporariamente.

3. **Status é um `int`** ao invés de `enum` para facilitar filtros SQL diretos.

4. **Sugestões de correção** são calculadas apenas para erros de KM, mas podem ser expandidas para outros tipos de erro.

5. **Rastreamento de origem** (ArquivoOrigem, NumeroLinhaOriginal) permite identificar exatamente qual linha da planilha gerou a pendência.

---

**📅 Documentação criada em:** 08/01/2026  
**🔄 Última atualização:** 08/01/2026
