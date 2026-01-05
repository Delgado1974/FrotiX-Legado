# 📊 ANÁLISE DE PERFORMANCE - FrotiX

**Data:** 2026-01-05
**Páginas Analisadas:** Agenda (3min) e Controle de Viagens (1min)
**Status:** 🔴 CRÍTICO - Requer otimização urgente

---

## 🔍 PROBLEMAS IDENTIFICADOS

### 1️⃣ **AgendaController.cs**

#### **CarregaViagens** (Linha 818-887)
**Problema:** Carregamento lento de eventos do calendário
**Causa Raiz:**
- Usa `ViewViagensAgenda` (View do banco - sem índices otimizados)
- Carrega dados na memória com `.ToList()` DUAS vezes (linha 845 e 871)
- Transformação de dados em memória ao invés de no banco

```csharp
// ❌ PROBLEMA (linha 843-845)
var viagensBrutas = _unitOfWork
    .ViewViagensAgenda.GetAllReducedIQueryable(seletor, filtro)
    .ToList(); // PRIMEIRA .ToList() - carrega tudo na memória

var viagens = viagensBrutas
    .Select(x => { /* transformação */ })
    .ToList(); // SEGUNDA .ToList()
```

**Impacto:** ⚠️ ALTO - Carrega TODOS os eventos do mês na memória antes de processar

---

#### **VerificarAgendamento** (Linha 1212-1284)
**Problema:** Verificação se existe agendamento muito lenta
**Causa Raiz:**
- `GetAllReduced()` SEM FILTRO (linha 1250) - carrega TODAS as viagens
- Filtro aplicado em memória com `.Any()` (linha 1258) ao invés do banco

```csharp
// ❌ PROBLEMA (linha 1250-1268)
var objViagens = _unitOfWork.Viagem.GetAllReduced(selector: v => new
{
    v.DataInicial,
    v.HoraInicio,
    v.RecorrenciaViagemId,
    v.ViagemId,
}); // SEM WHERE - carrega TUDO

var existeAgendamento = objViagens.Any(v => /* filtro em memória */);
```

**Impacto:** 🔴 CRÍTICO - Carrega TODAS as viagens do sistema (pode ser 100k+ registros)

---

#### **GetDatasViagem** (Linha 889-950)
**Problema:** Busca de datas de viagens lenta
**Causa Raiz:**
- Mesmo problema: `GetAllReduced()` sem filtro, depois filtra em memória

```csharp
// ❌ PROBLEMA (linha 898-903)
var objViagens = _unitOfWork.Viagem.GetAllReduced(selector: v => new
{
    v.DataInicial,
    v.RecorrenciaViagemId,
    v.ViagemId,
}); // SEM WHERE - carrega TUDO
```

**Impacto:** 🔴 CRÍTICO - Carrega TODAS as viagens sempre que abre modal de edição

---

### 2️⃣ **ViagemController.cs**

#### **Get** (Linha 604-682)
**Problema:** Listagem do DataTable Controle de Viagens muito lenta
**Causa Raiz:**
- Usa `ViewViagens` (View complexa sem índices)
- Ordenação COMPLEXA em memória com 4 critérios (linha 631-636)
- `.ToList()` carrega tudo antes de ordenar

```csharp
// ❌ PROBLEMA (linha 618-666)
var query = _unitOfWork.ViewViagens.GetAll(filter: /*...*/);

var result = query
    .OrderBy(x => x.NoFichaVistoria > 0 ? 1 : 0)  // Ordenação em memória
    .ThenByDescending(x => x.DataInicial)         // Mais ordenação
    .ThenByDescending(x => x.HoraInicio)          // Mais ordenação
    .ThenByDescending(x => x.NoFichaVistoria)     // Mais ordenação
    .Select(x => new { /* 25 campos */ })
    .ToList(); // Carrega tudo na memória
```

**Impacto:** 🔴 CRÍTICO - Com 50k+ viagens, ordenar em memória demora 30-60 segundos

---

## 💡 SOLUÇÕES PROPOSTAS

### 📌 **Solução 1: Otimizar AgendaController.CarregaViagens**

