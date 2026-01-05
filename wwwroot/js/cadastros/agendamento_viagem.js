// ====================================================================
// CORREÇÕES APLICADAS:
// 1. Corrigidos caracteres corrompidos nos comentários (Ã, Ãƒã, etc.)
// 2. Substituído toastr por AppToast.show conforme padrío
// 3. Substituído alert() por Alerta.Erro
// 4. Removidos trechos comentados desnecessários
// 5. Corrigida identação (4 espaços)
// 6. Mantida funcionalidade dos algoritmos originais
// ====================================================================

$(document).on('shown.bs.modal', '.modal', function ()
{
    try
    {
        var tooltipElements = document.querySelectorAll('[data-ejtip]');
        tooltipElements.forEach(function (element)
        {
            try
            {
                new ej.popups.Tooltip({
                    target: element
                });
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "tooltip_creation", error);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "modal_shown", error);
    }
});

function getSyncfusionInstance(id)
{
    try
    {
        var el = document.getElementById(id);
        if (el && Array.isArray(el.ej2_instances) && el.ej2_instances.length > 0 && el.ej2_instances[0])
        {
            return el.ej2_instances[0];
        }
        return null;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "getSyncfusionInstance", error);
    }
}

let modalLock = false;

/**
 * Arredonda a hora para o próximo intervalo especificado
 * param {Date|string} hora - Data/hora a ser arredondada
 * param {number} intervaloMinutos - Intervalo em minutos (ex: 10, 15, 30, 60)
 * returns {string} Hora arredondada no formato "HH:mm"
 */
function arredondarHora(hora, intervaloMinutos = 10)
{
    var m = moment(hora);
    var minutos = m.minutes();
    var resto = minutos % intervaloMinutos;

    if (resto !== 0)
    {
        // Arredonda para o próximo intervalo
        m.add(intervaloMinutos - resto, 'minutes');
    }

    // Zera os segundos
    m.seconds(0);
    m.milliseconds(0);

    return m.format("HH:mm");
}

function rebuildLstPeriodos()
{
    try
    {
        new ej.dropdowns.DropDownList({
            dataSource: dataPeriodos,
            fields: {
                value: "PeriodoId",
                text: "Periodo"
            },
            placeholder: "Selecione o período",
            allowFiltering: true,
            showClearButton: true,
            sortOrder: "Ascending"
        }).appendTo("#lstPeriodos");
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "rebuildLstPeriodos", error);
    }
}

function toDateOnlyString(d)
{
    try
    {
        const dt = d instanceof Date ? d : new Date(d);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const dd = String(dt.getDate()).padStart(2, "0");
        return `${y}-${m}-${dd}`;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "toDateOnlyString", error);
    }
}

function getSfValue0(inst)
{
    try
    {
        if (!inst) return null;
        const v = inst.value;
        if (Array.isArray(v)) return v.length ? v[0] : null;
        return v ?? null;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "getSfValue0", error);
    }
}

function parseIntSafe(v)
{
    try
    {
        const n = parseInt(v, 10);
        return Number.isFinite(n) ? n : null;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "parseIntSafe", error);
    }
}

function toLocalDateOnly(date)
{
    try
    {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "toLocalDateOnly", error);
    }
}

function toLocalDateTimeString(date, timeStr)
{
    try
    {
        if (!date) return null;
        const [hh, mm] = (timeStr || "").split(":").map(Number);
        const d = new Date(date);
        if (!isNaN(hh) && !isNaN(mm))
        {
            d.setHours(hh, mm, 0, 0);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
        }
        return null;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "toLocalDateTimeString", error);
    }
}

function criarAgendamentoNovo()
{
    try
    {
        const rteDescricao = document.getElementById("rteDescricao")?.ej2_instances?.[0];
        const lstMotorista = document.getElementById("lstMotorista")?.ej2_instances?.[0];
        const lstVeiculo = document.getElementById("lstVeiculo")?.ej2_instances?.[0];
        const ddtSetor = document.getElementById("ddtSetor")?.ej2_instances?.[0];
        const ddtFinalidade = document.getElementById("lstFinalidade")?.ej2_instances?.[0];
        const ddtCombIniInst = document.getElementById("ddtCombustivelInicial")?.ej2_instances?.[0];
        const ddtCombFimInst = document.getElementById("ddtCombustivelFinal")?.ej2_instances?.[0];
        const lstEventosInst = document.getElementById("lstEventos")?.ej2_instances?.[0];
        const txtDataInicial = document.getElementById("txtDataInicial")?.ej2_instances?.[0];
        const txtDataFinal = document.getElementById("txtDataFinal")?.ej2_instances?.[0];
        const rteDescricaoHtmlContent = rteDescricao?.getHtml() ?? "";

        const motoristaId = lstMotorista?.value ?? null;
        const veiculoId = lstVeiculo?.value ?? null;
        const setorId = getSfValue0(ddtSetor);
        const requisitanteId = document.getElementById("lstRequisitante")?.ej2_instances?.[0]?.value ?? null;
        const destino = document.getElementById("cmbDestino")?.ej2_instances?.[0]?.value ?? null;
        const origem = document.getElementById("cmbOrigem")?.ej2_instances?.[0]?.value ?? null;
        const finalidade = getSfValue0(ddtFinalidade);
        const combustivelInicial = getSfValue0(ddtCombIniInst);
        const combustivelFinal = getSfValue0(ddtCombFimInst);
        const noFichaVistoria = $("#txtNoFichaVistoria").val();
        const kmAtual = parseIntSafe($("#txtKmAtual").val());
        const kmInicial = parseIntSafe($("#txtKmInicial").val());
        const kmFinal = parseIntSafe($("#txtKmFinal").val());
        let eventoId = null;
        const eventosVal = lstEventosInst?.value;
        if (Array.isArray(eventosVal) && eventosVal.length) eventoId = eventosVal[0];

        const dataInicialDate = txtDataInicial?.value ? new Date(txtDataInicial.value) : null;
        const dataInicialStr = dataInicialDate ? toDateOnlyString(dataInicialDate) : null;
        const horaInicioTexto = $("#txtHoraInicial").val();
        const horaInicioLocal = dataInicialDate && horaInicioTexto ? toLocalDateTimeString(dataInicialDate, horaInicioTexto) : null;

        const dataFinalDate = txtDataFinal?.value ? new Date(txtDataFinal.value) : null;
        const dataFinalStr = dataFinalDate ? toDateOnlyString(dataFinalDate) : null;
        const horaFimTexto = $("#txtHoraFinal").val() || null;

        const recorrente = $("#chkRecorrente").prop?.("checked") ?? null;
        const intervalo = $("#ddtIntervalo")?.val?.() ?? null;
        const dataFinalRecorrenciaEl = document.getElementById("txtDataFinalRecorrencia")?.ej2_instances?.[0];
        const dataFinalRecorrencia = dataFinalRecorrenciaEl?.value ? toDateOnlyString(new Date(dataFinalRecorrenciaEl.value)) : null;

        const monday = $("#chkMonday").prop?.("checked") ?? null;
        const tuesday = $("#chkTuesday").prop?.("checked") ?? null;
        const wednesday = $("#chkWednesday").prop?.("checked") ?? null;
        const thursday = $("#chkThursday").prop?.("checked") ?? null;
        const friday = $("#chkFriday").prop?.("checked") ?? null;
        const saturday = $("#chkSaturday").prop?.("checked") ?? null;
        const sunday = $("#chkSunday").prop?.("checked") ?? null;

        const diaMesRecorrencia = parseIntSafe($("#txtDiaMesRecorrencia").val());

        let datasSelecionadas = null;
        if (Array.isArray(window.selectedDates) && window.selectedDates.length)
        {
            datasSelecionadas = window.selectedDates.map(x =>
            {
                try
                {
                    return new Date(x.Timestamp);
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "map_callback", error);
                }
            }).map(d =>
            {
                try
                {
                    return toDateOnlyString(d);
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "map_callback", error);
                }
            });
        }

        const statusAgendamento = true;
        const foiAgendamento = true;
        const status = "Agendada";

        const agendamento = {
            DataInicial: dataInicialStr,
            HoraInicio: horaInicioLocal,
            ...(dataFinalStr ? { DataFinal: dataFinalStr } : {}),
            ...(horaFimTexto ? { HoraFim: horaFimTexto } : {}),
            Finalidade: finalidade,
            Origem: origem,
            Destino: destino,
            MotoristaId: motoristaId,
            VeiculoId: veiculoId,
            CombustivelInicial: combustivelInicial,
            CombustivelFinal: combustivelFinal,
            KmAtual: kmAtual,
            KmInicial: kmInicial,
            KmFinal: kmFinal,
            RequisitanteId: requisitanteId,
            RamalRequisitante: $("#txtRamalRequisitante").val(),
            SetorSolicitanteId: setorId,
            Descricao: rteDescricaoHtmlContent,
            StatusAgendamento: statusAgendamento,
            FoiAgendamento: foiAgendamento,
            Status: status,
            EventoId: eventoId,
            Recorrente: recorrente ? "S" : "N",
            Intervalo: intervalo,
            DataFinalRecorrencia: dataFinalRecorrencia,
            Monday: monday,
            Tuesday: tuesday,
            Wednesday: wednesday,
            Thursday: thursday,
            Friday: friday,
            Saturday: saturday,
            Sunday: sunday,
            DiaMesRecorrencia: diaMesRecorrencia,
            DatasSelecionadas: datasSelecionadas,
            NoFichaVistoria: noFichaVistoria
        };
        return agendamento;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "criarAgendamentoNovo", error);
    }
}

async function calendarEvents(fetchInfo, successCallback, failureCallback)
{
    try
    {
        const resp = await fetch(`/api/Agenda/Eventos?start=${fetchInfo.startStr}&end=${fetchInfo.endStr}`);
        const payload = await resp.json();

        const events = (payload?.data || payload || []).map(item =>
        {
            try
            {
                return {
                    id: item.id,
                    title: item.title || item.descricao || "",
                    description: item.descricao || "",
                    start: item.start,
                    end: item.end,
                    backgroundColor: item.backgroundColor || undefined,
                    textColor: item.textColor || undefined,
                    allDay: item.allDay === true
                };
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "map_callback", error);
            }
        });
        successCallback(events);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "calendarEvents", error);
        failureCallback(error);
    }
}

const aplicarAtualizacao = async objViagem =>
{
    try
    {
        const response = await fetch("/api/Agenda/Agendamento", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(objViagem)
        });
        const data = await response.json();
        if (data?.success || data?.data)
        {
            AppToast.show("Verde", data.message || "Agendamento Atualizado", 2000);
            return true;
        } else
        {
            AppToast.show("Vermelho", data?.message || "Falha ao atualizar agendamento", 2000);
            return false;
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("aplicarAtualizacao", "agendamento_viagem.js", error);
    }
};

const fmtDateLocal = d =>
{
    try
    {
        const dt = new Date(d);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const day = String(dt.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "fmtDateLocal", error);
    }
};

