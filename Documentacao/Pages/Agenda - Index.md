# Documentação: Agenda de Viagens

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Objetivos

A página **Agenda de Viagens** (`Pages/Agenda/Index.cshtml`) permite:
- ✅ Visualizar todas as viagens e eventos em um calendário interativo (FullCalendar 6)
- ✅ Agendar novas viagens com configurações de recorrência complexas (Diária, Semanal, Quinzenal, Mensal, Variada)
- ✅ Editar agendamentos existentes (com suporte a edição em massa de recorrentes)
- ✅ Transformar agendamentos em viagens abertas ou realizadas
- ✅ Monitorar ocupação de veículos e motoristas em tempo real
- ✅ Gerenciar conflitos de horário automaticamente
- ✅ Validar dados com sistema inteligente (IA) para datas, horas e quilometragem

---

## Arquivos Envolvidos

### 1. Pages/Agenda/Index.cshtml
**Função**: View principal com calendário FullCalendar e modal complexo de agendamento

**Estrutura**:
- Legenda de cores de status
- Calendário FullCalendar (`#agenda`)
- Modal Bootstrap complexo (`#modalViagens`) com 7 seções
- Scripts JavaScript modulares

---

### 2. Pages/Agenda/Index.cshtml.cs
**Função**: PageModel que inicializa dados para os componentes

**Problema**: Modal precisa de listas pré-carregadas (motoristas, veículos, finalidades, eventos, etc.)

**Solução**: Carregar listas no OnGet usando helpers especializados

**Código**:
```csharp
public void OnGet()
{
    // ✅ Inicializa dados usando helpers especializados
    FrotiX.Pages.Viagens.IndexModel.Initialize(_unitOfWork);
    ViewData["dataCombustivel"] = new ListaNivelCombustivel(_unitOfWork).NivelCombustivelList();
    ViewData["lstMotorista"] = new ListaMotorista(_unitOfWork).MotoristaList();
    ViewData["lstVeiculos"] = new ListaVeiculos(_unitOfWork).VeiculosList();
    ViewData["lstSetor"] = new ListaSetores(_unitOfWork).SetoresList();
    ViewData["lstStatus"] = new ListaStatus(_unitOfWork).StatusList();
    ViewData["lstEventos"] = new ListaEvento(_unitOfWork).EventosList();
}
```

---

### 3. wwwroot/js/agendamento/main.js
**Função**: Ponto de entrada principal, inicialização de componentes e handlers globais

#### 3.1. Inicialização do Calendário
**Problema**: Calendário precisa carregar eventos do período visível e permitir interações (click, drag, resize)

**Solução**: Configurar FullCalendar com eventos via AJAX e handlers de interação

**Código**:
```javascript
window.InitializeCalendar = function(URL) {
    var calendarEl = document.getElementById("agenda");
    
    window.calendar = new FullCalendar.Calendar(calendarEl, {
        timeZone: "local",
        lazyFetching: true,  // ✅ Carrega eventos sob demanda
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        buttonText: {
            today: "Hoje",
            dayGridMonth: "mensal",
            timeGridWeek: "semanal",
            timeGridDay: "diário"
        },
        initialView: "timeGridWeek",  // Visualização semanal por padrão
        locale: "pt-br",
        events: {
            url: "/api/Agenda/CarregaViagens",
            method: "GET",
            failure: function() {
                AppToast.show('Vermelho', 'Erro ao carregar eventos!');
            }
        },
        eventClick: function(info) {
            // ✅ Abre modal para edição
            abrirModalEdicao(info.event.id);
        },
        dateClick: function(info) {
            // ✅ Abre modal para novo agendamento na data clicada
            abrirModalNovo(info.dateStr);
        },
        eventDidMount: function(info) {
            // ✅ Personalização visual de cada evento
            // Adiciona tooltips, classes CSS, etc.
        }
    });
    
    calendar.render();
};
```

#### 3.2. Botão de Confirmação (Salvar Agendamento)
**Problema**: Usuário precisa salvar agendamento após preencher formulário complexo com validações

