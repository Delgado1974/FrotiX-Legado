# Documentação: Evento.cs

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

O Model `Evento` representa eventos institucionais que requerem múltiplas viagens. Um evento pode ter várias viagens associadas, permitindo agrupar viagens relacionadas a um mesmo evento (ex: Congresso, Seminário, Evento de vários dias).

**Principais características:**

✅ **Agrupamento de Viagens**: Múltiplas viagens podem pertencer a um evento  
✅ **Requisitante e Setor**: Vinculado a requisitante e setor solicitante  
✅ **Período**: Data inicial e final do evento  
✅ **Participantes**: Quantidade de participantes  
✅ **Status**: Ativo/Inativo para controle

### Objetivo

O `Evento` resolve o problema de:
- Agrupar viagens relacionadas a um mesmo evento
- Controlar eventos institucionais
- Calcular custos totais de eventos
- Facilitar relatórios por evento

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Entity Framework Core | 5.0+ | ORM |
| ASP.NET Core | 5.0+ | Validações |

---

## Estrutura de Arquivos

### Arquivo Principal
```
Models/Cadastros/Evento.cs
```

### Arquivos Relacionados
- `Controllers/EventoController.cs` - CRUD de eventos
- `Pages/Evento/Index.cshtml` - Listagem de eventos
- `Models/Views/ViewEventos.cs` - View consolidada
- `Models/EventoListDto.cs` - DTO para listagem

---

## Estrutura do Model

```csharp
public class Evento
{
    [Key]
    public Guid EventoId { get; set; }

    [StringLength(200, ErrorMessage = "o Nome não pode exceder 200 caracteres")]
    [Display(Name = "Nome do Evento")]
    [Required]
    public string? Nome { get; set; }

    [StringLength(300, ErrorMessage = "a Descrição não pode exceder 300 caracteres")]
    [Display(Name = "Descrição")]
    [Required]
    public string? Descricao { get; set; }

    [Display(Name = "Quantidade de Participantes")]
    [Required]
    public int? QtdParticipantes { get; set; }

    [Display(Name = "Data Inicial")]
    [Required]
    public DateTime? DataInicial { get; set; }

    [DataType(DataType.DateTime)]
    [Display(Name = "Data Final")]
    [Required]
    public DateTime? DataFinal { get; set; }

    [Display(Name = "Ativo/Inativo")]
    [Required]
    public string? Status { get; set; }

    [Display(Name = "Setor Solicitante")]
    [Required]
    public Guid SetorSolicitanteId { get; set; }

    [ForeignKey("SetorSolicitanteId")]
    public virtual SetorSolicitante SetorSolicitante { get; set; }

    [Display(Name = "Usuário Solicitante")]
    [Required]
    public Guid RequisitanteId { get; set; }

    [ForeignKey("RequisitanteId")]
    public virtual Requisitante Requisitante { get; set; }
}
```

**Propriedades Principais:**

- `EventoId` (Guid): Chave primária
- `Nome` (string): Nome do evento (obrigatório, max 200)
- `Descricao` (string): Descrição detalhada (obrigatório, max 300)
- `QtdParticipantes` (int?): Quantidade de participantes (obrigatório)
- `DataInicial` (DateTime?): Data de início (obrigatório)
- `DataFinal` (DateTime?): Data de término (obrigatório)
- `Status` (string): Status do evento (obrigatório, ex: "Ativo", "Inativo")
- `SetorSolicitanteId` (Guid): FK para SetorSolicitante (obrigatório)
- `RequisitanteId` (Guid): FK para Requisitante (obrigatório)

### Classe: `EventoViewModel`

```csharp
public class EventoViewModel
{
    public Guid EventoId { get; set; }
    public string? Nome { get; set; }
    public string? Descricao { get; set; }
    public int? QtdParticipantes { get; set; }
    public DateTime? DataInicial { get; set; }
    public DateTime? DataFinal { get; set; }
    public string? Status { get; set; }
    public Guid SetorSolicitanteId { get; set; }
    public Guid RequisitanteId { get; set; }
    public Evento Evento { get; set; }
}
```

**Uso**: ViewModel para formulários de criação/edição.

---

## Mapeamento Model ↔ Banco de Dados

### Tabela: `Evento`

**Tipo**: Tabela

**SQL de Criação** (exemplo):
```sql
CREATE TABLE [dbo].[Evento] (
    [EventoId] uniqueidentifier NOT NULL PRIMARY KEY,
    [Nome] nvarchar(200) NOT NULL,
    [Descricao] nvarchar(300) NOT NULL,
    [QtdParticipantes] int NOT NULL,
    [DataInicial] datetime2 NOT NULL,
    [DataFinal] datetime2 NOT NULL,
    [Status] nvarchar(50) NOT NULL,
    [SetorSolicitanteId] uniqueidentifier NOT NULL,
    [RequisitanteId] uniqueidentifier NOT NULL,
    CONSTRAINT [FK_Evento_SetorSolicitante] FOREIGN KEY ([SetorSolicitanteId]) 
        REFERENCES [SetorSolicitante]([SetorSolicitanteId]),
    CONSTRAINT [FK_Evento_Requisitante] FOREIGN KEY ([RequisitanteId]) 
        REFERENCES [Requisitante]([RequisitanteId])
);
```