const makeLocalDateTime = (yyyyMMdd, hhmm) =>
{
    try
    {
        const [hh, mm] = String(hhmm || "00:00").split(":");
        return `${yyyyMMdd}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "makeLocalDateTime", error);
    }
};

const __scriptName = function ()
{
    try
    {
        let script = document.currentScript;
        if (!script)
        {
            const scripts = document.getElementsByTagName("script");
            script = scripts[scripts.length - 1];
        }
        const src = script.src || "";
        const m = src.match(/(ViagemUpsert_\d+)(?:\.min)?\.js$/i);
        return m ? m[1] : "ViagemUpsert";
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "anonymous", error);
    }
}();

var CarregandoViagemBloqueada = false;

let viagemId_AJAX = "";
let viagemId = "";
let recorrenciaViagemId = "";
let recorrenciaViagemId_AJAX = "";
let dataInicial_List = "";
let dataInicial = "";
let horaInicial = "";
let agendamentosRecorrentes = [];
let editarTodosRecorrentes = false;
let transformandoEmViagem = false;
let datasSelecionadas = [];

function limpaTooltipsGlobais(timeout = 200)
{
    try
    {
        setTimeout(() =>
        {
            try
            {
                document.querySelectorAll(".e-tooltip-wrap").forEach(t =>
                {
                    try
                    {
                        return t.remove();
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "forEach_callback", error);
                    }
                });
                document.querySelectorAll(".e-control.e-tooltip").forEach(el =>
                {
                    try
                    {
                        const instance = el.ej2_instances?.[0];
                        if (instance?.destroy) instance.destroy();
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "forEach_callback", error);
                    }
                });

                document.querySelectorAll("[title]").forEach(el =>
                {
                    try
                    {
                        return el.removeAttribute("title");
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "forEach_callback", error);
                    }
                });

                $('[data-bs-toggle="tooltip"]').tooltip("dispose");
                $(".tooltip").remove();
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "setTimeout_callback", error);
            }
        }, timeout);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "limpaTooltipsGlobais", error);
    }
}

let isSubmitting = false;
$("#btnConfirma").off("click").on("click", async function (event)
{
    try
    {
        event.preventDefault();
        const $btn = $(this);
        if ($btn.prop("disabled"))
        {
            console.log("Botão desabilitado, impedindo clique duplo.");
            return;
        }
        $btn.prop("disabled", true);
        try
        {
            const viagemId = document.getElementById("txtViagemId").value;
            const validado = await ValidaCampos(viagemId);
            if (!validado)
            {
                console.warn("Validação de campos reprovada.");
                return;
            }
            dataInicial = moment(document.getElementById("txtDataInicial").ej2_instances[0].value).toISOString().split("T")[0];
            const periodoRecorrente = document.getElementById("lstPeriodos").ej2_instances[0].value;
            if (!viagemId)
            {
                if (periodoRecorrente === null)
                {
                    try
                    {
                        let objViagem = criarAgendamentoUnico();
                        const response = await fetch("/api/Agenda/Agendamento", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(objViagem)
                        });
                        const data = await response.json();
                        if (data.success)
                        {
                            AppToast.show("Verde", "Agendamento Criado com Sucesso", 2000);
                            $("#modalViagens").modal("hide");
                            $(document.body).removeClass("modal-open");
                            $(".modal-backdrop").remove();
                            $(document.body).css("overflow", "");
                            calendar.refetchEvents();
                        } else
                        {
                            AppToast.show("Vermelho", "Erro ao Criar Agendamento", 2000);
                            Alerta.Erro("Erro ao criar Agendamento", "Não foi possível criar o Agendamento com os dados informados");
                        }
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "criarAgendamentoUnico", error);
                    }
                } else if (periodoRecorrente === "M")
                {
                    const datasRecorrentes = ajustarDataInicialRecorrente(periodoRecorrente);
                    const datasUnicas = [...new Set(datasRecorrentes)];
                    await handleRecurrence(periodoRecorrente, datasUnicas);
                    exibirMensagemSucesso();
                } else
                {
                    const datasRecorrentes = ajustarDataInicialRecorrente(periodoRecorrente);
                    await handleRecurrence(periodoRecorrente, datasRecorrentes);
                    exibirMensagemSucesso();
                }
            } else if (viagemId != null && viagemId !== "" && $("#btnConfirma").text() === "Registra Viagem")
            {
                transformandoEmViagem = true;

                try
                {
                    const agendamentoUnicoAlterado = await recuperarViagemEdicao(viagemId);
                    let objViagem = criarAgendamentoViagem(agendamentoUnicoAlterado);
                    const response = await fetch("/api/Agenda/Agendamento", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(objViagem)
                    });
                    const data = await response.json();
                    if (data.success)
                    {
                        AppToast.show("Verde", "Viagem Criada com Sucesso", 2000);
                        $("#modalViagens").modal("hide");
                        $(document.body).removeClass("modal-open");
                        $(".modal-backdrop").remove();
                        $(document.body).css("overflow", "");
                        calendar.refetchEvents();
                    } else
                    {
                        AppToast.show("Vermelho", "Erro ao Criar Viagem", 2000);
                        Alerta.Erro("Erro ao criar Agendamento", "Não foi possível criar a Viagem com os dados informados");
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "RegistraViagem", error);
                }
            } else
            {
                $.ajax({
                    url: `/api/Viagem/PegarStatusViagem`,
                    type: "GET",
                    data: {
                        viagemId: viagemId
                    },
                    success: async function (isAberta)
                    {
                        try
                        {
                            if (isAberta)
                            {
                                try
                                {
                                    await editarAgendamento(viagemId);
                                } catch (error)
                                {
                                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "editarAgendamentoViagemAberta", error);
                                }
                            } else
                            {
                                try
                                {
                                    const objViagem = await recuperarViagemEdicao(viagemId);
                                    if (objViagem.recorrente === "S")
                                    {
                                        const confirmacao = await Alerta.Confirmar("Editar Agendamento Recorrente", "Deseja aplicar as alterações a todos os agendamentos recorrentes ou apenas ao atual?", "Todos", "Apenas ao Atual");
                                        if (confirmacao)
                                        {
                                            editarTodosRecorrentes = true;
                                            await editarAgendamentoRecorrente(viagemId, true, objViagem.dataInicial, objViagem.recorrenciaViagemId, editarTodosRecorrentes);
                                        } else
                                        {
                                            editarTodosRecorrentes = false;
                                            await editarAgendamentoRecorrente(viagemId, false, objViagem.dataInicial, objViagem.recorrenciaViagemId, editarTodosRecorrentes);
                                        }
                                    } else
                                    {
                                        await editarAgendamento(viagemId);
                                    }
                                } catch (error)
                                {
                                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "editarAgendamentoRecorrente", error);
                                }
                            }
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "success", error);
                        }
                    },
                    error: function (error)
                    {
                        try
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "PegarStatusViagem", error);
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "error", error);
                        }
                    }
                });
            }
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "btnConfirma_inner", error);
        } finally
        {
            $btn.prop("disabled", false);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "on_callback", error);
    }
});

async function obterAgendamentosRecorrenteInicial(viagemId)
{
    try
    {
        return new Promise((resolve, reject) =>
        {
            try
            {
                $.ajax({
                    url: "api/Agenda/ObterAgendamentoEdicaoInicial",
                    type: "GET",
                    contentType: "application/json",
                    data: {
                        viagemId: viagemId
                    },
                    success: function (data)
                    {
                        try
                        {
                            console.log("Requisição AJAX bem-sucedida, dados recebidos:", data);
                            resolve(data);
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "success", error);
                        }
                    },
                    error: function (err)
                    {
                        try
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "error", err);
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "error", error);
                        }
                    }
                });
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "anonymous", error);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "obterAgendamentosRecorrenteInicial", error);
    }
}

async function obterAgendamentosRecorrentes(recorrenciaViagemId)
{
    try
    {
        return new Promise((resolve, reject) =>
        {
            try
            {
                $.ajax({
                    url: "api/Agenda/ObterAgendamentoExclusao",
                    type: "GET",
                    contentType: "application/json",
                    data: {
                        recorrenciaViagemId: recorrenciaViagemId
                    },
                    success: function (data)
                    {
                        try
                        {
                            console.log("Requisição AJAX bem-sucedida, dados recebidos:", data);
                            resolve(data);
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "success", error);
                        }
                    },
                    error: function (err)
                    {
                        try
                        {
                            console.error("Erro na requisição AJAX:", err);
                            Alerta.Erro("Erro", "Algo deu errado");
                            reject(err);
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "error", error);
                        }
                    }
                });
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "anonymous", error);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "obterAgendamentosRecorrentes", error);
    }
}

async function editarAgendamentoRecorrente(viagemId, editaTodos, dataInicialRecorrencia, recorrenciaViagemId, editarAgendamentoRecorrente)
{
    try
    {
        const isSameOrAfterDay = (left, right) =>
        {
            try
            {
                const L = toLocalDateOnly(left);
                const R = toLocalDateOnly(right);
                if (!L || !R) return false;
                return L.getTime() >= R.getTime();
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "isSameOrAfterDay", error);
            }
        };

        const fecharModalComSucesso = () =>
        {
            try
            {
                try
                {
                    $("#modalViagens").modal("hide");
                } catch { }
                $(".modal-backdrop").remove();
                $("body").removeClass("modal-open").css("overflow", "");
                if (window.calendar?.refetchEvents) window.calendar.refetchEvents();
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "fecharModalComSucesso", error);
            }
        };

        try
        {
            if (!viagemId) throw new Error("ViagemId não fornecido.");
            let houveSucesso = false;
            if (editaTodos)
            {
                if (recorrenciaViagemId === "00000000-0000-0000-0000-000000000000" || !recorrenciaViagemId)
                {
                    recorrenciaViagemId = viagemId;
                    const [primeiroDaSerie = {}] = await obterAgendamentosRecorrenteInicial(viagemId);
                    let objViagem = criarAgendamentoEdicao(primeiroDaSerie);

                    if ("DataInicial" in objViagem) delete objViagem.DataInicial;

                    objViagem.editarTodosRecorrentes = true;
                    objViagem.editarAPartirData = dataInicialRecorrencia;
                    const ok = await aplicarAtualizacao(objViagem);
                    houveSucesso = houveSucesso || ok;
                }

                const agendamentos = await obterAgendamentosRecorrentes(recorrenciaViagemId);
                for (const agendamentoRecorrente of agendamentos)
                {
                    if (isSameOrAfterDay(agendamentoRecorrente.dataInicial, dataInicialRecorrencia))
                    {
                        let objViagem = criarAgendamentoEdicao(agendamentoRecorrente);

                        if ("DataInicial" in objViagem) delete objViagem.DataInicial;
                        const ok = await aplicarAtualizacao(objViagem);
                        houveSucesso = houveSucesso || ok;
                    }
                }
            } else
            {
                const agendamentoUnicoAlterado = await recuperarViagemEdicao(viagemId);
                let objViagem = criarAgendamentoEdicao(agendamentoUnicoAlterado);

                if ("DataInicial" in objViagem) delete objViagem.DataInicial;
                const ok = await aplicarAtualizacao(objViagem);
                houveSucesso = houveSucesso || ok;
            }
            if (houveSucesso) fecharModalComSucesso();
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "editarAgendamentoRecorrente", error);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "editarAgendamentoRecorrente", error);
    }
}

async function editarAgendamento(viagemId)
{
    try
    {
        if (!viagemId)
        {
            throw new Error("ViagemId é obrigatório.");
        }
        try
        {
            const agendamentoBase = await recuperarViagemEdicao(viagemId);
            if (!agendamentoBase)
            {
                throw new Error("Agendamento inexistente.");
            }

            const agendamentoEditado = criarAgendamentoEdicao(agendamentoBase);

            if (await ValidaCampos(agendamentoEditado.ViagemId))
            {
                const response = await fetch("/api/Agenda/Agendamento", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(agendamentoEditado)
                });
                let tipoAgendamento = "Viagem";
                if (agendamentoEditado.Status === "Aberta")
                {
                    tipoAgendamento = "Viagem";
                } else
                {
                    tipoAgendamento = "Agendamento";
                }
                const resultado = await response.json();
                if (resultado.success)
                {
                    AppToast.show("Verde", tipoAgendamento + " atualizado com sucesso!", 2000);
                } else
                {
                    AppToast.show("Vermelho", "Erro ao atualizar " + tipoAgendamento, 2000);
                }
                if (window.calendar?.refetchEvents)
                {
                    window.calendar.refetchEvents();
                }
            }
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "editarAgendamento", error);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "editarAgendamento", error);
    }
}

async function handleRecurrence(periodoRecorrente, datasRecorrentes)
{
    try
    {
        if (!datasRecorrentes || datasRecorrentes.length === 0)
        {
            console.error("Nenhuma data inicial válida retornada para o período.");
            return;
        }

        let primeiroAgendamento = criarAgendamento(null, null, datasRecorrentes[0]);
        let agendamentoObj;
        try
        {
            agendamentoObj = await enviarNovoAgendamento(primeiroAgendamento, datasRecorrentes.length === 1);
            if (!agendamentoObj || !agendamentoObj.novaViagem || !agendamentoObj.novaViagem.viagemId)
            {
                throw new Error("Erro ao criar o primeiro agendamento.");
            }
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "handleRecurrence", error);
        }

        if (datasRecorrentes.length > 1)
        {
            for (let i = 1; i < datasRecorrentes.length; i++)
            {
                const agendamentoSubsequente = criarAgendamento(null, agendamentoObj.novaViagem.viagemId, datasRecorrentes[i]);
                try
                {
                    await enviarNovoAgendamento(agendamentoSubsequente, i === datasRecorrentes.length - 1);
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "handleRecurrence", error);
                }
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "handleRecurrence", error);
    }
}

async function enviarNovoAgendamento(agendamento, isUltimoAgendamento = true)
{
    try
    {
        try
        {
            const objViagem = await enviarAgendamento(agendamento);
            if (!objViagem.operacaoBemSucedida)
            {
                console.error("Erro ao criar novo agendamento: operação não bem-sucedida", objViagem);
                throw new Error("Erro ao criar novo agendamento");
            }
            if (isUltimoAgendamento)
            {
                exibirMensagemSucesso();
            }
            return objViagem;
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "enviarNovoAgendamento", error);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "enviarNovoAgendamento", error);
    }
}

async function enviarAgendamentoComOpcao(viagemId, editarTodos, editarProximos, dataInicial = null, viagemIdRecorrente = null)
{
    try
    {
        try
        {
            if (!dataInicial)
            {
                dataInicial = moment().format("YYYY-MM-DD");
            }
            const agendamento = criarAgendamento(viagemId, viagemIdRecorrente, dataInicial);

            agendamento.EditarTodos = editarTodos;
            agendamento.EditarProximos = editarProximos;
            const objViagem = await enviarAgendamento(agendamento);
            if (objViagem)
            {
                AppToast.show("Verde", "Agendamento atualizado com sucesso", 3000);
                $("#modalViagens").modal("hide");
                $(document.body).removeClass("modal-open");
                $(".modal-backdrop").remove();
                $(document.body).css("overflow", "");
                calendar.refetchEvents();
            }
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "enviarAgendamentoComOpcao", error);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "enviarAgendamentoComOpcao", error);
    }
}

async function obterEDefinirDatasCalendario(viagem, viagemIdRecorrente)
{
    try
    {
        try
        {
            console.log("Testando chamada a getDatasIniciais...");
            const datasIniciais = await getDatasIniciais(viagem, viagemIdRecorrente);
            if (datasIniciais && datasIniciais.length > 0)
            {
                console.log("Datas iniciais recebidas:", datasIniciais);
                atualizarCalendarioExistente(datasIniciais);
            } else
            {
                console.error("Nenhuma data inicial foi recebida.");
            }
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "obterEDefinirDatasCalendario", error);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "obterEDefinirDatasCalendario", error);
    }
}

async function getDatasIniciais(viagemId, recorrenciaViagemId)
{
    try
    {
        console.log("Chamando getDatasIniciais com viagemId:", viagemId_AJAX, "e recorrenciaViagemId:", recorrenciaViagemId_AJAX);
        try
        {
            return new Promise((resolve, reject) =>
            {
                try
                {
                    $.ajax({
                        url: "api/Agenda/GetDatasViagem",
                        type: "GET",
                        contentType: "application/json",
                        data: {
                            viagemId: viagemId_AJAX,
                            recorrenciaViagemId: recorrenciaViagemId_AJAX
                        },
                        success: function (data)
                        {
                            try
                            {
                                console.log("Requisição AJAX bem-sucedida, dados recebidos:", data);
                                resolve(data);
                            } catch (error)
                            {
                                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "success", error);
                            }
                        },
                        error: function (err)
                        {
                            try
                            {
                                console.error("Erro na requisição AJAX:", err);
                                Alerta.Erro("Erro Desconhecido", err);
                                reject(err);
                            } catch (error)
                            {
                                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "error", error);
                            }
                        }
                    });
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "anonymous", error);
                }
            });
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "getDatasIniciais", error);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "getDatasIniciais", error);
    }
}

function atualizarListBoxHTMLComDatas(datas)
{
    try
    {
        datasSelecionadas = [...datas];
        const listBoxHTML = document.getElementById("lstDiasCalendarioHTML");
        const divDiasSelecionados = document.getElementById("diasSelecionadosTexto");
        if (!listBoxHTML) return;
        listBoxHTML.innerHTML = "";
        let contDatas = 0;
        datas.forEach(data =>
        {
            try
            {
                const dataFormatada = moment(data).format("DD/MM/YYYY");
                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                li.innerHTML = `<span>${dataFormatada}</span>`;
                listBoxHTML.appendChild(li);
                contDatas += 1;
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "forEach_callback", error);
            }
        });
        const badge2 = document.getElementById("itensBadgeHTML");
        if (badge2) badge2.textContent = contDatas;
        if (divDiasSelecionados)
        {
            divDiasSelecionados.textContent = `Dias Selecionados (${datas.length})`;
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "atualizarListBoxHTMLComDatas", error);
    }
}

function atualizarCalendarioExistente(datas)
{
    try
    {
        var selectedDates = datas.map(data =>
        {
            try
            {
                return new Date(data);
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "map_callback", error);
            }
        });
        let calendarObj = document.getElementById("calDatasSelecionadas").ej2_instances[0];
        if (calendarObj)
        {
            calendarObj.values = selectedDates;

            calendarObj.renderDayCell = function (args)
            {
                try
                {
                    let today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (args.date.getTime() === today.getTime())
                    {
                        args.isDisabled = true;
                        args.element.classList.remove("e-today");
                    }
                    const isDateSelected = selectedDates.some(selectedDate =>
                    {
                        try
                        {
                            return args.date.getFullYear() === selectedDate.getFullYear() && args.date.getMonth() === selectedDate.getMonth() && args.date.getDate() === selectedDate.getDate();
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "some_callback", error);
                        }
                    });
                    if (isDateSelected)
                    {
                        args.isDisabled = true;
                        args.element.classList.add("e-selected");
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "renderDayCell", error);
                }
            };

            calendarObj.change = function (args)
            {
                try
                {
                    calendarObj.values = selectedDates;
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "change", error);
                }
            };

            calendarObj.refresh();
            atualizarListBoxHTMLComDatas(datas);
        } else
        {
            console.error("Calendário não inicializado!");
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "atualizarCalendarioExistente", error);
    }
}

async function enviarAgendamento(agendamento)
{
    try
    {
        if (isSubmitting)
        {
            console.warn("Tentativa de enviar enquanto outra requisição está em andamento.");
            return;
        }
        isSubmitting = true;
        $("#btnConfirma").prop("disabled", true);

        try
        {
            const response = await $.ajax({
                type: "POST",
                url: "/api/Agenda/Agendamento",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(agendamento)
            });
            if (response?.novaViagem?.operacaoBemSucedida === true)
            {
                console.log("Agendamento enviado com sucesso.");
            } else
            {
                console.error("Erro ao enviar agendamento: operação não bem-sucedida.", response);
                throw new Error("Erro ao criar agendamento. Operação não bem-sucedida.");
            }
            response.operacaoBemSucedida = true;
            return response;
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "enviarAgendamento", error);
        } finally
        {
            isSubmitting = false;
            $("#btnConfirma").prop("disabled", false);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "enviarAgendamento", error);
    }
}

function handleAgendamentoError(error)
{
    try
    {
        exibirErroAgendamento();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "handleAgendamentoError", error);
    }
}

function exibirErroAgendamento()
{
    try
    {
        AppToast.show("Vermelho", "Não foi possível criar o agendamento com os dados informados", 3000);
        Alerta.Erro("Erro ao criar agendamento", "Não foi possível criar o agendamento com os dados informados");
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "exibirErroAgendamento", error);
    }
}

function ajustarDataInicialRecorrente(tipoRecorrencia)
{
    try
    {
        const datas = [];
        if (tipoRecorrencia === "V")
        {
            gerarRecorrenciaVariada(datas);
            return datas.length > 0 ? datas : null;
        }

        let dataAtual = document.getElementById("txtDataInicial")?.ej2_instances?.[0]?.value;
        const dataFinal = document.getElementById("txtFinalRecorrencia")?.ej2_instances?.[0]?.value;
        if (!dataAtual || !dataFinal)
        {
            console.error("Data Inicial ou Data Final não encontrada.");
            return null;
        }
        dataAtual = moment(dataAtual).toISOString().split("T")[0];
        const dataFinalFormatada = moment(dataFinal).toISOString().split("T")[0];
        let diasSelecionados = document.getElementById("lstDias")?.ej2_instances?.[0]?.value || [];
        if (tipoRecorrencia === "M")
        {
            diasSelecionados = [].concat(document.getElementById("lstDiasMes")?.ej2_instances?.[0]?.value || []);
        }
        let diasSelecionadosIndex = [];
        if (tipoRecorrencia !== "M")
        {
            diasSelecionadosIndex = diasSelecionados.map(dia =>
            {
                try
                {
                    return {
                        Sunday: 0,
                        Monday: 1,
                        Tuesday: 2,
                        Wednesday: 3,
                        Thursday: 4,
                        Friday: 5,
                        Saturday: 6
                    }[dia];
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "map_callback", error);
                }
            });
        }
        if (tipoRecorrencia === "D")
        {
            gerarRecorrenciaDiaria(dataAtual, dataFinalFormatada, datas);
        } else if (tipoRecorrencia === "M")
        {
            gerarRecorrenciaMensal(dataAtual, dataFinalFormatada, diasSelecionados, datas);
        } else
        {
            gerarRecorrenciaPorPeriodo(tipoRecorrencia, dataAtual, dataFinalFormatada, diasSelecionadosIndex, datas);
        }
        return datas.length > 0 ? datas : null;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "ajustarDataInicialRecorrente", error);
    }
}

function gerarRecorrenciaVariada(datas)
{
    try
    {
        let calendarObj = document.getElementById("calDatasSelecionadas")?.ej2_instances?.[0];
        if (!calendarObj || !calendarObj.values || calendarObj.values.length === 0)
        {
            console.error("Nenhuma data selecionada no calendário para recorrência do tipo 'V'.");
            return;
        }

        calendarObj.values.forEach(date =>
        {
            try
            {
                if (date)
                {
                    datas.push(moment(date).format("YYYY-MM-DD"));
                }
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "forEach_callback", error);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "gerarRecorrenciaVariada", error);
    }
}

function gerarRecorrenciaMensal(dataAtual, dataFinal, diasSelecionados, datas)
{
    try
    {
        dataAtual = moment(dataAtual);
        dataFinal = moment(dataFinal);
        while (dataAtual.isSameOrBefore(dataFinal))
        {
            diasSelecionados.forEach(dia =>
            {
                try
                {
                    let proximaData = moment(dataAtual).date(dia);

                    if (proximaData.isBefore(dataAtual))
                    {
                        return;
                    }

                    if (proximaData.isSameOrBefore(dataFinal) && proximaData.isSameOrAfter(dataAtual.startOf("month")))
                    {
                        datas.push(proximaData.format("YYYY-MM-DD"));
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "forEach_callback", error);
                }
            });

            dataAtual.add(1, "month").startOf("month");
            if (dataAtual.isAfter(dataFinal)) break;
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "gerarRecorrenciaMensal", error);
    }
}

function gerarRecorrenciaDiaria(dataAtual, dataFinal, datas)
{
    try
    {
        dataAtual = moment(dataAtual);
        dataFinal = moment(dataFinal);
        while (dataAtual.isSameOrBefore(dataFinal))
        {
            const dayOfWeek = dataAtual.isoWeekday();
            if (dayOfWeek >= 1 && dayOfWeek <= 5)
            {
                datas.push(dataAtual.format("YYYY-MM-DD"));
            }
            dataAtual.add(1, "days");
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "gerarRecorrenciaDiaria", error);
    }
}

function gerarRecorrenciaPorPeriodo(tipoRecorrencia, dataAtual, dataFinal, diasSelecionadosIndex, datas)
{
    try
    {
        dataAtual = moment(dataAtual);
        dataFinal = moment(dataFinal);

        if (tipoRecorrencia === "Q")
        {
            dataAtual = moment(dataAtual).day(8);
        }
        while (dataAtual.isSameOrBefore(dataFinal))
        {
            diasSelecionadosIndex.forEach(diaSelecionado =>
            {
                try
                {
                    let proximaData = moment(dataAtual).day(diaSelecionado);
                    if (proximaData.isBefore(dataAtual)) proximaData.add(1, "week");
                    if (proximaData.isSameOrBefore(dataFinal) && !datas.includes(proximaData.format("YYYY-MM-DD")))
                    {
                        datas.push(proximaData.format("YYYY-MM-DD"));
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "forEach_callback", error);
                }
            });
            switch (tipoRecorrencia)
            {
                case "S":
                    dataAtual.add(1, "week");
                    break;
                case "Q":
                    dataAtual.add(2, "weeks");
                    break;
                default:
                    console.error("Tipo de recorrência inválido: ", tipoRecorrencia);
                    return;
            }
            if (dataAtual.isAfter(dataFinal)) break;
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "gerarRecorrenciaPorPeriodo", error);
    }
}

function exibirMensagemSucesso()
{
    try
    {
        AppToast.show("Verde", "Todos os agendamentos foram criados com sucesso", 3000);
        Alerta.Sucesso("Agendamento criado com sucesso", "Todos os agendamentos foram criados com sucesso");
        $("#modalViagens").modal("hide");
        $(document.body).removeClass("modal-open");
        $(".modal-backdrop").remove();
        $(document.body).css("overflow", "");
        calendar.refetchEvents();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "exibirMensagemSucesso", error);
    }
}

async function ValidaCampos(viagemId)
{
    try
    {
        console.log("Entrei na validação: " + viagemId);
        const valDataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;
        const lstDdataInicial = document.getElementById("txtDataInicial").ej2_instances[0];
        if (!valDataInicial || !moment(valDataInicial).isValid() || valDataInicial === null)
        {
            lstDdataInicial.value = moment().format("DD/MM/YYYY");
        }
        const finalidade = document.getElementById("lstFinalidade").ej2_instances[0].value;
        if (finalidade === "" || finalidade === null)
        {
            await Alerta.Erro("Informação Ausente", "A <strong>Finalidade</strong> é obrigatória");
            return false;
        }
        const origem = document.getElementById("cmbOrigem").ej2_instances[0].value;
        if (origem === "" || origem === null)
        {
            await Alerta.Erro("Informação Ausente", "A Origem é obrigatória");
            return false;
        }
        const ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0];
        const ddtCombustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0];
        const dataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;
        const horaFinal = document.getElementById("txtHoraFinal").value;
        const kmInicial = document.getElementById("txtKmInicial").value;
        const kmFinal = document.getElementById("txtKmFinal").value;
        const dataFinal = $("#txtDataFinal").val();
        const combustivelFinal = ddtCombustivelFinal.value;
        const algumFinalPreenchido = dataFinal || horaFinal || combustivelFinal || kmFinal;
        const todosFinalPreenchidos = dataFinal && horaFinal && combustivelFinal && kmFinal;
        if (todosFinalPreenchidos)
        {
            const destino = document.getElementById("cmbDestino").ej2_instances[0].value;
            if (destino === "" || destino === null)
            {
                await Alerta.Erro("Informação Ausente", "O Destino é obrigatório");
                return false;
            }
        }
        if (viagemId != null && viagemId !== "" && $("#btnConfirma").text() !== "Edita Agendamento")
        {
            if (document.getElementById("txtNoFichaVistoria").value === "" || document.getElementById("txtNoFichaVistoria").value === null)
            {
                await Alerta.Erro("Informação Ausente", "O Nº da Ficha de Vistoria é obrigatório");
                return false;
            }
            const lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
            if (lstMotorista.value === null || lstMotorista.value === "")
            {
                await Alerta.Erro("Informação Ausente", "O Motorista é obrigatório");
                return false;
            }
            const lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
            if (lstVeiculo.value === null || lstVeiculo.value === "")
            {
                await Alerta.Erro("Informação Ausente", "O Veículo é obrigatório");
                return false;
            }
            const kmOk = await validarKmInicialFinal();
            if (!kmOk) return false;
            const ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0];
            if (ddtCombustivelInicial.value === "" || ddtCombustivelInicial.value === null)
            {
                await Alerta.Erro("Informação Ausente", "O Combustível Inicial é obrigatório");
                return false;
            }
        }
        const lstRequisitante = document.getElementById("lstRequisitante").ej2_instances[0];
        if (lstRequisitante.value === "" || lstRequisitante.value === null)
        {
            await Alerta.Erro("Informação Ausente", "O Requisitante é obrigatório");
            return false;
        }
        if (document.getElementById("txtRamalRequisitante").value === "" || document.getElementById("txtRamalRequisitante").value === null)
        {
            await Alerta.Erro("Informação Ausente", "O Ramal do Requisitante é obrigatório");
            return false;
        }
        const ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
        if (ddtSetor.value === "" || ddtSetor.value === null)
        {
            await Alerta.Erro("Informação Ausente", "O Setor do Requisitante é obrigatório");
            return false;
        }
        if (document.getElementById("lstFinalidade").ej2_instances[0].value[0] === "Evento")
        {
            const evento = document.getElementById("lstEventos").ej2_instances[0].value;
            if (evento === "" || evento === null)
            {
                await Alerta.Erro("Informação Ausente", "O Nome do Evento é obrigatório");
                return false;
            }
        }
        if (viagemId != null && viagemId !== "" && $("#btnConfirma").text() === "Registra Viagem")
        {
            transformandoEmViagem = true;
        }
        if (transformandoEmViagem === false)
        {
            const recorrente = document.getElementById("lstRecorrente").ej2_instances[0].value;

            let periodo = "";
            if (document.getElementById("txtPeriodos").value = "Diário")
            {
                periodo = "D";
            } else if (document.getElementById("txtPeriodos").value = "Semanal")
            {
                periodo = "S";
            } else if (document.getElementById("txtPeriodos").value = "Quinzenal")
            {
                periodo = "Q";
            } else if (document.getElementById("txtPeriodos").value = "Mensal")
            {
                periodo = "M";
            } else if (document.getElementById("txtPeriodos").value = "Dias Variados")
            {
                periodo = "V";
            }
            if (recorrente === "S" && (!periodo || periodo === ""))
            {
                await Alerta.Erro("Informação Ausente", "Se o Agendamento é Recorrente, você precisa escolher o Período de Recorrência");
                return false;
            }
            if ((periodo === "S" || periodo === "Q" || periodo === "M") && (document.getElementById("lstDias").ej2_instances[0].value === "" || document.getElementById("lstDias").ej2_instances[0].value === null))
            {
                await Alerta.Erro("Informação Ausente", "Se o período foi escolhido como semanal, quinzenal ou mensal, você precisa escolher os Dias da Semana");
                return false;
            }
        }
        const periodo = document.getElementById("lstPeriodos").ej2_instances[0].value;
        if ((periodo === "D" || periodo === "S" || periodo === "Q" || periodo === "M") && (document.getElementById("txtFinalRecorrencia").ej2_instances[0].value === "" || document.getElementById("txtFinalRecorrencia").ej2_instances[0].value === null))
        {
            await Alerta.Erro("Informação Ausente", "Se o período foi escolhido como diário, semanal, quinzenal ou mensal, você precisa escolher a Data Final");
            return false;
        }
        if (periodo === "V")
        {
            const calendarObj = document.getElementById("calDatasSelecionadas").ej2_instances[0];
            const selectedDates = calendarObj.values;
            if (!selectedDates || selectedDates.length === 0)
            {
                await Alerta.Erro("Informação Ausente", "Se o período foi escolhido como Dias Variados, você precisa escolher ao menos um dia no Calendário");
                return false;
            }
        }
        StatusViagem = "Aberta";
        if (dataInicial && horaFinal && kmInicial && ddtCombustivelInicial.value !== "")
        {
            StatusViagem = "Realizada";
        }
        if (kmFinal && parseFloat(kmFinal) <= 0)
        {
            Alerta.Erro("Informação Incorreta", "A Quilometragem Final deve ser maior que zero");
            return false;
        }
        if (algumFinalPreenchido && !todosFinalPreenchidos)
        {
            Alerta.Erro("Informação Incompleta", "Todos os campos de Finalização devem ser preenchidos para encerrar a viagem");
            return false;
        }
        if (todosFinalPreenchidos)
        {
            const confirmacao = await Alerta.Confirmar("Confirmar Fechamento", 'Você está criando a viagem como "Realizada". Deseja continuar?', "Sim, criar!", "Cancelar");
            if (!confirmacao) return false;
        }
        console.log("Terminei Validação!");
        return true;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "ValidaCampos", error);
        return false;
    }
}

function delay(ms)
{
    try
    {
        return new Promise(resolve =>
        {
            try
            {
                return setTimeout(resolve, ms);
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "anonymous", error);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "delay", error);
    }
}

function criarAgendamento(viagemId, viagemIdRecorrente, dataInicial)
{
    try
    {
        const rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];
        const rteDescricaoHtmlContent = rteDescricao.getHtml();

        const lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
        const lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
        const ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];

        const dataFinalInput = document.getElementById("txtFinalRecorrencia").ej2_instances[0].value;
        const momentDate = moment(dataFinalInput);
        const DataFinalRecorrencia = momentDate.isValid() ? momentDate.format("YYYY-MM-DD") : null;

        const lstDias = document.getElementById("lstDias").ej2_instances[0].value;
        const diasSemana = {
            Monday: lstDias.includes("Monday"),
            Tuesday: lstDias.includes("Tuesday"),
            Wednesday: lstDias.includes("Wednesday"),
            Thursday: lstDias.includes("Thursday"),
            Friday: lstDias.includes("Friday"),
            Saturday: lstDias.includes("Saturday"),
            Sunday: lstDias.includes("Sunday")
        };

        const dataInicialFormatada = moment(dataInicial).isValid() ? moment(dataInicial).format("YYYY-MM-DD") : null;

        let eventoId = null;
        const eventoCombo = document.getElementById("lstEventos").ej2_instances[0];
        if (eventoCombo.value != null && eventoCombo.value.length > 0)
        {
            eventoId = eventoCombo.value[0];
        }

        const agendamento = {
            ViagemId: viagemId || "00000000-0000-0000-0000-000000000000",
            DataInicial: dataInicialFormatada,
            HoraInicio: $("#txtHoraInicial").val(),
            Finalidade: document.getElementById("lstFinalidade").ej2_instances[0].value[0],
            Origem: document.getElementById("cmbOrigem").ej2_instances[0].value,
            Destino: document.getElementById("cmbDestino").ej2_instances[0].value,
            MotoristaId: lstMotorista.value || null,
            VeiculoId: lstVeiculo.value || null,
            KmAtual: parseInt($("#txtKmAtual").val(), 10) || null,
            RequisitanteId: document.getElementById("lstRequisitante").ej2_instances[0].value || null,
            RamalRequisitante: $("#txtRamalRequisitante").val(),
            SetorSolicitanteId: ddtSetor.value[0] || null,
            Descricao: rteDescricaoHtmlContent,
            StatusAgendamento: true,
            FoiAgendamento: true,
            Status: "Agendada",
            EventoId: eventoId,
            Recorrente: document.getElementById("lstRecorrente").ej2_instances[0].value,
            RecorrenciaViagemId: viagemIdRecorrente || "00000000-0000-0000-0000-000000000000",
            DatasSelecionadas: null,
            Intervalo: document.getElementById("lstPeriodos").ej2_instances[0].value,
            DataFinalRecorrencia: DataFinalRecorrencia,
            Monday: diasSemana.Monday,
            Tuesday: diasSemana.Tuesday,
            Wednesday: diasSemana.Wednesday,
            Thursday: diasSemana.Thursday,
            Friday: diasSemana.Friday,
            Saturday: diasSemana.Saturday,
            Sunday: diasSemana.Sunday,
            DiaMesRecorrencia: document.getElementById("lstDiasMes").ej2_instances[0].value
        };
        console.log("Agendamento criado:", agendamento);
        return agendamento;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "criarAgendamento", error);
    }
}

async function recuperarViagemEdicao(viagemId)
{
    try
    {
        try
        {
            const response = await $.ajax({
                url: "/api/Agenda/ObterAgendamentoEdicao",
                type: "GET",
                data: {
                    viagemId: viagemId
                },
                dataType: "json"
            });
            console.log("Response: ", response);

            const objViagem = Array.isArray(response) ? response[0] : response;
            return objViagem;
        } catch (err)
        {
            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "recuperarViagemEdicao", error);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "recuperarViagemEdicao", error);
    }
}

function criarAgendamentoUnico()
{
    try
    {
        const rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];
        const rteDescricaoHtmlContent = rteDescricao.getHtml();

        const lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
        const lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
        const ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
        let motoristaId = document.getElementById("lstMotorista").ej2_instances[0].value;
        let veiculoId = document.getElementById("lstVeiculo").ej2_instances[0].value;
        let eventoId = "";
        if (document.getElementById("lstEventos").ej2_instances[0].value != null)
        {
            let valor = document.getElementById("lstEventos").ej2_instances[0].value;
            console.log(valor);
            let flattened = valor.flat();
            console.log(flattened);
            eventoId = flattened.join(",");
            console.log("EventoID:" & eventoId);
        } else
        {
            eventoId = null;
        }
        let setorId = document.getElementById("ddtSetor").ej2_instances[0].value[0];
        let ramal = $("#txtRamalRequisitante").val();
        let requisitanteId = document.getElementById("lstRequisitante").ej2_instances[0].value;
        let kmAtual = parseInt($("#txtKmAtual").val(), 10);
        let destino = document.getElementById("cmbDestino").ej2_instances[0].value;
        let origem = document.getElementById("cmbOrigem").ej2_instances[0].value;
        let finalidade = document.getElementById("lstFinalidade").ej2_instances[0].value[0];

        const agendamento = {
            DataInicial: dataInicial,
            HoraInicio: $("#txtHoraInicial").val(),
            Finalidade: finalidade,
            Origem: origem,
            Destino: destino,
            MotoristaId: motoristaId,
            VeiculoId: veiculoId,
            KmAtual: kmAtual,
            RequisitanteId: requisitanteId,
            RamalRequisitante: ramal,
            SetorSolicitanteId: setorId,
            Descricao: rteDescricaoHtmlContent,
            StatusAgendamento: true,
            FoiAgendamento: true,
            Status: "Agendada",
            EventoId: eventoId,
            Recorrente: "N"
        };
        console.log("Agendamento criado:", agendamento);
        return agendamento;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "criarAgendamentoUnico", error);
    }
}

function criarAgendamentoEdicao(agendamentoOriginal)
{
    try
    {
        const rteDescricao = document.getElementById("rteDescricao")?.ej2_instances?.[0];
        const lstMotorista = document.getElementById("lstMotorista")?.ej2_instances?.[0];
        const lstVeiculo = document.getElementById("lstVeiculo")?.ej2_instances?.[0];
        const ddtSetor = document.getElementById("ddtSetor")?.ej2_instances?.[0];
        const ddtFinalidade = document.getElementById("lstFinalidade")?.ej2_instances?.[0];
        const ddtCombIniInst = document.getElementById("ddtCombustivelInicial")?.ej2_instances?.[0];
        const ddtCombFimInst = document.getElementById("ddtCombustivelFinal")?.ej2_instances?.[0];
        const lstEventosInst = document.getElementById("lstEventos")?.ej2_instances?.[0];
        const txtDataFinal = document.getElementById("txtDataFinal")?.ej2_instances?.[0];
        const rteDescricaoHtmlContent = rteDescricao?.getHtml() ?? "";

        const motoristaId = lstMotorista?.value ?? null;
        const veiculoId = lstVeiculo?.value ?? null;
        const setorId = getSfValue0(ddtSetor);
        const requisitanteId = document.getElementById("lstRequisitante")?.ej2_instances?.[0]?.value ?? null;
        const destino = document.getElementById("cmbDestino")?.ej2_instances?.[0]?.value ?? null;
        const origem = document.getElementById("cmbOrigem")?.ej2_instances?.[0]?.value ?? null;
        const finalidade = getSfValue0(ddtFinalidade);
        const combustivelInicial = getSfValue0(ddtCombIniInst);
        const combustivelFinal = getSfValue0(ddtCombFimInst);
        const noFichaVistoria = $("#txtNoFichaVistoria").val();
        const kmAtual = parseIntSafe($("#txtKmAtual").val());
        const kmInicial = parseIntSafe($("#txtKmInicial").val());
        const kmFinal = parseIntSafe($("#txtKmFinal").val());
        let eventoId = null;
        const eventosVal = lstEventosInst?.value;
        if (Array.isArray(eventosVal) && eventosVal.length) eventoId = eventosVal[0];

        const dataBaseOriginal = agendamentoOriginal?.dataInicial ? new Date(agendamentoOriginal.dataInicial) : null;

        const horaInicioTexto = $("#txtHoraInicial").val();
        const horaInicioLocal = dataBaseOriginal && horaInicioTexto ? toLocalDateTimeString(dataBaseOriginal, horaInicioTexto) : null;

        const dataFinalDate = txtDataFinal?.value ? new Date(txtDataFinal.value) : null;
        const dataFinalStr = dataFinalDate ? toDateOnlyString(dataFinalDate) : null;
        const horaFimTexto = $("#txtHoraFinal").val() || null;

        const statusAgendamento = agendamentoOriginal?.statusAgendamento ?? true;
        const foiAgendamento = agendamentoOriginal?.foiAgendamento ?? true;

        const payload = {
            ViagemId: agendamentoOriginal?.viagemId,
            ...(horaInicioLocal ? { HoraInicio: horaInicioLocal } : {}),
            ...(dataFinalStr ? { DataFinal: dataFinalStr } : {}),
            ...(horaFimTexto ? { HoraFim: horaFimTexto } : {}),
            Finalidade: finalidade,
            Origem: origem,
            Destino: destino,
            MotoristaId: motoristaId,
            VeiculoId: veiculoId,
            CombustivelInicial: combustivelInicial,
            CombustivelFinal: combustivelFinal,
            KmAtual: kmAtual,
            KmInicial: kmInicial,
            KmFinal: kmFinal,
            RequisitanteId: requisitanteId,
            RamalRequisitante: $("#txtRamalRequisitante").val(),
            SetorSolicitanteId: setorId,
            Descricao: rteDescricaoHtmlContent,
            StatusAgendamento: statusAgendamento,
            FoiAgendamento: foiAgendamento,
            Status: agendamentoOriginal?.status,
            EventoId: eventoId,
            Recorrente: agendamentoOriginal?.recorrente,
            RecorrenciaViagemId: agendamentoOriginal?.recorrenciaViagemId,
            DatasSelecionadas: agendamentoOriginal?.datasSelecionadas,
            Intervalo: agendamentoOriginal?.intervalo,
            DataFinalRecorrencia: agendamentoOriginal?.dataFinalRecorrencia,
            Monday: agendamentoOriginal?.monday,
            Tuesday: agendamentoOriginal?.tuesday,
            Wednesday: agendamentoOriginal?.wednesday,
            Thursday: agendamentoOriginal?.thursday,
            Friday: agendamentoOriginal?.friday,
            Saturday: agendamentoOriginal?.saturday,
            Sunday: agendamentoOriginal?.sunday,
            DiaMesRecorrencia: agendamentoOriginal?.diaMesRecorrencia,
            NoFichaVistoria: noFichaVistoria
        };

        if ("DataInicial" in payload) delete payload.DataInicial;
        return payload;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "criarAgendamentoEdicao", error);
    }
}

function criarAgendamentoViagem(agendamentoUnicoAlterado)
{
    try
    {
        const rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];
        const rteDescricaoHtmlContent = rteDescricao.getHtml();

        const lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
        const lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
        const ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
        let motoristaId = document.getElementById("lstMotorista").ej2_instances[0].value;
        let veiculoId = document.getElementById("lstVeiculo").ej2_instances[0].value;
        let eventoId = "";
        if (document.getElementById("lstEventos").ej2_instances[0].value != null)
        {
            eventoId = document.getElementById("lstEventos").ej2_instances[0].value[0];
        } else
        {
            eventoId = null;
        }
        let setorId = document.getElementById("ddtSetor").ej2_instances[0].value[0];
        let ramal = $("#txtRamalRequisitante").val();
        let requisitanteId = document.getElementById("lstRequisitante").ej2_instances[0].value;
        let kmAtual = parseInt($("#txtKmAtual").val(), 10);
        let kmInicial = parseInt($("#txtKmInicial").val(), 10);
        let kmFinal = parseInt($("#txtKmFinal").val(), 10);
        let destino = document.getElementById("cmbDestino").ej2_instances[0].value;
        let origem = document.getElementById("cmbOrigem").ej2_instances[0].value;
        let finalidade = document.getElementById("lstFinalidade").ej2_instances[0].value[0];
        let combustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0].value[0];
        let combustivelFinal = "";
        if (document.getElementById("ddtCombustivelFinal").ej2_instances[0].value[0] === null || document.getElementById("ddtCombustivelFinal").ej2_instances[0].value[0] === undefined)
        {
            combustivelFinal = null;
        } else
        {
            combustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0].value[0];
        }
        let dataFinal = "";
        if (document.getElementById("txtDataFinal").ej2_instances[0].value === null || document.getElementById("txtDataFinal").ej2_instances[0].value === undefined)
        {
            dataFinal = null;
        } else
        {
            dataFinal = moment(document.getElementById("txtDataFinal").ej2_instances[0].value).format("YYYY-MM-DD");
        }
        let horaInicio = $("#txtHoraInicial").val();
        let horaFim = "";
        if (document.getElementById("txtHoraFinal").value === null || document.getElementById("txtHoraFinal").value === undefined || document.getElementById("txtHoraFinal").value === "")
        {
            horaFim = null;
        } else
        {
            horaFim = document.getElementById("txtHoraFinal").value;
        }
        let statusAgendamento = document.getElementById("txtStatusAgendamento").value;
        let criarViagemFechada = true;
        let noFichaVistoria = document.getElementById("txtNoFichaVistoria").value;
        if (dataFinal && horaFim && combustivelFinal && kmFinal)
        {
            status = "Realizada";
            if (statusAgendamento)
            {
                criarViagemFechada = true;
            } else
            {
                criarViagemFechada = false;
            }
        } else
        {
            status = "Aberta";
        }

        const agendamento = {
            ViagemId: viagemId,
            NoFichaVistoria: noFichaVistoria,
            DataInicial: dataInicial,
            HoraInicio: horaInicio,
            DataFinal: dataFinal,
            HoraFim: horaFim,
            Finalidade: finalidade,
            Origem: origem,
            Destino: destino,
            MotoristaId: motoristaId,
            VeiculoId: veiculoId,
            KmAtual: kmAtual,
            KmInicial: kmInicial,
            KmFinal: kmFinal,
            CombustivelInicial: combustivelInicial,
            CombustivelFinal: combustivelFinal,
            RequisitanteId: requisitanteId,
            RamalRequisitante: ramal,
            SetorSolicitanteId: setorId,
            Descricao: rteDescricaoHtmlContent,
            StatusAgendamento: false,
            FoiAgendamento: true,
            Status: status,
            EventoId: eventoId,
            Recorrente: agendamentoUnicoAlterado.recorrente,
            RecorrenciaViagemId: agendamentoUnicoAlterado.recorrenciaViagemId,
            DatasSelecionadas: agendamentoUnicoAlterado.datasSelecionadas,
            Intervalo: agendamentoUnicoAlterado.intervalo,
            DataFinalRecorrencia: agendamentoUnicoAlterado.dataFinalRecorrencia,
            Monday: agendamentoUnicoAlterado.monday,
            Tuesday: agendamentoUnicoAlterado.tuesday,
            Wednesday: agendamentoUnicoAlterado.wednesday,
            Thursday: agendamentoUnicoAlterado.thursday,
            Friday: agendamentoUnicoAlterado.friday,
            Saturday: agendamentoUnicoAlterado.saturday,
            Sunday: agendamentoUnicoAlterado.sunday,
            DiaMesRecorrencia: agendamentoUnicoAlterado.diaMesRecorrencia,
            CriarViagemFechada: criarViagemFechada
        };
        console.log("Agendamento criado:", agendamento);
        return agendamento;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "criarAgendamentoViagem", error);
    }
}

$(document).ready(function ()
{
    try
    {
        var accordionContainer = $("#accordionRequisitante");
        var isAnimating = false;

        // Inicialmente esconder todo o container do accordion
        accordionContainer.hide();

        // Remover qualquer evento anterior e adicionar novo
        $("#btnRequisitante").off("click").on("click", function (e)
        {
            e.preventDefault();
            e.stopPropagation();

            // Prevenir cliques durante animação
            if (isAnimating) return false;

            isAnimating = true;

            if (accordionContainer.is(":visible"))
            {
                accordionContainer.slideUp(300, function ()
                {
                    isAnimating = false;
                });
            } else
            {
                accordionContainer.slideDown(300, function ()
                {
                    isAnimating = false;
                });
            }

            return false;
        });

        // Handler para fechar
        $("#btnFecharAccordionRequisitante").off("click").on("click", function (e)
        {
            e.preventDefault();
            e.stopPropagation();

            if (isAnimating) return false;

            isAnimating = true;

            accordionContainer.slideUp(300, function ()
            {
                isAnimating = false;
                // Limpar campos após fechar
                try
                {
                    var setores = document.getElementById("ddtSetorRequisitante").ej2_instances[0];
                    if (setores) setores.value = "";
                    $("#txtPonto, #txtNome, #txtRamal, #txtEmail").val("");
                } catch (error)
                {
                    console.error("Erro ao limpar campos:", error);
                }
            });

            return false;
        });

        // Bloquear eventos do accordion Syncfusion
        accordionContainer.find(".e-acrdn-header").off("click").on("click", function (e)
        {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });

        var dataRecorrente = [{
            text: "Sim",
            value: "S"
        }, {
            text: "Não",
            value: "N"
        }];

        var dropDownListRecorrente = new ej.dropdowns.DropDownList({
            dataSource: dataRecorrente,
            fields: {
                text: "text",
                value: "value"
            },
            value: "N",
            placeholder: "Selecione uma opção",
            change: function (e)
            {
                try
                {
                    var selectedValue = e.value;
                    var selectedText = "";

                    if (e.itemData && e.itemData.text != null)
                    {
                        selectedText = e.itemData.text;
                    }

                    console.log("Selected Value:", selectedValue);
                    console.log("Selected Text:", selectedText);
                    document.getElementById("lstPeriodos").ej2_instances[0].value = "";
                    document.getElementById("lstDias").ej2_instances[0].value = "";
                    document.getElementById("txtFinalRecorrencia").value = "";
                    document.getElementById("calDatasSelecionadas").ej2_instances[0].value = null;
                    var listBox = document.getElementById("lstDiasCalendario").ej2_instances[0];
                    listBox.dataSource = [];
                    document.getElementById("itensBadge").textContent = 0;
                    if (selectedValue === "S")
                    {
                        if (document.getElementById("divTxtPeriodo").style.display != "block")
                        {
                            document.getElementById("divPeriodo").style.display = "block";
                            rebuildLstPeriodos();
                            document.getElementById("divDias").style.display = "none";
                            document.getElementById("divDiaMes").style.display = "none";
                            document.getElementById("divFinalRecorrencia").style.display = "none";
                            document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
                            var calendarContainer = document.getElementById("calendarContainer");
                            calendarContainer.style.display = "none";
                            var listboxContainer = document.getElementById("listboxContainer");
                            listboxContainer.style.display = "none";
                        }
                    } else
                    {
                        document.getElementById("divPeriodo").style.display = "none";
                        document.getElementById("divDias").style.display = "none";
                        document.getElementById("divDiaMes").style.display = "none";
                        document.getElementById("divFinalRecorrencia").style.display = "none";
                        document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
                        var calendarContainer = document.getElementById("calendarContainer");
                        calendarContainer.style.display = "none";
                        var listboxContainer = document.getElementById("listboxContainer");
                        listboxContainer.style.display = "none";
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "change", error);
                }
            }
        });
        dropDownListRecorrente.appendTo("#lstRecorrente");

        var data = [{
            text: "Diário",
            value: "D"
        }, {
            text: "Semanal",
            value: "S"
        }, {
            text: "Quinzenal",
            value: "Q"
        }, {
            text: "Mensal",
            value: "M"
        }, {
            text: "Dias Variados",
            value: "V"
        }];

        var dropDownListObject = new ej.dropdowns.DropDownList({
            dataSource: data,
            fields: {
                text: "text",
                value: "value"
            },
            value: null,
            placeholder: "Selecione um período",
            change: function (e)
            {
                try
                {
                    var selectedValue = e.value || "";

                    document.getElementById("lstDias").ej2_instances[0].value = "";
                    document.getElementById("txtFinalRecorrencia").ej2_instances[0].value = "";
                    document.getElementById("calDatasSelecionadas").ej2_instances[0].value = null;
                    var listBox = document.getElementById("lstDiasCalendario").ej2_instances[0];
                    listBox.dataSource = [];
                    document.getElementById("itensBadge").textContent = 0;
                    if (document.getElementById("lstPeriodos").ej2_instances[0].enabled === true)
                    {
                        if (selectedValue === "")
                        {
                            document.getElementById("divDias").style.display = "none";
                            document.getElementById("divDiaMes").style.display = "none";
                            document.getElementById("divFinalRecorrencia").style.display = "none";
                            document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
                            var calendarContainer = document.getElementById("calendarContainer");
                            calendarContainer.style.display = "none";
                            var listboxContainer = document.getElementById("listboxContainer");
                            listboxContainer.style.display = "none";
                        } else if (selectedValue === "V")
                        {
                            var calendarContainer = document.getElementById("calendarContainer");
                            calendarContainer.style.display = "block";
                            var listboxContainer = document.getElementById("listboxContainer");
                            listboxContainer.style.display = "block";
                            document.getElementById("divDias").style.display = "none";
                            document.getElementById("divDiaMes").style.display = "none";
                            document.getElementById("divFinalRecorrencia").style.display = "none";
                            document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
                        } else if (selectedValue === "D")
                        {
                            document.getElementById("divDias").style.display = "none";
                            document.getElementById("divDiaMes").style.display = "none";
                            document.getElementById("divFinalRecorrencia").style.display = "block";
                            document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
                            var calendarContainer = document.getElementById("calendarContainer");
                            calendarContainer.style.display = "none";
                            var listboxContainer = document.getElementById("listboxContainer");
                            listboxContainer.style.display = "none";
                        } else if (selectedValue === "M")
                        {
                            document.getElementById("divDias").style.display = "none";
                            document.getElementById("divDiaMes").style.display = "block";
                            document.getElementById("divFinalRecorrencia").style.display = "block";
                            document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
                            var calendarContainer = document.getElementById("calendarContainer");
                            calendarContainer.style.display = "none";
                            var listboxContainer = document.getElementById("listboxContainer");
                            listboxContainer.style.display = "none";
                        } else
                        {
                            document.getElementById("divDias").style.display = "block";
                            document.getElementById("divDiaMes").style.display = "none";
                            document.getElementById("divFinalRecorrencia").style.display = "block";
                            document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
                            var calendarContainer = document.getElementById("calendarContainer");
                            calendarContainer.style.display = "none";
                            var listboxContainer = document.getElementById("listboxContainer");
                            listboxContainer.style.display = "none";
                        }
                    } else
                    {
                        var textbox = new ej.inputs.TextBox({
                            enabled: false
                        });
                        textbox.appendTo("#txtDataFinalRecorrencia");
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "change", error);
                }
            }
        });
        dropDownListObject.appendTo("#lstPeriodos");

        var accordionRequisitante = new ej.navigations.Accordion({
            width: 600,
            height: "auto",
            margintop: 100,
            marginleft: -300,
            expandMode: "Single",
            animation: {
                expand: {
                    effect: "fadeIn",
                    duration: 500
                },
                collapse: {
                    effect: "fadeOut",
                    duration: 500
                }
            }
        });

        accordionRequisitante.appendTo("#accordionRequisitante");
        let dialogRecorrencia = new ej.popups.Dialog({
            header: '<div style="display: flex; align-items: center; justify-content: space-between;">' + '<span style="font-size: 18px; color: #e74c3c; font-weight: bold;">Atenção ao Prazo</span>' + '<img src="./images/barbudo.jpg" alt="Warning Icon" style="width: 48px; height: 48px; margin-left: auto;">' + "</div>",
            content: '<div style="font-size: 16px; color: #333;">A data final não pode ser maior que 365 dias após a data inicial.</div>',
            position: {
                X: "center",
                Y: "center"
            },
            width: "350px",
            cssClass: "custom-dialog-style",
            visible: false,
            buttons: [{
                click: () =>
                {
                    try
                    {
                        return dialogRecorrencia.hide();
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "click", error);
                    }
                },
                buttonModel: {
                    content: "OK",
                    isPrimary: true,
                    cssClass: "custom-ok-button"
                }
            }]
        });
        dialogRecorrencia.appendTo("#dialogRecorrencia");

        var accordionEvento = new ej.navigations.Accordion({
            width: 800,
            height: "auto",
            margintop: 100,
            marginleft: -1300,
            expandMode: "Single",
            animation: {
                expand: {
                    effect: "fadeIn",
                    duration: 500
                },
                collapse: {
                    effect: "fadeOut",
                    duration: 500
                }
            }
        });
        accordionEvento.appendTo("#accordionEvento");

        let selectedDates = [];

        const listBox = new ej.dropdowns.ListBox({
            dataSource: selectedDates,
            height: "200px",
            itemTemplate: `
        <div class="normal-item" style="height: 50px; line-height: 50px; display: flex; align-items: center;">
            <button class="remove-btn" style="width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-left: 10px; background-color: red; border: none;" onclick="removeDate(\${Timestamp})">
                <i class="fas fa-trash-alt" style="font-size: 16px; color: white;"></i>
            </button>
            <span class="item-text" style="margin-left: 15px;">\${DateText}</span>
        </div>`,
            noRecordsTemplate: "Sem dias escolhidos.."
        });

        listBox.appendTo("#lstDiasCalendario");

        function toLocalDateOnly(d)
        {
            try
            {
                const dt = d instanceof Date ? d : new Date(d);
                return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "toLocalDateOnly", error);
            }
        }

        function formatDateLocal(d)
        {
            try
            {
                return formatDate(d);
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "formatDateLocal", error);
                return new Intl.DateTimeFormat("pt-BR", {
                    timeZone: "America/Sao_Paulo"
                }).format(d);
            }
        }

        function syncListBoxAndBadges()
        {
            try
            {
                if (window.listBox && typeof listBox.dataBind === "function")
                {
                    listBox.dataSource = selectedDates;
                    listBox.dataBind();
                }

                const totalItems = window.listBox && typeof listBox.getDataList === "function" ? listBox.getDataList().length : Array.isArray(selectedDates) ? selectedDates.length : 0;
                const badge1 = document.getElementById("itensBadge");
                const badge2 = document.getElementById("itensBadgeHTML");
                if (badge1) badge1.textContent = totalItems;
                if (badge2) badge2.textContent = totalItems;
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "syncListBoxAndBadges", error);
            }
        }

        function handleCalendarChange(args)
        {
            try
            {
                const selectedDatesArray = Array.isArray(args.values) ? args.values : args.value ? [args.value] : [];

                selectedDates = selectedDatesArray.map(d =>
                {
                    try
                    {
                        const localMidnight = toLocalDateOnly(d);
                        return {
                            Timestamp: localMidnight.getTime(),
                            DateText: formatDateLocal(localMidnight)
                        };
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "map_callback", error);
                    }
                });

                selectedDates.sort((a, b) =>
                {
                    try
                    {
                        return a.Timestamp - b.Timestamp;
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "sort_callback", error);
                    }
                });
                console.log("Selected dates changed:", selectedDates);

                listBox.dataSource = selectedDates;
                listBox.dataBind();

                const totalItems = listBox.getDataList().length;
                const badge1 = document.getElementById("itensBadge");
                const badge2 = document.getElementById("itensBadgeHTML");
                if (badge1) badge1.textContent = totalItems;
                if (badge2) badge2.textContent = totalItems;
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "handleCalendarChange", error);
            }
        }

        const todayLocal = toLocalDateOnly(new Date());

        const calendar = new ej.calendars.Calendar({
            isMultiSelection: true,
            showTodayButton: false,
            locale: "pt-BR",
            min: toLocalDateOnly(new Date()),
            change: function (args)
            {
                try
                {
                    const selectedDatesArray = Array.isArray(args.values) ? args.values : args.value ? [args.value] : [];
                    selectedDates = selectedDatesArray.map(d =>
                    {
                        try
                        {
                            const localMidnight = toLocalDateOnly(d);
                            return {
                                Timestamp: localMidnight.getTime(),
                                DateText: formatDateLocal(localMidnight)
                            };
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "map_callback", error);
                        }
                    });
                    selectedDates.sort((a, b) =>
                    {
                        try
                        {
                            return a.Timestamp - b.Timestamp;
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "sort_callback", error);
                        }
                    });
                    listBox.dataSource = selectedDates;
                    listBox.dataBind();
                    const totalItems = listBox.getDataList().length;
                    document.getElementById("itensBadge").textContent = totalItems;
                    document.getElementById("itensBadgeHTML").textContent = totalItems;
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "change", error);
                }
            }
        });
        calendar.appendTo("#calDatasSelecionadas");
        var L10n = ej.base.L10n;
        L10n.load({
            pt: {
                calendar: {
                    today: "Hoje"
                }
            }
        });
        calendar.locale = "pt";

        var multiSelect = new ej.dropdowns.MultiSelect({
            placeholder: "Selecione os dias...",
            dataSource: [{
                id: "Monday",
                name: "Segunda"
            }, {
                id: "Tuesday",
                name: "Terça"
            }, {
                id: "Wednesday",
                name: "Quarta"
            }, {
                id: "Thursday",
                name: "Quinta"
            }, {
                id: "Friday",
                name: "Sexta"
            }, {
                id: "Saturday",
                name: "Sábado"
            }, {
                id: "Sunday",
                name: "Domingo"
            }],
            fields: {
                text: "name",
                value: "id"
            },
            maximumSelectionLength: 7,
            change: function (args)
            {
                try
                {
                    let itemValue = args.item ? args.item.value : null;
                    if (itemValue && multiSelect.value.includes(itemValue))
                    {
                        multiSelect.value = multiSelect.value.filter(value =>
                        {
                            try
                            {
                                return value !== itemValue;
                            } catch (error)
                            {
                                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "filter_callback", error);
                            }
                        });
                        multiSelect.dataBind();
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "change", error);
                }
            }
        });
        multiSelect.appendTo("#lstDias");

        let hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        new ej.calendars.DatePicker({
            min: hoje,
            strictMode: false,
            format: "dd/MM/yyyy",
            placeholder: ""
        }, "#txtFinalRecorrencia");

        let datePicker = new ej.calendars.DatePicker({
            min: hoje,
            format: "dd/MM/yyyy",
            focus: function (event)
            {
                try
                {
                    console.log("DatePicker focused!");
                    console.log(event);
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "focus", error);
                }
            },
            change: function (event)
            {
                try
                {
                    let dataSelecionada = event.value;
                    datePickerFinal.min = dataSelecionada;
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "change", error);
                }
            }
        }, "#txtDataInicial");
        setTimeout(function ()
        {
            try
            {
                datePicker.value = hoje;
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "setTimeout_callback", error);
            }
        }, 100);

        datePicker.value = hoje;

        let datePickerFinal = new ej.calendars.DatePicker({
            min: hoje,
            format: "dd/MM/yyyy"
        }, "#txtDataFinal");

        var textBox = new ej.inputs.TextBox({
            placeholder: "Selecione a data"
        });
        textBox.appendTo("#txtDataFinalRecorrencia");

        var dias = [];
        for (var i = 1; i <= 31; i++)
        {
            dias.push({
                text: i.toString(),
                value: i
            });
        }

        var dropdownObj = new ej.dropdowns.DropDownList({
            dataSource: dias,
            fields: {
                text: "text",
                value: "value"
            },
            floatLabelType: "Always"
        });
        dropdownObj.appendTo("#lstDiasMes");

        document.getElementById("lstRecorrente").ej2_instances[0].setProperties({ height: "200px" });
        document.getElementById("lstPeriodos").ej2_instances[0].setProperties({ height: "200px" });
        document.getElementById("lstDias").ej2_instances[0].setProperties({ height: "200px" });
        document.getElementById("txtFinalRecorrencia").ej2_instances[0].setProperties({ height: "200px" });

        document.getElementById("divDias").style.display = "none";
        document.getElementById("divFinalRecorrencia").style.display = "none";
        document.getElementById("divFinalFalsoRecorrencia").style.display = "none";

        document.getElementById("ReportContainer").classList.remove("d-flex");
        document.getElementById("ReportContainer").style.display = "none";
        $("#txtFinalRecorrencia").val("");
        var calendarContainer = document.getElementById("calendarContainer");
        calendarContainer.style.display = "none";
        var listboxContainer = document.getElementById("listboxContainer");
        listboxContainer.style.display = "none";

        $("#btnFecha").on("click", function ()
        {
            try
            {
                $("#modalViagens").modal("hide");
                $(document.body).removeClass("modal-open");
                $(".modal-backdrop").remove();
                $(document.body).css("overflow", "");
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "on_callback", error);
            }
        });

        $("#btnFecharFicha").on("click", function ()
        {
            try
            {
                $("#modalPrint").modal("hide");
                $(document.body).removeClass("modal-open");
                $(".modal-backdrop").remove();
                $(document.body).css("overflow", "");
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "on_callback", error);
            }
        });

        InitializeCalendar("api/Agenda/CarregaViagens");
        PreencheListaSetores();

        $("#modalRequisitante").modal({
            keyboard: true,
            backdrop: "static",
            show: false
        }).on("hide.bs.modal", function ()
        {
            try
            {
                var setores = document.getElementById("ddtSetorRequisitante").ej2_instances[0];
                setores.value = "";
                $("#txtPonto").val("");
                $("#txtNome").val("");
                $("#txtRamal").val("");
                $("#txtEmail").val("");
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "on_callback", error);
            }
        });

        $("#modalSetor").modal({
            keyboard: true,
            backdrop: "static",
            show: false
        }).on("hide.bs.modal", function ()
        {
            try
            {
                $("#txtSigla").val("");
                $("#txtNomeSetor").val("");
                $("#txtRamalSetor").val("");
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "on_callback", error);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "ready_callback", error);
    }
});

/**
 * Função consolidada que substitui tanto inicializarComponentesEvento()
 * quanto inicializarCardEvento()
 *
 * Esta é a ÚNICA função que você precisa chamar!
 */
function inicializarSistemaEventoCompleto()
{
    try
    {
        // ================================================================
        // PARTE 1: Configuração inicial dos componentes
        // (Era o que fazia inicializarComponentesEvento)
        // ================================================================

        // 1. Configura lstEventos
        const lstEventosElement = document.getElementById("lstEventos");
        if (lstEventosElement && lstEventosElement.ej2_instances && lstEventosElement.ej2_instances[0])
        {
            // Desabilita inicialmente (será habilitado quando "Evento" for selecionado)
            lstEventosElement.ej2_instances[0].enabled = false;
        }

        // 2. Oculta o botão de evento inicialmente
        const btnEvento = document.getElementById("btnEvento");
        if (btnEvento)
        {
            btnEvento.style.display = "none";
        }

        // 3. Oculta o card de evento inicialmente
        const cardEvento = document.getElementById("cardEvento");
        if (cardEvento)
        {
            cardEvento.classList.add("d-none");
        }

        // ================================================================
        // PARTE 2: Configuração dos listeners e eventos
        // (Era o que fazia inicializarCardEvento)
        // ================================================================

        // 4. Monitora mudanças na finalidade
        const lstFinalidadeElement = document.getElementById("lstFinalidade");
        if (lstFinalidadeElement && lstFinalidadeElement.ej2_instances && lstFinalidadeElement.ej2_instances[0])
        {
            const lstFinalidade = lstFinalidadeElement.ej2_instances[0];

            // Remove listeners antigos para evitar duplicação
            lstFinalidade.change = null;

            // Adiciona novo listener
            lstFinalidade.change = function (args)
            {
                controlarCardEvento(args.value);
            };
        }

        // 5. Configura botão "Novo Evento"
        if (btnEvento)
        {
            // Remove listeners antigos
            const novoBtnEvento = btnEvento.cloneNode(true);
            btnEvento.parentNode.replaceChild(novoBtnEvento, btnEvento);

            // Adiciona novo listener
            novoBtnEvento.onclick = function ()
            {
                abrirAccordionEvento();
            };
        }

        // 6. Configura botão "Fechar Accordion"
        const btnFecharAccordion = document.getElementById("btnFecharEvento");
        if (btnFecharAccordion)
        {
            // Remove listeners antigos
            const novoBtnFechar = btnFecharAccordion.cloneNode(true);
            btnFecharAccordion.parentNode.replaceChild(novoBtnFechar, btnFecharAccordion);

            // Adiciona novo listener
            novoBtnFechar.onclick = function ()
            {
                fecharAccordionEvento();
                limparCamposEventoFormulario();
            };
        }

        // 7. Configura botão "Inserir Evento"
        const btnInserirEvento = document.getElementById("btnInserirEvento");
        if (btnInserirEvento)
        {
            // Remove listeners antigos
            const novoBtnInserir = btnInserirEvento.cloneNode(true);
            btnInserirEvento.parentNode.replaceChild(novoBtnInserir, btnInserirEvento);

            // Adiciona novo listener
            novoBtnInserir.onclick = function ()
            {
                salvarNovoEvento();
            };
        }

        console.log("✅ Sistema de evento inicializado com sucesso");
    }
    catch (error)
    {
        console.error("❌ Erro ao inicializar sistema de evento:", error);
    }
}

/**
 * Controla a visibilidade do card de evento baseado na finalidade
 * param {string|Array} finalidade - Finalidade(s) selecionada(s)
 */
function controlarCardEvento(finalidade)
{
    try
    {
        const cardEvento = document.getElementById("cardEvento");
        const btnEvento = document.getElementById("btnEvento");

        if (!cardEvento) return;

        let mostrarCard = false;

        // Verifica se "Evento" está selecionado
        if (Array.isArray(finalidade))
        {
            mostrarCard = finalidade.some(f =>
                f && (f === "Evento" || f.toLowerCase() === "evento")
            );
        }
        else if (finalidade)
        {
            mostrarCard = finalidade === "Evento" || finalidade.toLowerCase() === "evento";
        }

        if (mostrarCard)
        {
            // ========== MOSTRA O CARD ==========
            cardEvento.classList.remove("d-none");

            // Mostra o botão de evento
            if (btnEvento)
            {
                btnEvento.style.display = "inline-block";
            }

            // Habilita lstEventos
            habilitarLstEventos(true);

            console.log("📋 Card de evento exibido");
        }
        else
        {
            // ========== ESCONDE O CARD ==========
            cardEvento.classList.add("d-none");

            // Esconde o botão de evento
            if (btnEvento)
            {
                btnEvento.style.display = "none";
            }

            // Fecha o accordion se estiver aberto
            fecharAccordionEvento();

            // Limpa os campos
            limparCamposEventoFormulario();

            // Desabilita e limpa lstEventos
            habilitarLstEventos(false);

            console.log("🚫 Card de evento ocultado");
        }
    }
    catch (error)
    {
        console.error("Erro ao controlar card:", error);
    }
}

/**
 * Habilita ou desabilita o componente lstEventos
 * param {boolean} habilitar - true para habilitar, false para desabilitar
 */
function habilitarLstEventos(habilitar)
{
    try
    {
        const lstEventosElement = document.getElementById("lstEventos");

        if (lstEventosElement && lstEventosElement.ej2_instances && lstEventosElement.ej2_instances[0])
        {
            lstEventosElement.ej2_instances[0].enabled = habilitar;

            if (!habilitar)
            {
                lstEventosElement.ej2_instances[0].value = null;
            }
        }
    }
    catch (error)
    {
        console.error("Erro ao habilitar/desabilitar lstEventos:", error);
    }
}

/**
 * Abre o accordion de cadastro de evento
 */
function abrirAccordionEvento()
{
    try
    {
        const accordionEvento = document.getElementById("accordionEvento");
        if (!accordionEvento) return;

        // Mostra o accordion
        accordionEvento.classList.remove("d-none");

        // Expande usando Bootstrap
        const collapseElement = document.getElementById("collapseEvento");
        if (collapseElement && typeof bootstrap !== 'undefined')
        {
            const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseElement);
            bsCollapse.show();
        }

        console.log("📖 Accordion de evento aberto");
    }
    catch (error)
    {
        console.error("Erro ao abrir accordion:", error);
    }
}

/**
 * Fecha o accordion de cadastro de evento
 */
function fecharAccordionEvento()
{
    try
    {
        const accordionEvento = document.getElementById("accordionEvento");
        if (!accordionEvento) return;

        // Esconde o accordion
        accordionEvento.classList.add("d-none");

        // Colapsa usando Bootstrap
        const collapseElement = document.getElementById("collapseEvento");
        if (collapseElement && typeof bootstrap !== 'undefined')
        {
            const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseElement);
            bsCollapse.hide();
        }

        console.log("📕 Accordion de evento fechado");
    }
    catch (error)
    {
        console.error("Erro ao fechar accordion:", error);
    }
}

/**
 * Limpa todos os campos do formulário de evento
 */
function limparCamposEventoFormulario()
{
    try
    {
        // Campos HTML simples
        const camposTexto = [
            "txtNomeEvento",
            "txtDescricaoEvento",
            "txtDataInicialEvento",
            "txtDataFinalEvento",
            "txtQuantidadePessoasEvento"
        ];

        camposTexto.forEach(id =>
        {
            const elemento = document.getElementById(id);
            if (elemento) elemento.value = "";
        });

        // Componentes EJ2
        const componentesEJ2 = [
            "lstRequisitanteEvento",
            "ddtSetorEvento"
        ];

        componentesEJ2.forEach(id =>
        {
            const elemento = document.getElementById(id);
            if (elemento && elemento.ej2_instances && elemento.ej2_instances[0])
            {
                elemento.ej2_instances[0].value = null;
            }
        });

        console.log("🧹 Campos do evento limpos");
    }
    catch (error)
    {
        console.error("Erro ao limpar campos:", error);
    }
}

/**
 * Salva um novo evento
 */
function salvarNovoEvento()
{
    try
    {
        // Coleta dados
        const nomeEvento = document.getElementById("txtNomeEvento").value.trim();
        const descricao = document.getElementById("txtDescricaoEvento").value.trim();
        const dataInicial = document.getElementById("txtDataInicialEvento").value;
        const dataFinal = document.getElementById("txtDataFinalEvento").value;
        const quantidadePessoas = document.getElementById("txtQuantidadePessoasEvento").value;

        // Validações
        if (!nomeEvento)
        {
            Alerta.Aviso("Atenção", "Informe o nome do evento.");
            return;
        }

        if (!dataInicial || !dataFinal)
        {
            Alerta.Aviso("Atenção", "Informe as datas do evento.");
            return;
        }

        if (moment(dataFinal).isBefore(moment(dataInicial)))
        {
            Alerta.Aviso("Atenção", "A data final deve ser posterior à data inicial.");
            return;
        }

        // Coleta IDs dos componentes EJ2
        let requisitanteId = null;
        let setorId = null;

        const lstReq = document.getElementById("lstRequisitanteEvento");
        if (lstReq && lstReq.ej2_instances && lstReq.ej2_instances[0])
        {
            requisitanteId = lstReq.ej2_instances[0].value;
        }

        const ddtSetor = document.getElementById("ddtSetorEvento");
        if (ddtSetor && ddtSetor.ej2_instances && ddtSetor.ej2_instances[0])
        {
            setorId = ddtSetor.ej2_instances[0].value;
        }

        // Monta objeto
        const evento = {
            nome: nomeEvento,
            descricao: descricao,
            dataInicial: dataInicial,
            dataFinal: dataFinal,
            requisitanteId: requisitanteId,
            setorId: setorId,
            quantidadePessoas: quantidadePessoas
        };

        // Salva via AJAX
        $.ajax({
            url: "/api/Eventos/Inserir",
            type: "POST",
            data: JSON.stringify(evento),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response)
            {
                Alerta.Sucesso("Sucesso", "Evento cadastrado!");

                fecharAccordionEvento();
                limparCamposEventoFormulario();

                // Atualiza lista e seleciona
                atualizarListaEventosESelecionar(response.eventoId);
            },
            error: function (err)
            {
                console.error("Erro ao salvar:", err);
                Alerta.Erro("Erro", "Não foi possível salvar o evento.");
            }
        });
    }
    catch (error)
    {
        console.error("Erro ao salvar evento:", error);
    }
}

/**
 * Atualiza lista de eventos e seleciona um específico
 * param {number} eventoId - ID do evento a selecionar
 */
function atualizarListaEventosESelecionar(eventoId)
{
    try
    {
        const lstEventosElement = document.getElementById("lstEventos");

        if (!lstEventosElement || !lstEventosElement.ej2_instances || !lstEventosElement.ej2_instances[0])
        {
            return;
        }

        $.ajax({
            url: "/api/Eventos/Listar",
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data)
            {
                const lstEventos = lstEventosElement.ej2_instances[0];
                lstEventos.dataSource = data;
                lstEventos.dataBind();

                if (eventoId)
                {
                    lstEventos.value = eventoId;
                }
            },
            error: function (err)
            {
                console.error("Erro ao atualizar lista:", err);
            }
        });
    }
    catch (error)
    {
        console.error("Erro:", error);
    }
}

/**
 * Exibe um modal para criar/editar/visualizar uma viagem ou agendamento
 * param {Object|string} viagem - Objeto com dados da viagem ou string vazia para criar nova
 * param {Date} dataClicada - Data selecionada no calendário (opcional)
 * param {string} horaClicada - Hora selecionada no calendário (opcional)
 */
function ExibeViagem(viagem, dataClicada = null, horaClicada = null)
{
    try
    {
        StatusViagem = "Aberta";

        // ====================================================================
        // INICIALIZAÇÃO DO MODAL
        // ====================================================================
        inicializarCamposModal();
        limparCamposRecorrencia();

        // ====================================================================
        // MODO: CRIAR NOVO AGENDAMENTO
        // ====================================================================
        if (viagem === "")
        {
            configurarModoNovoAgendamento(dataClicada, horaClicada);
            return;
        }

        // ====================================================================
        // MODO: EDITAR/VISUALIZAR VIAGEM EXISTENTE
        // ====================================================================
        console.log("Status Agendamento:", viagem.statusAgendamento);

        const reportContainer = document.getElementById("ReportContainer");
        if (reportContainer)
        {
            reportContainer.classList.add("d-flex");
            reportContainer.style.display = "block";
        }

        // Preenche campos básicos
        preencherCamposBasicos(viagem);

        // Exibe labels de usuários (Agendado, Criado, Finalizado, Cancelado)
        exibirLabelsUsuarios(viagem);

        // Configura recorrência
        configurarRecorrencia(viagem);

        // ====================================================================
        // DETERMINA O ESTADO DA VIAGEM E CONFIGURA INTERFACE
        // ====================================================================
        const estadoViagem = determinarEstadoViagem(viagem);

        switch (estadoViagem)
        {
            case 'REALIZADA':
            case 'CANCELADA':
                configurarViagemFinalizada(viagem, estadoViagem);
                break;

            case 'AGENDAMENTO_ATIVO':
                configurarAgendamentoAtivo(viagem);
                break;

            case 'AGENDAMENTO_CANCELADO':
                configurarAgendamentoCancelado(viagem);
                break;

            case 'VIAGEM_ABERTA':
                configurarViagemAberta(viagem);
                break;
        }

        $("#btnFecha").prop("disabled", false);

        // ====================================================================
        // CONTROLA CARD DE EVENTO (se aplicável)
        // ====================================================================
        // Aguarda um pouco para garantir que todos os componentes estejam prontos
        setTimeout(function ()
        {
            try
            {
                // Inicializa o sistema de evento se a função existir
                if (typeof inicializarSistemaEventoCompleto === 'function')
                {
                    inicializarSistemaEventoCompleto();
                }

                // Verifica se deve mostrar o card de evento
                if (viagem.eventoId != null || viagem.finalidade === "Evento")
                {
                    const lstFinalidade = document.getElementById("lstFinalidade");
                    if (lstFinalidade && lstFinalidade.ej2_instances && lstFinalidade.ej2_instances[0])
                    {
                        const finalidadeAtual = lstFinalidade.ej2_instances[0].value;
                        if (typeof controlarCardEvento === 'function')
                        {
                            controlarCardEvento(finalidadeAtual);
                        }
                    }
                }
            }
            catch (error)
            {
                console.error("Erro ao controlar card de evento:", error);
            }
        }, 300);
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "ExibeViagem", error);
    }
}

// ========================================================================
// FUNÇÕES AUXILIARES - INICIALIZAÇÃO
// ========================================================================

/**
 * Inicializa e habilita todos os campos do modal
 */
/**
 * Inicializa e habilita todos os campos do modal
 */
function inicializarCamposModal()
{
    try
    {
        // Habilita todos os campos exceto o container de botões
        const divModal = document.getElementById("divModal");
        if (divModal)
        {
            const childNodes = divModal.getElementsByTagName("*");
            for (const node of childNodes)
            {
                if (node.id !== "divBotoes")
                {
                    node.disabled = false;
                    node.value = "";
                }
            }
        }

        // Configura campos de hora
        $("#txtHoraInicial, #txtHoraFinal").attr("type", "time");

        // Oculta campos específicos de viagem
        const camposViagem = [
            "divNoFichaVistoria", "divDataFinal", "divHoraFinal", "divDuracao",
            "divKmAtual", "divKmInicial", "divKmFinal", "divQuilometragem",
            "divCombustivelInicial", "divCombustivelFinal"
        ];

        camposViagem.forEach(id =>
        {
            const elemento = document.getElementById(id);
            if (elemento) elemento.style.display = "none";
        });

        // Inicializa componentes EJ2
        inicializarComponentesEJ2();

        // Configura visibilidade de botões
        $("#btnImprime, #btnConfirma, #btnApaga, #btnCancela").show();

        const btnEvento = document.getElementById("btnEvento");
        if (btnEvento) btnEvento.style.display = "none";

        const lstEvento = document.getElementById("lstEventos");
        if (lstEvento && lstEvento.ej2_instances && lstEvento.ej2_instances[0])
        {
            lstEvento.ej2_instances[0].enabled = false;
        }

        // Configura botão requisitante
        const btnRequisitante = document.getElementById("btnRequisitante");
        if (btnRequisitante)
        {
            btnRequisitante.classList.remove("disabled");
        }
    }
    catch (error)
    {
        console.error("Erro ao inicializar campos do modal:", error);
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "inicializarCamposModal", error);
    }
}

/**
 * Inicializa todos os componentes Syncfusion EJ2
 */
function inicializarComponentesEJ2()
{
    const componentes = [
        { id: "rteDescricao", propriedades: { enabled: true, value: "" } },
        { id: "lstMotorista", propriedades: { enabled: true, value: "" } },
        { id: "lstVeiculo", propriedades: { enabled: true, value: "" } },
        { id: "lstRequisitante", propriedades: { enabled: true, value: "" } },
        { id: "ddtSetor", propriedades: { enabled: true, value: "" } },
        { id: "ddtCombustivelInicial", propriedades: { value: "" } },
        { id: "ddtCombustivelFinal", propriedades: { value: "" } }
    ];

    componentes.forEach(({ id, propriedades }) =>
    {
        try
        {
            const elemento = document.getElementById(id);
            if (elemento && elemento.ej2_instances && elemento.ej2_instances[0])
            {
                const componente = elemento.ej2_instances[0];
                Object.assign(componente, propriedades);
            }
        }
        catch (error)
        {
            console.warn(`Não foi possível inicializar o componente: ${id}`);
        }
    });
}

/**
 * Limpa todos os campos de recorrência
 */
function limparCamposRecorrencia()
{
    try
    {
        const componentesRecorrencia = [
            { id: "lstRecorrente", valor: "" },
            { id: "lstPeriodos", valor: "" },
            { id: "lstDias", valor: "" },
            { id: "txtFinalRecorrencia", valor: null },
            { id: "calDatasSelecionadas", valor: null }
        ];

        componentesRecorrencia.forEach(({ id, valor }) =>
        {
            const elemento = document.getElementById(id);
            if (elemento && elemento.ej2_instances && elemento.ej2_instances[0])
            {
                elemento.ej2_instances[0].value = valor;
            }
            else if (elemento)
            {
                elemento.value = valor;
            }
        });

        const listBox = document.getElementById("lstDiasCalendario");
        if (listBox && listBox.ej2_instances && listBox.ej2_instances[0])
        {
            listBox.ej2_instances[0].dataSource = [];
        }

        const badge = document.getElementById("itensBadge");
        if (badge) badge.textContent = 0;
    }
    catch (error)
    {
        console.error("Erro ao limpar campos de recorrência:", error);
    }
}

// ========================================================================
// FUNÇÕES AUXILIARES - MODO NOVO AGENDAMENTO
// ========================================================================

/**
 * Configura o modal para criar um novo agendamento
 */
function configurarModoNovoAgendamento(dataClicada, horaClicada)
{
    document.getElementById("Titulo").innerHTML = `
        <h3 class='modal-title'>
            <i class="fa-duotone fa-calendar-lines-pen"
               style="--fa-primary-color: #006400; --fa-secondary-color: #A9BA9D;"></i>
            Criar Agendamento
        </h3>`;

    console.log("Criar Agendamento");

    // Oculta botões desnecessários
    $("#btnViagem, #btnImprime, #btnApaga, #btnCancela").hide();
    $("#btnConfirma").html("<i class='fa fa-save' aria-hidden='true'></i>Cria Agendamento");

    // Preenche data inicial
    preencherDataInicial(dataClicada);

    // Preenche hora inicial
    preencherHoraInicial(horaClicada);

    // Limpa labels de usuários
    limparLabelsUsuarios();
}

/**
 * Preenche o campo de data inicial
 */
function preencherDataInicial(dataClicada)
{
    try
    {
        const datePicker = document.getElementById("txtDataInicial");
        if (!datePicker || !datePicker.ej2_instances || !datePicker.ej2_instances[0])
        {
            console.warn("DatePicker txtDataInicial não está inicializado");
            return;
        }

        const datePickerInstance = datePicker.ej2_instances[0];

        if (dataClicada)
        {
            datePickerInstance.value = moment(dataClicada).toDate();
            console.log("Data preenchida:", moment(dataClicada).format("DD/MM/YYYY"));
        }
        else
        {
            datePickerInstance.value = moment().toDate();
            console.log("Data preenchida (atual):", moment().format("DD/MM/YYYY"));
        }

        datePickerInstance.dataBind();
    }
    catch (error)
    {
        console.error("Erro ao preencher data inicial:", error);
    }
}

/**
 * Preenche o campo de hora inicial (arredondada para intervalos de 10 minutos)
 */
function preencherHoraInicial(horaClicada)
{
    let horaFinal;

    if (horaClicada)
    {
        horaFinal = horaClicada;
        console.log("Hora preenchida:", horaClicada);
    }
    else
    {
        horaFinal = arredondarHoraProximos10Minutos(moment());
        console.log("Hora preenchida (arredondada):", horaFinal);
    }

    $("#txtHoraInicial").removeAttr("type");
    document.getElementById("txtHoraInicial").value = horaFinal;
    $("#txtHoraInicial").attr("type", "time");
}

/**
 * Arredonda um horário para o próximo intervalo de 10 minutos
 */
function arredondarHoraProximos10Minutos(momentObj)
{
    const minutos = momentObj.minutes();
    const resto = minutos % 10;

    if (resto !== 0)
    {
        momentObj.add(10 - resto, 'minutes');
    }

    momentObj.seconds(0).milliseconds(0);
    return momentObj.format("HH:mm");
}

// ========================================================================
// FUNÇÕES AUXILIARES - PREENCHIMENTO DE DADOS
// ========================================================================

/**
 * Preenche os campos básicos da viagem
 */
function preencherCamposBasicos(viagem)
{
    try
    {
        // Campos hidden
        $("#txtViagemId").val(viagem.viagemId);
        $("#txtRecorrenciaViagemId").val(viagem.recorrenciaViagemId);
        $("#txtStatusAgendamento").val(viagem.statusAgendamento);
        $("#txtUsuarioIdCriacao").val(viagem.usuarioIdCriacao);
        $("#txtDataCriacao").val(viagem.dataCriacao);
        $("#txtNoFichaVistoria").val(viagem.noFichaVistoria);

        // Data inicial
        const datePicker = document.getElementById("txtDataInicial");
        if (datePicker && datePicker.ej2_instances && datePicker.ej2_instances[0])
        {
            datePicker.ej2_instances[0].value = moment(viagem.dataInicial).toDate();
            datePicker.ej2_instances[0].dataBind();
        }

        // Hora inicial
        $("#txtHoraInicial").removeAttr("type");
        document.getElementById("txtHoraInicial").value = viagem.horaInicio.substring(11, 16);
        $("#txtHoraInicial").attr("type", "time");

        // Campos de seleção
        const lstFinalidade = document.getElementById("lstFinalidade");
        if (lstFinalidade && lstFinalidade.ej2_instances && lstFinalidade.ej2_instances[0])
        {
            lstFinalidade.ej2_instances[0].value = [viagem.finalidade];
            lstFinalidade.ej2_instances[0].text = viagem.finalidade;
        }

        const cmbOrigem = document.getElementById("cmbOrigem");
        if (cmbOrigem && cmbOrigem.ej2_instances && cmbOrigem.ej2_instances[0])
        {
            cmbOrigem.ej2_instances[0].value = viagem.origem;
        }

        const cmbDestino = document.getElementById("cmbDestino");
        if (cmbDestino && cmbDestino.ej2_instances && cmbDestino.ej2_instances[0])
        {
            cmbDestino.ej2_instances[0].value = viagem.destino;
        }

        // Evento
        if (viagem.eventoId != null)
        {
            const lstEvento = document.getElementById("lstEventos");
            if (lstEvento && lstEvento.ej2_instances && lstEvento.ej2_instances[0])
            {
                lstEvento.ej2_instances[0].enabled = true;
                lstEvento.ej2_instances[0].value = [viagem.eventoId];
            }

            const btnEvento = document.getElementById("btnEvento");
            if (btnEvento) btnEvento.style.display = "block";
        }

        // Motorista, Veículo, Requisitante
        if (viagem.motoristaId != null)
        {
            const lstMotorista = document.getElementById("lstMotorista");
            if (lstMotorista && lstMotorista.ej2_instances && lstMotorista.ej2_instances[0])
            {
                lstMotorista.ej2_instances[0].value = viagem.motoristaId;
            }
        }

        if (viagem.veiculoId != null)
        {
            const lstVeiculo = document.getElementById("lstVeiculo");
            if (lstVeiculo && lstVeiculo.ej2_instances && lstVeiculo.ej2_instances[0])
            {
                lstVeiculo.ej2_instances[0].value = viagem.veiculoId;
            }
        }

        if (viagem.requisitanteId != null)
        {
            const lstRequisitante = document.getElementById("lstRequisitante");
            if (lstRequisitante && lstRequisitante.ej2_instances && lstRequisitante.ej2_instances[0])
            {
                lstRequisitante.ej2_instances[0].value = viagem.requisitanteId;
            }
        }

        if (viagem.ramalRequisitante != null)
        {
            const txtRamal = document.getElementById("txtRamalRequisitante");
            if (txtRamal) txtRamal.value = viagem.ramalRequisitante;
        }

        // Quilometragem
        if (viagem.kmAtual != null)
        {
            const txtKmAtual = document.getElementById("txtKmAtual");
            if (txtKmAtual) txtKmAtual.value = viagem.kmAtual;
        }

        if (viagem.kmInicial != null)
        {
            const txtKmInicial = document.getElementById("txtKmInicial");
            if (txtKmInicial) txtKmInicial.value = viagem.kmInicial;
        }

        if (viagem.kmFinal != null && viagem.kmFinal != 0)
        {
            const txtKmFinal = document.getElementById("txtKmFinal");
            if (txtKmFinal) txtKmFinal.value = viagem.kmFinal;
        }

        // Calcula distância se a função existir
        if (typeof calcularDistanciaViagem === 'function')
        {
            calcularDistanciaViagem();
        }

        // Combustível
        if (viagem.combustivelInicial != null && viagem.combustivelInicial !== "")
        {
            const ddtCombInicial = document.getElementById("ddtCombustivelInicial");
            if (ddtCombInicial && ddtCombInicial.ej2_instances && ddtCombInicial.ej2_instances[0])
            {
                ddtCombInicial.ej2_instances[0].value = [viagem.combustivelInicial];
            }
        }

        if (viagem.combustivelFinal != null && viagem.combustivelFinal !== "")
        {
            const ddtCombFinal = document.getElementById("ddtCombustivelFinal");
            if (ddtCombFinal && ddtCombFinal.ej2_instances && ddtCombFinal.ej2_instances[0])
            {
                ddtCombFinal.ej2_instances[0].value = [viagem.combustivelFinal];
            }
        }

        // Descrição
        const rteDescricao = document.getElementById("rteDescricao");
        if (rteDescricao && rteDescricao.ej2_instances && rteDescricao.ej2_instances[0])
        {
            rteDescricao.ej2_instances[0].value = viagem.descricao;
        }
    }
    catch (error)
    {
        console.error("Erro ao preencher campos básicos:", error);
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "preencherCamposBasicos", error);
    }
}

// ========================================================================
// FUNÇÕES AUXILIARES - LABELS DE USUÁRIOS
// ========================================================================

/**
 * Exibe os labels com informações dos usuários que interagiram com a viagem
 */
function exibirLabelsUsuarios(viagem)
{
    if (!viagem.statusAgendamento && !viagem.foiAgendamento)
    {
        limparLabelsUsuarios();
        return;
    }

    // Agendado por
    if (viagem.usuarioIdAgendamento != null)
    {
        exibirLabelUsuario(
            viagem.usuarioIdAgendamento,
            viagem.dataAgendamento,
            "lblUsuarioAgendamento",
            "Agendado por",
            "fa-user-clock",
            "#C2410C",
            "#FB923C"
        );
    }
    else
    {
        document.getElementById("lblUsuarioAgendamento").innerHTML = "";
    }

    // Criado/Alterado por
    if (viagem.statusAgendamento === false)
    {
        exibirLabelUsuario(
            viagem.usuarioIdCriacao,
            viagem.dataCriacao,
            "lblUsuarioCriacao",
            "Criado/Alterado por",
            "fa-user-plus",
            "#1e3a8a",
            "#60a5fa"
        );
    }
    else
    {
        document.getElementById("lblUsuarioCriacao").innerHTML = "";
    }

    // Finalizado por
    if (viagem.horaFim != null)
    {
        exibirLabelUsuario(
            viagem.usuarioIdFinalizacao,
            viagem.dataFinalizacao,
            "lblUsuarioFinalizacao",
            "Finalizado por",
            "fa-user-check",
            "#155724",
            "#28a745"
        );
    }
    else
    {
        document.getElementById("lblUsuarioFinalizacao").innerHTML = "";
    }

    // Cancelado por
    if (viagem.usuarioIdCancelamento != null && viagem.dataCancelamento != null)
    {
        exibirLabelUsuario(
            viagem.usuarioIdCancelamento,
            viagem.dataCancelamento,
            "lblUsuarioCancelamento",
            "Cancelado por",
            "fa-trash-can-xmark",
            "#8B0000",
            "#DC143C"
        );
    }
    else
    {
        document.getElementById("lblUsuarioCancelamento").innerHTML = "";
    }
}

/**
 * Exibe um label com informações de usuário
 */
function exibirLabelUsuario(usuarioId, data, labelId, textoAcao, icone, corPrimaria, corSecundaria)
{
    const dataFormatada = moment(data).format("DD/MM/YYYY");
    const horaFormatada = moment(data).format("HH:mm");

    $.ajax({
        url: "/api/Agenda/RecuperaUsuario",
        type: "Get",
        data: { id: usuarioId },
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data)
        {
            try
            {
                let nomeUsuario;
                $.each(data, function (key, val)
                {
                    nomeUsuario = val;
                });

                document.getElementById(labelId).innerHTML =
                    `<i class="fa-duotone fa-solid ${icone}" ` +
                    `style="--fa-primary-color: ${corPrimaria}; ` +
                    `--fa-secondary-color: ${corSecundaria}; ` +
                    `--fa-secondary-opacity: 0.7;"></i> ` +
                    `<span>${textoAcao}:</span> ${nomeUsuario} em ${dataFormatada} às ${horaFormatada}`;
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "exibirLabelUsuario", error);
            }
        },
        error: function (err)
        {
            console.error("Erro ao recuperar usuário:", err);
            Alerta.Erro("Erro", "Não foi possível recuperar informações do usuário");
        }
    });
}