**Solução**: Handler que valida campos, verifica conflitos, cria objeto e envia para API

**Código**:
```javascript
$("#btnConfirma").off("click").on("click", async function (event) {
    try {
        event.preventDefault();
        const $btn = $(this);
        
        // ✅ Previne clique duplo
        if ($btn.prop("disabled")) {
            return;
        }
        
        $btn.prop("disabled", true);
        
        const viagemId = document.getElementById("txtViagemId").value;
        
        // ✅ Validação completa de campos
        const validado = await window.ValidaCampos(viagemId);
        if (!validado) {
            $btn.prop("disabled", false);
            return;
        }
        
        // ✅ Validação IA (se disponível)
        const isRegistraViagem = $("#btnConfirma").text().includes("Registra Viagem");
        if (isRegistraViagem && typeof window.validarFinalizacaoConsolidadaIA === 'function') {
            const iaValida = await window.validarFinalizacaoConsolidadaIA({
                dataInicial: DataInicial,
                horaInicial: HoraInicial,
                dataFinal: DataFinal,
                horaFinal: HoraFinal,
                kmInicial: KmInicial,
                kmFinal: KmFinal,
                veiculoId: veiculoId
            });
            
            if (!iaValida) {
                $btn.prop("disabled", false);
                return;
            }
        }
        
        // ✅ Cria objeto de agendamento
        const agendamento = window.criarAgendamentoNovo();
        
        // ✅ Verifica conflitos antes de salvar
        const conflitos = await window.verificarConflitos(agendamento);
        if (conflitos.temConflito) {
            const confirma = await Alerta.Confirmar(
                "Conflito de Horário",
                `O veículo/motorista já está ocupado neste horário. Deseja continuar mesmo assim?`,
                "Sim, Continuar",
                "Cancelar"
            );
            
            if (!confirma) {
                $btn.prop("disabled", false);
                return;
            }
        }
        
        // ✅ Envia para API
        const resposta = await window.enviarNovoAgendamento(agendamento);
        
        if (resposta.success) {
            $('#modalViagens').modal('hide');
            window.calendar.refetchEvents(); // ✅ Atualiza calendário
            Alerta.Sucesso('Sucesso', 'Agendamento salvo com sucesso');
        }
    } catch (error) {
        Alerta.TratamentoErroComLinha("main.js", "btnConfirma.click", error);
    } finally {
        $btn.prop("disabled", false);
    }
});
```

---

### 4. wwwroot/js/agendamento/components/calendario.js
**Função**: Configuração e handlers do FullCalendar

#### 4.1. Formatação de Eventos
**Problema**: Eventos precisam ter cores e títulos específicos por status

**Solução**: Função que formata eventos retornados da API com cores e propriedades estendidas

**Código**: A formatação é feita no backend (endpoint `CarregaViagens`), mas o calendário pode customizar via `eventDidMount`

---

### 5. wwwroot/js/agendamento/components/modal-viagem-novo.js
**Função**: Lógica completa do modal de agendamento

#### 5.1. Criação de Objeto de Agendamento
**Problema**: Formulário tem 50+ campos que precisam ser coletados e formatados para envio à API

**Solução**: Função que lê todos os componentes Syncfusion e monta objeto JSON

