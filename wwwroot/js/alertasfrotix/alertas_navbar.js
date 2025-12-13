// alertas_navbar.js - Sistema de Alertas no Navbar (Global) - VERSÃO CORRIGIDA
// Este arquivo deve ser incluído no layout principal (_Layout.cshtml)
// REQUER: signalr_manager.js carregado ANTES deste arquivo

var connectionAlertasNavbar;
var alertasNaoLidos = [];

$(document).ready(function ()
{
    try
    {
        console.log("✅ Inicializando alertas_navbar.js...");
        inicializarAlertasNavbar();
        inicializarSignalRNavbar();
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "document.ready", error);
    }
});

function inicializarAlertasNavbar()
{
    try
    {
        // Carregar alertas não lidos ao iniciar
        carregarAlertasNaoLidos();

        // Configurar evento de clique no sino
        $('#btnNotificacoes, #iconeSino').on('click', function (e)
        {
            try
            {
                e.preventDefault();
                e.stopPropagation();
                toggleDropdownAlertas();
            }
            catch (error)
            {
                TratamentoErroComLinha("alertas_navbar.js", "btnNotificacoes.click", error);
            }
        });

        // Fechar dropdown ao clicar fora
        $(document).on('click', function (e)
        {
            try
            {
                if (!$(e.target).closest('#dropdownAlertas, #btnNotificacoes, #iconeSino').length)
                {
                    fecharDropdownAlertas();
                }
            }
            catch (error)
            {
                TratamentoErroComLinha("alertas_navbar.js", "document.click", error);
            }
        });

        // Prevenir que cliques dentro do dropdown o fechem
        $('#dropdownAlertas').on('click', function (e)
        {
            try
            {
                e.stopPropagation();
            }
            catch (error)
            {
                TratamentoErroComLinha("alertas_navbar.js", "dropdownAlertas.click", error);
            }
        });

        console.log("✅ Alertas navbar inicializado");
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "inicializarAlertasNavbar", error);
    }
}

function inicializarSignalRNavbar()
{
    try
    {
        console.log("🔧 Configurando SignalR para Navbar...");

        // Verificar se SignalRManager está disponível
        if (typeof SignalRManager === 'undefined')
        {
            console.error("❌ SignalRManager não está carregado!");
            console.error("Certifique-se de que signalr_manager.js está carregado ANTES de alertas_navbar.js");
            return;
        }

        // Obter conexão do gerenciador global
        SignalRManager.getConnection()
            .then(function (conn)
            {
                try
                {
                    connectionAlertasNavbar = conn;
                    console.log("✅ Conexão SignalR obtida para Navbar");

                    // Registrar event handlers usando o gerenciador
                    configurarEventHandlersSignalR();

                    // Registrar callbacks de reconexão
                    SignalRManager.registerCallback({
                        onReconnected: function (connectionId)
                        {
                            try
                            {
                                console.log("🔄 Navbar: SignalR reconectado, recarregando alertas...");
                                carregarAlertasNaoLidos();
                            }
                            catch (error)
                            {
                                TratamentoErroComLinha("alertas_navbar.js", "callback.onReconnected", error);
                            }
                        },
                        onReconnecting: function (error)
                        {
                            console.log("🔄 Navbar: SignalR reconectando...");
                        },
                        onClose: function (error)
                        {
                            console.log("❌ Navbar: Conexão SignalR fechada");
                        }
                    });

                    console.log("✅ SignalR configurado com sucesso para Navbar");
                }
                catch (error)
                {
                    TratamentoErroComLinha("alertas_navbar.js", "getConnection.then", error);
                }
            })
            .catch(function (err)
            {
                try
                {
                    console.error("❌ Erro ao obter conexão SignalR para Navbar:", err);
                    // Tentar novamente após 5 segundos
                    setTimeout(inicializarSignalRNavbar, 5000);
                }
                catch (error)
                {
                    TratamentoErroComLinha("alertas_navbar.js", "getConnection.catch", error);
                }
            });
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "inicializarSignalRNavbar", error);
    }
}

