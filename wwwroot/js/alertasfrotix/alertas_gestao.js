// alertas_gestao.js - Sistema de Gestão de Alertas FrotiX
var tabelaAlertasLidos;
var connectionAlertas;

// Variáveis do sino
var connectionSino;
var alertasSino = [];
var menuEstaAberto = false;

// Variável global para armazenar dados do alerta atual
var alertaDetalhesAtual = null;

$(document).ready(function () 
{
    try
    {
        inicializarDataTableLidos();
        inicializarDataTableMeusAlertas(); // ✅ ADICIONAR ESTA LINHA

        // Se estivermos na página de gestão, carregar cards
        if ($('#alertasAtivosContainer').length > 0)
        {
            carregarAlertasGestao();
        }

        // Sempre carregar alertas do sino
        carregarAlertasAtivos();
        configurarEventHandlers();
        inicializarSignalR();
        iniciarRecarregamentoAutomatico();

        // ✅ ADICIONAR ESTE BLOCO COMPLETO
        // Evento do botão "Dar Baixa no Alerta" no modal
        $(document).on('click', '#btnBaixaAlerta', function (e)
        {
            e.preventDefault();
            e.stopPropagation();

            const alertaId = $(this).data('alerta-id');

            if (!alertaId)
            {
                console.error('ID do alerta não encontrado no botão');
                AppToast.show("Vermelho", "Erro: ID do alerta não encontrado", 2000);
                return;
            }

            console.log('Dando baixa no alerta:', alertaId);

            // Chamar função que usa Alerta.Confirmar
            darBaixaAlertaComConfirmacao(alertaId);
        });
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_gestao.js", "document.ready", error);
    }
});

async function carregarAlertasSeguro()
{
    try
    {
        const url = '/api/alertas'; // ou @Url.Action("Alertas", "Api")
        console.log('🔄 Carregando alertas de:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin' // Incluir cookies de autenticação
        });

        console.log('📊 Status:', response.status, response.statusText);

        // Pegar o content-type antes de tentar ler
        const contentType = response.headers.get('content-type');
        console.log('📄 Content-Type:', contentType);

        // Se não for JSON, ler como texto e mostrar o erro
        if (!contentType || !contentType.includes('application/json'))
        {
            const textoErro = await response.text();

            console.error('❌ Resposta não é JSON!');
            console.error('Conteúdo recebido:', textoErro.substring(0, 500));

            // Criar um erro descritivo
            const erro = new Error(
                `A API retornou ${contentType || 'conteúdo HTML'} ao invés de JSON. ` +
                `Status: ${response.status}. ` +
                `Verifique se a URL está correta e se o servidor está funcionando.`
            );
            erro.statusCode = response.status;
            erro.contentType = contentType;
            erro.responsePreview = textoErro.substring(0, 200);

            throw erro;
        }

        // Só tenta fazer parse se for JSON
        const data = await response.json();
        console.log('✅ Dados recebidos:', data);

        // Processar os alertas aqui
        // exibirAlertas(data);

        return data;

    } catch (erro)
    {
        console.error('❌ Erro detalhado:', {
            nome: erro.name,
            mensagem: erro.message,
            status: erro.statusCode,
            contentType: erro.contentType,
            preview: erro.responsePreview
        });

        // Mostrar o alerta de erro
        await Alerta.TratamentoErroComLinha(
            'analyticsdashboard.cshtml',
            'carregarAlertas',
            {
                erro: erro.message,
                message: erro.message,
                stack: erro.stack,
                statusCode: erro.statusCode || 'N/A',
                contentType: erro.contentType || 'desconhecido',
                preview: erro.responsePreview
            }
        );

        // Não propagar o erro para não quebrar o setInterval
        return null;
    }
}

// ✅ Inicializar o ProgressBar - VERSÃO SIMPLES
function inicializarProgressBar() 
{
    try 
    {
        console.log('✅ ProgressBar Bootstrap pronto (não requer inicialização)');
    }
    catch (error) 
    {
        TratamentoErroComLinha("alertas_gestao.js", "inicializarProgressBar", error);
    }
}

{
    try 
    {
        var progressBar = document.getElementById('progressoLeitura');
        var progressWarned = false;

        function verificarProgressBar(tentativa) {
            try {
                if (progressBar && progressBar.ej2_instances && progressBar.ej2_instances[0]) {
                    console.log('✅ ProgressBar Syncfusion inicializado');
                    return;
                }

                if (tentativa >= 5) {
                    // Silencia após a última tentativa; mantém flag apenas para evitar repetir lógica
                    progressWarned = true;
                    return;
                }

                setTimeout(function () { verificarProgressBar(tentativa + 1); }, 400);
            } catch (e) {
                console.error('❌ Erro ao verificar ProgressBar:', e);
            }
        }

        if (progressBar)
        {
            // Aguardar e verificar algumas vezes até o Syncfusion finalizar
            setTimeout(function () { verificarProgressBar(1); }, 300);
        } else
        {
            console.warn('⚠️ Elemento progressoLeitura não encontrado no DOM');
        }
    }
    catch (error) 
    {
        TratamentoErroComLinha("alertas_gestao.js", "inicializarProgressBar", error);
    }
}

// Chamar quando o modal for aberto
$('#modalDetalhesAlerta').on('shown.bs.modal', function ()
{
    try
    {
        inicializarProgressBar();
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_gestao.js", "modalDetalhesAlerta.shown", error);
    }
});

function inicializarDataTableLidos() 
{
    try
    {
        if ($('#tblAlertasInativos').length === 0) return;

        tabelaAlertasLidos = $('#tblAlertasInativos').DataTable({
            "processing": true,
            "serverSide": false,
            "ajax": {
                "url": "/api/AlertasFrotiX/GetAlertasInativos",
                "type": "GET",
                "datatype": "json",
                "dataSrc": function (json)
                {
                    if (json && json.data)
                    {
                        atualizarBadgeInativos(json.data.length);
                        return json.data;
                    }
                    atualizarBadgeInativos(0);
                    return [];
                },
                "error": function (xhr, error, code) 
                {
                    TratamentoErroComLinha("alertas_gestao.js", "ajax.error", error);
                    atualizarBadgeInativos(0);
                }
            },
            "columns": [
                {
                    "data": "icone",
                    "render": function (data, type, row) 
                    {
                        var corIcone = obterCorPorTipo(row.tipo);
                        return `<i class="${data} fa-lg" style="color: ${corIcone}"></i>`;
                    },
                    "className": "text-center",
                    "width": "3%"
                },
                {
                    "data": "titulo",
                    "width": "17%"
                },
                {
                    "data": "descricao",
                    "width": "37%"
                },
                {
                    "data": "tipo",
                    "render": function (data) 
                    {
                        var badgeClass = obterClasseBadge(data);
                        return `<span class="badge badge-tipo ${badgeClass}">${data}</span>`;
                    },
                    "className": "text-center",
                    "width": "7%"
                },
                {
                    "data": "prioridade",
                    "render": function (data) 
                    {
                        var classPrioridade = obterClassePrioridade(data);
                        return `<span class="${classPrioridade}"><i class="fa-duotone fa-flag"></i> ${data}</span>`;
                    },
                    "className": "text-center",
                    "width": "7%"
                },
                {
                    "data": "dataInsercao",
                    "width": "8%",
                    "className": "text-center"
                },
                {
                    "data": "dataDesativacao",
                    "width": "8%",
                    "className": "text-center"
                },
                {
                    "data": "percentualLeitura",
                    "render": function (data, type, row) 
                    {
                        var percentual = parseFloat(data) || 0;
                        var cor = percentual >= 75 ? 'success' : percentual >= 50 ? 'warning' : 'danger';

                        return `
                            <div class="d-flex align-items-center justify-content-center">
                                <div class="progress" style="width: 60px; height: 20px; margin-right: 8px;">
                                    <div class="progress-bar bg-${cor}" role="progressbar" 
                                         style="width: ${percentual}%" 
                                         aria-valuenow="${percentual}" 
                                         aria-valuemin="0" 
                                         aria-valuemax="100">
                                    </div>
                                </div>
                                <span class="badge bg-${cor}">${percentual.toFixed(1)}%</span>
                            </div>`;
                    },
                    "className": "text-center",
                    "width": "8%"
                },
                {
                    "data": "alertaId",
                    "render": function (data, type, row) 
                    {
                        return `
                            <button class="btn btn-info btn-sm" 
                                    onclick="verDetalhesAlertaInativo('${data}')" 
                                    title="Ver Detalhes"
                                    data-ejtip="Ver detalhes completos do alerta">
                                <i class="fa-duotone fa-eye"></i>
                            </button>`;
                    },
                    "className": "text-center",
                    "orderable": false,
                    "width": "5%"
                }
            ],
            "order": [[6, "desc"]],
            "language": {
                "url": "//cdn.datatables.net/plug-ins/1.13.8/i18n/pt-BR.json"
            },
            "pageLength": 25,
            "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
            "responsive": true,
            "dom": '<"top"lf>rt<"bottom"ip><"clear">',
            "initComplete": function () 
            {
                configurarTooltips();
            }
        });
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_gestao.js", "inicializarDataTableLidos", error);
    }
}

/**
 * Atualiza o badge de alertas inativos
 */
function atualizarBadgeInativos(quantidade) 
{
    try
    {
        var badge = $('#badgeInativos');
        if (badge.length)
        {
            badge.text(quantidade);
        }
    }
    catch (error)
    {
        console.error('Erro ao atualizar badge de inativos:', error);
    }
}

/**
 * Retorna a cor hexadecimal baseada no tipo de alerta
 */
