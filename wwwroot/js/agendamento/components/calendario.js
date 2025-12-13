// ====================================================================
// CALENDÁRIO - Gerenciamento do calendário FullCalendar
// ====================================================================

/**
 * Inicializa o calendário FullCalendar
 * param {string} URL - URL para carregar eventos
 */
window.InitializeCalendar = function (URL)
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
                        Alerta.TratamentoErroComLinha("calendario.js", "hideAgendaSpinners_forEach", error);
                    }
                });

                root.querySelectorAll('.e-spinner-pane, .e-spin-overlay, .e-spin-show').forEach(function (el)
                {
                    try
                    {
                        el.remove();
                    } catch (error)
                    {
                        el.style.setProperty('display', 'none', 'important');
                        el.style.setProperty('visibility', 'hidden', 'important');
                    }
                });
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("calendario.js", "hideAgendaSpinners", error);
            }
        }

        if (window.FtxSpin) window.FtxSpin.show('Carregando agenda…');

        let firstPaintDone = false;
        const firstHide = () =>
        {
            try
            {
                if (!firstPaintDone)
                {
                    firstPaintDone = true;
                    if (window.FtxSpin) window.FtxSpin.hide();
                }
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("calendario.js", "firstHide", error);
            }
        };

        var calendarEl = document.getElementById("agenda");
        window.calendar = new FullCalendar.Calendar(calendarEl, {
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
                                    var start = window.addDaysLocal(item.start, 1);
                                    var end = window.addDaysLocal(item.end, 1);

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
                                    Alerta.TratamentoErroComLinha("calendario.js", "events_mapItem", e);
                                }
                            }

                            successCallback(events);
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("calendario.js", "events_done", error);
                            if (typeof failureCallback === 'function') failureCallback(error);
                            successCallback([]);
                        } finally
                        {
                            setTimeout(hideAgendaSpinners, 0);
                        }
                    }).fail(function (jqXHR, textStatus, errorThrown)
                    {
                        try
                        {
                            const erro = window.criarErroAjax(jqXHR, textStatus, errorThrown, this);
                            Alerta.TratamentoErroComLinha("calendario.js", "events_fail", erro);
                            if (typeof failureCallback === 'function') failureCallback(erro);
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("calendario.js", "events_fail_outer", error);
                        } finally
                        {
                            successCallback([]);
                        }
                    });
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("calendario.js", "events", error);
                }
            },
            eventClick: function (info)
            {
                try
                {
                    var idViagem = info.event.id;
                    info.jsEvent.preventDefault();

                    $.ajax({
                        type: "GET",
                        url: "/api/Agenda/RecuperaViagem",
                        data: { id: idViagem },
                        contentType: "application/json",
                        dataType: "json",
                        success: function (response)
                        {
                            try
                            {
                                window.AppState.update({
                                    'viagem.id': response.data.viagemId,
                                    'viagem.idAJAX': response.data.viagemId,
                                    'viagem.recorrenciaId': response.data.recorrenciaViagemId,
                                    'viagem.recorrenciaIdAJAX': response.data.recorrenciaViagemId,
                                    'viagem.dataInicialList': response.data.dataInicial
                                });

                                const dataInicialISO = response.data.dataInicial;
                                const dataTemp = new Date(dataInicialISO);
                                window.dataInicial = new Intl.DateTimeFormat("pt-BR").format(dataTemp);

                                if (typeof window.ExibeViagem === 'function') window.ExibeViagem(response.data);
                            } catch (error)
                            {
                                Alerta.TratamentoErroComLinha("calendario.js", "eventClick_success", error);
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown)
                        {
                            const erro = window.criarErroAjax(jqXHR, textStatus, errorThrown, this);
                            Alerta.TratamentoErroComLinha("calendario.js", "eventClick_error", erro);
                        }
                    });

                    // Modal sera aberto por ExibeViagem apos carregar dados
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("calendario.js", "eventClick", error);
                }
            },
            eventDidMount: function (info)
            {
                try
                {
                    const description = info.event.extendedProps.description || "Sem descrição";
                    info.el.setAttribute("title", description);
                    new bootstrap.Tooltip(info.el);
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("calendario.js", "eventDidMount", error);
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
                    Alerta.TratamentoErroComLinha("calendario.js", "loading", error);
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
                    Alerta.TratamentoErroComLinha("calendario.js", "viewDidMount", error);
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
                    Alerta.TratamentoErroComLinha("calendario.js", "eventSourceFailure", error);
                }
            },
            select: function (info)
            {
                try
                {
                    // Pega a data/hora clicada
                    const start = info.start ? new Date(info.start) : new Date();

                    // Arredonda a hora para intervalos de 10 minutos
                    const horaArredondada = window.arredondarHora(start, 10);

                    // Cria um novo Date com a hora arredondada
                    const startArredondado = moment(start).set({
                        'hour': parseInt(horaArredondada.split(':')[0]),
                        'minute': parseInt(horaArredondada.split(':')[1]),
                        'second': 0,
                        'millisecond': 0
                    }).toDate();

                    const dataStr = moment(startArredondado).format("YYYY-MM-DD");

                    window.CarregandoAgendamento = true;

                    // 1. Limpar campos primeiro
                    if (typeof window.limparCamposModalViagens === 'function')
                    {
                        window.limparCamposModalViagens();
                    }

                    // 2. Configurar novo agendamento (ExibeViagem já preenche data/hora)
                    if (typeof window.ExibeViagem === 'function')
                    {
                        window.ExibeViagem("", startArredondado, horaArredondada);
                    }

                    // 3. Abrir modal
                    $("#modalViagens").modal("show");

                    window.CarregandoAgendamento = false;
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("calendario.js", "select", error);
                }
            },
            selectOverlap: function (event)
            {
                try
                {
                    return !event.block;
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("calendario.js", "selectOverlap", error);
                    return true;
                }
            }
        });

        window.calendar.render();
        setTimeout(firstHide, 10000);

    } catch (error)
    {
        Alerta.TratamentoErroComLinha("calendario.js", "InitializeCalendar", error);
    }
};

/**
 * Carrega eventos do calendário (callback alternativo)
 * param {Object} fetchInfo - Informações de fetch
 * param {Function} successCallback - Callback de sucesso
 * param {Function} failureCallback - Callback de falha
 */
window.calendarEvents = async function (fetchInfo, successCallback, failureCallback)
{
    try
    {
        const result = await window.AgendamentoService.carregarEventos(fetchInfo);

        if (result.success)
        {
            successCallback(result.data);
        } else
        {
            failureCallback(result.error);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("calendario.js", "calendarEvents", error);
        failureCallback(error);
    }
};