/**
 * Limpa todos os labels de usuários
 */
function limparLabelsUsuarios()
{
    const labels = [
        "lblUsuarioAgendamento",
        "lblUsuarioCriacao",
        "lblUsuarioFinalizacao",
        "lblUsuarioCancelamento"
    ];

    labels.forEach(id => document.getElementById(id).innerHTML = "");
}

// ========================================================================
// FUNÇÕES AUXILIARES - RECORRÊNCIA
// ========================================================================

/**
 * Configura os campos de recorrência
 */
function configurarRecorrencia(viagem)
{
    try
    {
        const txtPeriodos = document.getElementById("txtPeriodos");
        if (txtPeriodos) txtPeriodos.style.display = "none";

        const lstRecorrente = document.getElementById("lstRecorrente");
        if (lstRecorrente && lstRecorrente.ej2_instances && lstRecorrente.ej2_instances[0])
        {
            lstRecorrente.ej2_instances[0].enabled = false;
            lstRecorrente.ej2_instances[0].value = viagem.recorrente;
        }

        if (viagem.recorrente !== "S")
        {
            const divPeriodo = document.getElementById("divPeriodo");
            if (divPeriodo) divPeriodo.style.display = "none";
            return;
        }

        // Mapeia intervalos para textos
        const intervalosMap = {
            'D': 'Diário',
            'S': 'Semanal',
            'Q': 'Quinzenal',
            'M': 'Mensal',
            'V': 'Dias Variados'
        };

        if (txtPeriodos)
        {
            txtPeriodos.value = intervalosMap[viagem.intervalo] || "";
            txtPeriodos.disabled = true;
        }

        const divPeriodo = document.getElementById("divPeriodo");
        const divTxtPeriodo = document.getElementById("divTxtPeriodo");
        if (divPeriodo) divPeriodo.style.display = "none";
        if (divTxtPeriodo) divTxtPeriodo.style.display = "block";

        // Configurações específicas por tipo de intervalo
        switch (viagem.intervalo)
        {
            case 'S':
            case 'Q':
                configurarRecorrenciaSemanal(viagem);
                break;

            case 'M':
                configurarRecorrenciaMensal(viagem);
                break;

            case 'V':
                configurarRecorrenciaVariada(viagem);
                break;
        }

        // Data final de recorrência
        if (['D', 'S', 'Q', 'M'].includes(viagem.intervalo))
        {
            const txtDataFinalRecorrencia = document.getElementById("txtDataFinalRecorrencia");
            if (txtDataFinalRecorrencia)
            {
                txtDataFinalRecorrencia.disabled = true;
                txtDataFinalRecorrencia.value = moment(viagem.dataFinalRecorrencia).format("DD/MM/YYYY");
            }

            const divFinalRecorrencia = document.getElementById("divFinalRecorrencia");
            const divFinalFalsoRecorrencia = document.getElementById("divFinalFalsoRecorrencia");

            if (divFinalRecorrencia) divFinalRecorrencia.style.display = "none";
            if (divFinalFalsoRecorrencia) divFinalFalsoRecorrencia.style.display = "block";
        }
        else
        {
            const divFinalRecorrencia = document.getElementById("divFinalRecorrencia");
            const divFinalFalsoRecorrencia = document.getElementById("divFinalFalsoRecorrencia");

            if (divFinalRecorrencia) divFinalRecorrencia.style.display = "none";
            if (divFinalFalsoRecorrencia) divFinalFalsoRecorrencia.style.display = "none";
        }
    }
    catch (error)
    {
        console.error("Erro ao configurar recorrência:", error);
    }
}