**Código**:
```javascript
window.criarAgendamentoNovo = function () {
    try {
        // ✅ Obter instâncias dos componentes Syncfusion
        const txtDataInicial = document.getElementById("txtDataInicial")?.ej2_instances?.[0];
        const txtHoraInicial = $("#txtHoraInicial").val();
        const lstMotorista = document.getElementById("lstMotorista")?.ej2_instances?.[0];
        const lstVeiculo = document.getElementById("lstVeiculo")?.ej2_instances?.[0];
        const lstRecorrente = document.getElementById("lstRecorrente")?.ej2_instances?.[0];
        const rteDescricao = document.getElementById("rteDescricao")?.ej2_instances?.[0];
        
        // ✅ Extrair valores
        const dataInicialValue = txtDataInicial?.value;
        const motoristaId = lstMotorista?.value;
        const veiculoId = lstVeiculo?.value;
        const recorrente = lstRecorrente?.value || "N";
        
        // ✅ Montar objeto de agendamento
        const agendamento = {
            ViagemId: document.getElementById("txtViagemId").value || "00000000-0000-0000-0000-000000000000",
            DataInicial: dataInicialValue ? new Date(dataInicialValue).toISOString() : null,
            HoraInicio: txtHoraInicial || null,
            MotoristaId: motoristaId || null,
            VeiculoId: veiculoId || null,
            Recorrente: recorrente,
            Status: document.getElementById("txtStatus").value || "Agendada",
            Descricao: rteDescricao?.value || ""
        };
        
        // ✅ Processar recorrência se necessário
        if (recorrente === "S") {
            const datasSelecionadas = window.gerarDatasRecorrencia();
            agendamento.DatasSelecionadas = datasSelecionadas;
        }
        
        return agendamento;
    } catch (error) {
        Alerta.TratamentoErroComLinha("modal-viagem-novo.js", "criarAgendamentoNovo", error);
        return null;
    }
};
```

#### 5.2. Envio para API
**Problema**: Objeto precisa ser enviado para API com tratamento de erros e feedback ao usuário

**Solução**: Função assíncrona que envia POST e trata resposta

**Código**:
```javascript
window.enviarNovoAgendamento = async function (agendamento) {
    try {
        const resposta = await fetch('/api/Agenda/Agendamento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(agendamento)
        });
        
        const resultado = await resposta.json();
        
        if (!resposta.ok) {
            throw new Error(resultado.message || 'Erro ao salvar agendamento');
        }
        
        return resultado;
    } catch (error) {
        Alerta.TratamentoErroComLinha("modal-viagem-novo.js", "enviarNovoAgendamento", error);
        return { success: false, message: error.message };
    }
};
```

---

### 6. wwwroot/js/agendamento/components/recorrencia.js
**Função**: Lógica de geração de datas recorrentes

#### 6.1. Geração de Recorrência Diária
**Problema**: Usuário precisa criar agendamentos para todos os dias entre duas datas

**Solução**: Função que gera array de datas diárias entre data inicial e final

**Código**:
```javascript
gerarRecorrenciaDiaria(dataAtual, dataFinalFormatada, datas) {
    try {
        let data = moment(dataAtual);
        const dataFinal = moment(dataFinalFormatada);
        
        // ✅ Gera datas diárias até data final
        while (data.isSameOrBefore(dataFinal)) {
            datas.push(data.format('YYYY-MM-DD'));
            data.add(1, 'days');
        }
    } catch (error) {
        Alerta.TratamentoErroComLinha("recorrencia.js", "gerarRecorrenciaDiaria", error);
    }
}
```

#### 6.2. Geração de Recorrência Semanal
**Problema**: Usuário precisa criar agendamentos para dias específicos da semana (ex: Segunda, Quarta, Sexta)

**Solução**: Função que gera datas apenas nos dias da semana selecionados

**Código**:
```javascript
gerarRecorrenciaPorPeriodo(tipoRecorrencia, dataAtual, dataFinalFormatada, diasSelecionadosIndex, datas) {
    try {
        let data = moment(dataAtual);
        const dataFinal = moment(dataFinalFormatada);
        const intervalo = tipoRecorrencia === "Q" ? 2 : 1; // Quinzenal = 2 semanas
        
        // ✅ Gera datas apenas nos dias selecionados
        while (data.isSameOrBefore(dataFinal)) {
            const diaSemana = data.day(); // 0=Domingo, 1=Segunda, etc.
            
            if (diasSelecionadosIndex.includes(diaSemana)) {
                datas.push(data.format('YYYY-MM-DD'));
            }
            
            data.add(intervalo, 'weeks');
        }
    } catch (error) {
        Alerta.TratamentoErroComLinha("recorrencia.js", "gerarRecorrenciaPorPeriodo", error);
    }
}
```