function configurarEventHandlersSignalR()
{
    try
    {
        // Evento: Novo alerta recebido
        SignalRManager.on("NovoAlerta", function (alerta)
        {
            try
            {
                console.log("📬 Novo alerta recebido no navbar:", alerta);

                // Adicionar ao array no início
                alertasNaoLidos.unshift(alerta);

                // Atualizar badge
                atualizarBadgeNavbar(alertasNaoLidos.length);

                // Se o dropdown estiver aberto, atualizar
                if ($('#dropdownAlertas').is(':visible'))
                {
                    renderizarDropdownAlertas();
                }

                // Mostrar notificação toast
                if (typeof AppToast !== 'undefined')
                {
                    AppToast.show("Amarelo", "Novo alerta: " + alerta.titulo, 3000);
                }

                // Notificação do navegador (opcional)
                mostrarNotificacaoNavegador(alerta);
            }
            catch (error)
            {
                TratamentoErroComLinha("alertas_navbar.js", "SignalR.NovoAlerta", error);
            }
        });

        // Evento: Badge atualizado
        SignalRManager.on("AtualizarBadgeAlertas", function (quantidade)
        {
            try
            {
                console.log("🔢 Atualizar badge navbar:", quantidade);
                atualizarBadgeNavbar(quantidade);
            }
            catch (error)
            {
                TratamentoErroComLinha("alertas_navbar.js", "SignalR.AtualizarBadgeAlertas", error);
            }
        });

        console.log("✅ Event handlers configurados para Navbar");
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "configurarEventHandlersSignalR", error);
    }
}

function toggleDropdownAlertas()
{
    try
    {
        var dropdown = $('#dropdownAlertas');

        if (dropdown.is(':visible'))
        {
            fecharDropdownAlertas();
        } else
        {
            abrirDropdownAlertas();
        }
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "toggleDropdownAlertas", error);
    }
}

function abrirDropdownAlertas()
{
    try
    {
        var dropdown = $('#dropdownAlertas');

        // Fechar outros dropdowns que possam estar abertos
        $('.dropdown-menu').not(dropdown).hide();

        // Mostrar dropdown
        dropdown.fadeIn(200);

        // Recarregar alertas
        carregarAlertasNaoLidos();
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "abrirDropdownAlertas", error);
    }
}

function fecharDropdownAlertas()
{
    try
    {
        $('#dropdownAlertas').fadeOut(200);
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "fecharDropdownAlertas", error);
    }
}

function carregarAlertasNaoLidos()
{
    try
    {
        $.ajax({
            url: '/api/AlertasFrotiX/GetAlertasAtivos',
            type: 'GET',
            dataType: 'json',
            success: function (response)
            {
                try
                {
                    if (response && response.sucesso)
                    {
                        alertasNaoLidos = response.dados || [];
                        atualizarBadgeNavbar(alertasNaoLidos.length);
                        renderizarDropdownAlertas();
                    }
                }
                catch (error)
                {
                    TratamentoErroComLinha("alertas_navbar.js", "carregarAlertasNaoLidos.success", error);
                }
            },
            error: function (xhr, status, error)
            {
                TratamentoErroComLinha("alertas_navbar.js", "carregarAlertasNaoLidos.error", error);
            }
        });
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "carregarAlertasNaoLidos", error);
    }
}