/**
 * Configura recorrência semanal/quinzenal
 */
function configurarRecorrenciaSemanal(viagem)
{
    document.getElementById("divDias").style.display = "block";

    const diasMap = {
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
        sunday: "Sunday"
    };

    const diasSelecionados = Object.keys(diasMap)
        .filter(dia => viagem[dia])
        .map(dia => diasMap[dia]);

    const multiSelect = document.getElementById("lstDias").ej2_instances[0];

    multiSelect.dataSource = multiSelect.dataSource.filter(item =>
        diasSelecionados.includes(item.id)
    );
    multiSelect.dataBind();

    multiSelect.value = diasSelecionados;
    multiSelect.dataBind();

    const selectedTexts = diasSelecionados.map(val =>
    {
        const item = multiSelect.dataSource.find(dsItem => dsItem.id === val);
        return item ? item.name : val;
    });

    multiSelect.inputElement.value = selectedTexts.join(", ");
    multiSelect.readonly = true;
    multiSelect.enabled = false;
}

/**
 * Configura recorrência mensal
 */
function configurarRecorrenciaMensal(viagem)
{
    document.getElementById("divDiaMes").style.display = "block";

    const lstDiasMes = document.getElementById("lstDiasMes").ej2_instances[0];
    lstDiasMes.enabled = false;
    lstDiasMes.value = viagem.diaMesRecorrencia;
    lstDiasMes.text = viagem.diaMesRecorrencia;
}