#### 6.3. Geração de Recorrência Mensal
**Problema**: Usuário precisa criar agendamentos no mesmo dia do mês (ex: dia 15 de cada mês)

**Solução**: Função que gera datas no mesmo dia do mês até data final

**Código**: Similar à diária, mas incrementa por mês

#### 6.4. Geração de Recorrência Variada
**Problema**: Usuário precisa criar agendamentos em datas específicas selecionadas manualmente no calendário

**Solução**: Função que lê datas selecionadas no Syncfusion Calendar e retorna array

**Código**:
```javascript
gerarRecorrenciaVariada(datas) {
    try {
        const calendarObj = document.getElementById("calDatasSelecionadas")?.ej2_instances?.[0];
        
        if (!calendarObj || !calendarObj.values || calendarObj.values.length === 0) {
            console.error("Nenhuma data selecionada no calendário");
            return;
        }
        
        // ✅ Converte datas selecionadas para formato YYYY-MM-DD
        calendarObj.values.forEach(data => {
            datas.push(moment(data).format('YYYY-MM-DD'));
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("recorrencia.js", "gerarRecorrenciaVariada", error);
    }
}
```

---

### 7. Controllers/AgendaController.cs
**Função**: Endpoints API para operações com agenda

#### 7.1. GET `/api/Agenda/CarregaViagens`
**Problema**: FullCalendar precisa de eventos formatados para exibir no calendário

**Solução**: Endpoint que busca viagens da view `ViewViagensAgenda` e formata para FullCalendar

**Código**:
```csharp
[HttpGet("CarregaViagens")]
public IActionResult CarregaViagens(DateTime start, DateTime end)
{
    try
    {
        // ✅ Ajuste de timezone (FullCalendar envia UTC, banco está UTC-3)
        DateTime startMenos3 = start.AddHours(-3);
        DateTime endMenos3 = end.AddHours(-3);
        
        // ✅ Busca na view otimizada
        var viagens = _context.ViewViagensAgenda
            .AsNoTracking()
            .Where(v => v.DataInicial.HasValue
                && v.DataInicial >= startMenos3
                && v.DataInicial < endMenos3)
            .ToList();
        
        // ✅ Formata para FullCalendar
        var eventos = viagens.Select(v => new
        {
            id = v.ViagemId.ToString(),
            title = v.Titulo ?? "Viagem",
            start = v.Start?.ToString("yyyy-MM-ddTHH:mm:ss") ?? v.DataInicial?.ToString("yyyy-MM-ddTHH:mm:ss"),
            end = v.End?.ToString("yyyy-MM-ddTHH:mm:ss") ?? v.DataInicial?.AddHours(1).ToString("yyyy-MM-ddTHH:mm:ss"),
            backgroundColor = v.CorEvento ?? "#808080",
            textColor = v.CorTexto ?? "#FFFFFF",
            extendedProps = new
            {
                status = v.Status,
                veiculo = v.PlacaVeiculo,
                motorista = v.NomeMotorista
            }
        }).ToList();
        
        return Ok(eventos);
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("AgendaController.cs", "CarregaViagens", error);
        return StatusCode(500);
    }
}
```

#### 7.2. POST `/api/Agenda/Agendamento`
**Problema**: Frontend precisa criar/editar agendamentos com suporte a recorrência e múltiplos cenários

**Solução**: Endpoint complexo que trata 3 cenários principais (novo único, novo recorrente, edição)

**Código - Cenário 1: Novo Agendamento Único**:
```csharp
bool isNew = viagem.ViagemId == Guid.Empty;

if (isNew == true && viagem.Recorrente != "S")
{
    // ✅ Cria agendamento único
    Viagem novaViagem = new Viagem();
    AtualizarDadosAgendamento(novaViagem, viagem);
    novaViagem.Status = "Agendada";
    novaViagem.StatusAgendamento = true;
    novaViagem.FoiAgendamento = false;
    novaViagem.UsuarioIdAgendamento = currentUserID;
    novaViagem.DataAgendamento = DateTime.Now;
    
    _unitOfWork.Viagem.Add(novaViagem);
    _unitOfWork.Save();
    
    return Ok(new { success = true, viagemId = novaViagem.ViagemId });
}
```