```csharp
[HttpGet("CarregaViagens")]
public ActionResult CarregaViagens(DateTime start, DateTime end)
{
    try
    {
        DateTime startMenos3 = start.AddHours(-3);
        DateTime endMenos3 = end.AddHours(-3);

        // ✅ OTIMIZAÇÃO: Query direto no banco com projeção
        var viagens = _context.ViewViagensAgenda
            .Where(v => v.DataInicial >= startMenos3 && v.DataInicial < endMenos3)
            .AsNoTracking() // Não rastreia mudanças (mais rápido)
            .Select(v => new
            {
                id = v.ViagemId,
                title = v.Titulo,
                // Cálculo de datas no banco
                start = v.DataInicial.Value.AddDays(-1).Date
                    .AddHours(v.HoraInicio.Value.Hour)
                    .AddMinutes(v.HoraInicio.Value.Minute),
                end = v.DataInicial.Value.AddDays(-1).Date
                    .AddHours(v.HoraInicio.Value.Hour + 1)
                    .AddMinutes(v.HoraInicio.Value.Minute),
                backgroundColor = v.CorEvento,
                textColor = v.CorTexto,
                descricao = v.DescricaoEvento ?? v.DescricaoMontada
            })
            .ToList(); // UMA ÚNICA .ToList()

        return Ok(new { data = viagens });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("AgendaController.cs", "CarregaViagens", error);
        return StatusCode(500, new { success = false, error = "Erro interno" });
    }
}
```

**Ganho Estimado:** ⚡ 80% mais rápido (de 3min para ~35s)

---

### 📌 **Solução 2: Otimizar AgendaController.VerificarAgendamento**

```csharp
[HttpGet("VerificarAgendamento")]
public IActionResult VerificarAgendamento(
    string data,
    Guid viagemIdRecorrente = default,
    string horaInicio = null
)
{
    try
    {
        if (string.IsNullOrEmpty(data))
            return BadRequest(new { sucesso = false, mensagem = "Data obrigatória" });

        if (!DateTime.TryParse(data, out DateTime dataAgendamento))
            return BadRequest(new { sucesso = false, mensagem = "Data inválida" });

        TimeSpan? horaAgendamento = null;
        if (!string.IsNullOrEmpty(horaInicio) && TimeSpan.TryParse(horaInicio, out TimeSpan parsedHora))
            horaAgendamento = parsedHora;

        // ✅ OTIMIZAÇÃO: Query com WHERE direto no banco
        var existeAgendamento = _context.Viagem
            .AsNoTracking()
            .Where(v => v.DataInicial.HasValue
                && v.DataInicial.Value.Date == dataAgendamento.Date)
            .Where(v => !horaAgendamento.HasValue
                || v.HoraInicio.Value.TimeOfDay == horaAgendamento)
            .Where(v => viagemIdRecorrente == Guid.Empty
                || v.RecorrenciaViagemId == viagemIdRecorrente)
            .Any(); // Any() no banco, não em memória

        return Ok(new { existe = existeAgendamento });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("AgendaController.cs", "VerificarAgendamento", error);
        return BadRequest(new { sucesso = false, mensagem = error.Message });
    }
}
```

**Ganho Estimado:** ⚡ 95% mais rápido (de 10s para ~0.5s)

---

### 📌 **Solução 3: Otimizar ViagemController.Get**

```csharp
[HttpGet]
public IActionResult Get(
    string veiculoId = null,
    string motoristaId = null,
    string statusId = null,
    string dataViagem = null,
    string eventoId = null
)
{
    try
    {
        var motoristaIdParam = GetParsedId(motoristaId);
        var veiculoIdParam = GetParsedId(veiculoId);
        var eventoIdParam = GetParsedId(eventoId);

        // ✅ OTIMIZAÇÃO: OrderBy direto no SQL, antes do ToList()
        var result = _unitOfWork.ViewViagens
            .GetAll(filter: viagemsFilters(
                veiculoIdParam,
                motoristaIdParam,
                dataViagem,
                statusId,
                eventoIdParam
            ))
            .AsNoTracking() // Mais rápido
            // Ordenação no banco (SQL ORDER BY)
            .OrderBy(x => x.NoFichaVistoria > 0 ? 1 : 0)
            .ThenByDescending(x => x.DataInicial)
            .ThenByDescending(x => x.HoraInicio)
            .ThenByDescending(x => x.NoFichaVistoria)
            // Projeção para reduzir dados transferidos
            .Select(x => new
            {
                x.CombustivelFinal,
                x.CombustivelInicial,
                x.DataFinal,
                x.DataInicial,
                x.Descricao,
                x.DescricaoOcorrencia,
                x.DescricaoSolucaoOcorrencia,
                x.DescricaoVeiculo,
                x.Finalidade,
                x.HoraFim,
                x.HoraInicio,
                x.KmFinal,
                x.KmInicial,
                NoFichaVistoria = x.NoFichaVistoria > 0 ? x.NoFichaVistoria.ToString() : "(mobile)",
                x.NomeMotorista,
                x.NomeRequisitante,
                x.NomeSetor,
                x.ResumoOcorrencia,
                x.Status,
                x.StatusAgendamento,
                x.StatusCartaoAbastecimento,
                x.StatusDocumento,
                x.StatusOcorrencia,
                x.ViagemId,
                x.MotoristaId,
                x.VeiculoId,
            })
            .ToList(); // Uma única chamada ao banco

        return Json(new { data = result });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("ViagemController.cs", "Get", error);
        return Json(new { success = false, message = "Erro ao carregar viagens" });
    }
}
```