/**
 * Configura recorrência com dias variados
 */
function configurarRecorrenciaVariada(viagem)
{
    document.getElementById("calendarContainer").style.display = "none";
    document.getElementById("listboxContainer").style.display = "none";
    document.getElementById("listboxContainerHTML").style.display = "block";

    obterEDefinirDatasCalendario(viagem.viagemId, viagem.viagemIdRecorrente);
}

// ========================================================================
// FUNÇÕES AUXILIARES - DETERMINAÇÃO DE ESTADO
// ========================================================================

/**
 * Determina o estado atual da viagem
 * returns {string} Estado da viagem
 */
function determinarEstadoViagem(viagem)
{
    if (viagem.status === "Realizada") return 'REALIZADA';
    if (viagem.status === "Cancelada" && viagem.statusAgendamento === false) return 'CANCELADA';
    if (viagem.statusAgendamento === true && viagem.status === "Cancelada") return 'AGENDAMENTO_CANCELADO';
    if (viagem.statusAgendamento === true) return 'AGENDAMENTO_ATIVO';
    return 'VIAGEM_ABERTA';
}

// ========================================================================
// FUNÇÕES AUXILIARES - CONFIGURAÇÃO POR ESTADO
// ========================================================================

/**
 * Configura interface para viagem finalizada (Realizada ou Cancelada)
 */