function obterCorPorTipo(tipo) 
{
    var tipoLower = tipo.toLowerCase();

    switch (tipoLower)
    {
        case 'agendamento':
            return '#0ea5e9';
        case 'manutenção':
        case 'manutencao':
            return '#f59e0b';
        case 'motorista':
            return '#14b8a6';
        case 'veículo':
        case 'veiculo':
            return '#7c3aed';
        case 'anúncio':
        case 'anuncio':
            return '#dc2626';
        case 'diversos':
            return '#6c757d';
        default:
            return '#6b7280';
    }
}

/**
 * Atualiza o badge verde do histórico de alertas lidos
 */
function atualizarBadgeHistorico(quantidade) 
{
    try
    {
        var badge = $('#badgeHistorico');
        if (badge.length)
        {
            badge.text(quantidade);
            if (quantidade > 0)
            {
                badge.removeClass('bg-secondary').addClass('bg-success');
            } else
            {
                badge.removeClass('bg-success').addClass('bg-secondary');
            }
        }
    }
    catch (error)
    {
        console.error('Erro ao atualizar badge do histórico:', error);
    }
}

// === FUNÇÕES DO SINO ===

// ============================================
// ADICIONAR NO alertas_gestao.js
// Dentro da função configurarEventHandlers()
// ============================================

function configurarEventHandlers() 
{
    try
    {
        // Event handlers do sino
        var sinoBtn = document.getElementById('alertasSinoBtn');
        if (sinoBtn) 
        {
            sinoBtn.addEventListener('click', function (e)
            {
                e.preventDefault();
                e.stopPropagation();
                toggleMenu();
            });
        }

        var btnMarcarTodos = document.getElementById('btnMarcarTodosLidos');
        if (btnMarcarTodos) 
        {
            btnMarcarTodos.addEventListener('click', function (e)
            {
                e.stopPropagation();
                marcarTodosComoLidos();
            });
        }

        // ✅ ADICIONAR ESTE NOVO EVENT HANDLER
        var btnVerTodos = document.getElementById('btnVerTodosAlertas');
        if (btnVerTodos) 
        {
            btnVerTodos.addEventListener('click', function (e)
            {
                e.preventDefault();
                e.stopPropagation();

                // Fechar o menu do sino antes de redirecionar
                fecharMenu();

                // Redirecionar para a página de Controle de Alertas
                window.location.href = '/AlertasFrotiX';
            });
        }

        document.addEventListener('click', function (e)
        {
            var container = document.getElementById('alertasSinoContainer');
            if (container && !container.contains(e.target) && menuEstaAberto)
            {
                fecharMenu();
            }
        });

        var menu = document.getElementById('alertasMenu');
        if (menu) 
        {
            menu.addEventListener('click', function (e)
            {
                e.stopPropagation();
            });
        }

        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) 
        {
            try
            {
                var target = $(e.target).attr("href");
                if (target === "#tabAtivos") 
                {
                    carregarAlertasGestao();
                }
                else if (target === "#tabInativos")
                {
                    if (tabelaAlertasLidos && tabelaAlertasLidos.ajax)
                    {
                        tabelaAlertasLidos.ajax.reload(null, false);
                    }
                }
                else if (target === "#tabMeusAlertas") // ✅ ADICIONAR ESTE BLOCO
                {
                    if (tabelaMeusAlertas && tabelaMeusAlertas.ajax)
                    {
                        tabelaMeusAlertas.ajax.reload(null, false);
                    }
                }
            }
            catch (error)
            {
                TratamentoErroComLinha("alertas_gestao.js", "shown.bs.tab", error);
            }
        });
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_gestao.js", "configurarEventHandlers", error);
    }
}

function inicializarSignalR() 
{
    try 
    {
        if (typeof SignalRManager === 'undefined') 
        {
            setTimeout(inicializarSignalR, 2000);
            return;
        }

        SignalRManager.getConnection()
            .then(function (conn)
            {
                connectionSino = conn;
                configurarEventosSignalR();
            })
            .catch(function (err)
            {
                console.error('Sino: Erro ao conectar SignalR:', err);
                setTimeout(inicializarSignalR, 10000);
            });
    }
    catch (error) 
    {
        console.error('Sino: Erro ao inicializar SignalR:', error);
    }
}

function configurarEventosSignalR() 
{
    if (!connectionSino) return;

    try 
    {
        SignalRManager.on("NovoAlerta", function (alerta)
        {
            exibirNovoAlerta(alerta);
        });

        SignalRManager.on("AtualizarBadgeAlertas", function (quantidade)
        {
            atualizarBadge(quantidade);
        });

        SignalRManager.on("ExibirAlertasIniciais", function (alertas)
        {
            if (alertas && alertas.length > 0)
            {
                renderizarAlertas(alertas);
            }
        });

        SignalRManager.registerCallback({
            onReconnected: function ()
            {
                carregarAlertasAtivos();
            }
        });
    }
    catch (error) 
    {
        console.error('Sino: Erro ao configurar eventos:', error);
    }
}

function toggleMenu() 
{
    if (menuEstaAberto)
    {
        fecharMenu();
    } else
    {
        abrirMenu();
    }
}

function abrirMenu() 
{
    var menu = document.getElementById('alertasMenu');
    if (menu)
    {
        menu.classList.add('show');
        menuEstaAberto = true;
    }
}

function fecharMenu() 
{
    var menu = document.getElementById('alertasMenu');
    if (menu)
    {
        menu.classList.remove('show');
        menuEstaAberto = false;
    }
}

