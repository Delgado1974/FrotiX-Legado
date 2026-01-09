# Documentação: Abastecimento.cs

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
8. [Validações](#validações)
9. [Exemplos de Uso](#exemplos-de-uso)
10. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O Model `Abastecimento` representa um registro de abastecimento de combustível realizado por um veículo da frota. Cada abastecimento registra informações como quantidade de litros, valor unitário, data/hora, quilometragem e autorização QCard.

**Principais características:**

✅ **Registro de Abastecimento**: Armazena dados de cada abastecimento realizado  
✅ **Relacionamentos**: Vinculado a Veículo, Motorista e Combustível  
✅ **Rastreabilidade**: Inclui autorização QCard e quilometragem  
✅ **Cálculo de KM Rodado**: Campo calculado baseado em abastecimentos anteriores  
✅ **Integração com Importação**: Suporta importação de planilhas QCard

### Objetivo

O `Abastecimento` resolve o problema de:
- Registrar todos os abastecimentos da frota
- Controlar consumo de combustível por veículo
- Rastrear custos de abastecimento
- Validar quilometragem e detectar inconsistências
- Integrar com sistema QCard para importação automática

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Entity Framework Core | 5.0+ | ORM e mapeamento |
| ASP.NET Core | 5.0+ | Validações e Data Annotations |
| SQL Server | - | Banco de dados |

### Padrões de Design

- **Repository Pattern**: Acesso a dados através de `AbastecimentoRepository`
- **Unit of Work**: Gerenciamento de transações através de `IUnitOfWork`
- **Data Annotations**: Validações declarativas nos modelos

---

## Estrutura de Arquivos

### Arquivo Principal
```
Models/Cadastros/Abastecimento.cs
```

### Arquivos Relacionados
- `Repository/AbastecimentoRepository.cs` - Acesso a dados
- `Repository/IRepository/IAbastecimentoRepository.cs` - Interface
- `Controllers/AbastecimentoController.cs` - Endpoints CRUD e importação
- `Pages/Abastecimento/Index.cshtml` - Listagem de abastecimentos
- `Pages/Abastecimento/Upsert.cshtml` - Formulário de criação/edição
- `Pages/Abastecimento/Pendencias.cshtml` - Gestão de pendências de importação
- `Models/Views/ViewAbastecimentos.cs` - View consolidada de abastecimentos

---

## Estrutura do Model

### Classe: `Abastecimento`

```csharp
public class Abastecimento
{
    [Key]
    public Guid AbastecimentoId { get; set; }

    [Required(ErrorMessage = "A quantidade de litros é obrigatória")]
    public double? Litros { get; set; }

    [Required(ErrorMessage = "O valor unitário é obrigatório")]
    public double? ValorUnitario { get; set; }

    [Required(ErrorMessage = "A data/hora é obrigatória")]
    public DateTime? DataHora { get; set; }

    public int? KmRodado { get; set; }

    [Required(ErrorMessage = "O hodômetro é obrigatório")]
    public int? Hodometro { get; set; }

    [Required(ErrorMessage = "A autorização QCard é obrigatória")]
    public int? AutorizacaoQCard { get; set; }

    [Required(ErrorMessage = "O veículo é obrigatório")]
    public Guid VeiculoId { get; set; }

    [ForeignKey("VeiculoId")]
    public virtual Veiculo Veiculo { get; set; }

    [Required(ErrorMessage = "O tipo de combustível é obrigatório")]
    public Guid CombustivelId { get; set; }

    [ForeignKey("CombustivelId")]
    public virtual Combustivel Combustivel { get; set; }

    [Required(ErrorMessage = "O motorista é obrigatório")]
    public Guid MotoristaId { get; set; }

    [ForeignKey("MotoristaId")]
    public virtual Motorista Motorista { get; set; }
}
```

**Propriedades Principais:**

- `AbastecimentoId` (Guid): Chave primária única
- `Litros` (double?): Quantidade de litros abastecidos (obrigatório)
- `ValorUnitario` (double?): Valor unitário do combustível (obrigatório)
- `DataHora` (DateTime?): Data e hora do abastecimento (obrigatório)
- `KmRodado` (int?): Quilometragem rodada desde último abastecimento (calculado)
- `Hodometro` (int?): Quilometragem atual do veículo (obrigatório)
- `AutorizacaoQCard` (int?): Número da autorização QCard (obrigatório)
- `VeiculoId` (Guid): ID do veículo (obrigatório, FK)
- `CombustivelId` (Guid): ID do tipo de combustível (obrigatório, FK)
- `MotoristaId` (Guid): ID do motorista (obrigatório, FK)

### Classe: `AbastecimentoViewModel`

```csharp
public class AbastecimentoViewModel
{
    public Guid AbastecimentoId { get; set; }
    public Guid VeiculoId { get; set; }
    public Guid MotoristaId { get; set; }
    public Guid CombustivelId { get; set; }
    public Abastecimento Abastecimento { get; set; }
    public IEnumerable<SelectListItem> VeiculoList { get; set; }
    public IEnumerable<SelectListItem> MotoristaList { get; set; }
    public IEnumerable<SelectListItem> CombustivelList { get; set; }
}
```

**Uso**: ViewModel para formulários de criação/edição com listas de dropdown.

---

## Mapeamento Model ↔ Banco de Dados

### Tabela: `Abastecimento`

**Tipo**: Tabela

**SQL de Criação** (exemplo):
```sql
CREATE TABLE [dbo].[Abastecimento] (
    [AbastecimentoId] uniqueidentifier NOT NULL PRIMARY KEY,
    [Litros] float NULL,
    [ValorUnitario] float NULL,
    [DataHora] datetime2 NULL,
    [KmRodado] int NULL,
    [Hodometro] int NULL,
    [AutorizacaoQCard] int NULL,
    [VeiculoId] uniqueidentifier NOT NULL,
    [CombustivelId] uniqueidentifier NOT NULL,
    [MotoristaId] uniqueidentifier NOT NULL,
    CONSTRAINT [FK_Abastecimento_Veiculo] FOREIGN KEY ([VeiculoId]) 
        REFERENCES [Veiculo]([VeiculoId]),
    CONSTRAINT [FK_Abastecimento_Combustivel] FOREIGN KEY ([CombustivelId]) 
        REFERENCES [Combustivel]([CombustivelId]),
    CONSTRAINT [FK_Abastecimento_Motorista] FOREIGN KEY ([MotoristaId]) 
        REFERENCES [Motorista]([MotoristaId])
);
```

**Mapeamento Model ↔ Banco**:

| Campo no Model | Campo no Banco | Tipo SQL | Tipo C# | Nullable | Descrição |
|----------------|----------------|----------|---------|----------|-----------|
| `AbastecimentoId` | `AbastecimentoId` | `uniqueidentifier` | `Guid` | ❌ | Chave primária |
| `Litros` | `Litros` | `float` | `double?` | ✅ | Quantidade em litros |
| `ValorUnitario` | `ValorUnitario` | `float` | `double?` | ✅ | Valor unitário |
| `DataHora` | `DataHora` | `datetime2` | `DateTime?` | ✅ | Data/hora |
| `KmRodado` | `KmRodado` | `int` | `int?` | ✅ | KM rodado |
| `Hodometro` | `Hodometro` | `int` | `int?` | ✅ | Hodômetro atual |
| `AutorizacaoQCard` | `AutorizacaoQCard` | `int` | `int?` | ✅ | Autorização QCard |
| `VeiculoId` | `VeiculoId` | `uniqueidentifier` | `Guid` | ❌ | FK Veículo |
| `CombustivelId` | `CombustivelId` | `uniqueidentifier` | `Guid` | ❌ | FK Combustível |
| `MotoristaId` | `MotoristaId` | `uniqueidentifier` | `Guid` | ❌ | FK Motorista |

**Chaves e Índices**:
- **PK**: `AbastecimentoId` (CLUSTERED)
- **FK**: `VeiculoId` → `Veiculo(VeiculoId)`
- **FK**: `CombustivelId` → `Combustivel(CombustivelId)`
- **FK**: `MotoristaId` → `Motorista(MotoristaId)`
- **IX**: `IX_Abastecimento_VeiculoId` (VeiculoId) - Para consultas por veículo
- **IX**: `IX_Abastecimento_DataHora` (DataHora) - Para consultas por data

**Triggers Associados** (se existirem):
- Verificar triggers que atualizam estatísticas ou validam KM

**Stored Procedures Relacionadas**:
- Verificar procedures que calculam médias de consumo

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **AbastecimentoController.Get()** → Lista Abastecimentos

**Quando**: Usuário acessa página de listagem  
**Por quê**: Retornar todos os abastecimentos para exibição

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

#### 2. **AbastecimentoController.Create()** → Cria Abastecimento

**Quando**: Usuário preenche formulário e salva  
**Por quê**: Criar novo registro de abastecimento

```csharp
[HttpPost]
public IActionResult Create([FromBody] Abastecimento abastecimento)
{
    // Validações
    // Cálculo de KmRodado
    // Salvar no banco
    _unitOfWork.Abastecimento.Add(abastecimento);
    _unitOfWork.Save();
}
```

#### 3. **AbastecimentoController.Import.cs** → Importa de Planilha

**Quando**: Usuário importa planilha QCard  
**Por quê**: Criar múltiplos abastecimentos a partir de planilha

```csharp
// Processa cada linha da planilha
var abastecimento = new Abastecimento
{
    Litros = linha.Litros,
    ValorUnitario = linha.ValorUnitario,
    DataHora = linha.DataHora,
    // ...
};
_unitOfWork.Abastecimento.Add(abastecimento);
```

### O Que Este Arquivo Usa

- **Veiculo**: Relacionamento obrigatório
- **Combustivel**: Relacionamento obrigatório
- **Motorista**: Relacionamento obrigatório

### Fluxo de Dados

```
Usuário preenche formulário
    ↓
AbastecimentoViewModel (com listas)
    ↓
Validações (Data Annotations)
    ↓
AbastecimentoController.Create()
    ↓
Cálculo de KmRodado
    ↓
AbastecimentoRepository.Add()
    ↓
UnitOfWork.Save()
    ↓
Banco de Dados
```

---

## Lógica de Negócio

### Cálculo de KM Rodado

O campo `KmRodado` é calculado baseado na diferença entre o hodômetro atual e o último abastecimento:

```csharp
// Exemplo de cálculo
var ultimoAbastecimento = _unitOfWork.Abastecimento
    .GetAll(a => a.VeiculoId == veiculoId)
    .OrderByDescending(a => a.DataHora)
    .FirstOrDefault();

if (ultimoAbastecimento != null)
{
    abastecimento.KmRodado = abastecimento.Hodometro - ultimoAbastecimento.Hodometro;
}
else
{
    abastecimento.KmRodado = null; // Primeiro abastecimento
}
```

### Validação de Quilometragem

O sistema valida se a quilometragem é consistente:

```csharp
// Validação: KM não pode ser menor que o anterior
if (ultimoAbastecimento != null && 
    abastecimento.Hodometro < ultimoAbastecimento.Hodometro)
{
    // Cria pendência ou rejeita
    // Ver AbastecimentoPendente
}
```

---

## Validações

### Frontend

- Campos obrigatórios marcados com `[Required]`
- Validação de formato de data/hora
- Validação de valores numéricos positivos

### Backend

- **Litros**: Obrigatório, deve ser > 0
- **ValorUnitario**: Obrigatório, deve ser > 0
- **DataHora**: Obrigatório, não pode ser futura
- **Hodometro**: Obrigatório, deve ser >= último hodômetro
- **AutorizacaoQCard**: Obrigatório, deve ser único por veículo/data
- **Relacionamentos**: Veículo, Combustível e Motorista devem existir

**Código de Validação**:
```csharp
[Required(ErrorMessage = "A quantidade de litros é obrigatória")]
public double? Litros { get; set; }

// Validação customizada pode ser adicionada
if (Litros <= 0)
{
    ModelState.AddModelError("Litros", "Litros deve ser maior que zero");
}
```

---

## Exemplos de Uso

### Cenário 1: Criar Abastecimento Manual

**Situação**: Usuário registra abastecimento realizado manualmente

**Código**:
```csharp
var abastecimento = new Abastecimento
{
    AbastecimentoId = Guid.NewGuid(),
    Litros = 50.0,
    ValorUnitario = 5.89,
    DataHora = DateTime.Now,
    Hodometro = 15000,
    AutorizacaoQCard = 12345,
    VeiculoId = veiculoId,
    CombustivelId = combustivelId,
    MotoristaId = motoristaId
};

// Calcular KM rodado
var ultimo = _unitOfWork.Abastecimento
    .GetAll(a => a.VeiculoId == veiculoId)
    .OrderByDescending(a => a.DataHora)
    .FirstOrDefault();
    
if (ultimo != null)
    abastecimento.KmRodado = abastecimento.Hodometro - ultimo.Hodometro;

_unitOfWork.Abastecimento.Add(abastecimento);
_unitOfWork.Save();
```

**Resultado**: Abastecimento criado com KM rodado calculado

### Cenário 2: Importar Abastecimentos de Planilha

**Situação**: Importar múltiplos abastecimentos de planilha QCard

**Código**:
```csharp
foreach (var linha in linhasPlanilha)
{
    // Validar dados
    // Identificar veículo, motorista, combustível
    // Criar abastecimento ou pendência
}
```

**Resultado**: Múltiplos abastecimentos criados ou pendências geradas

---

## Troubleshooting

### Problema: KM Rodado negativo ou inconsistente

**Sintoma**: Campo `KmRodado` mostra valor negativo ou muito alto

**Causa**: Hodômetro atual menor que o anterior ou erro de digitação

**Solução**: 
1. Validar hodômetro antes de salvar
2. Criar pendência se inconsistente (ver `AbastecimentoPendente`)
3. Permitir correção manual

---

## Notas Importantes

1. **Autorização QCard**: Deve ser único para evitar duplicatas
2. **KM Rodado**: Calculado automaticamente, pode ser NULL no primeiro abastecimento
3. **Valor Total**: Calculado como `Litros * ValorUnitario` (não armazenado)
4. **Importação**: Abastecimentos com erro são salvos em `AbastecimentoPendente`

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação de documentação extensiva do modelo `Abastecimento`

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