function configurarViagemFinalizada(viagem, estado)
{
    try
    {
        const statusTexto = estado === 'REALIZADA' ? 'Realizada' : 'Cancelada';

        document.getElementById("Titulo").innerHTML =
            `<h3 class='modal-title'>` +
            `<i class='fa-duotone fa-solid fa-suitcase-rolling' aria-hidden='true'></i> ` +
            `Exibindo Viagem (${statusTexto} - ` +
            `<span class='btn-vinho fw-bold fst-italic'>Edição Não Permitida</span>` +
            `) </h3>`;

        // Exibe campos específicos de viagem
        exibirCamposViagem(viagem);

        // Preenche data e hora final
        const datePicker = document.getElementById("txtDataFinal");
        if (datePicker && datePicker.ej2_instances && datePicker.ej2_instances[0])
        {
            datePicker.ej2_instances[0].value = moment(viagem.dataInicial).toDate();
            datePicker.ej2_instances[0].dataBind();
        }

        if (viagem.horaFim)
        {
            $("#txtHoraFinal").removeAttr("type");
            const txtHoraFinal = document.getElementById("txtHoraFinal");
            if (txtHoraFinal)
            {
                txtHoraFinal.value = viagem.horaFim.substring(11, 16);
            }
            $("#txtHoraFinal").attr("type", "time");
        }

        // Desabilita todos os controles
        desabilitarTodosControles();

        // Configura botões
        $("#btnViagem, #btnImprime, #btnConfirma, #btnApaga").hide();
        $("#btnCancela").show().prop("disabled", false);
        $("#btnFecha").prop("disabled", false);
    }
    catch (error)
    {
        console.error("Erro ao configurar viagem finalizada:", error);
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "configurarViagemFinalizada", error);
    }
}

/**
 * Configura interface para agendamento ativo
 */
function configurarAgendamentoAtivo(viagem)
{
    document.getElementById("Titulo").innerHTML = `
        <h3 class='modal-title'>
            <i class="fa-duotone fa-calendar-lines-pen"
               style="--fa-primary-color: #002F6C; --fa-secondary-color: #7DA2CE;"></i>
            Editar Agendamento
        </h3>`;

    $("#btnConfirma").html("<i class='fa fa-save' aria-hidden='true'></i>Edita Agendamento");
    $("#btnViagem, #btnImprime, #btnConfirma, #btnApaga, #btnCancela").show();
}

/**
 * Configura interface para agendamento cancelado
 */
function configurarAgendamentoCancelado(viagem)
{
    document.getElementById("Titulo").innerHTML = `
        <h3 class='modal-title'>
            <i class="fa-duotone fa-calendar-xmark"
               style="--fa-primary-color: #8B0000; --fa-secondary-color: #FF4C4C;"></i>
            Agendamento Cancelado
        </h3>`;

    $("#btnViagem, #btnImprime, #btnConfirma, #btnApaga, #btnCancela").hide();
}

/**
 * Configura interface para viagem aberta
 */
function configurarViagemAberta(viagem)
{
    document.getElementById("Titulo").innerHTML =
        `<h3 class='modal-title'>` +
        `<i class='fa-duotone fa-solid fa-suitcase-rolling' aria-hidden='true'></i> ` +
        `Exibindo Viagem (Aberta)` +
        `</h3>`;

    exibirCamposViagem(viagem);
}

// ========================================================================
// FUNÇÕES AUXILIARES - CONTROLES DE INTERFACE
// ========================================================================

/**
 * Exibe campos específicos de viagem
 */
function exibirCamposViagem(viagem)
{
    try
    {
        const camposViagem = [
            "divNoFichaVistoria", "divDataFinal", "divHoraFinal", "divDuracao",
            "divKmAtual", "divKmInicial", "divKmFinal", "divQuilometragem",
            "divCombustivelInicial", "divCombustivelFinal"
        ];

        camposViagem.forEach(id =>
        {
            const elemento = document.getElementById(id);
            if (elemento) elemento.style.display = "block";
        });

        const txtNoFichaVistoria = document.getElementById("txtNoFichaVistoria");
        if (txtNoFichaVistoria && viagem.noFichaVistoria)
        {
            txtNoFichaVistoria.value = viagem.noFichaVistoria;
        }
    }
    catch (error)
    {
        console.error("Erro ao exibir campos de viagem:", error);
    }
}

/**
 * Desabilita todos os controles do formulário
 */
function desabilitarTodosControles()
{
    try
    {
        // Desabilita campos HTML nativos
        const divModal = document.getElementById("divModal");
        if (divModal)
        {
            const childNodes = divModal.getElementsByTagName("*");
            for (const node of childNodes)
            {
                node.disabled = true;
            }
        }

        // Desabilita componentes EJ2
        const componentesEJ2 = [
            "txtDataInicial", "txtDataFinal", "lstFinalidade",
            "lstMotorista", "lstVeiculo", "lstRequisitante",
            "ddtSetor", "cmbOrigem", "cmbDestino",
            "ddtCombustivelInicial", "ddtCombustivelFinal", "rteDescricao"
        ];

        componentesEJ2.forEach(id =>
        {
            const elemento = document.getElementById(id);
            if (elemento && elemento.ej2_instances && elemento.ej2_instances[0])
            {
                elemento.ej2_instances[0].enabled = false;
            }
        });

        // Desabilita botão requisitante
        const btnRequisitante = document.getElementById("btnRequisitante");
        if (btnRequisitante)
        {
            btnRequisitante.classList.add("disabled");
            btnRequisitante.addEventListener("click", function (event)
            {
                event.preventDefault();
            });
        }
    }
    catch (error)
    {
        console.error("Erro ao desabilitar controles:", error);
    }
}

function InitializeCalendar(URL)
{
    try
    {
        function hideAgendaSpinners()
        {
            try
            {
                var root = document.getElementById('agenda');
                if (!root) return;
                root.querySelectorAll('.fc-spinner').forEach(function (el)
                {
                    try
                    {
                        el.style.setProperty('display', 'none', 'important');
                        el.style.setProperty('visibility', 'hidden', 'important');
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.forEach_callback", error);
                    }
                });
                root.querySelectorAll('.e-spinner-pane, .e-spin-overlay, .e-spin-show').forEach(function (el)
                {
                    try
                    {
                        el.remove();
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.forEach_callback", error);
                        el.style.setProperty('display', 'none', 'important');
                        el.style.setProperty('visibility', 'hidden', 'important');
                    }
                });
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.hideAgendaSpinners", error);
            }
        }

        if (window.FtxSpin) FtxSpin.show('Carregando agenda…');
        let firstPaintDone = false;
        const firstHide = () =>
        {
            try
            {
                if (!firstPaintDone)
                {
                    firstPaintDone = true;
                    if (window.FtxSpin) FtxSpin.hide();
                }
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "firstHide", error);
            }
        };

        var calendarEl = document.getElementById("agenda");
        calendar = new FullCalendar.Calendar(calendarEl, {
            timeZone: "local",
            lazyFetching: true,
            headerToolbar: {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay"
            },
            initialView: "diaSemana",
            views: {
                diaSemana: {
                    buttonText: "Dia",
                    type: "timeGridDay",
                    weekends: true
                },
                listDay: {
                    buttonText: "Lista do dia",
                    weekends: true
                },
                weekends: {
                    buttonText: "Fins de Semana",
                    type: "timeGridWeek",
                    weekends: true,
                    hiddenDays: [1, 2, 3, 4, 5]
                }
            },
            locale: "pt",
            selectable: true,
            editable: true,
            navLinks: true,
            events: function (fetchInfo, successCallback, failureCallback)
            {
                try
                {
                    function addDaysLocal(dateString, days)
                    {
                        try
                        {
                            if (!dateString) return null;
                            var d = new Date(dateString);
                            if (isNaN(d)) return null;
                            d.setDate(d.getDate() + (Number.isFinite(days) ? days : 0));
                            var pad = function (n)
                            {
                                try
                                {
                                    return String(n).padStart(2, '0');
                                } catch (error)
                                {
                                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.pad", error);
                                }
                            };
                            return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.addDaysLocal", error);
                            return null;
                        }
                    }
                    $.ajax({
                        url: URL,
                        type: "GET",
                        dataType: "json",
                        data: {
                            start: fetchInfo.startStr,
                            end: fetchInfo.endStr
                        }
                    }).done(function (data)
                    {
                        try
                        {
                            var raw = Array.isArray(data) ? data : data && data.data || [];
                            var events = [];
                            for (var i = 0; i < raw.length; i++)
                            {
                                var item = raw[i];
                                try
                                {
                                    var start = addDaysLocal(item.start, 1);
                                    var end = addDaysLocal(item.end, 1);
                                    if (!start) continue;
                                    events.push({
                                        id: item.id,
                                        title: item.title,
                                        description: item.descricao,
                                        start: start,
                                        end: end,
                                        backgroundColor: item.backgroundColor,
                                        textColor: item.textColor,
                                        allDay: false
                                    });
                                } catch (e)
                                {
                                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.mapItem", e);
                                }
                            }
                            successCallback(events);
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.done_callback", error);
                            if (typeof failureCallback === 'function') failureCallback(error);
                            successCallback([]);
                        } finally
                        {
                            setTimeout(hideAgendaSpinners, 0);
                        }
                    }).fail(function (xhr, status, err)
                    {
                        try
                        {
                            if (typeof failureCallback === 'function') failureCallback(err);
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.fail_callback", error);
                        } finally
                        {
                            successCallback([]);
                        }
                    });
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.events", error);
                }
            },
            eventClick: function (info)
            {
                try
                {
                    var idViagem = info.event.id;
                    console.log("ID: " + idViagem);
                    info.jsEvent.preventDefault();
                    $.ajax({
                        type: "GET",
                        url: "/api/Agenda/RecuperaViagem",
                        data: {
                            id: idViagem
                        },
                        contentType: "application/json",
                        dataType: "json",
                        success: function (response)
                        {
                            try
                            {
                                console.log(response.data.viagemId);
                                console.log(response.data.dataInicial);
                                console.log(response.data.horaInicio);
                                viagemId_AJAX = response.data.viagemId;
                                viagemId = response.data.viagemId;
                                recorrenciaViagemId_AJAX = response.data.recorrenciaViagemId;
                                recorrenciaViagemId = response.data.recorrenciaViagemId;
                                dataInicial_List = response.data.dataInicial;
                                const dataInicialISO = response.data.dataInicial;
                                const dataTemp = new Date(dataInicialISO);

                                dataInicial = new Intl.DateTimeFormat("pt-BR").format(dataTemp);
                                ExibeViagem(response.data);
                            } catch (error)
                            {
                                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.success", error);
                            }
                        }
                    });
                    limparCamposModalViagens();
                    $("#modalViagens").modal("show");
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "eventClick", error);
                }
            },
            eventDidMount: function (info)
            {
                try
                {
                    const description = info.event.extendedProps.description || "Sem descrição";
                    info.el.setAttribute("title", description);
                    new bootstrap.Tooltip(info.el, {
                        customClass: 'tooltip-ftx-azul'
                    });
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.eventDidMount", error);
                }
            },
            loading: function (isLoading)
            {
                try
                {
                    if (!isLoading)
                    {
                        try
                        {
                            firstHide && firstHide();
                        } catch (_) { }
                        setTimeout(hideAgendaSpinners, 0);
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.loading", error);
                }
            },
            viewDidMount: function ()
            {
                try
                {
                    try
                    {
                        firstHide && firstHide();
                    } catch (_) { }
                    setTimeout(hideAgendaSpinners, 0);
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.viewDidMount", error);
                }
            },
            eventSourceFailure: function ()
            {
                try
                {
                    try
                    {
                        firstHide && firstHide();
                    } catch (_) { }
                    setTimeout(hideAgendaSpinners, 0);
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.eventSourceFailure", error);
                }
            },
            select: function (info)
            {
                try
                {
                    // 1) Pega a data/hora clicada (não a hora atual!)
                    const start = info.start ? new Date(info.start) : new Date();

                    // 2) Arredonda a hora para intervalos de 10 minutos
                    const horaArredondada = arredondarHora(start, 10);

                    // 3) Cria um novo Date com a hora arredondada
                    const startArredondado = moment(start).set({
                        'hour': parseInt(horaArredondada.split(':')[0]),
                        'minute': parseInt(horaArredondada.split(':')[1]),
                        'second': 0,
                        'millisecond': 0
                    }).toDate();

                    const startStr = moment(startArredondado).format("YYYY-MM-DD HH:mm:ss");
                    const dataStr = moment(startArredondado).format("YYYY-MM-DD");

                    console.log("Data/Hora original:", moment(start).format("YYYY-MM-DD HH:mm:ss"));
                    console.log("Data/Hora arredondada:", startStr);

                    // 4) Passa a data e hora arredondada para ExibeViagem
                    ExibeViagem("", startArredondado, horaArredondada);

                    CarregandoAgendamento = true;

                    // 5) Limpa e abre modal
                    limparCamposModalViagens();
                    $("#modalViagens").modal("show");

                    // 6) Preenche DATA
                    const elData = document.getElementById("txtDataInicial");
                    if (elData && elData.ej2_instances && elData.ej2_instances.length)
                    {
                        elData.ej2_instances[0].value = startArredondado;
                        elData.ej2_instances[0].dataBind?.();
                    } else if (elData)
                    {
                        elData.value = dataStr;
                    }

                    // 7) Preenche HORA com a hora arredondada
                    const elHora = document.getElementById("txtHoraInicial");
                    if (elHora && elHora.ej2_instances && elHora.ej2_instances.length)
                    {
                        elHora.ej2_instances[0].value = startArredondado;
                        elHora.ej2_instances[0].dataBind?.();
                    } else if (elHora)
                    {
                        elHora.value = horaArredondada;
                    }

                    // 8) Cálculo
                    calcularDuracaoViagem();
                    CarregandoAgendamento = false;
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("ViagemIndex.js", "Agenda.select", error);
                }
            },
            selectOverlap: function (event)
            {
                try
                {
                    return !event.block;
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.selectOverlap", error);
                }
            }
        });
        calendar.render();

        setTimeout(firstHide, 10000);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "Agenda.InitializeCalendar", error);
    }
}

let isFetching = false;

function formatDate(dateObj)
{
    try
    {
        const day = ("0" + dateObj.getDate()).slice(-2);
        const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "formatDate", error);
    }
}

function hideAccordionRequisitante()
{
    try
    {
        $("#txtPonto").val("");
        $("#txtNome").val("");
        $("#txtRamal").val("");
        $("#txtEmail").val("");
        var ddSetor = document.getElementById("ddtSetorRequisitante");
        if (ddSetor && Array.isArray(ddSetor.ej2_instances) && ddSetor.ej2_instances[0])
        {
            ddSetor.ej2_instances[0].value = "";
            if (typeof ddSetor.ej2_instances[0].dataBind === "function")
            {
                ddSetor.ej2_instances[0].dataBind();
            }
        }

        document.getElementById("accordionRequisitante").style.display = "none";
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "hideAccordionRequisitante", error);
    }
}

document.addEventListener("click", function (event)
{
    try
    {
        var accordionElement = document.getElementById("accordionRequisitante");
        var btnRequisitante = document.getElementById("btnRequisitante");

        if (!accordionElement.contains(event.target) && event.target !== btnRequisitante)
        {
            hideAccordionRequisitante();
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "addEventListener:click_callback", error);
    }
});

var toggleAccordionBtnRequisitante = document.getElementById("btnRequisitante");
var accordionElementRequisitante = document.getElementById("accordionRequisitante");
accordionElementRequisitante.style.display = "none";
toggleAccordionBtnRequisitante.addEventListener("click", function ()
{
    try
    {
        var displayValue = window.getComputedStyle(accordionElementRequisitante).display;
        if (displayValue === "none")
        {
            accordionElementRequisitante.style.display = "block";
        } else
        {
            hideAccordionRequisitante();
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "addEventListener:click_callback", error);
    }
});

var toggleAccordionBtnEvento = document.getElementById("btnEvento");
var accordionElementEvento = document.getElementById("accordionEvento");
accordionElementEvento.style.display = "none";

toggleAccordionBtnEvento.addEventListener("click", function ()
{
    try
    {
        var displayValue = window.getComputedStyle(accordionElementEvento).display;
        if (displayValue === "none")
        {
            accordionElementEvento.style.display = "block";
        } else
        {
            hideAccordionEvento();
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "addEventListener:click_callback", error);
    }
});

document.head.insertAdjacentHTML("beforeend", `
    <style>
        .custom-dialog-style .e-dlg-header {
            background: none;
            border-bottom: none;
        }
        .custom-dialog-style .e-footer-content {
            text-align: center;
        }
        .custom-ok-button {
            background-color: #3498db !important;
            color: white !important;
            border: none;
            font-size: 14px;
            padding: 8px 16px;
        }
        .custom-ok-button:hover {
            background-color: #2980b9 !important;
        }
    </style>
    `);

document.getElementById("txtFinalRecorrencia").addEventListener("focusout", function ()
{
    try
    {
        const txtDataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;
        const txtFinalRecorrencia = document.getElementById("txtFinalRecorrencia").value;
        if (txtDataInicial && txtFinalRecorrencia)
        {
            const dataInicial = moment(txtDataInicial, "DD-MM-YYYY");
            const dataFinal = moment(txtFinalRecorrencia, "DD-MM-YYYY");

            const diferencaDias = dataFinal.diff(dataInicial, "days");
            if (diferencaDias > 365)
            {
                Alerta.Warning("Atenção", "A data final não pode ser maior que 365 dias após a data inicial");
                document.getElementById("txtFinalRecorrencia").value = "";
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "addEventListener:focusout_callback", error);
    }
});

$("#modalViagens").on("shown.bs.modal", function (event)
{
    try
    {
        $(".esconde-diveventos").hide();
        $(document).off("focusin.modal");
        $("#btnConfirma").html("<i class='fa-regular fa-thumbs-up'></i> Confirmar").prop("disabled", false);
        var viagemId = document.getElementById("txtViagemId").value;
        var relatorioAsString = "";
        $.ajax({
            type: "GET",
            url: "/api/Agenda/RecuperaViagem",
            data: {
                id: viagemId
            },
            contentType: "application/json",
            dataType: "json",
            success: function (response)
            {
                try
                {
                    if (response.data.status == "Cancelada")
                    {
                        $("#btnCancela").hide();
                        CarregandoViagemBloqueada = true;
                        relatorioAsString = response.data.finalidade != "Evento" ? "FichaCancelada.trdp" : "FichaEventoCancelado.trdp";
                    } else if (response.data.finalidade == "Evento" && response.data.status != "Cancelada")
                    {
                        relatorioAsString = "FichaEvento.trdp";
                    } else if (response.data.status == "Aberta" && response.data.finalidade != "Evento")
                    {
                        relatorioAsString = "FichaAberta.trdp";
                    } else if (response.data.status == "Realizada")
                    {
                        CarregandoViagemBloqueada = true;
                        relatorioAsString = response.data.finalidade != "Evento" ? "FichaRealizada.trdp" : "FichaEventoRealizado.trdp";
                    } else if (response.data.statusAgendamento == true)
                    {
                        relatorioAsString = response.data.finalidade != "Evento" ? "FichaAgendamento.trdp" : "FichaEventoAgendado.trdp";
                    }
                    calcularDistanciaViagem();
                    calcularDuracaoViagem();

                    $("#fichaReport").telerik_ReportViewer({
                        serviceUrl: "/api/reports/",
                        reportSource: {
                            report: relatorioAsString,
                            parameters: {
                                ViagemId: viagemId.toString().toUpperCase()
                            }
                        },
                        viewMode: telerikReportViewer.ViewModes.PRINT_PREVIEW,
                        scaleMode: telerikReportViewer.ScaleModes.SPECIFIC,
                        scale: 1.0,
                        enableAccessibility: false,
                        sendEmail: {
                            enabled: true
                        }
                    });

                    $("#ReportContainer").addClass("visible").css("height", "200px").show();
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "success", error);
                }
            }
        });
        const novaDataMinima = new Date();
        const datePickerElement = document.getElementById("txtDataInicial");
        const datePickerInstance = datePickerElement.ej2_instances[0];
        novaDataMinima.setDate(novaDataMinima.getDate() - 1);
        datePickerInstance.setProperties({
            min: novaDataMinima
        });
        datePickerInstance.min = novaDataMinima;
        console.log("datePickerInstance");
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "on_callback", error);
    }
}).on("hide.bs.modal", function (event)
{
    try
    {
        $("#fichaReport").remove();
        $("#ReportContainer").append("<div id='fichaReport' style='width:100%' class='pb-3'> Carregando... </div>");
        $(document.body).removeClass("modal-open");
        $(".modal-backdrop").remove();
        $(document.body).css("overflow", "");
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "on_callback", error);
    }
});

var defaultRTE;
var StatusViagem = "Aberta";
var calendar;
var InserindoRequisitante = false;
var CarregandoAgendamento = false;
$(document).ready(function ()
{
    if ($.fn.modal && $.fn.modal.Constructor)
    {
        $.fn.modal.Constructor.prototype.enforceFocus = function ()
        {
            try { } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "enforceFocus", error);
            }
        };
    }
});

function onCreate()
{
    try
    {
        defaultRTE = this;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "onCreate", error);
    }
}

function toolbarClick(e)
{
    try
    {
        if (e.item.id == "rte_toolbar_Image")
        {
            var element = document.getElementById("rte_upload");
            element.ej2_instances[0].uploading = function upload(args)
            {
                try
                {
                    args.currentRequest.setRequestHeader("XSRF-TOKEN", document.getElementsByName("__RequestVerificationToken")[0].value);
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "upload", error);
                }
            };
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "toolbarClick", error);
    }
}