function renderizarDropdownAlertas()
{
    try
    {
        var container = $('#listaAlertasNavbar');

        // ✅ CORREÇÃO: Verificar se container existe, criar se não existir
        if (container.length === 0)
        {
            try
            {
                console.warn('⚠️ Container #listaAlertasNavbar não encontrado, criando...');

                var dropdown = $('#dropdownAlertas');
                if (dropdown.length === 0)
                {
                    console.error('❌ Dropdown #dropdownAlertas também não existe!');
                    return;
                }

                // Criar estrutura se não existir
                dropdown.html(`
                    <div class="dropdown-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">Alertas</h6>
                            <button id="btnMarcarTodosLidosNavbar" class="btn btn-sm btn-link text-primary p-0">
                                Marcar todos como lidos
                            </button>
                        </div>
                    </div>
                    <div id="listaAlertasNavbar"></div>
                `);

                container = $('#listaAlertasNavbar');

                // Configurar evento do botão marcar todos
                $('#btnMarcarTodosLidosNavbar').on('click', function ()
                {
                    try
                    {
                        marcarTodosComoLidosNavbar();
                    }
                    catch (error)
                    {
                        TratamentoErroComLinha("alertas_navbar.js", "btnMarcarTodosLidosNavbar.click", error);
                    }
                });
            }
            catch (error)
            {
                TratamentoErroComLinha("alertas_navbar.js", "renderizarDropdownAlertas.criarContainer", error);
                return;
            }
        }

        container.empty();

        if (alertasNaoLidos.length === 0)
        {
            container.html(`
                <div class="p-4 text-center text-muted">
                    <i class="fal fa-check-circle fa-2x mb-2"></i>
                    <p class="mb-0">Nenhum alerta não lido</p>
                </div>
            `);
            return;
        }

        // Renderizar alertas
        alertasNaoLidos.forEach(function (alerta)
        {
            try
            {
                var alertaHtml = `
                    <div class="alerta-item p-3 border-bottom hover-bg-light" data-alerta-id="${alerta.alertaId}">
                        <div class="d-flex">
                            <div class="flex-grow-1">
                                <div class="d-flex justify-content-between align-items-start mb-1">
                                    <h6 class="mb-0">${truncarTexto(alerta.titulo, 50)}</h6>
                                    <span class="badge badge-${obterClasseSeveridade(alerta.severidade)} ml-2">
                                        ${alerta.severidade}
                                    </span>
                                </div>
                                <p class="text-muted small mb-2">${truncarTexto(alerta.mensagem, 100)}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="text-muted">
                                        <i class="fal fa-clock mr-1"></i>
                                        ${formatarDataHora(alerta.dataInsercao)}
                                    </small>
                                    <button class="btn btn-sm btn-link text-primary p-0" 
                                            onclick="marcarComoLidoNavbar('${alerta.alertaId}')">
                                        Marcar como lido
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                container.append(alertaHtml);
            }
            catch (error)
            {
                TratamentoErroComLinha("alertas_navbar.js", "renderizarDropdownAlertas.forEach", error);
            }
        });

        console.log("✅ Dropdown renderizado com", alertasNaoLidos.length, "alertas");
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "renderizarDropdownAlertas", error);
    }
}

function marcarComoLidoNavbar(alertaId)
{
    try
    {
        $.ajax({
            url: '/api/AlertasFrotiX/MarcarComoLido',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ alertaId: alertaId }),
            success: function (response)
            {
                try
                {
                    if (response && response.sucesso)
                    {
                        // Remover visualmente o alerta
                        $('.alerta-item[data-alerta-id="' + alertaId + '"]').fadeOut(300, function ()
                        {
                            try
                            {
                                $(this).remove();

                                // Atualizar array
                                alertasNaoLidos = alertasNaoLidos.filter(function (a)
                                {
                                    return a.alertaId !== alertaId;
                                });

                                // Atualizar badge
                                atualizarBadgeNavbar(alertasNaoLidos.length);

                                // Se não houver mais alertas, mostrar mensagem
                                if (alertasNaoLidos.length === 0)
                                {
                                    renderizarDropdownAlertas();
                                }
                            }
                            catch (error)
                            {
                                TratamentoErroComLinha("alertas_navbar.js", "marcarComoLidoNavbar.fadeOut", error);
                            }
                        });

                        // Toast de sucesso
                        if (typeof AppToast !== 'undefined')
                        {
                            AppToast.show("Verde", "Alerta marcado como lido", 2000);
                        }
                    }
                }
                catch (error)
                {
                    TratamentoErroComLinha("alertas_navbar.js", "marcarComoLidoNavbar.success", error);
                }
            },
            error: function (xhr, status, error)
            {
                TratamentoErroComLinha("alertas_navbar.js", "marcarComoLidoNavbar.error", error);

                if (typeof AppToast !== 'undefined')
                {
                    AppToast.show("Vermelho", "Erro ao marcar alerta como lido", 2000);
                }
            }
        });
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "marcarComoLidoNavbar", error);
    }
}

function marcarTodosComoLidosNavbar()
{
    try
    {
        if (alertasNaoLidos.length === 0)
        {
            if (typeof AppToast !== 'undefined')
            {
                AppToast.show("Amarelo", "Não há alertas para marcar como lidos", 2000);
            }
            return;
        }

        // Confirmar ação
        if (typeof Alerta !== 'undefined' && typeof Alerta.Confirmar === 'function')
        {
            Alerta.Confirmar(
                "Confirmar Ação",
                "Deseja marcar todos os " + alertasNaoLidos.length + " alertas como lidos?",
                "Sim, marcar todos",
                "Cancelar"
            ).then(function (confirmed)
            {
                try
                {
                    if (confirmed)
                    {
                        executarMarcarTodosComoLidos();
                    }
                }
                catch (error)
                {
                    TratamentoErroComLinha("alertas_navbar.js", "marcarTodosComoLidosNavbar.confirmar", error);
                }
            });
        } else
        {
            // Fallback sem confirmação
            executarMarcarTodosComoLidos();
        }
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "marcarTodosComoLidosNavbar", error);
    }
}

function executarMarcarTodosComoLidos()
{
    try
    {
        $.ajax({
            url: '/api/AlertasFrotiX/MarcarTodosComoLidos',
            type: 'POST',
            contentType: 'application/json',
            success: function (response)
            {
                try
                {
                    if (response && response.sucesso)
                    {
                        alertasNaoLidos = [];
                        atualizarBadgeNavbar(0);
                        renderizarDropdownAlertas();

                        if (typeof AppToast !== 'undefined')
                        {
                            AppToast.show("Verde", "Todos os alertas foram marcados como lidos", 2000);
                        }
                    }
                }
                catch (error)
                {
                    TratamentoErroComLinha("alertas_navbar.js", "executarMarcarTodosComoLidos.success", error);
                }
            },
            error: function (xhr, status, error)
            {
                TratamentoErroComLinha("alertas_navbar.js", "executarMarcarTodosComoLidos.error", error);

                if (typeof AppToast !== 'undefined')
                {
                    AppToast.show("Vermelho", "Erro ao marcar todos os alertas como lidos", 2000);
                }
            }
        });
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "executarMarcarTodosComoLidos", error);
    }
}

function atualizarBadgeNavbar(total)
{
    const badge = document.getElementById('badgeAlertasSino'); // ← CORRIGIDO

    if (!badge)
    {
        console.warn('⚠️ Badge #badgeAlertasSino não encontrado');
        return;
    }

    if (total > 0)
    {
        badge.textContent = total;
        badge.style.display = 'block';
    } else
    {
        badge.style.display = 'none';
    }
}
function mostrarNotificacaoNavegador(alerta)
{
    try
    {
        // Verificar se o navegador suporta notificações
        if (!("Notification" in window))
        {
            return;
        }

        // Verificar permissão
        if (Notification.permission === "granted")
        {
            criarNotificacao(alerta);
        } else if (Notification.permission !== "denied")
        {
            Notification.requestPermission().then(function (permission)
            {
                try
                {
                    if (permission === "granted")
                    {
                        criarNotificacao(alerta);
                    }
                }
                catch (error)
                {
                    TratamentoErroComLinha("alertas_navbar.js", "mostrarNotificacaoNavegador.requestPermission", error);
                }
            });
        }
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "mostrarNotificacaoNavegador", error);
    }
}

function criarNotificacao(alerta)
{
    try
    {
        var notification = new Notification(alerta.titulo, {
            body: alerta.mensagem,
            icon: '/img/logo-small.png',
            badge: '/img/badge.png'
        });

        notification.onclick = function ()
        {
            try
            {
                window.focus();
                abrirDropdownAlertas();
                notification.close();
            }
            catch (error)
            {
                TratamentoErroComLinha("alertas_navbar.js", "notification.onclick", error);
            }
        };
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "criarNotificacao", error);
    }
}

// ========== FUNÇÕES AUXILIARES ==========

function obterClasseSeveridade(severidade)
{
    try
    {
        var classes = {
            'Critico': 'danger',
            'Crítico': 'danger',
            'Alto': 'warning',
            'Medio': 'info',
            'Médio': 'info',
            'Baixo': 'secondary'
        };
        return classes[severidade] || 'info';
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "obterClasseSeveridade", error);
        return 'info';
    }
}

function formatarDataHora(dataStr)
{
    try
    {
        var data = new Date(dataStr);
        var agora = new Date();
        var diff = agora - data;
        var minutos = Math.floor(diff / 60000);

        if (minutos < 1) return 'Agora';
        if (minutos < 60) return minutos + ' min atrás';

        var horas = Math.floor(minutos / 60);
        if (horas < 24) return horas + ' h atrás';

        var dias = Math.floor(horas / 24);
        if (dias < 7) return dias + ' dia' + (dias > 1 ? 's' : '') + ' atrás';

        return data.toLocaleDateString('pt-BR');
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "formatarDataHora", error);
        return dataStr;
    }
}

function truncarTexto(texto, maxLength)
{
    try
    {
        if (!texto) return '';
        if (texto.length <= maxLength) return texto;
        return texto.substring(0, maxLength) + '...';
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "truncarTexto", error);
        return texto || '';
    }
}

// ========== INJEÇÃO DE ESTILOS CSS ==========

(function ()
{
    try
    {
        var estiloAlertas = `
        <style id="estiloAlertasNavbar">
        #dropdownAlertas {
            display: none;
            position: absolute;
            right: 0;
            top: 100%;
            margin-top: 0.5rem;
            width: 400px;
            max-width: 90vw;
            max-height: 500px;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 9999;
            overflow: hidden;
        }

        #dropdownAlertas .dropdown-header {
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
        }

        #listaAlertasNavbar {
            max-height: 400px;
            overflow-y: auto;
        }

        .hover-bg-light:hover {
            background-color: #f9fafb;
            cursor: pointer;
        }

        .alerta-item {
            transition: all 0.2s;
        }

        #badgeAlertasNavbar {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: #ef4444;
            color: white;
            font-size: 0.7rem;
            font-weight: bold;
            padding: 0.15rem 0.4rem;
            border-radius: 50%;
            min-width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        </style>
        `;

        // Injetar estilos na página (apenas uma vez)
        if ($('#estiloAlertasNavbar').length === 0)
        {
            $('head').append(estiloAlertas);
        }
    }
    catch (error)
    {
        TratamentoErroComLinha("alertas_navbar.js", "injecaoEstilos", error);
    }
})();

console.log("✅ alertas_navbar.js carregado completamente");
