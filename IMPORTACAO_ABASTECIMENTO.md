# Documentação: Importação de Abastecimento

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Fluxo de Importação](#fluxo-de-importação)
4. [Endpoints API](#endpoints-api)
5. [Frontend](#frontend)
6. [Validações](#validações)
7. [Sistema de Pendências](#sistema-de-pendências)
8. [Formatos de Arquivo](#formatos-de-arquivo)
9. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A funcionalidade de **Importação de Abastecimento** permite importar dados de abastecimentos no sistema FrotiX a partir de planilhas Excel (XLSX/XLS) ou combinação de arquivos XLSX + CSV.

### Características Principais
- ✅ **Importação Dual (XLSX + CSV)**: Combina dados de data/hora do XLSX com dados de abastecimento do CSV
- ✅ **Importação Simples (XLSX)**: Importa todos os dados de um único arquivo Excel
- ✅ **Progresso em Tempo Real**: Usa SignalR para mostrar progresso da importação
- ✅ **Validação Inteligente**: Valida veículos, motoristas, produtos, quilometragem e consumo
- ✅ **Sistema de Pendências**: Erros geram pendências que podem ser corrigidas posteriormente
- ✅ **Sugestões Automáticas**: Para erros de KM, sugere correções baseadas no consumo médio do veículo
- ✅ **Prevenção de Duplicatas**: Verifica autorizações já importadas
- ✅ **Transações**: Usa TransactionScope para garantir consistência dos dados

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Abastecimento/
│       └── Importacao.cshtml              # Página principal (HTML + JavaScript)
│
├── Controllers/
│   └── AbastecimentoController.Import.cs  # Lógica de importação (backend)
│
├── Hubs/
│   └── ImportacaoHub.cs                   # SignalR para progresso em tempo real
│
└── Models/
    └── AbastecimentoPendente.cs           # Modelo de dados para pendências
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core** | Backend API |
| **SignalR** | Comunicação em tempo real (progresso) |
| **NPOI** | Leitura de arquivos Excel (XLSX/XLS) |
| **CsvHelper** | Leitura de arquivos CSV |
| **Bootstrap 5** | Interface do usuário |
| **JavaScript Vanilla** | Lógica frontend |

---

## Fluxo de Importação

### Diagrama de Fluxo Geral

```
┌─────────────────────────────────────────────────────────────┐
│ USUÁRIO SELECIONA ARQUIVO(S)                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Valida extensão e habilita botão "Importar"       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Envia arquivos via FormData para API              │
│ - POST /api/Abastecimento/ImportarNovo (1 arquivo XLSX)     │
│ - POST /api/Abastecimento/ImportarDual (XLSX + CSV)         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: Recebe arquivos e ConnectionId do SignalR          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ ETAPA 1: Ler arquivos (5-20%)                               │
│ - ImportarNovo: LerPlanilhaDinamica()                       │
│ - ImportarDual: LerArquivoXlsx() + LerArquivoCsv()          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ ETAPA 2: Combinar dados (apenas ImportarDual) (15-20%)      │
│ - INNER JOIN em memória pela coluna "Autorizacao"           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ ETAPA 3: Carregar dados de referência (20-25%)              │
│ - Veículos (busca por Placa)                                │
│ - Motoristas (busca por CodMotoristaQCard)                  │
│ - Autorizações existentes (prevenir duplicatas)             │
│ - Médias de consumo por veículo                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ ETAPA 4: Validar linhas (25-70%)                            │
│ - Produto válido (Gasolina Comum ou Diesel S-10)            │
│ - Veículo cadastrado                                         │
│ - Motorista cadastrado                                       │
│ - Quantidade < 500 litros                                    │
│ - Quilometragem válida (< 1000 km, não negativa)            │
│ - Consumo dentro da média (±40%)                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ ETAPA 5: Salvar registros válidos (70-90%)                  │
│ - Inserir em tabela Abastecimento                           │
│ - Atualizar consumo médio dos veículos                      │
│ - Usar TransactionScope para garantir consistência          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ ETAPA 6: Gerar pendências para erros (90-98%)               │
│ - Inserir em tabela AbastecimentoPendente                   │
│ - Incluir sugestões de correção (se aplicável)              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ ETAPA 7: Retornar resultado (98-100%)                       │
│ - Estatísticas: Total, Importados, Erros, Ignorados         │
│ - Lista de linhas importadas                                │
│ - Lista de erros com sugestões                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Exibe resultado                                   │
│ - Sucesso Total: Mostra tabela de importados                │
│ - Parcial: Mostra importados + lista de erros               │
│ - Erro Total: Mostra apenas lista de erros                  │
└─────────────────────────────────────────────────────────────┘
```

### Progresso via SignalR

Durante toda a importação, o backend envia atualizações de progresso via SignalR:

```javascript
// Frontend recebe eventos em tempo real
hubConnection.on("ProgressoImportacao", (progresso) => {
    // Atualiza barra de progresso
    progressFill.style.width = progresso.porcentagem + '%';
    progressText.textContent = progresso.porcentagem + '%';
    progressEtapa.textContent = progresso.etapa;
    progressDetail.textContent = progresso.detalhe;
});
```

---

## Endpoints API

### 1. POST `/api/Abastecimento/ImportarNovo`

**Descrição**: Importa abastecimentos de um único arquivo Excel (XLSX/XLS) com todas as colunas.

**Request**:
- `Content-Type`: `multipart/form-data`
- `arquivo`: IFormFile (XLSX/XLS)
- `connectionId`: string (opcional, para SignalR)

**Colunas Obrigatórias no Excel**:
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| Autorização | int | Número da autorização QCard |
| Data | date | Data do abastecimento |
| Hora | time | Hora do abastecimento |
| Placa | string | Placa do veículo |
| KM | int | Hodômetro atual |
| KMAnterior | int | Hodômetro anterior |
| Rodado | int | KM rodados (calculado) |
| Produto | string | Nome do combustível |
| Qtde | decimal | Quantidade em litros |
| Valor Unitário | decimal | Preço por litro |
| CodMotorista | int | Código do motorista no QCard |

**Response**:
```json
{
  "sucesso": true,
  "mensagem": "Importação concluída com sucesso! 150 abastecimento(s) registrado(s).",
  "totalLinhas": 150,
  "linhasImportadas": 145,
  "linhasComErro": 5,
  "linhasIgnoradas": 0,
  "linhasCorrigiveis": 2,
  "pendenciasGeradas": 5,
  "erros": [
    {
      "linhaOriginal": 12,
      "linhaArquivoErros": 1,
      "tipo": "veiculo",
      "descricao": "Veículo de placa 'ABC1234' não cadastrado",
      "icone": "fa-car-burst",
      "corrigivel": false
    }
  ],
  "linhasImportadasLista": [ /* ... */ ]
}
```

---

### 2. POST `/api/Abastecimento/ImportarDual`

**Descrição**: Importa abastecimentos combinando dados de 2 arquivos (XLSX para data/hora + CSV para dados).

**Request**:
- `Content-Type`: `multipart/form-data`
- `arquivoXlsx`: IFormFile (XLSX com Data + Autorizacao)
- `arquivoCsv`: IFormFile (CSV com dados de abastecimento)
- `connectionId`: string (opcional, para SignalR)

**Arquivo XLSX - Colunas**:
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| Data | datetime | Data/hora do abastecimento (com hora) |
| Autorizacao | int | Número da autorização |

**Arquivo CSV - Colunas**:
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| Autorizacao | int | Número da autorização (chave de JOIN) |
| Placa | string | Placa do veículo |
| KM | int | Hodômetro atual |
| KMAnterior | int | Hodômetro anterior |
| Rodado | int | KM rodados |
| Produto | string | Combustível |
| Qtde | decimal | Litros |
| VrUnitario | decimal | Preço/litro |
| CodMotorista | int | Código motorista |

**Lógica de JOIN**:
```csharp
// INNER JOIN em memória
foreach (var csvRecord in dadosCsv)
{
    if (dadosXlsx.TryGetValue(csvRecord.Autorizacao, out var xlsxRecord))
    {
        // Combina: DataHora do XLSX + Dados do CSV
        var linha = new LinhaImportacao
        {
            DataHoraParsed = xlsxRecord.DataHora,
            Placa = csvRecord.Placa,
            Km = csvRecord.Km,
            // ...
        };
    }
}
```

**Response**: Mesmo formato do `ImportarNovo`.

---

## Frontend

### Estrutura da Página

**Arquivo**: `Pages/Abastecimento/Importacao.cshtml`

#### Componentes Principais

**1. Dual Dropzone (para ImportarDual)**
```html
<!-- Dropzone XLSX -->
<div id="dropZoneXlsx" class="ftx-dropzone ftx-dropzone-small">
    <input type="file" id="arquivoXlsx" accept=".xlsx,.xls" />
    <!-- Conteúdo: ícone + texto + badge -->
</div>

<!-- Dropzone CSV -->
<div id="dropZoneCsv" class="ftx-dropzone ftx-dropzone-small">
    <input type="file" id="arquivoCsv" accept=".csv" />
    <!-- Conteúdo: ícone + texto + badge -->
</div>
```

**2. Botão Importar**
```html
<button type="button" id="btnImportar" class="btn btn-fundo-laranja btn-lg w-100" disabled>
    <i class="fa-duotone fa-upload me-2"></i>
    Importar Abastecimentos
</button>
```
- Habilitado apenas quando **AMBOS** os arquivos estão selecionados (no modo dual)
- No modo simples, apenas 1 arquivo é necessário

**3. Estados da Interface**

| Estado | ID | Quando Exibir |
|--------|------|---------------|
| Inicial | `estadoInicial` | Aguardando seleção de arquivo |
| Loading | `estadoLoading` | Durante importação (com barra de progresso) |
| Sucesso | `estadoSucesso` | Todos registros importados |
| Parcial | `estadoParcial` | Alguns importados + alguns com erro |
| Erro | `estadoErro` | Nenhum registro importado |

**4. Barra de Progresso**
```html
<div class="ftx-progress-container">
    <div class="ftx-progress-bar">
        <div class="ftx-progress-fill" id="progressFill" style="width: 0%"></div>
    </div>
    <div class="ftx-progress-text" id="progressText">0%</div>
</div>
```
- Animação gradiente horizontal (`progressShine`)
- Atualizada via SignalR em tempo real

---

### JavaScript Principal

**Arquivo**: `Importacao.cshtml` (seção `@section ScriptsBlock`)

#### Funções Importantes

**1. Inicialização SignalR**
```javascript
async function inicializarSignalR() {
    hubConnection = new signalR.HubConnectionBuilder()
        .withUrl("/hubs/importacao")
        .withAutomaticReconnect()
        .build();

    hubConnection.on("Conectado", (connId) => {
        connectionId = connId;
    });

    hubConnection.on("ProgressoImportacao", (progresso) => {
        atualizarProgresso(progresso.porcentagem, progresso.etapa, progresso.detalhe);
        if (progresso.resumoDisponivel) {
            mostrarResumoPlanilha(progresso);
        }
    });

    await hubConnection.start();
}
```

**2. Importar**
```javascript
async function importar() {
    // Validar arquivos
    if (!arquivoXlsxAtual || !arquivoCsvAtual) {
        AppToast.show('Amarelo', 'Selecione ambos os arquivos (XLSX e CSV)', 4000);
        return;
    }

    // Criar FormData
    const formData = new FormData();
    formData.append('arquivoXlsx', arquivoXlsxAtual);
    formData.append('arquivoCsv', arquivoCsvAtual);
    formData.append('connectionId', connectionId);

    // Enviar para API
    const response = await fetch('/api/Abastecimento/ImportarDual', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    // Exibir resultado
    if (result.sucesso && result.linhasComErro === 0) {
        mostrarSucesso(result);
    } else if (result.sucesso && result.linhasComErro > 0) {
        mostrarParcial(result);
    } else {
        mostrarErro(result);
    }
}
```

**3. Exibir Erros com Sugestões**
```javascript
function criarItemErro(erro, index) {
    const item = document.createElement('div');

    let html = `
        <div class="list-group-item">
            <strong>Linha ${erro.linhaOriginal}</strong>: ${erro.descricao}
    `;

    // Se tem sugestão de correção
    if (erro.corrigivel) {
        html += `
            <div class="sugestao-correcao">
                <div class="sugestao-valores">
                    <div class="sugestao-valor valor-errado">
                        <span class="valor-label">Atual (errado)</span>
                        <span class="valor-numero">${erro.valorAtual}</span>
                    </div>
                    <i class="fa-duotone fa-arrow-right sugestao-seta"></i>
                    <div class="sugestao-valor valor-correto">
                        <span class="valor-label">Sugerido</span>
                        <span class="valor-numero">${erro.valorSugerido}</span>
                    </div>
                </div>
                <button class="btn-aplicar-correcao" onclick="aplicarCorrecao(${index}, this)">
                    Aplicar e Importar
                </button>
            </div>
        `;
    }

    html += `</div>`;
    item.innerHTML = html;
    return item;
}
```

---

## Validações

### 1. Validações de Produto

**Produtos Aceitos**:
- ✅ **Gasolina Comum** → GUID: `f668f660-8380-4df3-90cd-787db06fe734`
- ✅ **Diesel S-10** → GUID: `a69aa86a-9162-4242-ab9a-8b184e04c4da`
- ❌ Outros produtos (ARLA, etc.) são **ignorados**

**Normalização**:
```csharp
private string LimparProduto(string produto)
{
    if (produto.Contains("Gasolina", StringComparison.OrdinalIgnoreCase))
        return "Gasolina Comum";

    if (produto.Contains("Diesel", StringComparison.OrdinalIgnoreCase) ||
        produto.Contains("S-10", StringComparison.OrdinalIgnoreCase))
        return "Diesel S-10";

    return produto; // Outros produtos
}
```

---

### 2. Validações de Veículo

```csharp
var veiculo = veiculos.FirstOrDefault(v =>
    v.Placa != null &&
    v.Placa.Equals(linha.Placa, StringComparison.OrdinalIgnoreCase));

if (veiculo == null)
{
    linha.Erros.Add($"Veículo de placa '{linha.Placa}' não cadastrado");
}
else
{
    linha.VeiculoId = veiculo.VeiculoId;
}
```

**Erros Possíveis**:
- ❌ Placa não encontrada no banco de dados

---

### 3. Validações de Motorista

```csharp
var motorista = motoristas.FirstOrDefault(m =>
    m.CodMotoristaQCard == linha.CodMotorista);

if (motorista == null)
{
    linha.Erros.Add($"Motorista com código QCard '{linha.CodMotorista}' não cadastrado");
}
else
{
    linha.MotoristaId = motorista.MotoristaId;
    linha.NomeMotorista = motorista.Nome;
}
```

**Erros Possíveis**:
- ❌ CodMotorista não encontrado

---

### 4. Validações de Quantidade

```csharp
if (linha.Quantidade > 500)
{
    linha.Erros.Add($"Quantidade de {linha.Quantidade:N2} litros excede o limite de 500 litros");
}
```

**Regra**:
- ❌ Máximo de **500 litros** por abastecimento

---

### 5. Validações Inteligentes de Quilometragem

**5.1. Quilometragem Negativa**
```csharp
if (linha.KmRodado < 0)
{
    linha.Erros.Add($"Quilometragem negativa ({linha.KmRodado} km): Km Anterior maior que Km Atual");

    // SUGESTÃO AUTOMÁTICA
    int kmAnteriorSugerido = linha.Km - kmRodadoEsperado;
    if (kmAnteriorSugerido > 0)
    {
        linha.TemSugestao = true;
        linha.CampoCorrecao = "KmAnterior";
        linha.ValorAtualErrado = linha.KmAnterior;
        linha.ValorSugerido = kmAnteriorSugerido;
        linha.JustificativaSugestao = $"Baseado na média de {mediaConsumo:N1} km/l do veículo...";
    }
}
```

**5.2. Quilometragem Acima de 1000 km**

O sistema **NÃO** rejeita automaticamente. Faz análise de consumo:

```csharp
if (linha.KmRodado > 1000)
{
    double consumoAtual = linha.KmRodado / linha.Quantidade;
    double mediaReferencia = mediaConsumo > 0 ? mediaConsumo : 10;
    double limiteInferior = mediaReferencia * 0.6;  // -40%
    double limiteSuperior = mediaReferencia * 1.4;  // +40%

    bool consumoDentroDoEsperado = consumoAtual >= limiteInferior && consumoAtual <= limiteSuperior;

    if (consumoDentroDoEsperado)
    {
        // ✅ VIAGEM LONGA LEGÍTIMA - NÃO ADICIONA ERRO
    }
    else if (consumoAtual > limiteSuperior)
    {
        // ❌ Consumo muito ALTO (provável erro no KM Anterior)
        linha.Erros.Add($"Quilometragem de {linha.KmRodado} km excede o limite e consumo de {consumoAtual:N1} km/l está muito acima da média");

        // SUGESTÃO: Corrigir KM Anterior
        linha.TemSugestao = true;
        linha.CampoCorrecao = "KmAnterior";
        linha.ValorSugerido = linha.Km - kmRodadoEsperado;
    }
    else
    {
        // ❌ Consumo muito BAIXO (provável erro no KM Atual)
        linha.Erros.Add($"Quilometragem de {linha.KmRodado} km excede o limite e consumo de {consumoAtual:N1} km/l está muito abaixo da média");

        // SUGESTÃO: Corrigir KM Atual
        linha.TemSugestao = true;
        linha.CampoCorrecao = "Km";
        linha.ValorSugerido = linha.KmAnterior + kmRodadoEsperado;
    }
}
```

**Exemplo Prático**:

| Cenário | KM Anterior | KM Atual | Rodado | Litros | Consumo | Média Veículo | Ação |
|---------|-------------|----------|--------|--------|---------|---------------|------|
| ✅ Viagem longa legítima | 10.000 | 11.500 | 1.500 | 120 | 12.5 km/l | 11 km/l | **Importa** (consumo dentro de ±40%) |
| ❌ Erro KM Anterior | 15.000 | 10.500 | -4.500 | 40 | - | 11 km/l | **Erro** + Sugestão: KM Ant = 10.060 |
| ❌ Erro KM Atual alto | 10.000 | 15.000 | 5.000 | 50 | 100 km/l | 11 km/l | **Erro** + Sugestão: KM Ant correto |
| ❌ Erro KM Atual baixo | 10.000 | 12.000 | 2.000 | 400 | 5 km/l | 11 km/l | **Erro** + Sugestão: KM Atual = 10.440 |

---

### 6. Validação de Autorização Duplicada

**Previne duplicatas**:
```csharp
var autorizacoesExistentes = _unitOfWork.Abastecimento.GetAll()
    .Where(a => a.AutorizacaoQCard.HasValue)
    .Select(a => a.AutorizacaoQCard.Value)
    .ToHashSet();

if (autorizacoesExistentes.Contains(linha.Autorizacao))
{
    linha.Erros.Add($"Autorização '{linha.Autorizacao}' já foi importada anteriormente");
}
```

**Também previne duplicatas em pendências**:
```csharp
var autorizacoesPendentes = _unitOfWork.AbastecimentoPendente
    .GetAll(p => p.Status == 0) // Apenas pendentes
    .Select(p => p.AutorizacaoQCard)
    .ToHashSet();

if (autorizacoesPendentes.Contains(linha.Autorizacao))
{
    continue; // Ignora silenciosamente
}
```

---

## Sistema de Pendências

### Modelo de Dados

**Arquivo**: `Models/AbastecimentoPendente.cs`

```csharp
public class AbastecimentoPendente
{
    public Guid AbastecimentoPendenteId { get; set; }

    // Dados originais
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

    // IDs identificados (nullable se não encontrados)
    public Guid? VeiculoId { get; set; }
    public Guid? MotoristaId { get; set; }
    public Guid? CombustivelId { get; set; }

    // Descrição do erro
    public string? DescricaoPendencia { get; set; }
    public string? TipoPendencia { get; set; } // "veiculo", "motorista", "km", etc.

    // Sugestão de correção (para erros de KM)
    public bool TemSugestao { get; set; }
    public string? CampoCorrecao { get; set; } // "KmAnterior" ou "Km"
    public int? ValorAtualErrado { get; set; }
    public int? ValorSugerido { get; set; }
    public string? JustificativaSugestao { get; set; }
    public double? MediaConsumoVeiculo { get; set; }

    // Controle
    public DateTime DataImportacao { get; set; }
    public int NumeroLinhaOriginal { get; set; }
    public string? ArquivoOrigem { get; set; }
    public int Status { get; set; } // 0=Pendente, 1=Resolvida, 2=Ignorada

    // Relacionamentos virtuais
    public virtual Veiculo? Veiculo { get; set; }
    public virtual Motorista? Motorista { get; set; }
    public virtual Combustivel? Combustivel { get; set; }
}
```

### Tipos de Pendência

| Tipo | TipoPendencia | Ícone | Descrição |
|------|---------------|-------|-----------|
| Autorização | `autorizacao` | `fa-ban` | Autorização duplicada |
| Veículo | `veiculo` | `fa-car-burst` | Placa não cadastrada |
| Motorista | `motorista` | `fa-user-xmark` | CodMotorista não cadastrado |
| Quilometragem | `km` | `fa-gauge-high` | KM negativo ou acima do limite |
| Litros | `litros` | `fa-gas-pump` | Quantidade acima de 500L |
| Data/Hora | `data` | `fa-calendar-xmark` | Data/hora inválida |

### Geração de Pendências

```csharp
foreach (var linha in linhasComErro)
{
    // Determinar tipo principal
    string tipoPrincipal = DeterminarTipoPendencia(linha.Erros);
    string descricaoCompleta = string.Join("; ", linha.Erros);

    var pendencia = new AbastecimentoPendente
    {
        AbastecimentoPendenteId = Guid.NewGuid(),
        AutorizacaoQCard = linha.Autorizacao,
        Placa = linha.Placa,
        // ... outros campos ...
        DescricaoPendencia = descricaoCompleta,
        TipoPendencia = tipoPrincipal,
        TemSugestao = linha.TemSugestao,
        CampoCorrecao = linha.CampoCorrecao,
        ValorAtualErrado = linha.ValorAtualErrado,
        ValorSugerido = linha.ValorSugerido,
        JustificativaSugestao = linha.JustificativaSugestao,
        DataImportacao = DateTime.Now,
        NumeroLinhaOriginal = linha.NumeroLinhaOriginal,
        ArquivoOrigem = nomeArquivo,
        Status = 0 // Pendente
    };

    _unitOfWork.AbastecimentoPendente.Add(pendencia);
}

_unitOfWork.Save();
```

### Página de Pendências

**Acesso**: `/Abastecimento/Pendencias`

Os usuários podem:
1. Visualizar todas as pendências
2. Filtrar por tipo de pendência
3. Aplicar sugestões automáticas
4. Editar manualmente e importar
5. Ignorar pendências

---

## Formatos de Arquivo

### Formato XLSX (ImportarNovo)

**Exemplo de planilha**:

| Autorização | Data | Hora | Placa | KM | KMAnterior | Rodado | Produto | Qtde | Valor Unitário | CodMotorista |
|-------------|------|------|-------|----|-----------:|-------:|---------|-----:|---------------:|-------------:|
| 123456 | 01/01/2025 | 10:30 | ABC1234 | 50500 | 50200 | 300 | Gasolina Comum | 40.5 | 5.89 | 101 |
| 123457 | 01/01/2025 | 14:20 | XYZ5678 | 82300 | 81900 | 400 | Diesel S-10 | 55.0 | 4.99 | 102 |

**Mapeamento Automático de Colunas**:
O sistema detecta automaticamente as colunas pelo nome (case-insensitive):
- `Autorização` ou `Autori*`
- `Data` (sem `hora` no nome)
- `Hora`
- `Placa`
- `KM` ou `Odômetro`
- `KMAnterior` ou `KM Anterior`
- `Rodado`
- `Produto` ou `Combustível`
- `Qtde` ou `Quantidade` ou `Litros`
- `Valor Unitário` ou `Unit*`
- `CodMotorista` ou `Cód Motorista`

---

### Formato CSV (ImportarDual)

**Encoding**: ISO-8859-1 (Latin-1)
**Delimiter**: `,` (vírgula)

**Exemplo CSV**:
```csv
Autorizacao,Placa,KM,Produto,Qtde,VrUnitario,Rodado,CodMotorista,KMAnterior
123456,ABC1234,50500,Gasolina Comum,40.5,5.89,300,101,50200
123457,XYZ5678,82300,Diesel S-10,55.0,4.99,400,102,81900
```

**Leitura com CsvHelper**:
```csharp
using (var reader = new StreamReader(file.OpenReadStream(), Encoding.GetEncoding("ISO-8859-1")))
using (var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
{
    Delimiter = ",",
    MissingFieldFound = null,
    HeaderValidated = null,
    BadDataFound = null
}))
{
    var registros = csv.GetRecords<LinhaCsv>().ToList();
}
```

---

### Formato XLSX para Data/Hora (ImportarDual)

**Colunas**:
- `Data` (tipo DateTime do Excel, com hora)
- `Autorizacao` (int)

**Exemplo**:

| Data | Autorizacao |
|------|-------------|
| 01/01/2025 10:30:00 | 123456 |
| 01/01/2025 14:20:00 | 123457 |

**IMPORTANTE**: A coluna `Data` deve estar formatada como **DateTime** no Excel, não como texto.

**Leitura**:
```csharp
if (cell.CellType == CellType.Numeric && DateUtil.IsCellDateFormatted(cell))
{
    return cell.DateCellValue; // DateTime com hora
}
```

---

## Troubleshooting

### Problema 1: Erro "One or more validation errors occurred"

**Causa**: O atributo `[ApiController]` do ASP.NET Core faz validação automática de model binding antes do método ser executado.

**Solução**: Remover validação de campos obrigatórios no início do método:
```csharp
[Route("ImportarDual")]
[HttpPost]
public async Task<ActionResult> ImportarDual()
{
    // ⭐ BLINDAGEM: Remover validação automática do [ApiController]
    ModelState.Remove("Veiculo");
    ModelState.Remove("Motorista");
    ModelState.Remove("Combustivel");
    ModelState.Remove("Litros");
    ModelState.Remove("DataHora");
    ModelState.Remove("Hodometro");
    ModelState.Remove("ValorUnitario");
    ModelState.Remove("AutorizacaoQCard");

    // ... resto do código
}
```

---

### Problema 2: Nenhum registro encontrado após JOIN

**Causa**: Os números de Autorização não correspondem entre CSV e XLSX.

**Diagnóstico**:
1. Verificar se as autorizações no CSV existem no XLSX
2. Verificar formato dos números (sem espaços, zeros à esquerda, etc.)

**Exemplo de mensagem de erro**:
```
Nenhum registro com Autorização correspondente encontrado.
CSV: 150 registros, XLSX: 150 registros.
Verifique se os números de Autorização correspondem nos dois arquivos.
```

---

### Problema 3: Arquivos CSV com caracteres especiais

**Causa**: Encoding incorreto (UTF-8 vs ISO-8859-1).

**Solução**: O sistema usa `ISO-8859-1` por padrão. Se o CSV estiver em UTF-8:
```csharp
// Alterar para UTF-8
using (var reader = new StreamReader(file.OpenReadStream(), Encoding.UTF8))
```

---

### Problema 4: Data/hora não reconhecida no XLSX

**Causa**: Coluna `Data` está como texto, não como DateTime do Excel.

**Solução**: No Excel:
1. Selecionar a coluna `Data`
2. Formatar como `Data/Hora` (não `Texto`)
3. Salvar novamente

---

### Problema 5: Todos os registros ignorados

**Causa**: Produtos não reconhecidos.

**Diagnóstico**: Verificar se os produtos estão escritos como:
- ✅ "Gasolina Comum"
- ✅ "Diesel S-10"
- ❌ "ARLA 32" (será ignorado)
- ❌ "Etanol" (será ignorado)

**Solução**: Renomear produtos na planilha ou adicionar mapeamento no código:
```csharp
var mapaCombustivel = new Dictionary<string, Guid>
{
    { "Gasolina Comum", Guid.Parse("...") },
    { "Diesel S-10", Guid.Parse("...") },
    { "Etanol", Guid.Parse("...") } // Adicionar novo
};
```

---

## Histórico de Mudanças

### Versão 2.0 - Importação Dual (Janeiro 2025)
- ✅ Adicionado endpoint `ImportarDual` para receber CSV + XLSX
- ✅ Implementado INNER JOIN em memória pela coluna `Autorizacao`
- ✅ Suporte a CsvHelper para leitura de CSV
- ✅ Dual dropzone no frontend
- ✅ Validação de AMBOS os arquivos antes de habilitar botão

### Versão 1.5 - Sistema de Pendências (Dezembro 2024)
- ✅ Criada tabela `AbastecimentoPendente`
- ✅ Sugestões automáticas de correção para erros de KM
- ✅ Página `/Abastecimento/Pendencias` para resolver pendências
- ✅ Prevenção de duplicatas em pendências

### Versão 1.0 - Importação Inicial (Novembro 2024)
- ✅ Endpoint `ImportarNovo` para XLSX único
- ✅ Validações de veículo, motorista, produto, quantidade
- ✅ Progresso em tempo real via SignalR
- ✅ TransactionScope para consistência de dados

---

## Referências Rápidas

### Arquivos Principais
- **Frontend**: `Pages/Abastecimento/Importacao.cshtml`
- **Backend**: `Controllers/AbastecimentoController.Import.cs`
- **SignalR**: `Hubs/ImportacaoHub.cs`
- **Modelo**: `Models/AbastecimentoPendente.cs`

### URLs
- **Página de Importação**: `/Abastecimento/Importacao`
- **Página de Pendências**: `/Abastecimento/Pendencias`
- **Endpoint Importar Simples**: `POST /api/Abastecimento/ImportarNovo`
- **Endpoint Importar Dual**: `POST /api/Abastecimento/ImportarDual`
- **SignalR Hub**: `/hubs/importacao`

### Limites e Regras
- ✅ Máximo 500 litros por abastecimento
- ✅ Máximo 1000 km rodados (com validação de consumo)
- ✅ Produtos aceitos: Gasolina Comum, Diesel S-10
- ✅ Consumo tolerância: ±40% da média do veículo
- ✅ Encoding CSV: ISO-8859-1 (Latin-1)
- ✅ Formato data XLSX: DateTime do Excel

---

**Última atualização**: Janeiro de 2025
**Autor**: Sistema FrotiX
**Versão**: 2.0