$("#btnViagem").click(function (event)
{
    try
    {
        event.preventDefault();
        $("#btnViagem").hide();
        $("#btnConfirma").html("<i class='fa fa-save' aria-hidden='true'></i>Registra Viagem");
        document.getElementById("divNoFichaVistoria").style.display = "block";
        document.getElementById("divDataFinal").style.display = "block";
        document.getElementById("divHoraFinal").style.display = "block";
        document.getElementById("divDuracao").style.display = "block";
        document.getElementById("divKmAtual").style.display = "block";
        document.getElementById("divKmInicial").style.display = "block";
        document.getElementById("txtKmInicial").value = "";
        document.getElementById("divKmFinal").style.display = "block";
        document.getElementById("txtKmFinal").value = "";
        document.getElementById("divQuilometragem").style.display = "block";
        document.getElementById("divCombustivelInicial").style.display = "block";
        document.getElementById("divCombustivelFinal").style.display = "block";
        $("#txtStatusAgendamento").val(false);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "click_callback", error);
    }
});

$("#btnApaga").click(async function (event)
{
    try
    {
        var viagemId = document.getElementById("txtViagemId").value;
        var recorrenciaViagemId = document.getElementById("txtRecorrenciaViagemId").value;
        var rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];
        let titulo = "";
        if (recorrenciaViagemId != null && recorrenciaViagemId != "" || recorrenciaViagemId != "00000000-0000-0000-0000-000000000000")
        {
            titulo = "Você gostaria de apagar todos os agendamentos recorrentes? Ou somente o atual?";
        } else
        {
            titulo = "Você gostaria de apagar este agendamento?";
        }
        const confirmacao = await Alerta.Confirmar(titulo, "Não será possível recuperar os dados eliminados", "Apagar Todos", "Apenas Atual");
        if (confirmacao)
        {
            try
            {
                if (recorrenciaViagemId === "00000000-0000-0000-0000-000000000000")
                {
                    await excluirAgendamento(viagemId);
                    recorrenciaViagemId = viagemId;
                }
                const agendamentosRecorrentes = await obterAgendamentosRecorrentes(recorrenciaViagemId);
                for (const agendamento of agendamentosRecorrentes)
                {
                    await excluirAgendamento(agendamento.viagemId);
                    await delay(200);
                }
                AppToast.show("Verde", "Todos os agendamentos foram excluídos com sucesso!", 3000);
                $("#modalViagens").modal("hide");
                $(document.body).removeClass("modal-open");
                $(".modal-backdrop").remove();
                $(document.body).css("overflow", "");
                calendar.refetchEvents();
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "anonymous", error);
            }
        } else
        {
            excluirAgendamento(viagemId);
            AppToast.show("Verde", "O agendamento foi excluído com sucesso!", 3000);
            $("#modalViagens").modal("hide");
            $(document.body).removeClass("modal-open");
            $(".modal-backdrop").remove();
            $(document.body).css("overflow", "");
            calendar.refetchEvents();
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "click_callback", error);
    }
});

async function excluirAgendamento(viagemId)
{
    try
    {
        var objAgendamento = JSON.stringify({
            ViagemId: viagemId
        });
        $.ajax({
            type: "post",
            url: "/api/Agenda/ApagaAgendamento",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: objAgendamento,
            success: function (data)
            {
                try
                {
                    if (data.success)
                    {
                        //AppToast.show(data.message, "Verde", 2000);
                        $("#modalViagens").modal("hide");
                        $(document.body).removeClass("modal-open");
                        $(".modal-backdrop").remove();
                        $(document.body).css("overflow", "");
                        calendar.refetchEvents();
                    } else
                    {
                        AppToast.show("Vermelho", data.message, 2000);
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "success", error);
                }
            },
            error: function (err)
            {
                try
                {
                    console.log("Erro:  " + err.responseText);
                    Alerta.Erro("Erro", "Algo deu errado");
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "error", error);
                }
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "excluirAgendamento", error);
    }
}

$("#btnCancela").click(async function (event)
{
    try
    {
        var viagemId = document.getElementById("txtViagemId").value;
        var recorrenciaViagemId = document.getElementById("txtRecorrenciaViagemId").value;
        var rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];
        let titulo = "";

        // Verificar se é recorrente
        const isRecorrente = recorrenciaViagemId &&
            recorrenciaViagemId !== "" &&
            recorrenciaViagemId !== "00000000-0000-0000-0000-000000000000";

        if (isRecorrente)
        {
            titulo = "Você gostaria de cancelar todos os agendamentos recorrentes? Ou somente o atual?";
        } else
        {
            titulo = "Você gostaria de cancelar este agendamento?";
        }

        const confirmacao = await Alerta.Confirmar(titulo, "Não será possível desfazer essa ação", "Cancelar Todos", "Apenas Atual");

        console.log(`🔍 isRecorrente: ${isRecorrente}`);
        console.log(`🔍 confirmacao: ${confirmacao}`);

        if (confirmacao && isRecorrente)
        {
            // === CANCELAR TODOS OS RECORRENTES ===
            console.log("📋 ENTRANDO NO BLOCO: Cancelar Todos os Recorrentes");
            try
            {
                const recorrenciaId = recorrenciaViagemId === "00000000-0000-0000-0000-000000000000"
                    ? viagemId
                    : recorrenciaViagemId;

                const agendamentosRecorrentes = await obterAgendamentosRecorrentes(recorrenciaId);

                let cancelados = 0;

                for (const agendamento of agendamentosRecorrentes)
                {
                    await cancelarAgendamento(agendamento.viagemId, rteDescricao.value, false);
                    cancelados++;
                    await delay(200);
                }

                // Toast para múltiplos cancelamentos
                if (cancelados === 1)
                {
                    AppToast.show("Verde", "O agendamento foi cancelado com sucesso!", 2000);
                } else
                {
                    AppToast.show("Verde", `${cancelados} agendamentos foram cancelados com sucesso!`, 2000);
                }
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "cancelar_recorrentes", error);
            }
        } else
        {
            // === CANCELAR APENAS UM AGENDAMENTO ===
            if (isRecorrente)
            {
                console.log("📋 ENTRANDO NO BLOCO: Cancelar Apenas o Atual (de uma série recorrente)");
            } else
            {
                console.log("📋 ENTRANDO NO BLOCO: Cancelar Agendamento Único");
            }

            try
            {
                // Determinar mensagem baseada no contexto
                const mensagemPersonalizada = isRecorrente
                    ? "O agendamento atual foi cancelado com sucesso!"
                    : "O agendamento foi cancelado com sucesso!";

                // Cancelar usando a função padrío mas SEM mostrar toast
                await cancelarAgendamento(viagemId, rteDescricao.value, false);

                // Mostrar toast personalizado
                AppToast.show("Verde", mensagemPersonalizada, 2000);
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "cancelar_unico", error);
            }
        }

        // === FECHAR MODAL E ATUALIZAR AGENDA ===
        $("#modalViagens").modal("hide");
        $(document.body).removeClass("modal-open");
        $(".modal-backdrop").remove();
        $(document.body).css("overflow", "");

        if (window.calendar && typeof calendar.refetchEvents === 'function')
        {
            calendar.refetchEvents();
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "btnCancela_click", error);
    }
});

async function cancelarAgendamento(viagemId, descricao, mostrarToast = true)
{
    try
    {
        console.log(`🎯 cancelarAgendamento - viagemId: ${viagemId}, mostrarToast: ${mostrarToast}`);

        var objAgendamento = JSON.stringify({
            ViagemId: viagemId,
            Descricao: descricao
        });

        return new Promise((resolve, reject) =>
        {
            $.ajax({
                type: "post",
                url: "/api/Agenda/CancelaAgendamento",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: objAgendamento,
                success: function (data)
                {
                    try
                    {
                        if (data.success)
                        {
                            // ✅ SÓ mostra toast se mostrarToast for true (raramente usado agora)
                            if (mostrarToast)
                            {
                                console.log("✅ Mostrando toast da função cancelarAgendamento");
                                AppToast.show("Verde", "O agendamento foi cancelado com sucesso!", 2000);
                            }
                            resolve(data);
                        } else
                        {
                            AppToast.show("Vermelho", data.message, 2000);
                            reject(new Error(data.message));
                        }
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "cancelarAgendamento_success", error);
                        reject(error);
                    }
                },
                error: function (err)
                {
                    try
                    {
                        Alerta.Erro("Erro", "Algo deu errado");
                        reject(err);
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "cancelarAgendamento_error", error);
                        reject(error);
                    }
                }
            });
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "cancelarAgendamento", error);
        throw error;
    }
}

$("#btnImprime").click(function (event)
{
    try
    {
        var viagemId = document.getElementById("txtViagemId").value;
        $("#fichaReport").telerik_ReportViewer({
            serviceUrl: "/api/reports/",
            reportSource: {
                report: "Agendamento.trdp",
                parameters: {
                    ViagemId: viagemId.toString().toUpperCase()
                }
            },
            viewMode: telerikReportViewer.ViewModes.PRINT_PREVIEW,
            scaleMode: telerikReportViewer.ScaleModes.SPECIFIC,
            scale: 1.0,
            enableAccessibility: false,
            sendEmail: {
                enabled: true
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "click_callback", error);
    }
});

ej.base.L10n.load({
    "pt-BR": {
        richtexteditor: {
            alignments: "Alinhamentos",
            justifyLeft: "Alinhar à Esquerda",
            justifyCenter: "Centralizar",
            justifyRight: "Alinhar à Direita",
            justifyFull: "Justificar",
            fontName: "Nome da Fonte",
            fontSize: "Tamanho da Fonte",
            fontColor: "Cor da Fonte",
            backgroundColor: "Cor de Fundo",
            bold: "Negrito",
            italic: "Itálico",
            underline: "Sublinhado",
            strikethrough: "Tachado",
            clearFormat: "Limpa Formatação",
            clearAll: "Limpa Tudo",
            cut: "Cortar",
            copy: "Copiar",
            paste: "Colar",
            unorderedList: "Lista com Marcadores",
            orderedList: "Lista Numerada",
            indent: "Aumentar Identação",
            outdent: "Diminuir Identação",
            undo: "Desfazer",
            redo: "Refazer",
            superscript: "Sobrescrito",
            subscript: "Subscrito",
            createLink: "Inserir Link",
            openLink: "Abrir Link",
            editLink: "Editar Link",
            removeLink: "Remover Link",
            image: "Inserir Imagem",
            replace: "Substituir",
            align: "Alinhar",
            caption: "Título da Imagem",
            remove: "Remover",
            insertLink: "Inserir Link",
            display: "Exibir",
            altText: "Texto Alternativo",
            dimension: "Mudar Tamanho",
            fullscreen: "Maximizar",
            maximize: "Maximizar",
            minimize: "Minimizar",
            lowerCase: "Caixa Baixa",
            upperCase: "Caixa Alta",
            print: "Imprimir",
            formats: "Formatos",
            sourcecode: "Visualizar Código",
            preview: "Exibir",
            viewside: "ViewSide",
            insertCode: "Inserir Código",
            linkText: "Exibir Texto",
            linkTooltipLabel: "Título",
            linkWebUrl: "Endereço Web",
            linkTitle: "Entre com um título",
            linkurl: "http://exemplo.com",
            linkOpenInNewWindow: "Abrir Link em Nova Janela",
            linkHeader: "Inserir Link",
            dialogInsert: "Inserir",
            dialogCancel: "Cancelar",
            dialogUpdate: "Atualizar",
            imageHeader: "Inserir Imagem",
            imageLinkHeader: "Você pode proporcionar um link da web",
            mdimageLink: "Favor proporcionar uma URL para sua imagem",
            imageUploadMessage: "Solte a imagem aqui ou busque para o upload",
            imageDeviceUploadMessage: "Clique aqui para o upload",
            imageAlternateText: "Texto Alternativo",
            alternateHeader: "Texto Alternativo",
            browse: "Procurar",
            imageUrl: "http://exemplo.com/imagem.png",
            imageCaption: "Título",
            imageSizeHeader: "Tamanho da Imagem",
            imageHeight: "Altura",
            imageWidth: "Largura",
            textPlaceholder: "Entre com um Texto",
            inserttablebtn: "Inserir Tabela",
            tabledialogHeader: "Inserir Tabela",
            tableWidth: "Largura",
            cellpadding: "Espaçamento de célula",
            cellspacing: "Espaçamento de célula",
            columns: "Número de colunas",
            rows: "Número de linhas",
            tableRows: "Linhas da Tabela",
            tableColumns: "Colunas da Tabela",
            tableCellHorizontalAlign: "Alinhamento Horizontal da Célular",
            tableCellVerticalAlign: "Alinhamento Vertical da Célular",
            createTable: "Criar Tabela",
            removeTable: "Remover Tabela",
            tableHeader: "Cabeçalho da Tabela",
            tableRemove: "Remover Tabela",
            tableCellBackground: "Fundo da Célula",
            tableEditProperties: "Editar Propriedades da Tabela",
            styles: "Estilos",
            insertColumnLeft: "Inserir Coluna à Esquerda",
            insertColumnRight: "Inserir Coluna à Direita",
            deleteColumn: "Apagar Coluna",
            insertRowBefore: "Inserir Linha Antes",
            insertRowAfter: "Inserir Linha Depois",
            deleteRow: "Apagar Linha",
            tableEditHeader: "Edita Tabela",
            TableHeadingText: "Cabeção",
            TableColText: "Col",
            imageInsertLinkHeader: "Inserir Link",
            editImageHeader: "Edita Imagem",
            alignmentsDropDownLeft: "Alinhar à Esquerda",
            alignmentsDropDownCenter: "Centralizar",
            alignmentsDropDownRight: "Alinhar à Direita",
            alignmentsDropDownJustify: "Justificar",
            imageDisplayDropDownInline: "Inline",
            imageDisplayDropDownBreak: "Break",
            tableInsertRowDropDownBefore: "Inserir linha antes",
            tableInsertRowDropDownAfter: "Inserir linha depois",
            tableInsertRowDropDownDelete: "Apagar linha",
            tableInsertColumnDropDownLeft: "Inserir coluna à esquerda",
            tableInsertColumnDropDownRight: "Inserir coluna à direita",
            tableInsertColumnDropDownDelete: "Apagar Coluna",
            tableVerticalAlignDropDownTop: "Alinhar no Topo",
            tableVerticalAlignDropDownMiddle: "Alinhar no Meio",
            tableVerticalAlignDropDownBottom: "Alinhar no Fundo",
            tableStylesDropDownDashedBorder: "Bordas Pontilhadas",
            tableStylesDropDownAlternateRows: "Linhas Alternadas",
            pasteFormat: "Colar Formato",
            pasteFormatContent: "Escolha a ação de formatação",
            plainText: "Texto Simples",
            cleanFormat: "Limpar",
            keepFormat: "Manter",
            formatsDropDownParagraph: "Parágrafo",
            formatsDropDownCode: "Código",
            formatsDropDownQuotation: "Citação",
            formatsDropDownHeading1: "Cabeçalho 1",
            formatsDropDownHeading2: "Cabeçalho 2",
            formatsDropDownHeading3: "Cabeçalho 3",
            formatsDropDownHeading4: "Cabeçalho 4",
            fontNameSegoeUI: "SegoeUI",
            fontNameArial: "Arial",
            fontNameGeorgia: "Georgia",
            fontNameImpact: "Impact",
            fontNameTahoma: "Tahoma",
            fontNameTimesNewRoman: "Times New Roman",
            fontNameVerdana: "Verdana"
        }
    }
});

$("#txtDataFinal").focusout(function ()
{
    try
    {
        let DataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;
        let DataFinal = $("#txtDataFinal").val();
        if (DataFinal === "")
        {
            return;
        }
        if (DataFinal < DataInicial)
        {
            Alerta.Erro("Atenção", "A data final deve ser maior que a inicial");
            $("#txtDataFinal").val("");
        }
        calcularDuracaoViagem();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "focusout_callback", error);
    }
});

$("#txtDataInicial").focusout(function ()
{
    try
    {
        let lstDataInicial = document.getElementById("txtDataInicial").ej2_instances[0];
        let valDataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;
        let DataFinal = $("#txtDataFinal").val();
        if (!valDataInicial || !moment(valDataInicial).isValid() || valDataInicial === null)
        {
            lstDataInicial.value = moment().toDate();
            lstDataInicial.dataBind();
            return;
        }
        if (valDataInicial === "" || DataFinal === "")
        {
            return;
        }
        if (valDataInicial > DataFinal)
        {
            $("#txtDataInicial").val("");
            Alerta.Erro("Atenção", "A data inicial deve ser menor que a final");
        }
        calcularDuracaoViagem();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "focusout_callback", error);
    }
});

$("#txtHoraFinal").focusout(function ()
{
    try
    {
        let HoraInicial = $("#txtHoraInicial").val();
        let HoraFinal = $("#txtHoraFinal").val();
        let DataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;
        let DataFinal = $("#txtDataFinal").val();
        if (DataFinal === "")
        {
            $("#txtHoraFinal").val("");
            Alerta.Erro("Atenção", "Preencha a Data Final para poder preencher a Hora Final");
        }
        if (HoraFinal < HoraInicial && DataInicial === DataFinal)
        {
            $("#txtHoraFinal").val("");
            Alerta.Erro("Atenção", "A hora final deve ser maior que a inicial");
        }
        calcularDuracaoViagem();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "focusout_callback", error);
    }
});

$("#txtHoraInicial").focusout(function ()
{
    try
    {
        let HoraInicial = $("#txtHoraInicial").val();
        let HoraFinal = $("#txtHoraFinal").val();
        console.log(HoraInicial);
        console.log(HoraFinal);
        if (HoraFinal === "")
        {
            return;
        }
        if (HoraInicial > HoraFinal)
        {
            $("#txtHoraInicial").val("");
            Alerta.Erro("Atenção", "A hora inicial deve ser menor que a final");
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "focusout_callback", error);
    }
});

$("#txtKmInicial").focusout(function ()
{
    try
    {
        const kmInicialStr = $("#txtKmInicial").val();
        const kmAtualStr = $("#txtKmAtual").val();
        if (!kmInicialStr || !kmAtualStr)
        {
            $("#txtKmPercorrido").val("");
            return;
        }
        const kmInicial = parseFloat(kmInicialStr.replace(",", "."));
        const kmAtual = parseFloat(kmAtualStr.replace(",", "."));
        if (isNaN(kmInicial) || isNaN(kmAtual))
        {
            $("#txtKmPercorrido").val("");
            return;
        }
        if (kmInicial < 0)
        {
            $("#txtKmInicial").val("");
            $("#txtKmPercorrido").val("");
            Alerta.Erro("Erro na Quilometragem", "A quilometragem <strong>inicial</strong> deve ser maior que <strong>zero</strong>!");
            return;
        }
        if (kmInicial < kmAtual)
        {
            $("#txtKmInicial").val("");
            $("#txtKmPercorrido").val("");
            Alerta.Erro("Erro na Quilometragem", "A quilometragem <strong>inicial</strong> deve ser maior que a <strong>atual</strong>!");
            return;
        }

        calcularDistanciaViagem();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "focusout_callback", error);
    }
});

$("#txtKmFinal").focusout(function ()
{
    try
    {
        let kmInicial = parseInt($("#txtKmInicial").val());
        let kmFinal = parseInt($("#txtKmFinal").val());
        if (kmFinal < kmInicial)
        {
            $("#txtKmFinal").val("");
            Alerta.Erro("Erro na Quilometragem", "A quilometragem final deve ser maior que a inicial");
        }
        if (kmFinal - kmInicial > 100)
        {
            Alerta.Warning("Alerta na Quilometragem", "A quilometragem final excede em 100km a inicial");
        }
        calcularDistanciaViagem();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "focusout_callback", error);
    }
});

$("#txtKmInicial").focusout(function ()
{
    try
    {
        let kmInicial = parseInt($("#txtKmInicial").val());
        let kmFinal = parseInt($("#txtKmFinal").val());
        if (kmInicial > kmFinal)
        {
            $("#txtKmInicial").val("");
            Alerta.Erro("Erro na Quilometragem", "A quilometragem inicial deve ser menor que a final");
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "focusout_callback", error);
    }
});

$("#txtKmInicial").focusout(function ()
{
    try
    {
        if ($("#txtKmInicial").val() === "" || $("#txtKmInicial").val() === null)
        {
            return;
        }
        let kmInicial = parseInt($("#txtKmInicial").val());
        let kmAtual = parseInt($("#txtKmAtual").val());
        console.log(kmInicial);
        if (kmInicial < kmAtual)
        {
            $("#txtKmInicial").val("");
            Alerta.Erro("Erro na Quilometragem", "A quilometragem inicial deve ser maior que a atual");
            return;
        }
        if (kmInicial != kmAtual)
        {
            Alerta.Erro("Erro na Quilometragem", "A quilometragem inicial não confere com a atual");
            return;
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "focusout_callback", error);
    }
});

function PreencheListaEventos()
{
    try
    {
        $.ajax({
            url: "/Viagens/Upsert?handler=AJAXPreencheListaEventos",
            method: "GET",
            datatype: "json",
            success: function (res)
            {
                try
                {
                    var eventoid = res.data[0].eventoId;
                    var nome = res.data[0].nome;
                    console.log(eventoid + " " + nome);
                    let EventoList = [{
                        EventoId: eventoid,
                        Evento: nome
                    }];
                    for (var i = 1; i < res.data.length; ++i)
                    {
                        console.log(res.data[i].eventoId + res.data[i].nome);
                        eventoid = res.data[i].eventoId;
                        nome = res.data[i].nome;
                        console.log(eventoid + " " + nome);
                        let evento = {
                            EventoId: eventoid,
                            Evento: nome
                        };
                        EventoList.push(evento);
                    }
                    console.log(EventoList);
                    document.getElementById("lstEventos").ej2_instances[0].fields.dataSource = EventoList;
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "success", error);
                }
            }
        });
        document.getElementById("lstEventos").ej2_instances[0].refresh();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "PreencheListaEventos", error);
    }
}

function PreencheListaSetores()
{
    try
    {
        $.ajax({
            url: "/Viagens/Upsert?handler=AJAXPreencheListaSetores",
            method: "GET",
            datatype: "json",
            success: function (res)
            {
                try
                {
                    var setorSolicitanteId = res.data[0].setorSolicitanteId;
                    var setorPaiId = res.data[0].setorPaiId;
                    var nome = res.data[0].nome;
                    var hasChild = res.data[0].hasChild;
                    let SetorList = [{
                        SetorSolicitanteId: setorSolicitanteId,
                        SetorPaiId: setorPaiId,
                        Nome: nome,
                        HasChild: hasChild
                    }];
                    for (var i = 1; i < res.data.length; ++i)
                    {
                        console.log(res.data[i].requisitanteId + res.data[i].requisitante);
                        setorSolicitanteId = res.data[i].setorSolicitanteId;
                        setorPaiId = res.data[i].setorPaiId;
                        nome = res.data[i].nome;
                        hasChild = res.data[i].hasChild;
                        let setor = {
                            SetorSolicitanteId: setorSolicitanteId,
                            SetorPaiId: setorPaiId,
                            Nome: nome,
                            HasChild: hasChild
                        };
                        SetorList.push(setor);
                    }
                    console.log(SetorList);
                    document.getElementById("ddtSetor").ej2_instances[0].fields.dataSource = SetorList;
                    document.getElementById("ddtSetorRequisitante").ej2_instances[0].fields.dataSource = SetorList;
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "success", error);
                }
            }
        });
        document.getElementById("ddtSetor").ej2_instances[0].refresh();
        document.getElementById("ddtSetorRequisitante").ej2_instances[0].refresh();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "PreencheListaSetores", error);
    }
}