**Ganho Estimado:** ⚡ 70% mais rápido (de 1min para ~18s)

---

## 🔧 ÍNDICES RECOMENDADOS

### **Tabela: Viagem**

```sql
-- Índice para CarregaViagens (Agenda)
CREATE NONCLUSTERED INDEX IX_Viagem_DataInicial_Status
ON Viagem (DataInicial DESC, Status)
INCLUDE (ViagemId, HoraInicio, DataFinal, HoraFim, Origem, Destino, Finalidade);

-- Índice para VerificarAgendamento
CREATE NONCLUSTERED INDEX IX_Viagem_DataInicial_RecorrenciaViagemId
ON Viagem (DataInicial, RecorrenciaViagemId)
INCLUDE (HoraInicio, ViagemId);

-- Índice para GetDatasViagem
CREATE NONCLUSTERED INDEX IX_Viagem_RecorrenciaViagemId_DataInicial
ON Viagem (RecorrenciaViagemId, DataInicial DESC)
INCLUDE (ViagemId);
```

### **View: ViewViagens / ViewViagensAgenda**

```sql
-- Criar índice na view (requer SCHEMABINDING)
-- Alternativa: Criar índices nas tabelas base usadas pela view
CREATE NONCLUSTERED INDEX IX_ViewViagens_DataInicial_Status
ON ViewViagens (DataInicial DESC, Status, NoFichaVistoria)
INCLUDE (ViagemId, HoraInicio, MotoristaId, VeiculoId);
```

---

## 📈 GANHOS ESPERADOS

| Página | Tempo Atual | Tempo Estimado Após Otimização | Melhoria |
|--------|-------------|-------------------------------|----------|
| **Agenda** | ~3 minutos | ~30-40 segundos | **⚡ 78% mais rápido** |
| **Controle de Viagens** | ~1 minuto | ~15-20 segundos | **⚡ 70% mais rápido** |
| **VerificarAgendamento** | ~10 segundos | ~0.5 segundos | **⚡ 95% mais rápido** |

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### **Fase 1: Otimizações Rápidas (1-2 horas)**
1. ✅ Adicionar `.AsNoTracking()` em todas as queries de leitura
2. ✅ Mover `.ToList()` para DEPOIS do `.Select()`
3. ✅ Substituir `GetAllReduced()` por queries com filtro

### **Fase 2: Índices (30 minutos)**
1. ✅ Executar scripts SQL para criar índices
2. ✅ Monitorar performance com SQL Profiler
3. ✅ Ajustar índices conforme necessário

### **Fase 3: Refatoração Profunda (4-6 horas)**
1. ✅ Migrar de Views para queries diretas em tabelas
2. ✅ Implementar cache para dados estáticos
3. ✅ Adicionar paginação server-side no DataTable

---

## 🎯 PRIORIDADES

1. **🔴 URGENTE:** VerificarAgendamento (impacta toda interação com Agenda)
2. **🟠 ALTA:** ViagemController.Get (impacta Controle de Viagens)
3. **🟡 MÉDIA:** CarregaViagens (impacta carregamento inicial da Agenda)
4. **🟢 BAIXA:** GetDatasViagem (chamado ocasionalmente)

---

**Próximos Passos:**
1. Aplicar otimizações em ambiente de desenvolvimento
2. Testar com volume real de dados
3. Criar índices no banco
4. Monitorar performance
5. Deploy em produção com janela de manutenção