function carregarAlertasAtivos() 
{
    var container = document.getElementById('listaAlertasSino');
    if (container)
    {
        container.innerHTML = `
            <div class="alertas-vazio">
                <i class="fa-duotone fa-spinner fa-spin"></i>
                <p>Carregando alertas...</p>
            </div>`;
    }

    fetch('/api/AlertasFrotiX/GetAlertasAtivos', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(function (response)
        {
            if (!response.ok)
            {
                throw new Error('HTTP ' + response.status);
            }
            return response.json();
        })
        .then(function (data)
        {
            if (Array.isArray(data))
            {
                alertasSino = data;
                renderizarAlertas(alertasSino);
                atualizarBadge(alertasSino.length);

                if (alertasSino.length > 0)
                {
                    mostrarBotaoMarcarTodos();
                    if (!menuEstaAberto)
                    {
                        setTimeout(abrirMenu, 500);
                    }
                } else
                {
                    esconderBotaoMarcarTodos();
                }
            }
        })
        .catch(function (error)
        {
            console.error('Erro ao carregar alertas:', error);
            mostrarErroCarregamento('Erro ao carregar alertas');
            atualizarBadge(0);
            esconderBotaoMarcarTodos();
        });
}

function renderizarAlertas(alertas) 
{
    var container = document.getElementById('listaAlertasSino');
    if (!container) return;

    container.innerHTML = '';

    if (!alertas || alertas.length === 0)
    {
        container.innerHTML = `
            <div class="alertas-vazio">
                <i class="fa-duotone fa-bell-slash"></i>
                <p>Nenhum alerta não lido</p>
            </div>`;
        return;
    }

    alertas.forEach(function (alerta)
    {
        container.insertAdjacentHTML('beforeend', criarHtmlAlerta(alerta));
    });

    container.querySelectorAll('.btn-marcar-lido').forEach(function (btn)
    {
        btn.addEventListener('click', function (e)
        {
            e.stopPropagation();
            marcarComoLido(this.dataset.alertaId);
        });
    });
}

function criarHtmlAlerta(alerta)
{
    var tempo = formatarData(alerta.dataInsercao);
    var prioridadeInfo = obterIconePrioridade(alerta.prioridade);
    var tipoInfo = obterInfoTipo(alerta.tipo);

    return `
        <div class="alerta-item nao-lido" data-alerta-id="${alerta.alertaId}">
            <div class="alerta-item-header">
                <div class="alerta-item-icon" style="color: ${prioridadeInfo.cor}">
                    <i class="${prioridadeInfo.icone}" data-ejtip="${prioridadeInfo.nome}"></i>
                </div>
                <div class="alerta-item-titulo">${escapeHtml(alerta.titulo)}</div>
                <span class="alerta-item-badge" style="background-color: ${tipoInfo.cor}">
                    ${tipoInfo.texto}
                </span>
            </div>
            <div class="alerta-item-descricao">${escapeHtml(alerta.mensagem || alerta.descricao || '')}</div>
            <div class="alerta-item-tempo">
                <span><i class="fa-duotone fa-clock"></i> ${tempo}</span>
                <div class="alerta-item-acoes">
                    <button class="btn-ver-detalhes e-control e-btn" 
                            data-alerta-id="${alerta.alertaId}" 
                            data-ejtip="Ver detalhes completos do alerta"
                            onclick="verDetalhesAlerta('${alerta.alertaId}')">
                        <i class="fa-duotone fa-eye"></i>
                    </button>
                    <button class="btn-marcar-lido e-control e-btn" 
                            data-alerta-id="${alerta.alertaId}" 
                            data-ejtip="Marcar este alerta como lido">
                        <i class="fa-duotone fa-check"></i>
                    </button>
                </div>
            </div>
        </div>`;
}

function obterIconePrioridade(prioridade)
{
    var prioridadeNum = typeof prioridade === 'string' ? parseInt(prioridade) : prioridade;

    switch (prioridadeNum)
    {
        case 1:
            return { icone: 'fa-duotone fa-circle-info', cor: '#0ea5e9', nome: 'Prioridade Baixa' };
        case 2:
            return { icone: 'fa-duotone fa-circle-exclamation', cor: '#f59e0b', nome: 'Prioridade Média' };
        case 3:
            return { icone: 'fa-duotone fa-triangle-exclamation', cor: '#dc2626', nome: 'Prioridade Alta' };
        default:
            return { icone: 'fa-duotone fa-circle', cor: '#6b7280', nome: 'Normal' };
    }
}

function obterInfoTipo(tipo) 
{
    var tipoNum = typeof tipo === 'string' ? parseInt(tipo) : tipo;

    switch (tipoNum)
    {
        case 1:
            return { texto: 'Agendamento', cor: '#0ea5e9' };
        case 2:
            return { texto: 'Manutenção', cor: '#f59e0b' };
        case 3:
            return { texto: 'Motorista', cor: '#14b8a6' };
        case 4:
            return { texto: 'Veículo', cor: '#7c3aed' };
        case 5:
            return { texto: 'Anúncio', cor: '#dc2626' };
        case 6:
            return { texto: 'Diversos', cor: '#6b7280' };
        default:
            return { texto: 'Info', cor: '#6b7280' };
    }
}

function exibirNovoAlerta(alerta) 
{
    alertasSino.unshift(alerta);
    renderizarAlertas(alertasSino);
    atualizarBadge(alertasSino.length);
    mostrarBotaoMarcarTodos();

    if (!menuEstaAberto)
    {
        abrirMenu();
    }
}

function atualizarBadge(quantidade) 
{
    var badge = document.getElementById('badgeAlertasSino');
    var btn = document.getElementById('alertasSinoBtn');

    if (!badge || !btn) return;

    if (quantidade > 0)
    {
        badge.textContent = quantidade > 99 ? '99+' : quantidade;
        badge.style.display = 'inline-block';
        btn.classList.add('has-alerts');
    } else
    {
        badge.style.display = 'none';
        btn.classList.remove('has-alerts');
    }
}

function marcarTodosComoLidos() 
{
    if (alertasSino.length === 0) return;

    fetch('/api/AlertasFrotiX/MarcarTodosComoLidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(function (data)
        {
            if (data && data.success)
            {
                alertasSino = [];
                renderizarAlertas(alertasSino);
                atualizarBadge(0);
                esconderBotaoMarcarTodos();
            }
        })
        .catch(error => console.error('Erro:', error));
}

function verificarListaVazia() 
{
    if (alertasSino.length === 0)
    {
        var container = document.getElementById('listaAlertasSino');
        if (container)
        {
            container.innerHTML = `
                <div class="alertas-vazio">
                    <i class="fa-duotone fa-bell-slash"></i>
                    <p>Nenhum alerta não lido</p>
                </div>`;
            esconderBotaoMarcarTodos();
        }
    }
}

function mostrarBotaoMarcarTodos() 
{
    var btn = document.getElementById('btnMarcarTodosLidos');
    if (btn) btn.style.display = 'inline-block';
}

function esconderBotaoMarcarTodos() 
{
    var btn = document.getElementById('btnMarcarTodosLidos');
    if (btn) btn.style.display = 'none';
}

function mostrarErroCarregamento(mensagem) 
{
    var container = document.getElementById('listaAlertasSino');
    if (container)
    {
        container.innerHTML = `
            <div class="alertas-vazio">
                <i class="fa-duotone fa-exclamation-triangle"></i>
                <p>${mensagem}</p>
                <button class="btn btn-sm btn-link text-primary" onclick="carregarAlertasAtivos()">
                    <i class="fa-duotone fa-sync"></i> Tentar novamente
                </button>
            </div>`;
    }
}

var intervaloRecarregamento;

function iniciarRecarregamentoAutomatico() 
{
    if (intervaloRecarregamento) clearInterval(intervaloRecarregamento);

    intervaloRecarregamento = setInterval(function ()
    {
        if (!document.hidden)
        {
            carregarAlertasAtivos();
        }
    }, 30000);
}

document.addEventListener('visibilitychange', function ()
{
    if (document.hidden)
    {
        if (intervaloRecarregamento) clearInterval(intervaloRecarregamento);
    } else
    {
        iniciarRecarregamentoAutomatico();
        carregarAlertasAtivos();
    }
});

// Função auxiliar para obter ID do usuário atual
function obterUsuarioAtualId() 
{
    try 
    {
        // Você pode armazenar o ID do usuário em uma variável global ao carregar a página
        // ou buscar de um elemento oculto no HTML
        return window.usuarioAtualId || $('#usuarioAtualId').val() || '';
    }
    catch (error) 
    {
        console.error('Erro ao obter ID do usuário:', error);
        return '';
    }
}

function darBaixaAlerta(alertaId) 
{
    try
    {
        Alerta.Confirmar(
            "Tem certeza que deseja dar baixa neste alerta?",
            "Esta ação não pode ser desfeita. O alerta será marcado como finalizado.",
            "Sim, dar baixa",
            "Cancelar"
        ).then((willDelete) =>
        {
            try
            {
                if (willDelete)
                {
                    $.ajax({
                        url: `/api/AlertasFrotiX/DarBaixaAlerta/${alertaId}`,
                        type: 'POST',
                        contentType: 'application/json',
                        success: function (response) 
                        {
                            try
                            {
                                if (response.success) 
                                {
                                    // ✅ Mostrar toast de sucesso
                                    AppToast.show("Verde", "Baixa do alerta realizada com sucesso", 2000);

                                    // ✅ Fechar o modal
                                    $('#modalDetalhesAlerta').modal('hide');

                                    // ✅ Remover card da interface se existir
                                    removerCardAlerta(alertaId);

                                    // ✅ Aguardar o modal fechar completamente antes de atualizar
                                    setTimeout(function () 
                                    {
                                        // ✅ Atualizar aba de Alertas Ativos
                                        carregarAlertasGestao();

                                        // ✅ Atualizar tabela de Histórico
                                        if (tabelaAlertasLidos && tabelaAlertasLidos.ajax)
                                        {
                                            tabelaAlertasLidos.ajax.reload(null, false);
                                        }

                                        // ✅ Atualizar alertas do sino
                                        carregarAlertasAtivos();

                                    }, 500);
                                }
                                else
                                {
                                    AppToast.show("Amarelo", response.mensagem || "Não foi possível dar baixa no alerta", 3000);
                                }
                            }
                            catch (error)
                            {
                                Alerta.TratamentoErroComLinha("alertas_gestao.js", "darBaixaAlerta.success", error);
                            }
                        },
                        error: function (xhr, status, error) 
                        {
                            try
                            {
                                console.error('Erro ao dar baixa no alerta:', error);

                                var mensagemErro = "Erro ao dar baixa no alerta";
                                if (xhr.responseJSON && xhr.responseJSON.mensagem) 
                                {
                                    mensagemErro = xhr.responseJSON.mensagem;
                                }

                                AppToast.show("Vermelho", mensagemErro, 3000);
                            }
                            catch (error)
                            {
                                Alerta.TratamentoErroComLinha("alertas_gestao.js", "darBaixaAlerta.error", error);
                            }
                        }
                    });
                }
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("alertas_gestao.js", "darBaixaAlerta.callback@swal.then#0", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("alertas_gestao.js", "darBaixaAlerta", error);
    }
}

// === FUNÇÕES DA GEStão DE ALERTAS ===
function adicionarCardAlerta(alerta) 
{
    try
    {
        var prioridadeClass = obterClassePrioridade(alerta.prioridade);
        var badgeClass = obterClasseBadge(alerta.textoBadge || obterTextoPorTipo(alerta.tipo));

        // Verificar se o usuário atual é o criador do alerta
        var usuarioAtualId = obterUsuarioAtualId(); // Função auxiliar para pegar o ID do usuário logado
        var ehCriador = alerta.usuarioCriadorId === usuarioAtualId;

        var cardHtml = `
            <div class="col-lg-6 col-xl-4 mb-3" id="card-alerta-${alerta.alertaId}">
                <div class="card border-left-${obterCorBorda(alerta.tipo)} h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div class="d-flex align-items-center">
                                <i class="${alerta.iconeCss} fa-2x me-3" style="color: ${alerta.corBadge}"></i>
                                <div>
                                    <h6 class="card-title mb-1">${alerta.titulo}</h6>
                                    <span class="badge badge-tipo ${badgeClass}">${alerta.textoBadge || obterTextoPorTipo(alerta.tipo)}</span>
                                </div>
                            </div>
                            <span class="${prioridadeClass}" title="Prioridade">
                                <i class="fa-duotone fa-flag"></i>
                            </span>
                        </div>
                        <p class="card-text text-muted small">${alerta.descricao}</p>
                        
                        ${alerta.totalUsuarios > 0 ? `
                        <div class="mb-2">
                            <small class="text-muted">
                                <i class="fa-duotone fa-users"></i> 
                                ${alerta.usuariosLeram}/${alerta.totalUsuarios} usuários leram
                            </small>
                        </div>
                        ` : ''}
                        
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <small class="text-muted">
                                <i class="fa-duotone fa-clock"></i> 
                                ${formatarData(alerta.dataInsercao)}
                            </small>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-info btn-sm" onclick="verDetalhesAlerta('${alerta.alertaId}')" 
                                        title="Ver Detalhes">
                                    <i class="fa-duotone fa-eye"></i>
                                </button>
                                ${ehCriador ? `
                                <button class="btn btn-vinho btn-sm" onclick="darBaixaAlerta('${alerta.alertaId}')" 
                                        title="Dar Baixa no Alerta" data-ejtip="Finalizar este alerta">
                                    <i class="fa-duotone fa-circle-xmark"></i>
                                </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        $('#alertasAtivosContainer').prepend(cardHtml);
        configurarTooltips();
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_gestao.js", "adicionarCardAlerta", error);
    }
}
function carregarAlertasGestao()
{
    try
    {
        $.ajax({
            url: '/api/AlertasFrotiX/GetTodosAlertasAtivosGestao',  // ✅ Novo endpoint
            type: 'GET',
            success: function (data)
            {
                $('#alertasAtivosContainer').empty();

                if (Array.isArray(data) && data.length > 0)
                {
                    atualizarBadgeAtivos(data.length);

                    data.forEach(function (alerta)
                    {
                        if (!alerta.usuarioCriadorId) 
                        {
                            alerta.usuarioCriadorId = alerta.criadoPor || '';
                        }
                        adicionarCardAlerta(alerta);
                    });
                } else
                {
                    atualizarBadgeAtivos(0);

                    $('#alertasAtivosContainer').html(`
                        <div class="col-12 text-center py-5">
                            <i class="fa-duotone fa-bell-slash fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">Nenhum alerta ativo no momento</h5>
                        </div>
                    `);
                }
            },
            error: function (xhr, status, error)
            {
                console.error('Erro ao carregar alertas gestão:', error);
                atualizarBadgeAtivos(0);

                $('#alertasAtivosContainer').html(`
                    <div class="col-12 text-center py-5">
                        <i class="fa-duotone fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                        <h5 class="text-danger">Erro ao carregar alertas</h5>
                        <button class="btn btn-primary mt-3" onclick="carregarAlertasGestao()">
                            <i class="fa-duotone fa-sync"></i> Tentar novamente
                        </button>
                    </div>
                `);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("alertas_gestao.js", "carregarAlertasGestao", error);
    }
}


function removerCardAlerta(alertaId) 
{
    try
    {
        $(`#card-alerta-${alertaId}`).fadeOut(300, function () 
        {
            $(this).remove();

            if ($('#alertasAtivosContainer .card').length === 0) 
            {
                $('#alertasAtivosContainer').html(`
                    <div class="col-12 text-center py-5">
                        <i class="fa-duotone fa-bell-slash fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Nenhum alerta ativo no momento</h5>
                    </div>
                `);
            }
        });
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_gestao.js", "removerCardAlerta", error);
    }
}

function marcarComoLido(alertaId) 
{
    try
    {
        $.ajax({
            url: `/api/AlertasFrotiX/MarcarComoLido/${alertaId}`,
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            success: function (response) 
            {
                if (response.success) 
                {
                    AppToast.show("Verde", "Alerta marcado como lido", 2000);

                    // Remover do card se existir
                    removerCardAlerta(alertaId);

                    // Remover do sino se existir
                    var item = document.querySelector('[data-alerta-id="' + alertaId + '"]');
                    if (item)
                    {
                        item.style.animation = 'slideUp 0.3s ease-out';
                        setTimeout(function ()
                        {
                            item.remove();
                            alertasSino = alertasSino.filter(a => a.alertaId !== alertaId);
                            atualizarBadge(alertasSino.length);
                            verificarListaVazia();
                        }, 300);
                    }

                    // Atualizar tabela de inativos se existir
                    if (tabelaAlertasLidos && tabelaAlertasLidos.ajax)
                    {
                        setTimeout(function ()
                        {
                            tabelaAlertasLidos.ajax.reload(null, false);
                        }, 500);
                    }

                    // Atualizar tabela de Meus Alertas se existir
                    if (tabelaMeusAlertas && tabelaMeusAlertas.ajax)
                    {
                        setTimeout(function ()
                        {
                            tabelaMeusAlertas.ajax.reload(null, false);
                        }, 500);
                    }
                }
                else
                {
                    console.error('Backend retornou success: false', response);
                    AppToast.show("Vermelho", response.message || response.mensagem || "Erro ao marcar como lido", 2000);
                }
            },
            error: function (xhr, status, errorThrown) 
            {
                console.error('Erro AJAX:', xhr.responseJSON);
                console.error('Status:', status);
                console.error('Error:', errorThrown);

                var mensagemErro = "Erro ao marcar alerta como lido";
                if (xhr.responseJSON && xhr.responseJSON.message)
                {
                    mensagemErro = xhr.responseJSON.message;
                }

                AppToast.show("Vermelho", mensagemErro, 3000);

                TratamentoErroComLinha("alertas_gestao.js", "marcarComoLido.ajax.error", {
                    message: errorThrown,
                    status: status,
                    response: xhr.responseJSON
                });
            }
        });
    }
    catch (err)
    {
        console.error('Erro no try-catch:', err);
        TratamentoErroComLinha("alertas_gestao.js", "marcarComoLido.catch", err);
        AppToast.show("Vermelho", "Erro ao processar requisição", 2000);
    }
}

// Exemplo de uso na função visualizarDetalhes:
function visualizarDetalhes(alertaId)
{
    console.log('🔍 Visualizando detalhes do alerta:', alertaId);

    // Fazer requisição
    $.ajax({
        url: `/Alertas/GetDetalhesAlerta/${alertaId}`,
        method: 'GET',
        success: function (response)
        {
            console.log('✅ Resposta recebida:', response);

            if (response.success && response.data)
            {
                const detalhes = response.data;

                // Preencher estatísticas
                $('#totalDestinatarios').text(detalhes.totalDestinatarios || 0);
                $('#totalNotificados').text(detalhes.totalNotificados || 0);
                $('#aguardandoNotificacao').text(detalhes.aguardandoNotificacao || 0);
                $('#usuariosLeram').text(detalhes.leram || 0);
                $('#usuariosNaoLeram').text(detalhes.naoLeram || 0);
                $('#usuariosApagaram').text(detalhes.apagaram || 0);

                // ✅ PREENCHER TABELA DE USUÁRIOS
                preencherTabelaUsuarios(detalhes.usuarios || []);

                // Abrir modal
                $('#modalDetalhesAlerta').modal('show');
            } else
            {
                console.error('❌ Resposta inválida:', response);
                AppToast.show('Vermelho', 'Erro ao carregar detalhes do alerta');
            }
        },
        error: function (xhr, status, error)
        {
            console.error('❌ Erro na requisição:', error);
            AppToast.show('Vermelho','Erro ao carregar detalhes: ' + error);
        }
    });
}

// ============================================
// FUNÇÃO AUXILIAR: PREENCHER ESTATÍSTICAS
// ============================================
function preencherEstatisticas(stats)
{
    if (!stats)
    {
        console.warn('⚠️ Estatísticas não disponíveis');
        return;
    }

    $('#totalNotificados').text(stats.totalNotificados || 0);
    $('#totalLidos').text(stats.totalLidos || 0);
    $('#totalNaoLidos').text(stats.totalNaoLidos || 0);
    $('#totalApagados').text(stats.totalApagados || 0);

    // Calcular percentual de leitura
    const total = stats.totalNotificados || 1; // Evitar divisão por zero
    const percentualLidos = ((stats.totalLidos / total) * 100).toFixed(1);
    $('#percentualLidos').text(`${percentualLidos}%`);

    // Atualizar barra de progresso
    $('#progressBarLidos')
        .css('width', `${percentualLidos}%`)
        .attr('aria-valuenow', percentualLidos);
}

// ============================================
// ADICIONE ISTO NO INÍCIO DA FUNÇÃO verDetalhesAlerta()
// Logo após receber os dados da API
// ============================================

async function verDetalhesAlerta(alertaId)
{
    try
    {
        console.log('Carregando detalhes do alerta:', alertaId);

        $('#modalDetalhesAlerta').modal('show');
        $('#loaderDetalhes').show();
        $('#conteudoDetalhes').hide();

        // ✅ Armazenar o alertaId no botão de baixa
        $('#btnBaixaAlerta').data('alerta-id', alertaId);

        const response = await fetch(`/api/AlertasFrotiX/GetDetalhesAlerta/${alertaId}`);

        if (!response.ok)
        {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        const resultado = await response.json();

        console.log('🔍 DEBUG:', resultado.debug);
        console.log('Leram:', resultado.data.leram);
        console.log('Usuários:', resultado.data.usuarios);

        if (!resultado.success)
        {
            throw new Error(resultado.message || 'Erro ao carregar detalhes');
        }

        const alerta = resultado.data;
        preencherModalDetalhes(alerta);

        // ✅ Verificar permissão e mostrar/esconder botão
        verificarPermissaoBaixaAlerta(alerta);

        $('#loaderDetalhes').hide();
        $('#conteudoDetalhes').show();

    } catch (erro)
    {
        console.error('Erro ao carregar detalhes:', erro);

        $('#loaderDetalhes').hide();
        $('#conteudoDetalhes').html(`
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                Erro ao carregar detalhes do alerta: ${erro.message}
            </div>
        `).show();

        await Alerta.TratamentoErroComLinha(
            'alertas_gestao.js',
            'verDetalhesAlerta',
            erro
        );
    }
}

// ═══════════════════════════════════════════════════════════════════
// FUNÇÃO: Popular Modal com os Dados
// ═══════════════════════════════════════════════════════════════════

function popularModalDetalhes(alerta)
{
    console.log('Populando modal com dados:', alerta);

    // ========== TÍTULO E DESCRIÇÃO ==========
    $('#tituloAlerta').text(alerta.titulo || 'Sem título');
    $('#descricaoAlerta').text(alerta.descricao || 'Sem descrição');

    // ========== BADGES ==========
    const corStatus = alerta.ativo ? '#28a745' : alerta.expirado ? '#ffc107' : '#dc3545';
    const textoStatus = alerta.status || 'Desconhecido';

    $('#badgeTipo').attr('style', `background-color: ${alerta.corBadge}`).text(alerta.tipo);
    $('#badgePrioridade').attr('style', `background-color: ${alerta.corBadge}`).text(alerta.prioridade);
    $('#badgeStatus').attr('style', `background-color: ${corStatus}`).text(textoStatus);

    // ========== ÍCONE ==========
    $('#iconeAlerta').attr('class', alerta.iconeCss).attr('style', `color: ${alerta.corBadge}`);

    // ========== INFORMAÇÕES GERAIS ==========
    $('#dataCriacao').text(formatarDataHora(alerta.dataInsercao));
    $('#dataExibicao').text(alerta.dataExibicao ? formatarDataHora(alerta.dataExibicao) : 'Imediata');
    $('#criadoPor').text(obterNomeCriador(alerta.usuarioCriadorId));
    $('#tempoNoAr').text(alerta.tempoNoArFormatado || 'N/A');

    // ========== ESTATÍSTICAS ==========
    const stats = alerta.estatisticas;

    $('#totalDestinatarios').text(stats.totalUsuarios || 0);
    $('#totalNotificados').text(stats.totalNotificados || 0);
    $('#aguardandoLeitura').text(stats.totalNaoLidos || 0);
    $('#totalLeram').text(stats.totalLidos || 0);
    $('#totalNaoLeram').text(stats.totalNaoLidos || 0);
    $('#totalApagaram').text(stats.totalApagados || 0);

    // ========== PROGRESSO DE LEITURA ==========
    const percentual = stats.percentualLeitura || 0;
    $('#progressoLeitura').css('width', percentual + '%').attr('aria-valuenow', percentual);
    $('#percentualLeitura').text(percentual.toFixed(1) + '%');

    // ========== USUÁRIOS NOTIFICADOS ==========
    popularTabelaUsuarios(alerta.usuarios || []);
}

function obterNomeCriador(criadorId)
{
    if (!criadorId) return 'Desconhecido';
    if (criadorId.toLowerCase() === 'system' || criadorId.toLowerCase() === 'sistema')
    {
        return 'Sistema';
    }
    // Você pode fazer uma requisição para buscar o nome do usuário
    // Por enquanto, retorna o ID
    return criadorId;
}

// ═══════════════════════════════════════════════════════════════════
// FUNÇÃO: Popular Tabela de Usuários
// ═══════════════════════════════════════════════════════════════════

function popularTabelaUsuarios(usuarios)
{
    const tbody = $('#tabelaUsuarios tbody');
    tbody.empty();

    if (!usuarios || usuarios.length === 0)
    {
        tbody.html(`
            <tr>
                <td colspan="5" class="text-center text-muted">
                    Nenhum usuário foi notificado
                </td>
            </tr>
        `);
        return;
    }

    usuarios.forEach(usuario =>
    {
        const statusHtml = gerarStatusUsuario(usuario);
        const dataNotificacao = usuario.dataNotificacao ? formatarDataHora(usuario.dataNotificacao) : '-';
        const dataLeitura = usuario.dataLeitura ? formatarDataHora(usuario.dataLeitura) : '-';
        const tempoLeitura = usuario.tempoAteLeitura
            ? formatarTempoMinutos(usuario.tempoAteLeitura)
            : '-';

        const row = `
            <tr>
                <td>
                    <div class="font-weight-bold">${usuario.nome || 'Sem nome'}</div>
                    <small class="text-muted">${usuario.email || ''}</small>
                </td>
                <td class="text-center">${statusHtml}</td>
                <td class="text-center">${dataNotificacao}</td>
                <td class="text-center">${dataLeitura}</td>
                <td class="text-center">${tempoLeitura}</td>
            </tr>
        `;

        tbody.append(row);
    });
}

// ═══════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════

function formatarTempoMinutos(minutos)
{
    if (!minutos || minutos < 0) return '-';

    if (minutos < 1)
    {
        return 'Menos de 1 min';
    } else if (minutos < 60)
    {
        return Math.round(minutos) + ' min';
    } else
    {
        const horas = Math.floor(minutos / 60);
        const mins = Math.round(minutos % 60);
        return `${horas}h ${mins}min`;
    }
}

function formatarDataHora(dataString)
{
    if (!dataString) return '-';

    try
    {
        const data = new Date(dataString);
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e)
    {
        return dataString;
    }
}

function gerarStatusUsuario(usuario)
{
    let badge = '';
    let icone = '';
    let cor = '';

    if (usuario.apagado)
    {
        badge = 'Apagou sem ler';
        icone = 'fa-trash';
        cor = 'danger';
    } else if (usuario.lido)
    {
        badge = 'Lido';
        icone = 'fa-check-circle';
        cor = 'success';
    } else if (usuario.notificado)
    {
        badge = 'Não lido';
        icone = 'fa-clock';
        cor = 'warning';
    } else
    {
        badge = 'Não notificado';
        icone = 'fa-circle';
        cor = 'secondary';
    }

    return `<span class="badge badge-${cor}"><i class="fas ${icone}"></i> ${badge}</span>`;
}


// ============================================
// FUNÇÃO: PREENCHER MODAL DETALHES - CORRIGIDA
// ============================================
function preencherModalDetalhes(alerta)
{
    try
    {
        console.log('📋 Preenchendo modal com:', alerta);

        // ============================================
        // 1. TÍTULO E DESCRIÇÃO
        // ============================================
        $('#tituloAlerta').text(alerta.titulo || 'Sem título');
        $('#descricaoAlerta').text(alerta.descricao || 'Sem descrição');

        // ============================================
        // 2. STATUS DO ALERTA
        // ============================================
        let statusHtml = '';
        let statusClass = '';

        if (alerta.ativo)
        {
            statusHtml = '<span class="badge badge-success"><i class="fa-duotone fa-check-circle"></i> Ativo</span>';
            statusClass = 'border-left-success';
        } else if (alerta.expirado)
        {
            statusHtml = '<span class="badge badge-danger"><i class="fa-duotone fa-clock"></i> Expirado</span>';
            statusClass = 'border-left-danger';
        } else
        {
            statusHtml = '<span class="badge badge-secondary"><i class="fa-duotone fa-ban"></i> Inativo</span>';
            statusClass = 'border-left-secondary';
        }

        $('#badgeStatus').html(statusHtml);
        $('#alertaCabecalho')
            .removeClass('border-left-success border-left-danger border-left-secondary')
            .addClass(statusClass);

        // ============================================
        // 3. TIPO E PRIORIDADE
        // ============================================
        $('#badgeTipo').html(`<i class="fa-duotone fa-tag"></i> ${alerta.tipoAlerta || alerta.tipo || 'Geral'}`);

        const corPrioridade = alerta.corBadge || '#6c757d';
        $('#badgePrioridade')
            .html(`<i class="fa-duotone fa-flag"></i> ${alerta.prioridade || 'Normal'}`)
            .css('background-color', corPrioridade);

        // ============================================
        // 4. ÍCONE DO ALERTA
        // ============================================
        const icone = alerta.iconeCss || 'fa-duotone fa-bell';
        $('#iconeAlerta')
            .attr('class', `${icone} fa-3x`)
            .css('color', corPrioridade);

        // ============================================
        // 5. INFORMAÇÕES GERAIS - TENTANDO MÚLTIPLOS CAMPOS
        // ============================================

        // Data de Criação: tenta múltiplos nomes
        const dataCriacao = alerta.dataCriacao || alerta.dataInsercao || alerta.dataCadastro;
        $('#dataCriacao').text(dataCriacao ? formatarDataCompleta(dataCriacao) : '-');
        console.log('📅 Data de Criação:', dataCriacao);

        // Data de Exibição
        $('#dataExibicao').text(alerta.dataExibicao ? formatarDataCompleta(alerta.dataExibicao) : 'Imediata');

        // Criado por
        const criador = alerta.nomeCriador || alerta.criadoPor || alerta.usuarioCriador || 'Sistema';
        $('#criadoPor').text(criador);

        // Tempo no Ar - se vier formatado do backend, usa; senão, formata aqui
        let tempoNoAr = alerta.tempoNoAr;
        if (tempoNoAr && tempoNoAr.includes(':'))
        {
            // Se veio no formato TimeSpan (04:50:39.0875933), formatar
            tempoNoAr = formatarTimeSpan(tempoNoAr);
        }
        $('#tempoNoAr').text(tempoNoAr || 'N/A');
        console.log('⏱️ Tempo no Ar:', tempoNoAr);

        // ============================================
        // 6. ESTATÍSTICAS - TENTANDO MÚLTIPLOS NOMES
        // ============================================

        // Total Destinatários
        const totalDest = alerta.totalDestinatarios || alerta.totalUsuarios || 0;

        // Total Notificados
        const totalNotif = alerta.totalNotificados || alerta.notificados || 0;

        // Aguardando
        const aguardando = alerta.aguardandoNotificacao || alerta.aguardando ||
            (totalDest - totalNotif);

        // Leram
        const leram = alerta.leram || alerta.totalLidos || alerta.usuariosLeram || 0;

        // Não Leram (calculado se não vier do backend)
        const naoLeram = alerta.naoLeram || alerta.totalNaoLidos ||
            (totalNotif - leram);

        // Apagaram
        const apagaram = alerta.apagaram || alerta.totalApagados || alerta.usuariosApagaram || 0;

        console.log('📊 Estatísticas processadas:', {
            totalDestinatarios: totalDest,
            totalNotificados: totalNotif,
            aguardando: aguardando,
            leram: leram,
            naoLeram: naoLeram,
            apagaram: apagaram
        });

        // Preencher RESUMO (lado direito das informações gerais)
        $('#totalDestinatariosResumo').text(totalDest);
        $('#totalNotificadosResumo').text(totalNotif);
        $('#aguardandoNotificacaoResumo').text(aguardando);
        $('#usuariosLeramResumo').text(leram);
        $('#usuariosNaoLeramResumo').text(naoLeram);
        $('#usuariosApagaramResumo').text(apagaram);

        // Preencher CARDS GRANDES
        $('#totalDestinatarios').text(totalDest);
        $('#totalNotificados').text(totalNotif);
        $('#aguardandoNotificacao').text(aguardando);
        $('#usuariosLeram').text(leram);
        $('#usuariosNaoLeram').text(naoLeram);
        $('#usuariosApagaram').text(apagaram);

        // ============================================
        // 7. BARRA DE PROGRESSO
        // ============================================
        const totalBase = totalNotif > 0 ? totalNotif : 1; // Evita divisão por zero
        const percentual = ((leram / totalBase) * 100).toFixed(1);

        $('#progressoLeitura')
            .css('width', percentual + '%')
            .attr('aria-valuenow', percentual);

        $('#textoProgressoBarra').text(percentual + '%');
        $('#infoLeitores').text(`${leram} de ${totalNotif} usuários notificados leram o alerta`);

        // ============================================
        // 8. TABELA DE USUÁRIOS
        // ============================================
        console.log('👥 Total de usuários recebidos:', (alerta.usuarios || []).length);
        preencherTabelaUsuarios(alerta.usuarios || []);

        // ============================================
        // 9. LINKS RELACIONADOS
        // ============================================
        preencherLinksRelacionados(alerta);

        console.log('✅ Modal preenchido com sucesso');

    } catch (error)
    {
        console.error('❌ Erro ao preencher modal:', error);
        console.error('Stack:', error.stack);
        Alerta.TratamentoErroComLinha("alertas_gestao.js", "preencherModalDetalhes", error);
    }
}

// ============================================
// FUNÇÃO AUXILIAR: Formatar TimeSpan
// ============================================
function formatarTimeSpan(timeSpanString)
{
    try
    {
        // Remove tudo após o ponto decimal se houver
        const semMilissegundos = timeSpanString.split('.')[0];

        // Divide em partes: HH:MM:SS
        const partes = semMilissegundos.split(':');

        if (partes.length === 3)
        {
            const horas = parseInt(partes[0]);
            const minutos = parseInt(partes[1]);

            if (horas === 0)
            {
                return `${minutos} min`;
            } else
            {
                return `${horas}h ${minutos}min`;
            }
        }

        return timeSpanString;
    } catch (e)
    {
        console.error('Erro ao formatar TimeSpan:', e);
        return timeSpanString;
    }
}

// ============================================
// FUNÇÃO AUXILIAR: PREENCHER LINKS RELACIONADOS
// ============================================
function preencherLinksRelacionados(alerta)
{
    const container = $('#linksRelacionados');
    container.empty();

    const links = [];

    // Verificar links relacionados
    if (alerta.viagemId)
    {
        links.push({
            texto: 'Ver Viagem',
            url: `/Viagens/Detalhes/${alerta.viagemId}`,
            icone: 'fa-duotone fa-route'
        });
    }

    if (alerta.manutencaoId)
    {
        links.push({
            texto: 'Ver Manutenção',
            url: `/Manutencoes/Detalhes/${alerta.manutencaoId}`,
            icone: 'fa-duotone fa-wrench'
        });
    }

    if (alerta.motoristaId)
    {
        links.push({
            texto: 'Ver Motorista',
            url: `/Motoristas/Detalhes/${alerta.motoristaId}`,
            icone: 'fa-duotone fa-user'
        });
    }

    if (alerta.veiculoId)
    {
        links.push({
            texto: 'Ver Veículo',
            url: `/Veiculos/Detalhes/${alerta.veiculoId}`,
            icone: 'fa-duotone fa-car'
        });
    }

    if (links.length > 0)
    {
        links.forEach(link =>
        {
            container.append(`
                <a href="${link.url}" class="btn btn-sm btn-outline-primary me-2 mb-2" target="_blank">
                    <i class="${link.icone} me-1"></i>
                    ${link.texto}
                </a>
            `);
        });
    } else
    {
        container.html('<small class="text-muted">Nenhum link relacionado</small>');
    }
}


// Função para preencher tabela de usuários - COM ORDENAÇÃO POR NOME
// ============================================
// FUNÇÃO AUXILIAR: PREENCHER TABELA DE USUÁRIOS
// ============================================
function preencherTabelaUsuarios(usuarios)
{
    console.log('📋 Preenchendo tabela com', usuarios.length, 'usuários');

    const tbody = $('#tabelaUsuarios');
    tbody.empty();

    if (!usuarios || usuarios.length === 0)
    {
        tbody.html(`
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="fa-duotone fa-inbox fa-2x mb-2 d-block"></i>
                    <p class="mb-0">Nenhum usuário recebeu este alerta</p>
                </td>
            </tr>
        `);
        return;
    }

    // Ordenar usuários por nome (case-insensitive)
    const usuariosOrdenados = [...usuarios].sort((a, b) =>
    {
        const nomeA = (a.nomeUsuario || '').toLowerCase();
        const nomeB = (b.nomeUsuario || '').toLowerCase();
        return nomeA.localeCompare(nomeB, 'pt-BR');
    });

    // Criar linhas da tabela
    usuariosOrdenados.forEach(usuario =>
    {
        // Badge de Notificado
        const notificadoBadge = usuario.notificado
            ? '<span class="badge bg-success"><i class="fa fa-check"></i> Sim</span>'
            : '<span class="badge bg-warning"><i class="fa fa-clock"></i> Aguardando</span>';

        // Status de Leitura
        let statusLeitura = '';
        if (usuario.apagado)
        {
            statusLeitura = '<span class="badge bg-secondary"><i class="fa fa-trash"></i> Apagado</span>';
        } else if (usuario.lido)
        {
            statusLeitura = '<span class="badge bg-success"><i class="fa fa-check"></i> Lido</span>';
        } else if (usuario.notificado)
        {
            statusLeitura = '<span class="badge bg-danger"><i class="fa fa-times"></i> Não Lido</span>';
        } else
        {
            statusLeitura = '<span class="badge bg-secondary"><i class="fa fa-minus"></i> N/A</span>';
        }

        // Datas formatadas
        const dataNotificacao = usuario.dataNotificacao
            ? formatarDataCompleta(usuario.dataNotificacao)
            : '<span class="text-muted">-</span>';

        const dataLeitura = usuario.dataLeitura
            ? formatarDataCompleta(usuario.dataLeitura)
            : '<span class="text-muted">-</span>';

        // Calcular tempo até leitura
        let tempoLeitura = '<span class="text-muted">-</span>';
        if (usuario.dataNotificacao && usuario.dataLeitura)
        {
            const notif = new Date(usuario.dataNotificacao);
            const leit = new Date(usuario.dataLeitura);
            const diffMinutos = Math.floor((leit - notif) / 1000 / 60);

            if (diffMinutos < 60)
            {
                tempoLeitura = `${diffMinutos} min`;
            } else
            {
                const horas = Math.floor(diffMinutos / 60);
                const mins = diffMinutos % 60;
                tempoLeitura = `${horas}h ${mins}min`;
            }
        }

        // Adicionar linha
        const row = `
            <tr>
                <td>
                    <i class="fa-duotone fa-user text-primary"></i>
                    <strong>${usuario.nomeUsuario || 'Sem nome'}</strong>
                    ${usuario.email ? `<br><small class="text-muted">${usuario.email}</small>` : ''}
                </td>
                <td class="text-center">${notificadoBadge}</td>
                <td class="text-center">${statusLeitura}</td>
                <td class="text-center">${dataNotificacao}</td>
                <td class="text-center">${dataLeitura}</td>
                <td class="text-center">${tempoLeitura}</td>
            </tr>
        `;

        tbody.append(row);
    });

    console.log('✅ Tabela preenchida com', usuariosOrdenados.length, 'usuários');
}

function preencherTimeline(eventos) 
{
    try 
    {
        var html = '';

        eventos.forEach(function (evento)
        {
            var classeItem = '';
            var icone = '';
            var cor = '';

            switch (evento.tipo)
            {
                case 'criado':
                    icone = 'fa-plus-circle';
                    cor = 'text-primary';
                    break;
                case 'lido':
                    icone = 'fa-check-circle';
                    cor = 'text-success';
                    classeItem = 'lido';
                    break;
                case 'apagado':
                    icone = 'fa-times-circle';
                    cor = 'text-danger';
                    classeItem = 'apagado';
                    break;
                case 'expirado':
                    icone = 'fa-clock';
                    cor = 'text-warning';
                    break;
            }

            html += `
                <div class="timeline-item ${classeItem}">
                    <div class="d-flex align-items-start">
                        <i class="fa-duotone ${icone} ${cor} fa-lg me-3"></i>
                        <div>
                            <h6 class="mb-1">${evento.descricao}</h6>
                            <small class="text-muted">
                                <i class="fa-duotone fa-calendar"></i> ${formatarDataCompleta(evento.data)}
                            </small>
                            ${evento.usuario ? `<br><small class="text-muted"><i class="fa-duotone fa-user"></i> ${evento.usuario}</small>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        $('#conteudoTimeline').html(html);
    }
    catch (error) 
    {
        TratamentoErroComLinha("alertas_gestao.js", "preencherTimeline", error);
    }
}

// === FUNÇÕES AUXILIARES ===

function obterClasseBadge(tipo) 
{
    var mapa = {
        'Agendamento': 'badge-agendamento',
        'Manutenção': 'badge-manutencao',
        'Motorista': 'badge-motorista',
        'Veículo': 'badge-veiculo',
        'Anúncio': 'badge-anuncio',
        'Diversos': 'badge-diversos'
    };
    return mapa[tipo] || 'badge-diversos';
}

function obterClassePrioridade(prioridade) 
{
    if (typeof prioridade === 'string')
    {
        prioridade = prioridade.toLowerCase();
    }

    switch (prioridade)
    {
        case 'alta':
        case 3:
            return 'prioridade-alta';
        case 'média':
        case 'media':
        case 2:
            return 'prioridade-media';
        default:
            return 'prioridade-baixa';
    }
}

function obterCorBorda(tipo) 
{
    switch (tipo)
    {
        case 1: return 'info';
        case 2: return 'warning';
        case 3: return 'success';
        case 4: return 'primary';
        case 5: return 'danger';
        default: return 'secondary';
    }
}

function obterTextoPorTipo(tipo) 
{
    var mapa = {
        1: 'Agendamento',
        2: 'Manutenção',
        3: 'Motorista',
        4: 'Veículo',
        5: 'Anúncio',
        6: 'Diversos'
    };
    return mapa[tipo] || 'Diversos';
}

function formatarData(dataString) 
{
    try
    {
        if (!dataString) return '';
        var data = new Date(dataString);
        return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    catch (error)
    {
        return dataString;
    }
}


function calcularTempoNoAr(data) 
{
    try 
    {
        var inicio = new Date(data.dataInsercao);
        var fim = !data.ativo && data.dataDesativacao ? new Date(data.dataDesativacao) : new Date();
        var diff = fim - inicio;

        var dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        var horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (dias > 0)
        {
            return `${dias}d ${horas}h ${minutos}min`;
        } else if (horas > 0)
        {
            return `${horas}h ${minutos}min`;
        } else
        {
            return `${minutos} minutos`;
        }
    }
    catch (error) 
    {
        return '-';
    }
}

function calcularDiferenca(dataInicial, dataFinal) 
{
    try 
    {
        var inicio = new Date(dataInicial);
        var fim = new Date(dataFinal);
        var diff = fim - inicio;
        var minutos = Math.floor(diff / (1000 * 60));
        var horas = Math.floor(minutos / 60);
        var dias = Math.floor(horas / 24);

        if (dias > 0)
        {
            return `${dias}d ${horas % 24}h`;
        } else if (horas > 0)
        {
            return `${horas}h ${minutos % 60}min`;
        } else
        {
            return `${minutos} min`;
        }
    }
    catch (error) 
    {
        return '-';
    }
}

function atualizarBadgeAtivos(quantidade) 
{
    var badge = $('#badgeAtivos');
    if (badge.length)
    {
        badge.text(quantidade);
        if (quantidade > 0)
        {
            badge.removeClass('bg-secondary').addClass('bg-danger');
        } else
        {
            badge.removeClass('bg-danger').addClass('bg-secondary');
        }
    }
}

function configurarTooltips() 
{
    if (typeof ej !== 'undefined' && ej.popups && ej.popups.Tooltip)
    {
        var tooltip = new ej.popups.Tooltip({
            cssClass: 'ftx-tooltip-noarrow',
            position: 'TopCenter',
            animation: {
                open: { effect: 'FadeIn', duration: 150 },
                close: { effect: 'FadeOut', duration: 150 }
            }
        });
        tooltip.appendTo('body');
    }
}

function escapeHtml(text) 
{
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event handler para exportar detalhes
$(document).on('click', '#btnExportarDetalhes', function ()
{
    try
    {
        if (!alertaDetalhesAtual) return;

        var dadosExport = {
            alertaId: alertaDetalhesAtual.alertaId,
            titulo: alertaDetalhesAtual.titulo,
            usuarios: alertaDetalhesAtual.usuarios
        };

        $.ajax({
            url: '/api/AlertasFrotiX/ExportarDetalhes',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dadosExport),
            xhrFields: { responseType: 'blob' },
            success: function (data)
            {
                var a = document.createElement('a');
                var url = window.URL.createObjectURL(data);
                a.href = url;
                a.download = `Alerta_${alertaDetalhesAtual.titulo}_${new Date().toISOString().slice(0, 10)}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                AppToast.show("Verde", "Relatório exportado com sucesso!", 2000);
            },
            error: function (xhr, status, error)
            {
                AppToast.show("Vermelho", "Erro ao exportar relatório", 3000);
                TratamentoErroComLinha("alertas_gestao.js", "ExportarDetalhes.error", error);
            }
        });
    } catch (error)
    {
        TratamentoErroComLinha("alertas_gestao.js", "btnExportarDetalhes.click", error);
    }
});

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function obterNomeTipo(tipo)
{
    try
    {
        const tipos = {
            1: 'Viagem',
            2: 'Manutenção',
            3: 'Vencimento',
            4: 'Veículo',
            5: 'Geral'
        };
        return tipos[tipo] || 'Desconhecido';
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_gestao.js", "obterNomeTipo", error);
        return 'Desconhecido';
    }
}
function obterNomePrioridade(prioridade)
{
    try
    {
        const prioridades = {
            1: 'Baixa',
            2: 'Média',
            3: 'Alta',
            4: 'Crítica'
        };
        return prioridades[prioridade] || 'Desconhecida';
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_gestao.js", "obterNomePrioridade", error);
        return 'Desconhecida';
    }
}

function obterCorPrioridade(prioridade)
{
    try
    {
        const cores = {
            1: '#17a2b8',  // Info
            2: '#ffc107',  // Warning
            3: '#fd7e14',  // Orange
            4: '#dc3545'   // Danger
        };
        return cores[prioridade] || '#6c757d';
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_gestao.js", "obterCorPrioridade", error);
        return '#6c757d';
    }
}

function obterIconePorTipo(tipo)
{
    try
    {
        const icones = {
            1: 'fa-duotone fa-route',
            2: 'fa-duotone fa-wrench',
            3: 'fa-duotone fa-calendar-exclamation',
            4: 'fa-duotone fa-car',
            5: 'fa-duotone fa-bell'
        };
        return icones[tipo] || 'fa-duotone fa-bell';
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_gestao.js", "obterIconePorTipo", error);
        return 'fa-duotone fa-bell';
    }
}

// ============================================
// FUNÇÃO AUXILIAR: FORMATAR DATA COMPLETA
// ============================================
// ============================================
// FUNÇÃO AUXILIAR: FORMATAR DATA COMPLETA
// ============================================
function formatarDataCompleta(dataStr)
{
    if (!dataStr) return '-';

    const data = new Date(dataStr);

    if (isNaN(data.getTime()))
    {
        return dataStr; // Retorna a string original se não for uma data válida
    }

    const opcoes = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return data.toLocaleString('pt-BR', opcoes);
}

/**
* Verifica permissão e controla visibilidade do botão
*/
function verificarPermissaoBaixaAlerta(alerta) 
{
    try 
    {
        var btnBaixa = $('#btnBaixaAlerta');

        // Se não temos dados do alerta, esconder botão
        if (!alerta || !alerta.alertaId)
        {
            btnBaixa.hide();
            return;
        }

        // Chamar API para verificar permissão
        $.ajax({
            url: `/api/AlertasFrotiX/VerificarPermissaoBaixa/${alerta.alertaId}`,
            type: 'GET',
            success: function (response)
            {
                if (response.podeDarBaixa)
                {
                    btnBaixa.show();  // ✅ Mostrar botão
                }
                else
                {
                    btnBaixa.hide();  // 🚫 Esconder botão
                    console.log('Usuário sem permissão:', response.motivo);
                }
            },
            error: function (xhr, status, error)
            {
                console.error('Erro ao verificar permissão:', error);
                btnBaixa.hide(); // Em caso de erro, esconder botão
            }
        });
    }
    catch (error) 
    {
        TratamentoErroComLinha("alertas_gestao.js", "verificarPermissaoBaixaAlerta", error);
        $('#btnBaixaAlerta').hide();
    }
}

// Garantir que o modal sempre feche
$(document).on('click', '[data-dismiss="modal"], [data-bs-dismiss="modal"]', function ()
{
    const modalId = $(this).closest('.modal').attr('id');
    if (modalId)
    {
        $(`#${modalId}`).modal('hide');

        // Força limpeza após 300ms
        setTimeout(() =>
        {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            $('body').css('padding-right', '');
        }, 300);
    }
});

// Fechar modal ao clicar fora
$(document).on('click', '.modal', function (e)
{
    if (e.target === this)
    {
        $(this).modal('hide');
    }
});

// Fechar modal com ESC
$(document).on('keydown', function (e)
{
    if (e.key === 'Escape' && $('.modal.show').length)
    {
        $('.modal.show').modal('hide');
    }
});

/**
* Dar baixa no alerta com confirmação
*/
function darBaixaAlertaComConfirmacao(alertaId) 
{
    try
    {
        Alerta.Confirmar(
            "Tem certeza que deseja dar baixa neste alerta?",
            "Esta ação não pode ser desfeita. O alerta será marcado como finalizado.",
            "Sim, dar baixa",
            "Cancelar"
        ).then((confirmado) =>
        {
            try
            {
                if (confirmado)
                {
                    executarBaixaAlerta(alertaId);
                }
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("alertas_gestao.js", "darBaixaAlertaComConfirmacao.callback", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("alertas_gestao.js", "darBaixaAlertaComConfirmacao", error);
    }
}

/**
 * Executa a baixa do alerta via AJAX
 */
function executarBaixaAlerta(alertaId) 
{
    try
    {
        $.ajax({
            url: `/api/AlertasFrotiX/DarBaixaAlerta/${alertaId}`,
            type: 'POST',
            contentType: 'application/json',
            success: function (response) 
            {
                try
                {
                    if (response.success) 
                    {
                        // ✅ Mostrar toast de sucesso
                        AppToast.show("Verde", "Baixa do alerta realizada com sucesso", 2000);

                        // ✅ Fechar o modal
                        $('#modalDetalhesAlerta').modal('hide');

                        // ✅ Aguardar o modal fechar antes de atualizar
                        setTimeout(function () 
                        {
                            // ✅ Atualizar aba de Alertas Ativos
                            carregarAlertasGestao();

                            // ✅ Atualizar tabela de Histórico
                            if (tabelaAlertasLidos && tabelaAlertasLidos.ajax)
                            {
                                tabelaAlertasLidos.ajax.reload(null, false);
                            }

                            // ✅ Atualizar alertas do sino
                            carregarAlertasAtivos();

                        }, 500);
                    }
                    else
                    {
                        AppToast.show("Amarelo", response.mensagem || "Não foi possível dar baixa no alerta", 3000);
                    }
                }
                catch (error)
                {
                    Alerta.TratamentoErroComLinha("alertas_gestao.js", "executarBaixaAlerta.success", error);
                }
            },
            error: function (xhr, status, error) 
            {
                try
                {
                    console.error('Erro ao dar baixa no alerta:', error);

                    var mensagemErro = "Erro ao dar baixa no alerta";
                    if (xhr.responseJSON && xhr.responseJSON.mensagem) 
                    {
                        mensagemErro = xhr.responseJSON.mensagem;
                    }

                    AppToast.show("Vermelho", mensagemErro, 3000);
                }
                catch (error)
                {
                    Alerta.TratamentoErroComLinha("alertas_gestao.js", "executarBaixaAlerta.error", error);
                }
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("alertas_gestao.js", "executarBaixaAlerta", error);
    }
}

/**
 * Dar baixa no alerta com confirmação usando Alerta.Confirmar
 */
function darBaixaAlertaComConfirmacao(alertaId) 
{
    try
    {
        Alerta.Confirmar(
            "Tem certeza que deseja dar baixa neste alerta?",
            "Esta ação não pode ser desfeita. O alerta será marcado como finalizado.",
            "Sim, dar baixa",
            "Cancelar"
        ).then((confirmado) =>
        {
            try
            {
                if (confirmado)
                {
                    executarBaixaAlertaAjax(alertaId);
                }
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("alertas_gestao.js", "darBaixaAlertaComConfirmacao.callback", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("alertas_gestao.js", "darBaixaAlertaComConfirmacao", error);
    }
}

/**
 * Executa a requisição AJAX para dar baixa no alerta
 */
function executarBaixaAlertaAjax(alertaId) 
{
    try
    {
        $.ajax({
            url: `/api/AlertasFrotiX/DarBaixaAlerta/${alertaId}`,
            type: 'POST',
            contentType: 'application/json',
            success: function (response) 
            {
                try
                {
                    if (response.success) 
                    {
                        AppToast.show("Verde", "Baixa do alerta realizada com sucesso", 2000);
                        $('#modalDetalhesAlerta').modal('hide');

                        setTimeout(function () 
                        {
                            carregarAlertasGestao();

                            if (tabelaAlertasLidos && tabelaAlertasLidos.ajax)
                            {
                                tabelaAlertasLidos.ajax.reload(null, false);
                            }

                            carregarAlertasAtivos();
                        }, 500);
                    }
                    else
                    {
                        AppToast.show("Amarelo", response.mensagem || "Não foi possível dar baixa no alerta", 3000);
                    }
                }
                catch (error)
                {
                    Alerta.TratamentoErroComLinha("alertas_gestao.js", "executarBaixaAlertaAjax.success", error);
                }
            },
            error: function (xhr, status, error) 
            {
                try
                {
                    console.error('Erro ao dar baixa no alerta:', error);

                    var mensagemErro = "Erro ao dar baixa no alerta";
                    if (xhr.responseJSON && xhr.responseJSON.mensagem) 
                    {
                        mensagemErro = xhr.responseJSON.mensagem;
                    }

                    AppToast.show("Vermelho", mensagemErro, 3000);
                }
                catch (error)
                {
                    Alerta.TratamentoErroComLinha("alertas_gestao.js", "executarBaixaAlertaAjax.error", error);
                }
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("alertas_gestao.js", "executarBaixaAlertaAjax", error);
    }
}

/**
* Ver detalhes de um alerta inativo (sem botão de baixa)
*/
async function verDetalhesAlertaInativo(alertaId)
{
    try
    {
        console.log('Carregando detalhes do alerta inativo:', alertaId);

        $('#modalDetalhesAlerta').modal('show');
        $('#loaderDetalhes').show();
        $('#conteudoDetalhes').hide();

        // ✅ ESCONDER botão de baixa para alertas inativos
        $('#btnBaixaAlerta').hide();

        const response = await fetch(`/api/AlertasFrotiX/GetDetalhesAlerta/${alertaId}`);

        if (!response.ok)
        {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        const resultado = await response.json();

        if (!resultado.success)
        {
            throw new Error(resultado.message || 'Erro ao carregar detalhes');
        }

        const alerta = resultado.data;
        preencherModalDetalhes(alerta);

        $('#loaderDetalhes').hide();
        $('#conteudoDetalhes').show();

    } catch (erro)
    {
        console.error('Erro ao carregar detalhes:', erro);

        $('#loaderDetalhes').hide();
        $('#conteudoDetalhes').html(`
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                Erro ao carregar detalhes do alerta: ${erro.message}
            </div>
        `).show();

        await Alerta.TratamentoErroComLinha(
            'alertas_gestao.js',
            'verDetalhesAlertaInativo',
            erro
        );
    }
}

// ============================================
// DATATABLE: MEUS ALERTAS
// ============================================
var tabelaMeusAlertas;

function inicializarDataTableMeusAlertas() 
{
    try
    {
        if ($('#tblMeusAlertas').length === 0) return;

        tabelaMeusAlertas = $('#tblMeusAlertas').DataTable({
            "processing": true,
            "serverSide": false,
            "ajax": {
                "url": "/api/AlertasFrotiX/GetMeusAlertas",
                "type": "GET",
                "datatype": "json",
                "dataSrc": function (json)
                {
                    if (json && json.data)
                    {
                        atualizarBadgeMeusAlertas(json.data.length);
                        return json.data;
                    }
                    atualizarBadgeMeusAlertas(0);
                    return [];
                },
                "error": function (xhr, error, code) 
                {
                    TratamentoErroComLinha("alertas_gestao.js", "ajax.getMeusAlertas.error", error);
                    atualizarBadgeMeusAlertas(0);
                }
            },
            "columns": [
                {
                    "data": "icone",
                    "render": function (data, type, row) 
                    {
                        var corIcone = obterCorPorTipo(row.tipo);
                        return `<i class="${data} fa-lg" style="color: ${corIcone}"></i>`;
                    },
                    "className": "text-center",
                    "width": "3%"
                },
                {
                    "data": "titulo",
                    "width": "15%"
                },
                {
                    "data": "descricao",
                    "render": function (data, type, row) 
                    {
                        if (data.length > 100)
                        {
                            return data.substring(0, 100) + '...';
                        }
                        return data;
                    },
                    "width": "30%"
                },
                {
                    "data": "tipo",
                    "render": function (data) 
                    {
                        var badgeClass = obterClasseBadge(data);
                        return `<span class="badge badge-tipo ${badgeClass}">${data}</span>`;
                    },
                    "className": "text-center",
                    "width": "8%"
                },
                {
                    "data": "notificado",
                    "render": function (data, type, row) 
                    {
                        if (data)
                        {
                            return '<span class="badge bg-success"><i class="fa fa-check"></i> Sim</span>';
                        } else
                        {
                            return '<span class="badge bg-warning"><i class="fa fa-clock"></i> Não</span>';
                        }
                    },
                    "className": "text-center",
                    "width": "8%"
                },
                {
                    "data": "dataNotificacao",
                    "className": "text-center",
                    "width": "10%"
                },
                {
                    "data": "lido",
                    "render": function (data, type, row) 
                    {
                        if (data)
                        {
                            return '<span class="badge bg-success"><i class="fa fa-check-circle"></i> Sim</span>';
                        } else
                        {
                            return '<span class="badge bg-danger"><i class="fa fa-times-circle"></i> Não</span>';
                        }
                    },
                    "className": "text-center",
                    "width": "8%"
                },
                {
                    "data": "dataLeitura",
                    "className": "text-center",
                    "width": "10%"
                },
                {
                    "data": "alertaId",
                    "render": function (data, type, row) 
                    {
                        return `
                            <button class="btn btn-info btn-sm" 
                                    onclick="verDetalhesAlerta('${data}')" 
                                    title="Ver Detalhes"
                                    data-ejtip="Ver detalhes completos do alerta">
                                <i class="fa-duotone fa-eye"></i>
                            </button>`;
                    },
                    "className": "text-center",
                    "orderable": false,
                    "width": "8%"
                }
            ],
            "order": [[1, "desc"]], // Ordenar por data de criação (coluna oculta ou usar índice da coluna de título)
            "language": {
                "url": "//cdn.datatables.net/plug-ins/1.13.8/i18n/pt-BR.json"
            },
            "pageLength": 25,
            "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
            "responsive": true,
            "dom": '<"top"lf>rt<"bottom"ip><"clear">',
            "initComplete": function () 
            {
                configurarTooltips();
            }
        });
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_gestao.js", "inicializarDataTableMeusAlertas", error);
    }
}

/**
 * Atualiza o badge de Meus Alertas
 */
function atualizarBadgeMeusAlertas(quantidade) 
{
    try
    {
        var badge = $('#badgeMeusAlertas');
        if (badge.length)
        {
            badge.text(quantidade);
            if (quantidade > 0)
            {
                badge.removeClass('bg-secondary').addClass('bg-primary');
            } else
            {
                badge.removeClass('bg-primary').addClass('bg-secondary');
            }
        }
    }
    catch (error)
    {
        console.error('Erro ao atualizar badge de Meus Alertas:', error);
    }
}