$("#btnInserirEvento").click(async function (e)
{
    try
    {
        e.preventDefault();
        if ($("#txtNomeDoEvento").val() === "")
        {
            Alerta.Erro("Atenção", "O Nome do Evento é obrigatório");
            return;
        }
        if ($("#txtDescricao").val() === "")
        {
            Alerta.Erro("Atenção", "A Descrição do Evento é obrigatória");
            return;
        }
        if ($("#txtDataInicialEvento").val() === "")
        {
            Alerta.Erro("Atenção", "A Data Inicial é obrigatória");
            return;
        }
        if ($("#txtDataFinalEvento").val() === "")
        {
            Alerta.Erro("Atenção", "A Data Final é obrigatória");
            return;
        }
        if ($("#txtQtdPessoas").val() === "")
        {
            Alerta.Erro("Atenção", "A Quantidade de Pessoas é obrigatória");
            return;
        }
        var setores = document.getElementById("lstSetorRequisitanteEvento").ej2_instances[0];
        if (setores.value === null)
        {
            Alerta.Erro("Atenção", "O Setor do Requisitante é obrigatório");
            return;
        }
        var setorSolicitanteId = setores.value.toString();
        var requisitantes = document.getElementById("lstRequisitanteEvento").ej2_instances[0];
        if (requisitantes.value === null)
        {
            Alerta.Erro("Atenção", "O Requisitante é obrigatório");
            return;
        }
        var requisitanteId = requisitantes.value.toString();
        var objEvento = JSON.stringify({
            Nome: $("#txtNomeDoEvento").val(),
            Descricao: $("#txtDescricaoEvento").val(),
            SetorSolicitanteId: setorSolicitanteId,
            RequisitanteId: requisitanteId,
            QtdParticipantes: $("#txtQtdPessoas").val(),
            DataInicial: moment(document.getElementById("txtDataInicialEvento").value).format("MM-DD-YYYY"),
            DataFinal: moment(document.getElementById("txtDataFinalEvento").value).format("MM-DD-YYYY"),
            Status: "1"
        });
        console.log(objEvento);
        try
        {
            document.body.style.cursor = "wait";

            await $.ajax({
                type: "post",
                url: "/api/Viagem/AdicionarEvento",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: objEvento,
                success: async function (data)
                {
                    try
                    {
                        if (data.success)
                        {
                            showToastrMessageSuccess(data.message);

                            await PreencheListaEventos();

                            var dropdownInstance = document.getElementById("lstEventos").ej2_instances[0];

                            var newItem = {
                                id: data.eventoId,
                                name: data.eventoText
                            };

                            let updatedDataSource = Array.isArray(dropdownInstance.dataSource) ? dropdownInstance.dataSource : [];

                            updatedDataSource.push(newItem);

                            dropdownInstance.dataSource = updatedDataSource;

                            dropdownInstance.refresh();

                            setTimeout(() =>
                            {
                                try
                                {
                                    dropdownInstance.value = [String(newItem.id)];

                                    dropdownInstance.dataBind();
                                } catch (error)
                                {
                                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "setTimeout_callback", error);
                                }
                            }, 500);

                            hideAccordionEvento();
                        } else
                        {
                            showToastrMessageFailure(data.message);
                        }
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "success", error);
                    }
                },
                error: function (data)
                {
                    try
                    {
                        Alerta.Erro("Erro", "Algo deu errado");
                        console.log(data);
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "error", error);
                    }
                }
            });
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "anonymous", error);
        } finally
        {
            document.body.style.cursor = "default";
        }

        function showToastrMessageSuccess(message)
        {
            try
            {
                return new Promise(resolve =>
                {
                    try
                    {
                        AppToast.show("Verde", message, 2000);
                        setTimeout(resolve, 2000);
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "anonymous", error);
                    }
                });
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "showToastrMessageSuccess", error);
            }
        }

        function showToastrMessageFailure(message)
        {
            try
            {
                return new Promise(resolve =>
                {
                    try
                    {
                        AppToast.show("Vermelho", message, 2000);
                        setTimeout(resolve, 2000);
                    } catch (error)
                    {
                        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "anonymous", error);
                    }
                });
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "showToastrMessageFailure", error);
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "click_callback", error);
    }
});

$("#btnInserirRequisitante").click(function (e)
{
    try
    {
        e.preventDefault();
        if ($("#txtPonto").val() === "")
        {
            Alerta.Erro("Atenção", "O Ponto do Requisitante é obrigatório");
            return;
        }
        if ($("#txtNome").val() === "")
        {
            Alerta.Erro("Atenção", "O Nome do Requisitante é obrigatório");
            return;
        }
        if ($("#txtRamal").val() === "")
        {
            Alerta.Erro("Atenção", "O Ramal do Requisitante é obrigatório");
            return;
        }
        var setores = document.getElementById("ddtSetorRequisitante").ej2_instances[0];
        if (setores.value.toString() === "")
        {
            Alerta.Erro("Atenção", "O Setor do Requisitante é obrigatório");
            return;
        }
        var setorSolicitanteId = setores.value.toString();
        var objRequisitante = JSON.stringify({
            Nome: $("#txtNome").val(),
            Ponto: $("#txtPonto").val(),
            Ramal: $("#txtRamal").val(),
            Email: $("#txtEmail").val(),
            SetorSolicitanteId: setorSolicitanteId
        });

        $.ajax({
            type: "post",
            url: "/api/Viagem/AdicionarRequisitante",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: objRequisitante,
            success: function (data)
            {
                try
                {
                    if (data.success)
                    {
                        AppToast.show("Verde", data.message, 2000);
                        document.getElementById("lstRequisitante").ej2_instances[0].addItem({
                            RequisitanteId: data.requisitanteid,
                            Requisitante: $("#txtNome").val() + " - " + $("#txtPonto").val()
                        }, 0);
                        hideAccordionRequisitante();
                        console.log("Passei por todas as etapas do Sucess do Adiciona Requisitante no AJAX");

                        var comboBoxInstance = document.getElementById("lstRequisitante").ej2_instances[0];

                        comboBoxInstance.value = data.requisitanteid;

                        comboBoxInstance.dataBind();
                        console.log(data.requisitanteid);
                    } else
                    {
                        AppToast.show("Vermelho", data.message, 2000);
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "success", error);
                }
            },
            error: function (data)
            {
                try
                {
                    AppToast.show("Vermelho", "Já existe um requisitante com este ponto/nome", 2000);
                    console.log(data);
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "error", error);
                }
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "click_callback", error);
    }
});

document.getElementById("btnFecharAccordionRequisitante").onclick = function ()
{
    try
    {
        hideAccordionRequisitante();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "onclick", error);
    }
};

document.addEventListener("DOMContentLoaded", function ()
{
    try
    {
        try
        {
            function formatDate(dateObj)
            {
                try
                {
                    const day = ("0" + dateObj.getDate()).slice(-2);
                    const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
                    const year = dateObj.getFullYear();
                    return `${day}/${month}/${year}`;
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "formatDate", error);
                }
            }

            function addDate(dateObj)
            {
                try
                {
                    const timestamp = new Date(dateObj).setHours(0, 0, 0, 0);
                    if (!selectedDates.some(d =>
                    {
                        try
                        {
                            return d.Timestamp === timestamp;
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "some_callback", error);
                        }
                    }))
                    {
                        selectedDates.push({
                            Timestamp: timestamp,
                            DateText: formatDate(new Date(timestamp))
                        });
                        selectedDates.sort((a, b) =>
                        {
                            try
                            {
                                return a.Timestamp - b.Timestamp;
                            } catch (error)
                            {
                                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "sort_callback", error);
                            }
                        });
                        console.log("Adding date:", selectedDates);
                        listBox.dataSource = selectedDates;
                        listBox.dataBind();
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "addDate", error);
                }
            }

            window.removeDate = function (timestamp)
            {
                try
                {
                    selectedDates = selectedDates.filter(d =>
                    {
                        try
                        {
                            return d.Timestamp !== timestamp;
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "filter_callback", error);
                        }
                    });
                    console.log("Removing date:", selectedDates);
                    listBox.dataSource = selectedDates;
                    listBox.dataBind();

                    const calendarObj = document.getElementById("calDatasSelecionadas").ej2_instances[0];
                    const dateToRemove = new Date(timestamp);

                    let currentSelectedDates = calendarObj.values;

                    currentSelectedDates = currentSelectedDates.filter(date =>
                    {
                        try
                        {
                            const normalizedDate = new Date(date).setHours(0, 0, 0, 0);
                            return normalizedDate !== timestamp;
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "filter_callback", error);
                        }
                    });
                    calendarObj.values = currentSelectedDates;
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "removeDate", error);
                }
            };
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "anonymous", error);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "addEventListener:DOMContentLoaded_callback", error);
    }
});

function onDateChange(args)
{
    try
    {
        selectedDates = args.values;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "onDateChange", error);
    }
}

var dataRecorrente = [{
    text: "Sim",
    value: "S"
}, {
    text: "Não",
    value: "N"
}];

var data = [{
    text: "Diário",
    value: "D"
}, {
    text: "Semanal",
    value: "S"
}, {
    text: "Quinzenal",
    value: "Q"
}, {
    text: "Mensal",
    value: "M"
}, {
    text: "Dias Variados",
    value: "V"
}];

let rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];

rteDescricao.addEventListener("paste", function (event)
{
    try
    {
        var clipboardData = event.clipboardData;

        if (clipboardData && clipboardData.items)
        {
            var items = clipboardData.items;

            for (var i = 0; i < items.length; i++)
            {
                var item = items[i];

                if (item.type.indexOf("image") !== -1)
                {
                    var blob = item.getAsFile();
                    var reader = new FileReader();

                    reader.onloadend = function ()
                    {
                        try
                        {
                            var base64Image = reader.result.split(",")[1];

                            var pastedHtml = `<img src="data:image/png;base64,${base64Image}" />`;

                            editor.insertHtml(pastedHtml);
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("agendamento_viagem.js", "onloadend", error);
                        }
                    };

                    reader.readAsDataURL(blob);
                    break;
                }
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "addEventListener:paste_callback", error);
    }
});

async function validarDatas()
{
    try
    {
        const txtDataInicial = $("#txtDataInicial").val();
        const txtDataFinal = $("#txtDataFinal").val();
        if (!txtDataFinal || !txtDataInicial) return true;
        const dtInicial = parseDate(txtDataInicial);
        const dtFinal = parseDate(txtDataFinal);
        dtInicial.setHours(0, 0, 0, 0);
        dtFinal.setHours(0, 0, 0, 0);
        const diferenca = (dtFinal - dtInicial) / (1000 * 60 * 60 * 24);
        if (diferenca >= 5)
        {
            const confirmacao = await Alerta.Confirmar("Atenção", "A Data Final está 5 dias ou mais após a Inicial. Tem certeza?", "Tenho certeza! 💪🏼", "Me enganei! 😟");
            if (!confirmacao)
            {
                $("#txtDataFinal").val("");
                $("#txtDataFinal").focus();
                return false;
            }
        }
        return true;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "validarDatas", error);
        return false;
    }
}

function parseDate(d)
{
    try
    {
        if (!d) return null;

        if (d instanceof Date && !isNaN(d))
        {
            return d;
        }

        const s = String(d).trim();

        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s))
        {
            const [dia, mes, ano] = s.split("/");
            return new Date(Number(ano), Number(mes) - 1, Number(dia));
        }

        if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s))
        {
            const [ano, mes, dia] = s.split("-");
            return new Date(Number(ano), Number(mes) - 1, Number(dia));
        }

        const parsed = Date.parse(s);
        if (!isNaN(parsed))
        {
            return new Date(parsed);
        }
        return null;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "parseDate", error);
        return null;
    }
}

function calcularDistanciaViagem()
{
    try
    {
        const kmInicialStr = $("#txtKmInicial").val();
        const kmFinalStr = $("#txtKmFinal").val();
        if (!kmInicialStr || !kmFinalStr)
        {
            $("#txtKmPercorrido").val("");
            return;
        }
        const kmInicial = parseFloat(kmInicialStr.replace(",", "."));
        const kmFinal = parseFloat(kmFinalStr.replace(",", "."));
        if (isNaN(kmInicial) || isNaN(kmFinal))
        {
            $("#txtKmPercorrido").val("");
            return;
        }
        const kmPercorrido = Math.round(kmFinal - kmInicial);
        $("#txtQuilometragem").val(kmPercorrido);
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "calcularDistanciaViagem", error);
    }
}

$("#txtNoFichaVistoria").focusout(function ()
{
    try
    {
        let noFicha = $("#txtNoFichaVistoria").val();
        if (noFicha === "") return;
        $.ajax({
            url: "/Viagens/Upsert?handler=VerificaFicha",
            method: "GET",
            datatype: "json",
            data: {
                id: noFicha
            },
            success: function (res)
            {
                try
                {
                    let maxFicha = parseInt(res.data);
                    if (noFicha > maxFicha + 100 || noFicha < maxFicha - 100)
                    {
                        Alerta.Warning("Alerta na Ficha de Vistoria", "O número inserido difere em ±100 da última Ficha inserida");
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "success", error);
                }
            }
        });
        $.ajax({
            url: "/Viagens/Upsert?handler=FichaExistente",
            method: "GET",
            datatype: "json",
            data: {
                id: noFicha
            },
            success: function (res)
            {
                try
                {
                    if (res.data === true)
                    {
                        Alerta.Warning("Alerta na Ficha de Vistoria", "Já existe uma Ficha inserida com esta numeração");
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("agendamento_viagem.js", "success", error);
                }
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "focusout_callback", error);
    }
});

async function validarDatasInicialFinal(DataInicial, DataFinal)
{
    try
    {
        const dtIni = parseData(DataInicial);
        const dtFim = parseData(DataFinal);
        if (!dtIni || !dtFim || isNaN(dtIni) || isNaN(dtFim)) return true;
        const diff = (dtFim - dtIni) / (1000 * 60 * 60 * 24);
        if (diff >= 5)
        {
            const confirmacao = await Alerta.Confirmar("Atenção", "A Data Final está 5 dias ou mais após a Inicial. Tem certeza?", "Tenho certeza! 💪🏼", "Me enganei! 😟");
            if (!confirmacao)
            {
                const txtDataFinalElement = document.getElementById("txtDataFinal");
                txtDataFinalElement.value = null;
                txtDataFinalElement.focus();
                return false;
            }
        }
        return true;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "validarDatasInicialFinal", error);
        return false;
    }
}

async function validarKmInicialFinal()
{
    try
    {
        const kmInicial = $("#txtKmInicial").val();
        const kmFinal = $("#txtKmFinal").val();
        if (!kmInicial || !kmFinal) return true;
        const ini = parseFloat(kmInicial.replace(",", "."));
        const fim = parseFloat(kmFinal.replace(",", "."));
        if (fim < ini)
        {
            Alerta.Erro("Erro", "A quilometragem final deve ser maior que a inicial.");
            return false;
        }
        const diff = fim - ini;
        if (diff > 100)
        {
            const confirmacao = await Alerta.Confirmar("Atenção", "A quilometragem <strong>final</strong> excede em 100km a <strong>inicial</strong>. Tem certeza?", "Tenho certeza! 💪🏼", "Me enganei! 😟");
            if (!confirmacao)
            {
                const txtKmFinalElement = document.getElementById("txtKmFinal");
                txtKmFinalElement.value = null;
                txtKmFinalElement.focus();
                return false;
            }
        }
        return true;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "validarKmInicialFinal", error);
        return false;
    }
}

async function validarKmAtualFinal()
{
    try
    {
        const kmInicial = $("#txtKmInicial").val();
        const kmAtual = $("#txtKmAtual").val();
        if (!kmInicial || !kmAtual) return true;
        const ini = parseFloat(kmAtual.replace(",", "."));
        const fim = parseFloat(kmFinal.replace(",", "."));
        if (fim < ini)
        {
            Alerta.Erro("Erro", "A quilometragem <strong>inicial</strong> deve ser maior que a <strong>atual</strong>.");
            return false;
        }
        const diff = fim - ini;
        if (diff > 100)
        {
            const confirmacao = await Alerta.Confirmar("Quilometragem Alta", "A quilometragem <strong>inicial</strong> excede em 100km a <strong>atual</strong>. Tem certeza?", "Tenho certeza! 💪🏼", "Me enganei! 😟");
            if (!confirmacao)
            {
                const txtKmInicialElement = document.getElementById("txtKmInicial");
                txtKmInicialElement.value = null;
                txtKmInicialElement.focus();
                return false;
            }
        }
        return true;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "validarKmAtualFinal", error);
        return false;
    }
}

function calcularDuracaoViagem()
{
    try
    {
        const dataInicialStr = $("#txtDataInicial").val();
        const horaInicialStr = $("#txtHoraInicial").val();
        const dataFinalStr = $("#txtDataFinal").val();
        const horaFinalStr = $("#txtHoraFinal").val();
        if (!dataInicialStr || !horaInicialStr || !dataFinalStr || !horaFinalStr)
        {
            $("#txtDuracao").val("");
            return;
        }
        const parseDataHora = (data, hora) =>
        {
            try
            {
                if (data.includes("/"))
                {
                    const [dia, mes, ano] = data.split("/");
                    return new Date(`${ano}-${mes}-${dia}T${hora}`);
                } else if (data.includes("-"))
                {
                    return new Date(`${data}T${hora}`);
                } else
                {
                    return null;
                }
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "parseDataHora", error);
            }
        };
        const dtInicial = parseDataHora(dataInicialStr, horaInicialStr);
        const dtFinal = parseDataHora(dataFinalStr, horaFinalStr);
        if (!dtInicial || !dtFinal || dtFinal <= dtInicial)
        {
            $("#txtDuracao").val("");
            return;
        }
        const diffMs = dtFinal - dtInicial;
        const diffHoras = (diffMs / (1000 * 60 * 60)).toFixed(2);
        $("#txtDuracao").val(Math.round(diffHoras));
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "calcularDuracaoViagem", error);
    }
}

function limparCamposModalViagens()
{
    try
    {
        $("#txtReport, #txtViagemId, #txtRecorrenciaViagemId, #txtStatusAgendamento, #txtUsuarioIdCriacao, #txtDataCriacao, #txtNoFichaVistoria, #txtDataFinal, #txtHoraFinal, #txtKmAtual, #txtKmInicial, #txtKmFinal, #txtRamalRequisitante, #txtNomeDoEvento, #txtDescricaoEvento, #txtDataInicialEvento, #txtDataFinalEvento, #txtQtdPessoas, #txtPonto, #txtNome, #txtRamal, #txtEmail").val("");

        ["txtDuracao", "txtQuilometragem"].forEach(id =>
        {
            try
            {
                const instance = getSyncfusionInstance(id);
                if (instance)
                {
                    instance.value = null;
                    instance.dataBind && instance.dataBind();
                }
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "forEach_callback", error);
            }
        });

        const syncIds = ["cmbOrigem", "cmbDestino", "lstMotorista", "lstVeiculo", "lstRequisitante", "ddtSetor", "lstEventos", "ddtCombustivelInicial", "ddtCombustivelFinal", "lstDiasMes"];
        syncIds.forEach(id =>
        {
            try
            {
                let instance = getSyncfusionInstance(id);
                if (instance)
                {
                    instance.value = null;
                    if (typeof instance.enabled !== "undefined") instance.enabled = true;
                    if (typeof instance.dataBind === "function") instance.dataBind();
                }
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "forEach_callback", error);
            }
        });

        let lstDiasInst = getSyncfusionInstance("lstDias");
        if (lstDiasInst)
        {
            lstDiasInst.value = [];
            lstDiasInst.enabled = true;
            lstDiasInst.dataBind && lstDiasInst.dataBind();
        }

        var lstFinalidade = getSyncfusionInstance("lstFinalidade");
        if (lstFinalidade)
        {
            lstFinalidade.value = null;
            lstFinalidade.enabled = true;
            lstFinalidade.dataBind && lstFinalidade.dataBind();
        } else
        {
            console.warn("Syncfusion instance #lstFinalidade não existe ou ainda não foi inicializada.");
        }

        var lstRecorrente = getSyncfusionInstance("lstRecorrente");
        if (lstRecorrente)
        {
            lstRecorrente.value = "N";
            lstRecorrente.enabled = true;
            lstRecorrente.dataBind && lstRecorrente.dataBind();
        }

        var elPeriodos = getSyncfusionInstance("lstPeriodos");
        if (elPeriodos)
        {
            elPeriodos.value = null;
            elPeriodos.enabled = true;
            elPeriodos.dataBind && elPeriodos.dataBind();
        } else if (typeof rebuildLstPeriodos === "function")
        {
            rebuildLstPeriodos();
        }

        var rteDescricao = getSyncfusionInstance("rteDescricao");
        if (rteDescricao)
        {
            rteDescricao.value = "";
            rteDescricao.dataBind && rteDescricao.dataBind();
        }

        const idsToReset = ["lstRequisitanteEvento", "lstSetorRequisitanteEvento", "ddtSetorRequisitante"];
        idsToReset.forEach(id =>
        {
            try
            {
                const instance = getSyncfusionInstance(id);
                if (instance)
                {
                    instance.value = null;
                    instance.dataBind && instance.dataBind();
                }
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("agendamento_viagem.js", "forEach_callback", error);
            }
        });

        $("#divPeriodo, #divTxtPeriodo, #divDias, #divDiaMes, #divFinalRecorrencia, #divFinalFalsoRecorrencia, #calendarContainer, #listboxContainer, #listboxContainerHTML, #ReportContainer").hide();

        $("#lblUsuarioAgendamento, #lblUsuarioCriacao, #lblUsuarioFinalizacao, #lblUsuarioCancelamento").text("");
        $("#btnConfirma").text("Confirmar").prop("disabled", false);

        var calInstance = getSyncfusionInstance("calDatasSelecionadas");
        if (calInstance)
        {
            if ("values" in calInstance) calInstance.values = [];
            if ("value" in calInstance) calInstance.value = null;
            calInstance.dataBind && calInstance.dataBind();
        }
        var lstDiasHTML = document.getElementById("lstDiasCalendarioHTML");
        if (lstDiasHTML) lstDiasHTML.innerHTML = "";

        $("#ReportContainer").hide();
        $("#fichaReport").html("");

        $("#fichaReport").removeClass("loading");

        $("#ReportContainer").hide().removeClass("visible").css("height", "0");
        $("#fichaReport").html("");

        if (window.xhrRelatorio && window.xhrRelatorio.abort) window.xhrRelatorio.abort();
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("agendamento_viagem.js", "limparCamposModalViagens", error);
    }
}