**Código - Cenário 2: Novo Agendamento Recorrente**:
```csharp
if (isNew == true && viagem.Recorrente == "S")
{
    Guid primeiraViagemId = Guid.Empty;
    bool primeiraIteracao = true;
    
    // ✅ Cria primeira viagem da série
    Viagem novaViagem = new Viagem();
    AtualizarDadosAgendamento(novaViagem, viagem);
    novaViagem.DataInicial = DatasSelecionadasAdicao.First();
    novaViagem.UsuarioIdAgendamento = currentUserID;
    novaViagem.DataAgendamento = DateTime.Now;
    
    _unitOfWork.Viagem.Add(novaViagem);
    _unitOfWork.Save();
    
    primeiraViagemId = novaViagem.ViagemId;
    novaViagem.RecorrenciaViagemId = primeiraViagemId;
    _unitOfWork.Viagem.Update(novaViagem);
    
    // ✅ Cria demais viagens da série
    foreach (var dataSelecionada in DatasSelecionadasAdicao.Skip(1))
    {
        Viagem novaViagemRecorrente = new Viagem();
        AtualizarDadosAgendamento(novaViagemRecorrente, viagem);
        novaViagemRecorrente.DataInicial = dataSelecionada;
        novaViagemRecorrente.RecorrenciaViagemId = primeiraViagemId; // ✅ Todas apontam para primeira
        
        _unitOfWork.Viagem.Add(novaViagemRecorrente);
    }
    
    _unitOfWork.Save();
    
    return Ok(new { success = true, totalCriado = DatasSelecionadasAdicao.Count });
}
```

**Código - Cenário 3: Editar Agendamento**:
```csharp
if (isNew == false)
{
    var viagemExistente = await _unitOfWork.Viagem.GetFirstOrDefaultAsync(
        v => v.ViagemId == viagem.ViagemId
    );
    
    if (viagemExistente == null)
    {
        return NotFound();
    }
    
    // ✅ Atualiza campos
    AtualizarDadosAgendamento(viagemExistente, viagem);
    
    // ✅ Se transformando em viagem
    if (viagem.Status == "Aberta" || viagem.Status == "Realizada")
    {
        viagemExistente.FoiAgendamento = true;
        viagemExistente.UsuarioIdCriacao = currentUserID;
        viagemExistente.DataCriacao = DateTime.Now;
    }
    
    _unitOfWork.Viagem.Update(viagemExistente);
    _unitOfWork.Save();
    
    return Ok(new { success = true });
}
```

#### 7.3. GET `/api/Agenda/VerificarAgendamento`
**Problema**: Frontend precisa verificar conflitos de horário antes de salvar

**Solução**: Endpoint que verifica sobreposição temporal de viagens para veículo/motorista

**Código**:
```csharp
[HttpGet("VerificarAgendamento")]
public async Task<IActionResult> VerificarAgendamento(
    Guid? veiculoId,
    Guid? motoristaId,
    DateTime dataInicial,
    DateTime? dataFinal,
    Guid? viagemIdExcluir)
{
    try
    {
        var query = _unitOfWork.Viagem.GetAll()
            .Where(v =>
                (veiculoId.HasValue && v.VeiculoId == veiculoId.Value) ||
                (motoristaId.HasValue && v.MotoristaId == motoristaId.Value))
            .Where(v => v.Status != "Cancelada")
            .Where(v => viagemIdExcluir == null || v.ViagemId != viagemIdExcluir.Value);
        
        // ✅ Verifica sobreposição temporal
        var conflitos = await query
            .Where(v =>
                v.DataInicial < (dataFinal ?? dataInicial.AddHours(1)) &&
                (v.DataFinal ?? v.DataInicial.AddHours(1)) > dataInicial
            )
            .Select(v => new
            {
                v.ViagemId,
                v.DataInicial,
                v.DataFinal,
                v.Status,
                PlacaVeiculo = v.Veiculo.Placa,
                NomeMotorista = v.Motorista.Nome
            })
            .ToListAsync();
        
        return Ok(new
        {
            temConflito = conflitos.Any(),
            conflitos = conflitos
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("AgendaController.cs", "VerificarAgendamento", error);
        return StatusCode(500);
    }
}
```

