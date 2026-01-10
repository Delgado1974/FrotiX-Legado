# Documentação: FrotiXDbContext.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `FrotiXDbContext` é o contexto de banco de dados principal do sistema FrotiX, contendo todas as entidades de domínio, views otimizadas e tabelas estatísticas pré-calculadas.

**Principais características:**

✅ **Contexto Principal**: Contém todas as entidades do sistema  
✅ **Views Otimizadas**: Múltiplas views para consultas complexas  
✅ **Tabelas Estatísticas**: Tabelas pré-calculadas para dashboards  
✅ **Configuração de Triggers**: Suporte a triggers SQL Server  
✅ **Chaves Compostas**: Múltiplas tabelas com chaves compostas  
✅ **Timeout Estendido**: 9000 segundos (150 minutos)

**Nota**: Esta classe é implementada como `partial class`, dividida em múltiplos arquivos:
- `FrotiXDbContext.cs` (principal)
- `FrotiXDbContext.OcorrenciaViagem.cs`
- `FrotiXDbContext.RepactuacaoVeiculo.cs`

---

## Estrutura da Classe

### Herança

```csharp
public partial class FrotiXDbContext : DbContext
```

**Herança**: `DbContext` padrão do Entity Framework Core

---

## Configurações Especiais

### Timeout Estendido

```csharp
Database.SetCommandTimeout(9000); // 150 minutos
```

**Motivo**: Operações complexas (importações, cálculos em lote, relatórios) podem demorar muito tempo.

---

## DbSets Principais

### Entidades de Cadastros

- `Abastecimento`, `AbastecimentoPendente`
- `Veiculo`, `MarcaVeiculo`, `ModeloVeiculo`
- `Motorista`, `Encarregado`, `Operador`, `Lavador`
- `Contrato`, `AtaRegistroPrecos`
- `Combustivel`, `Unidade`, `Fornecedor`
- `Requisitante`, `SetorSolicitante`
- `SetorPatrimonial`, `SecaoPatrimonial`, `Patrimonio`
- `PlacaBronze`

### Entidades de Operações

- `Viagem`, `ViagensEconomildo`
- `OcorrenciaViagem` (partial)
- `Lavagem`, `Manutencao`, `Multa`
- `Empenho`, `NotaFiscal`, `Glosa`
- `Evento`

### Entidades de Relacionamentos

- `VeiculoContrato`, `VeiculoAta`
- `MotoristaContrato`, `OperadorContrato`
- `EncarregadoContrato`, `LavadorContrato`
- `LotacaoMotorista`, `LavadoresLavagem`

### Views Otimizadas

- `ViewAbastecimentos`, `ViewVeiculos`, `ViewMotoristas`
- `ViewViagens`, `ViewCustosViagem`
- `ViewManutencao`, `ViewMultas`, `ViewEmpenhos`
- `ViewFluxoEconomildo`, `ViewLavagem`
- `ViewEventos`, `ViewOcorrencia`
- E muitas outras...

### Tabelas Estatísticas (Dashboards)

**Dashboard Motoristas**:
- `EstatisticaMotoristasMensal`
- `EstatisticaGeralMensal`
- `RankingMotoristasMensal`
- `HeatmapViagensMensal`
- `EvolucaoViagensDiaria`

**Dashboard Abastecimentos**:
- `EstatisticaAbastecimentoMensal`
- `EstatisticaAbastecimentoCombustivel`
- `EstatisticaAbastecimentoCategoria`
- `EstatisticaAbastecimentoTipoVeiculo`
- `EstatisticaAbastecimentoVeiculo`
- `EstatisticaAbastecimentoVeiculoMensal`
- `HeatmapAbastecimentoMensal`
- `AnosDisponiveisAbastecimento`

---

## Configurações de Modelo (`OnModelCreating`)

### ⚠️ CRÍTICO: Configuração de Triggers

**Problema**: Tabelas com triggers SQL Server causam erro quando Entity Framework usa `OUTPUT` clause:
```
"A tabela de destino da instrução DML não pode ter gatilhos habilitados 
se a instrução contém uma cláusula OUTPUT sem cláusula INTO"
```

**Solução**: Desabilitar `OUTPUT` clause para tabelas com triggers:

```csharp
modelBuilder.Entity<Motorista>(entity =>
{
    entity.ToTable(tb =>
    {
        tb.HasTrigger("trg_Motorista_FillNulls_OnChange");
        tb.UseSqlOutputClause(false); // CRÍTICO
    });
});
```

**Tabelas Configuradas**:
- `Motorista` - trigger: `trg_Motorista_FillNulls_OnChange`
- `Viagem` - trigger: `tr_Viagem_CalculaCustos`
- `Abastecimento` - trigger: `trg_Abastecimento_AtualizarEstatisticas`
- `Requisitante` - trigger: `TriggerRequisitante`
- `AbastecimentoPendente`, `Veiculo` - desabilitado por segurança

---

### Chaves Compostas

Múltiplas tabelas usam chaves compostas:

```csharp
// VeiculoContrato: (VeiculoId, ContratoId)
modelBuilder.Entity<VeiculoContrato>()
    .HasKey(vc => new { vc.VeiculoId, vc.ContratoId });

// MotoristaContrato: (MotoristaId, ContratoId)
modelBuilder.Entity<MotoristaContrato>()
    .HasKey(mc => new { mc.MotoristaId, mc.ContratoId });

// MediaCombustivel: (NotaFiscalId, CombustivelId, Ano, Mes)
modelBuilder.Entity<MediaCombustivel>()
    .HasKey(mc => new { mc.NotaFiscalId, mc.CombustivelId, mc.Ano, mc.Mes });
```

**Tabelas com Chaves Compostas**:
- `VeiculoContrato`, `VeiculoAta`
- `MotoristaContrato`, `OperadorContrato`
- `EncarregadoContrato`, `LavadorContrato`
- `MediaCombustivel`, `CustoMensalItensContrato`
- `LavadoresLavagem`, `ControleAcesso`

---

### Relacionamentos Especiais

#### VeiculoPadraoViagem (1:1)

```csharp
modelBuilder.Entity<VeiculoPadraoViagem>(entity =>
{
    entity.HasKey(e => e.VeiculoId);
    entity.HasOne(e => e.Veiculo)
        .WithOne()
        .HasForeignKey<VeiculoPadraoViagem>(e => e.VeiculoId)
        .OnDelete(DeleteBehavior.Cascade);
});
```

**Uso**: Define veículo padrão para viagens (relacionamento 1:1 com `Veiculo`)

---

### Views Sem Chave (`HasNoKey`)

Views são configuradas como `HasNoKey()` pois são apenas consultas:

```csharp
modelBuilder.Entity<ViewAbastecimentos>().HasNoKey();
modelBuilder.Entity<ViewViagens>().HasNoKey();
modelBuilder.Entity<ViewCustosViagem>().HasNoKey();
// ... e muitas outras
```

**Total**: Mais de 30 views configuradas como `HasNoKey()`

---

## Interconexões

### Quem Usa Este Contexto

- **Todos os Controllers**: Via `IUnitOfWork` que encapsula este contexto
- **Repositories**: Acesso direto às entidades
- **Services**: Operações de negócio
- **Dashboards**: Consultas em tabelas estatísticas

### O Que Este Contexto Usa

- **FrotiX.Models**: Todos os modelos de domínio
- **FrotiX.Models.Views**: Views otimizadas
- **FrotiX.Models.Estatisticas**: Tabelas estatísticas

---

## Casos de Uso Importantes

### 1. Consulta com View Otimizada

```csharp
var abastecimentos = context.ViewAbastecimentos
    .Where(a => a.DataHora >= dataInicio && a.DataHora <= dataFim)
    .ToList();
```

### 2. Consulta em Tabela Estatística

```csharp
var estatisticas = context.EstatisticaAbastecimentoMensal
    .Where(e => e.Ano == 2026 && e.Mes == 1)
    .ToList();
```

### 3. Operação com Trigger

```csharp
// Ao salvar Motorista, o trigger trg_Motorista_FillNulls_OnChange
// preenche campos nulos automaticamente
var motorista = new Motorista { Nome = "João" };
context.Motorista.Add(motorista);
context.SaveChanges(); // Trigger executa automaticamente
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do FrotiXDbContext

**Arquivos Afetados**:
- `Data/FrotiXDbContext.cs`
- `Data/FrotiXDbContext.OcorrenciaViagem.cs`
- `Data/FrotiXDbContext.RepactuacaoVeiculo.cs`

**Impacto**: Documentação de referência para contexto principal do sistema

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