**Mapeamento Model ↔ Banco**:

| Campo no Model | Campo no Banco | Tipo SQL | Tipo C# | Nullable | Descrição |
|----------------|----------------|----------|---------|----------|-----------|
| `EventoId` | `EventoId` | `uniqueidentifier` | `Guid` | ❌ | Chave primária |
| `Nome` | `Nome` | `nvarchar(200)` | `string?` | ❌ | Nome do evento |
| `Descricao` | `Descricao` | `nvarchar(300)` | `string?` | ❌ | Descrição |
| `QtdParticipantes` | `QtdParticipantes` | `int` | `int?` | ❌ | Quantidade |
| `DataInicial` | `DataInicial` | `datetime2` | `DateTime?` | ❌ | Data início |
| `DataFinal` | `DataFinal` | `datetime2` | `DateTime?` | ❌ | Data fim |
| `Status` | `Status` | `nvarchar(50)` | `string?` | ❌ | Status |
| `SetorSolicitanteId` | `SetorSolicitanteId` | `uniqueidentifier` | `Guid` | ❌ | FK Setor |
| `RequisitanteId` | `RequisitanteId` | `uniqueidentifier` | `Guid` | ❌ | FK Requisitante |

**Chaves e Índices**:
- **PK**: `EventoId` (CLUSTERED)
- **FK**: `SetorSolicitanteId` → `SetorSolicitante(SetorSolicitanteId)`
- **FK**: `RequisitanteId` → `Requisitante(RequisitanteId)`
- **IX**: `IX_Evento_DataInicial` (DataInicial) - Para consultas por período

**Tabelas Relacionadas**:
- `Viagem` - Viagens podem ter EventoId (FK opcional)
- `SetorSolicitante` - Setor solicitante
- `Requisitante` - Requisitante do evento

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **EventoController.Get()** → Lista Eventos

**Quando**: Página de listagem de eventos  
**Por quê**: Retornar todos os eventos

```csharp
var eventos = _unitOfWork.Evento.GetAll()
    .OrderByDescending(e => e.DataInicial)
    .ToList();
```

#### 2. **ViagemController** → Vincula Viagens a Eventos

**Quando**: Viagem é criada/editada  
**Por quê**: Associar viagem a um evento

```csharp
var viagem = new Viagem
{
    // ... outros campos
    EventoId = eventoId  // Vincula ao evento
};
```

### O Que Este Arquivo Usa

- **SetorSolicitante**: Relacionamento obrigatório
- **Requisitante**: Relacionamento obrigatório

### Fluxo de Dados

```
Evento criado
    ↓
Viagens associadas (EventoId)
    ↓
Cálculo de custo total do evento
    ↓
Relatórios por evento
```

---

## Lógica de Negócio

### Validação de Datas

Data final deve ser maior ou igual à data inicial:

```csharp
if (evento.DataFinal < evento.DataInicial)
{
    ModelState.AddModelError("DataFinal", "Data final deve ser maior ou igual à data inicial");
}
```

### Cálculo de Custo Total

Custo total do evento é soma dos custos das viagens relacionadas:

```csharp
var custoTotal = _unitOfWork.Viagem
    .GetAll(v => v.EventoId == eventoId)
    .Sum(v => v.CustoViagem ?? 0);
```

---

## Exemplos de Uso

### Cenário 1: Criar Evento e Associar Viagens

**Situação**: Evento de vários dias precisa de múltiplas viagens

**Código**:
```csharp
// Criar evento
var evento = new Evento
{
    EventoId = Guid.NewGuid(),
    Nome = "Congresso Nacional 2026",
    Descricao = "Evento de 3 dias",
    QtdParticipantes = 50,
    DataInicial = new DateTime(2026, 3, 1),
    DataFinal = new DateTime(2026, 3, 3),
    Status = "Ativo",
    SetorSolicitanteId = setorId,
    RequisitanteId = requisitanteId
};

_unitOfWork.Evento.Add(evento);

// Criar viagens associadas
for (int i = 0; i < 3; i++)
{
    var viagem = new Viagem
    {
        EventoId = evento.EventoId,
        DataInicial = evento.DataInicial.Value.AddDays(i),
        // ... outros campos
    };
    _unitOfWork.Viagem.Add(viagem);
}

_unitOfWork.Save();
```

**Resultado**: Evento criado com múltiplas viagens associadas

---

## Troubleshooting

### Problema: Evento não aparece em listagens

**Sintoma**: Evento criado não aparece na lista

**Causa**: Filtro por Status ou Data

**Solução**: Verificar filtros aplicados na consulta

---

## Notas Importantes

1. **Agrupamento**: Evento agrupa múltiplas viagens relacionadas
2. **Custo Total**: Calculado somando custos das viagens do evento
3. **Status**: Campo string, valores comuns: "Ativo", "Inativo", "Finalizado"

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação de documentação extensiva do modelo `Evento`

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