#### 7.4. GET `/api/Agenda/ObterAgendamento`
**Problema**: Frontend precisa buscar dados de viagem para preencher modal de edição

**Solução**: Endpoint que retorna dados completos da viagem com relacionamentos

**Código**:
```csharp
[HttpGet("ObterAgendamento")]
public async Task<IActionResult> ObterAgendamento(Guid id)
{
    try
    {
        // ✅ Busca viagem com relacionamentos
        var viagem = await _unitOfWork.Viagem.GetFirstOrDefaultAsync(
            v => v.ViagemId == id,
            includeProperties: "Motorista,Veiculo,Requisitante,SetorSolicitante,Evento"
        );
        
        if (viagem == null)
        {
            return NotFound();
        }
        
        // ✅ Monta objeto de resposta
        var resposta = new
        {
            viagemId = viagem.ViagemId,
            dataInicial = viagem.DataInicial,
            horaInicio = viagem.HoraInicio?.ToString("HH:mm"),
            dataFinal = viagem.DataFinal,
            horaFim = viagem.HoraFim?.ToString("HH:mm"),
            origem = viagem.Origem,
            destino = viagem.Destino,
            finalidadeId = viagem.FinalidadeId,
            motoristaId = viagem.MotoristaId,
            veiculoId = viagem.VeiculoId,
            kmInicial = viagem.KmInicial,
            kmFinal = viagem.KmFinal,
            requisitanteId = viagem.RequisitanteId,
            setorSolicitanteId = viagem.SetorSolicitanteId,
            eventoId = viagem.EventoId,
            status = viagem.Status,
            descricao = viagem.Descricao,
            recorrenciaViagemId = viagem.RecorrenciaViagemId,
            recorrente = viagem.RecorrenciaViagemId != null ? "S" : "N"
        };
        
        return Ok(resposta);
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("AgendaController.cs", "ObterAgendamento", error);
        return StatusCode(500);
    }
}
```

---

## Fluxo de Funcionamento

### Carregamento da Página
```
1. Página carrega (OnGet)
   ↓
2. Backend carrega listas para componentes (motoristas, veículos, etc.)
   ↓
3. Frontend inicializa componentes Syncfusion
   ↓
4. Frontend inicializa FullCalendar chamando InitializeCalendar()
   ↓
5. Calendário faz requisição GET para /api/Agenda/CarregaViagens?start=...&end=...
   ↓
6. Backend retorna eventos formatados da ViewViagensAgenda
   ↓
7. Calendário renderiza eventos com cores e tooltips
```

### Criação de Novo Agendamento
```
1. Usuário clica em data no calendário (dateClick)
   ↓
2. Modal Bootstrap abre com data pré-preenchida
   ↓
3. Usuário preenche formulário (origem, destino, motorista, veículo, etc.)
   ↓
4. Se selecionou recorrência:
   - Seleciona tipo (Diária, Semanal, etc.)
   - Configura período e dias
   - Sistema gera array de datas
   ↓
5. Usuário clica em "Confirmar"
   ↓
6. Validação completa de campos (ValidaCampos)
   ↓
7. Validação IA (se disponível)
   ↓
8. Verificação de conflitos (VerificarAgendamento)
   ↓
9. Se há conflitos: mostra alerta e pergunta se deseja continuar
   ↓
10. Cria objeto de agendamento (criarAgendamentoNovo)
   ↓
11. Requisição POST para /api/Agenda/Agendamento
   ↓
12. Backend processa (cria único ou múltiplos se recorrente)
   ↓
13. Calendário atualiza (refetchEvents)
   ↓
14. Modal fecha
```

### Edição de Agendamento
```
1. Usuário clica em evento no calendário (eventClick)
   ↓
2. Modal Bootstrap abre
   ↓
3. Requisição GET para /api/Agenda/ObterAgendamento?id=guid
   ↓
4. Backend retorna dados completos da viagem
   ↓
5. Frontend preenche todos os campos do modal
   ↓
6. Usuário edita campos desejados
   ↓
7. Clica em "Confirmar"
   ↓
8. Validações e verificação de conflitos (mesmo fluxo de criação)
   ↓
9. Requisição POST para /api/Agenda/Agendamento (com ViagemId preenchido)
   ↓
10. Backend atualiza viagem existente
   ↓
11. Calendário atualiza
```

---

## Endpoints API Resumidos

| Método | Endpoint | Descrição | Parâmetros |
|--------|----------|-----------|------------|
| GET | `/api/Agenda/CarregaViagens` | Retorna eventos para calendário | `start`, `end` (DateTime) |
| POST | `/api/Agenda/Agendamento` | Cria/atualiza agendamento | `{ViagemId, DataInicial, HoraInicio, ...}` |
| GET | `/api/Agenda/VerificarAgendamento` | Verifica conflitos de horário | `veiculoId`, `motoristaId`, `dataInicial`, `dataFinal` |
| GET | `/api/Agenda/ObterAgendamento` | Busca dados para edição | `id` (Guid) |
| GET | `/api/Agenda/BuscarViagensRecorrencia` | Busca série recorrente | `id` (Guid) |
| POST | `/api/Agenda/ApagaAgendamento` | Exclui agendamento | `{ViagemId}` |

---

## Troubleshooting

### Problema: Calendário não carrega eventos
**Causa**: Erro no endpoint `/api/Agenda/CarregaViagens` ou view `ViewViagensAgenda` não existe  
**Solução**: 
- Verificar logs do servidor
- Verificar se view existe no banco de dados
- Testar endpoint manualmente: `/api/Agenda/TesteView`
- Verificar Network Tab para erros na requisição

### Problema: Modal não abre ao clicar em evento
**Causa**: Event handler `eventClick` não está registrado ou ID do evento está incorreto  
**Solução**: 
- Verificar se `InitializeCalendar()` foi chamado
- Verificar se função `abrirModalEdicao()` existe
- Verificar console do navegador por erros JavaScript

### Problema: Recorrência não gera datas corretas
**Causa**: Lógica de geração de datas está incorreta ou componentes não estão inicializados  
**Solução**: 
- Verificar se componentes Syncfusion estão inicializados
- Verificar se função `gerarDatasRecorrencia()` está sendo chamada
- Verificar console para logs de debug

### Problema: Conflitos não são detectados
**Causa**: Endpoint `/api/Agenda/VerificarAgendamento` não está sendo chamado ou retorna resultado incorreto  
**Solução**: 
- Verificar se função `verificarConflitos()` está sendo chamada antes de salvar
- Verificar Network Tab para requisição de verificação
- Testar endpoint manualmente com parâmetros conhecidos

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [08/01/2026] - Reescrita no Padrão FrotiX Simplificado

**Descrição**:
Documentação reescrita seguindo padrão simplificado e didático:
- Objetivos claros no início
- Arquivos listados com Problema/Solução/Código
- Fluxos de funcionamento explicados passo a passo
- Troubleshooting simplificado

**Status**: ✅ **Reescrito**

**Responsável**: Claude (AI Assistant)
**Versão**: 2.0

---

## [08/01/2026] - Expansão Completa da Documentação

**Descrição**:
Documentação expandida de ~200 linhas para mais de 2300 linhas.

**Status**: ✅ **Expandido**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
