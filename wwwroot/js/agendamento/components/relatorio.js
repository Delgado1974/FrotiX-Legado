// ====================================================================
// RELATÓRIO - Gerenciamento do relatório da ficha de vistoria
// ====================================================================

/**
 * 🎯 MÓDULO DE RELATÓRIO
 * Gerencia a exibição de relatórios Telerik no modal de visualização
 */
(function ()
{
    'use strict';

    // ================================================================
    // OVERLAY DE LOADING COM LOGO FROTIX PISCANDO (PADRÃO FROTIX)
    // ================================================================
    window.mostrarLoadingRelatorio = function ()
    {
        console.log('[Relatório] ⏳ Mostrando overlay...');

        // Remover anterior
        $('#modal-relatorio-loading-overlay').remove();

        // Criar HTML com padrão FrotiX (logo piscando)
        const html = `
        <div id="modal-relatorio-loading-overlay" class="ftx-spin-overlay" style="z-index: 999999; cursor: wait;">
            <div class="ftx-spin-box" style="text-align: center; min-width: 300px;">
                <img src="/images/logo_gota_frotix_transparente.png" alt="FrotiX" class="ftx-loading-logo" style="display: block;" />
                <div class="ftx-loading-bar"></div>
                <div class="ftx-loading-text">Carregando a Ficha...</div>
                <div class="ftx-loading-subtext">Aguarde, por favor</div>
            </div>
        </div>
    `;

        $('body').append(html);

        // Bloquear ESC e clicks
        $('#modal-relatorio-loading-overlay').on('click keydown', function (e)
        {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        });

        console.log('[Relatório] ✅ Overlay visível');
    };

    window.esconderLoadingRelatorio = function ()
    {
        console.log('[Relatório] ✅ Aguardando 1 segundo antes de remover overlay...');

        setTimeout(function ()
        {
            $('#modal-relatorio-loading-overlay').fadeOut(300, function ()
            {
                $(this).remove();
            });

            console.log('[Relatório] ✅ Overlay removido');
        }, 1000);
    };


    // ================================================================
    // CONFIGURAÇÕES E ESTADO
    // ================================================================

    const CONFIG = {
        CARD_ID: 'cardRelatorio',
        VIEWER_ID: 'reportViewerAgenda',
        CONTAINER_ID: 'ReportContainerAgenda',
        HIDDEN_ID: 'txtViagemIdRelatorio',
        SERVICE_URL: '/api/reports/',
        RECOVERY_URL: '/api/Agenda/RecuperaViagem',
        TIMEOUT: 20000, // Aumentado de 18s para 20s (+10s total para carregamento da Ficha)
        SHOW_DELAY: 500,
        // ✅ NOVA CONFIGURAÇÃO: Alturas fixas
        VIEWER_HEIGHT: '800px',
        CONTAINER_MIN_HEIGHT: '850px'
    };

    let reportViewerInstance = null;
    let loadTimeout = null;

    // ================================================================
    // FLAGS GLOBAIS DE CONTROLE ANTI-CONFLITO
    // ================================================================

    window.isReportViewerLoading = false;
    window.isReportViewerDestroying = false;
    window.reportViewerInitPromise = null;
    window.reportViewerDestroyPromise = null;

    // ================================================================
    // FUNÇÃO DE ESPERA PARA SINCRONIZAÇÃO
    // ================================================================

    /**
     * ⏳ Aguarda até que uma condição seja verdadeira
     * @param {Function} condition - Função que retorna boolean
     * @param {number} timeout - Timeout em ms
     * @param {number} interval - Intervalo de verificação em ms
     * @returns {Promise<boolean>}
     */
    async function waitUntil(condition, timeout = 15000, interval = 100)
    {
        const startTime = Date.now();

        while (!condition())
        {
            if (Date.now() - startTime > timeout)
            {
                console.warn('⚠️ [Relatório] Timeout ao aguardar condição');
                return false;
            }

            await new Promise(resolve => setTimeout(resolve, interval));
        }

        return true;
    }

    // ================================================================
    // FUNÇÕES PRIVADAS - VALIDAÇÃO
    // ================================================================

    /**
     * 🔍 Valida se todas as dependências necessárias estão carregadas
     * returns {Object} Resultado da validação
     */
    function validarDependencias()
    {
        const deps = {
            jQuery: typeof $ !== 'undefined',
            jQueryFn: typeof $.fn !== 'undefined',
            Telerik: typeof $.fn.telerik_ReportViewer === 'function',
            TelerikViewer: typeof telerikReportViewer !== 'undefined',
            Kendo: typeof kendo !== 'undefined'
        };

        const todasCarregadas = Object.values(deps).every(v => v === true);

        if (!todasCarregadas)
        {
            console.error("❌ Dependências faltando:",
                Object.entries(deps)
                    .filter(([_, loaded]) => !loaded)
                    .map(([name]) => name)
            );
        }

        return {
            valido: todasCarregadas,
            dependencias: deps
        };
    }

    /**
     * 🔍 Valida se o ViagemId é válido
     * param {string} viagemId - ID da viagem
     * returns {boolean}
     */
    function validarViagemId(viagemId)
    {
        if (!viagemId ||
            viagemId === "" ||
            viagemId === "00000000-0000-0000-0000-000000000000")
        {
            console.warn("⚠️ ViagemId inválido:", viagemId);
            return false;
        }
        return true;
    }

    // ================================================================
    // FUNÇÕES PRIVADAS - MANIPULAÇÃO DO DOM
    // ================================================================

    /**
     * 🔍 Obtém referência ao card do relatório
     * returns {HTMLElement|null}
     */
    function obterCard()
    {
        const card = document.getElementById(CONFIG.CARD_ID);

        if (!card)
        {
            console.error(`❌ #${CONFIG.CARD_ID} não encontrado no DOM`);
        }

        return card;
    }

    /**
     * 🔍 Obtém referência ao container do relatório
     * returns {HTMLElement|null}
     */
    function obterContainer()
    {
        const container = document.getElementById(CONFIG.CONTAINER_ID);

        if (!container)
        {
            console.error(`❌ #${CONFIG.CONTAINER_ID} não encontrado no DOM`);
        }

        return container;
    }

    /**
     * 🔍 Obtém referência ao viewer do relatório
     * returns {HTMLElement|null}
     */
    function obterViewer()
    {
        const viewer = document.getElementById(CONFIG.VIEWER_ID);

        if (!viewer)
        {
            console.error(`❌ #${CONFIG.VIEWER_ID} não encontrado no DOM`);
        }

        return viewer;
    }

    /**
     * 🧹 Limpa instância anterior do Telerik ReportViewer
     */
    function limparInstanciaAnterior()
    {
        try
        {
            const $viewer = $(`#${CONFIG.VIEWER_ID}`);

            // Tenta obter instância existente
            const viewer = $viewer.data("telerik_ReportViewer");

            if (viewer)
            {
                console.log("🗑️ Destruindo viewer anterior...");

                if (typeof viewer.dispose === 'function')
                {
                    viewer.dispose();
                } else if (typeof viewer.destroy === 'function')
                {
                    viewer.destroy();
                }

                reportViewerInstance = null;
            }

            // Remove dados do jQuery
            $viewer.removeData("telerik_ReportViewer");

            // Limpa HTML
            $viewer.empty();

            console.log("✅ Instância anterior limpa");

        } catch (error)
        {
            console.warn("⚠️ Erro ao limpar instância anterior:", error.message);
        }
    }

    /**
     * ⏳ Mostra indicador de loading
     * param {string} mensagem - Mensagem a exibir
     */
    function mostrarLoading(mensagem = 'Carregando relatório...')
    {
        const viewer = obterViewer();

        if (!viewer) return;

        viewer.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                <p class="mt-3 text-muted">${mensagem}</p>
            </div>
        `;
    }

    /**
     * ❌ Mostra mensagem de erro no viewer
     * param {string} mensagem - Mensagem de erro
     */
    function mostrarErro(mensagem)
    {
        const viewer = obterViewer();

        if (!viewer) return;

        viewer.innerHTML = `
            <div class="alert alert-danger m-4">
                <i class="fa fa-exclamation-triangle me-2"></i>
                <strong>Erro:</strong> ${mensagem}
            </div>
        `;
    }

    /**
     * 🎨 Aplica alturas fixas aos containers
     * CORREÇÃO: Define alturas ANTES de inicializar o Telerik
     */
    function aplicarAlturasFixas()
    {
        console.log("📏 Aplicando alturas fixas aos containers...");

        const $viewer = $(`#${CONFIG.VIEWER_ID}`);
        const $container = $(`#${CONFIG.CONTAINER_ID}`);

        // Aplicar altura FIXA no viewer
        $viewer.css({
            'height': CONFIG.VIEWER_HEIGHT,
            'min-height': CONFIG.VIEWER_HEIGHT,
            'max-height': 'none',
            'width': '100%',
            'display': 'block',
            'visibility': 'visible',
            'opacity': '1',
            'position': 'relative'
        });

        // Aplicar altura no container
        $container.css({
            'height': 'auto',
            'min-height': CONFIG.CONTAINER_MIN_HEIGHT,
            'display': 'block',
            'visibility': 'visible',
            'opacity': '1'
        });

        console.log("✅ Alturas aplicadas:", {
            viewer: CONFIG.VIEWER_HEIGHT,
            containerMin: CONFIG.CONTAINER_MIN_HEIGHT
        });
    }

    // ================================================================
    // FUNÇÕES PÚBLICAS - INTERFACE
    // ================================================================

    /**
     * 👁️ Mostra o card e container do relatório
     */
    function mostrarRelatorio()
    {
        try
        {
            console.log("👁️ Mostrando relatório...");

            const $card = $(`#${CONFIG.CARD_ID}`);
            const $container = $(`#${CONFIG.CONTAINER_ID}`);
            const $viewer = $(`#${CONFIG.VIEWER_ID}`);

            if ($card.length === 0)
            {
                console.error("❌ Card não encontrado");
                return;
            }

            // 1. Garantir alturas FIXAS (CRÍTICO)
            aplicarAlturasFixas();

            // 2. Mostrar o card
            console.log("📺 Mostrando #cardRelatorio");
            $card.show().css({
                'display': 'block',
                'visibility': 'visible',
                'opacity': '1'
            });

            // 3. Mostrar o container
            if ($container.length > 0)
            {
                console.log("📺 Mostrando #ReportContainerAgenda");
                $container.show().css({
                    'display': 'block',
                    'visibility': 'visible',
                    'opacity': '1'
                });
            }

            // 4. Mostrar o viewer
            console.log("📺 Mostrando #reportViewerAgenda");
            $viewer.show().css({
                'display': 'block',
                'visibility': 'visible',
                'opacity': '1'
            });

            // 5. Forçar refresh do viewer se existir
            const viewerInstance = $viewer.data('telerik_ReportViewer');
            if (viewerInstance)
            {
                console.log("🔄 Forçando refresh do viewer");
                try
                {
                    if (typeof viewerInstance.refreshReport === 'function')
                    {
                        viewerInstance.refreshReport();
                    }
                } catch (e)
                {
                    console.warn("⚠️ Erro ao fazer refresh:", e);
                }
            }

            // 6. Scroll suave até o card
            setTimeout(() =>
            {
                const cardElement = $card[0];
                if (cardElement)
                {
                    console.log("📜 Fazendo scroll até o relatório");
                    cardElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 300);

            console.log("✅ Relatório exibido");

            // 7. Debug de visibilidade (se disponível)
            setTimeout(() =>
            {
                if (typeof window.diagnosticarVisibilidadeRelatorio === 'function')
                {
                    window.diagnosticarVisibilidadeRelatorio();
                }
            }, 500);

        } catch (error)
        {
            console.error("❌ Erro ao mostrar relatório:", error);

            if (typeof Alerta !== 'undefined' && Alerta.TratamentoErroComLinha)
            {
                Alerta.TratamentoErroComLinha("relatorio.js", "mostrarRelatorio", error);
            }
        }
    }

    /**
     * 🙈 Esconde o card e limpa o relatório
     */
    function esconderRelatorio()
    {
        console.log("🙈 Escondendo relatório...");

        const card = obterCard();
        const container = obterContainer();

        if (!card || !container) return;

        // Esconder o card com animação
        $(card).slideUp(300, function ()
        {
            card.style.display = "none";
        });

        // Esconder o container
        container.style.display = "none";
        container.classList.remove("visible");

        // Limpar viewer
        limparInstanciaAnterior();

        // Resetar HTML para o loading inicial
        const viewer = obterViewer();

        if (viewer)
        {
            viewer.innerHTML = `
                <div class="text-center p-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                    <p class="mt-3 text-muted">Carregando relatório...</p>
                </div>
            `;
        }

        console.log("✅ Relatório escondido e resetado");
    }

    /**
     * 📊 Determina qual relatório usar baseado no status e finalidade
     * param {Object} data - Dados da viagem
     * returns {string} Nome do arquivo .trdp
     */
    function determinarRelatorio(data)
    {
        if (!data)
        {
            console.warn("⚠️ Dados vazios, usando relatório padrão");
            return "FichaAberta.trdp";
        }

        // Normaliza propriedades (suporta PascalCase e camelCase)
        const status = data.status || data.Status;
        const finalidade = data.finalidade || data.Finalidade;
        const statusAgendamento = data.statusAgendamento ?? data.StatusAgendamento;

        let relatorioAsString = "FichaAberta.trdp"; // Default

        // Lógica de seleção do relatório
        if (status === "Cancelada" || status === "Cancelado")
        {
            relatorioAsString = finalidade !== "Evento"
                ? "FichaCancelada.trdp"
                : "FichaEventoCancelado.trdp";
        }
        else if (finalidade === "Evento" && status !== "Cancelada")
        {
            relatorioAsString = "FichaEvento.trdp";
        }
        else if (status === "Aberta" && finalidade !== "Evento")
        {
            relatorioAsString = "FichaAberta.trdp";
        }
        else if (status === "Realizada")
        {
            relatorioAsString = finalidade !== "Evento"
                ? "FichaRealizada.trdp"
                : "FichaEventoRealizado.trdp";
        }
        else if (statusAgendamento === true)
        {
            relatorioAsString = finalidade !== "Evento"
                ? "FichaAgendamento.trdp"
                : "FichaEventoAgendado.trdp";
        }

        console.log("📄 Relatório selecionado:", relatorioAsString);
        console.log("   - Status:", status);
        console.log("   - Finalidade:", finalidade);
        console.log("   - StatusAgendamento:", statusAgendamento);
        console.log("   - Dados originais:", JSON.stringify(data).substring(0, 500));

        return relatorioAsString;
    }

    /**
     * 🎨 Inicializa o Telerik ReportViewer
     * param {string} viagemId - ID da viagem
     * param {string} relatorioNome - Nome do arquivo .trdp
     */
    function inicializarViewer(viagemId, relatorioNome)
    {
        const $viewer = $(`#${CONFIG.VIEWER_ID}`);

        console.log("🎨 Inicializando Telerik ReportViewer...");
        console.log("   - ViagemId:", viagemId);
        console.log("   - Relatório:", relatorioNome);

        try
        {
            // 1. Limpa HTML
            $viewer.empty();

            // 2. ✅ CRÍTICO: Aplicar alturas ANTES de inicializar
            aplicarAlturasFixas();

            // 3. Mostra progresso do Kendo
            if (typeof kendo !== 'undefined' && kendo.ui && kendo.ui.progress)
            {
                kendo.ui.progress($viewer, true);
            }

            // 4. Inicializa o viewer
            $viewer.telerik_ReportViewer({
                serviceUrl: CONFIG.SERVICE_URL,
                reportSource: {
                    report: relatorioNome,
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
                },

                // ⚠️ NÃO definir height aqui, já está definido no CSS
                // height: "100%",  <-- REMOVIDO

                // Callbacks do Telerik
                ready: function ()
                {
                    console.log("✅ Telerik ReportViewer PRONTO!");
                    console.log("📄 Relatório renderizado com sucesso");

                    if (typeof kendo !== 'undefined' && kendo.ui && kendo.ui.progress)
                    {
                        kendo.ui.progress($viewer, false);
                    }
                },

                renderingBegin: function ()
                {
                    console.log("🎨 Iniciando renderização do relatório...");
                },

                renderingEnd: function ()
                {
                    console.log("🎨 Renderização concluída!");
                },

                error: function (e, args)
                {
                    console.error("❌ Erro no Telerik ReportViewer:", args);

                    if (typeof kendo !== 'undefined' && kendo.ui && kendo.ui.progress)
                    {
                        kendo.ui.progress($viewer, false);
                    }

                    const mensagem = args.message || "Falha ao renderizar o relatório";
                    mostrarErro(mensagem);

                    if (typeof AppToast !== 'undefined')
                    {
                        AppToast.show("Vermelho", "Erro ao renderizar relatório", mensagem);
                    }
                }
            });

            // 5. Guarda referência da instância
            reportViewerInstance = $viewer.data("telerik_ReportViewer");

            console.log("✅ Viewer inicializado");

        } catch (error)
        {
            console.error("❌ Erro ao inicializar viewer:", error);

            if (typeof kendo !== 'undefined' && kendo.ui && kendo.ui.progress)
            {
                kendo.ui.progress($viewer, false);
            }

            mostrarErro(error.message);
            throw error;
        }
    }

    /**
     * 🌐 Busca os dados da viagem na API
     * param {string} viagemId - ID da viagem
     * returns {Promise<Object>} Dados da viagem
     */
    function buscarDadosViagem(viagemId)
    {
        console.log("🌐 Fazendo requisição para RecuperaViagem...");

        return new Promise((resolve, reject) =>
        {
            $.ajax({
                type: "GET",
                url: CONFIG.RECOVERY_URL,
                data: { id: viagemId },
                contentType: "application/json",
                dataType: "json",
                timeout: CONFIG.TIMEOUT,

                success: function (response)
                {
                    console.log("📥 Resposta recebida da API:", response);

                    // Validar resposta
                    if (!response || !response.data)
                    {
                        reject(new Error("Resposta vazia ou inválida do servidor"));
                        return;
                    }

                    resolve(response.data);
                },

                error: function (jqXHR, textStatus, errorThrown)
                {
                    console.error("❌ Erro na requisição AJAX:", {
                        status: jqXHR.status,
                        statusText: jqXHR.statusText,
                        textStatus: textStatus,
                        error: errorThrown
                    });

                    // Criar erro detalhado
                    let mensagem = "Falha na comunicação com o servidor";

                    if (typeof window.criarErroAjax === 'function')
                    {
                        const erro = window.criarErroAjax(jqXHR, textStatus, errorThrown, this);
                        mensagem = erro.mensagemUsuario || mensagem;
                    } else if (jqXHR.responseJSON && jqXHR.responseJSON.message)
                    {
                        mensagem = jqXHR.responseJSON.message;
                    }

                    reject(new Error(mensagem));
                }
            });
        });
    }


    /**
     * 📊 Carrega o relatório de viagem com destruição completa do viewer anterior
     * param {string} viagemId - ID da viagem
     */
    window.carregarRelatorioViagem = async function (viagemId)
    {
        console.log('[Relatório] ===== INICIANDO CARREGAMENTO =====');
        console.log('[Relatório] ViagemId:', viagemId);

        // CRÍTICO: Mostrar overlay IMEDIATAMENTE
        window.mostrarLoadingRelatorio();

        try
        {
            // 1. Validação de ID
            if (!viagemId || viagemId === '00000000-0000-0000-0000-000000000000')
            {
                console.error('[Relatório] ViagemId inválido:', viagemId);
                window.esconderLoadingRelatorio();
                window.limparRelatorio();
                return;
            }

            // 2. PROTEÇÃO: Validar dependências Telerik
            if (typeof $ === 'undefined' || !$.fn.telerik_ReportViewer)
            {
                console.error('[Relatório] ❌ Telerik não disponível');

                $('#reportViewerAgenda').html(`
                    <div class="alert alert-warning m-3">
                        <i class="fa fa-exclamation-triangle"></i>
                        Componente não disponível. Recarregue a página.
                    </div>
                `);
                window.esconderLoadingRelatorio();
                return;
            }

            // 3. PROTEÇÃO: Validar modal ainda aberto
            const modalAberto = $('#modalViagens').hasClass('show');
            if (!modalAberto)
            {
                console.warn('[Relatório] ⚠️ Modal foi fechado, cancelando carregamento');
                window.esconderLoadingRelatorio();
                return;
            }

            // 4. PROTEÇÃO: Aguardar destruição anterior
            if (window.isReportViewerDestroying)
            {
                console.log('[Relatório] ⏳ Aguardando limpeza anterior...');
                await waitUntil(() => !window.isReportViewerDestroying, 3000);
            }

            // 5. PROTEÇÃO: Cancelar carregamento duplicado
            if (window.isReportViewerLoading)
            {
                console.log('[Relatório] ⚠️ Já existe carregamento em andamento');
                window.esconderLoadingRelatorio();
                return;
            }

            // 6. MARCAR COMO CARREGANDO
            window.isReportViewerLoading = true;

            // 7. LIMPAR VIEWER ANTERIOR
            console.log('[Relatório] 🧹 Limpando viewer anterior...');
            await window.limparRelatorio();

            // 8. AGUARDAR DEBOUNCE
            await new Promise(resolve => setTimeout(resolve, 500));

            // 9. VALIDAÇÃO: Modal ainda aberto após debounce
            const modalAindaAberto = $('#modalViagens').hasClass('show');
            if (!modalAindaAberto)
            {
                console.warn('[Relatório] ⚠️ Modal fechado durante debounce');
                window.isReportViewerLoading = false;
                window.esconderLoadingRelatorio();
                return;
            }

            // 10. VALIDAÇÃO: ViagemId não mudou
            const viagemIdAtual = $('#txtViagemIdRelatorio').val();
            if (viagemIdAtual && viagemIdAtual !== viagemId)
            {
                console.warn('[Relatório] ⚠️ ViagemId mudou durante carregamento');
                window.isReportViewerLoading = false;
                window.esconderLoadingRelatorio();
                return;
            }

            console.log('[Relatório] 🚀 Iniciando carregamento do viewer...');

            // 2. IMPORTANTE: Destruir completamente o viewer anterior
            await destruirViewerAnterior();

            // 3. Marcar como carregando (JÁ MARCADO ACIMA)
            // window.isReportViewerLoading = true;

            // 4. Verificar dependências (JÁ VERIFICADO ACIMA)

            // 5. Recriar o container do viewer
            const $container = $('#ReportContainerAgenda');
            if ($container.length === 0)
            {
                console.error('[Relatório] Container principal não encontrado');
                window.isReportViewerLoading = false;
                window.esconderLoadingRelatorio();
                return;
            }

            // 6. IMPORTANTE: Recriar o elemento viewer completamente
            $container.empty();
            $container.html(`
            <div id="reportViewerAgenda" style="width:100%; height: 800px; min-height: 800px;">
                <div class="text-center p-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                    <p class="mt-3 text-muted">Carregando relatório...</p>
                </div>
            </div>
        `);

            // 7. Buscar dados da viagem para determinar tipo de relatório
            let tipoRelatorio = 'FichaAgendamento.trdp'; // Default

            try
            {
                const response = await $.ajax({
                    type: "GET",
                    url: '/api/Agenda/RecuperaViagem',
                    data: { id: viagemId },
                    timeout: 10000
                });

                if (response && response.data)
                {
                    tipoRelatorio = determinarRelatorio(response.data);
                    console.log('[Relatório] Tipo determinado:', tipoRelatorio);
                }
            } catch (error)
            {
                console.warn('[Relatório] Usando relatório padrío, erro ao buscar dados:', error);
            }

            // 8. AGUARDAR UM MOMENTO para garantir que o DOM está pronto
            await new Promise(resolve => setTimeout(resolve, 500));

            // 9. Pegar referência NOVA do elemento viewer
            const $viewer = $('#reportViewerAgenda');
            if ($viewer.length === 0)
            {
                console.error('[Relatório] Viewer não foi recriado corretamente');
                window.isReportViewerLoading = false;
                window.esconderLoadingRelatorio();
                return;
            }

            // 10. Limpar conteúdo antes de inicializar
            $viewer.empty();

            // 11. Inicializar novo Telerik ReportViewer
            console.log('[Relatório] Criando novo Telerik ReportViewer...');

            $viewer.telerik_ReportViewer({
                serviceUrl: '/api/reports/',
                reportSource: {
                    report: tipoRelatorio,
                    parameters: {
                        ViagemId: viagemId.toString().toUpperCase()
                    }
                },
                scale: 1.0,
                viewMode: 'PRINT_PREVIEW',
                scaleMode: 'SPECIFIC',

                // Callbacks
                // Callbacks
                ready: function ()
                {
                    try
                    {
                        const modalAberto = $('#modalViagens').hasClass('show');
                        if (!modalAberto)
                        {
                            console.warn('[Relatório] ⚠️ Modal fechado durante ready');
                            window.isReportViewerLoading = false;
                            return;
                        }
                        window.esconderLoadingRelatorio();
                        console.log('[Relatório] ✅ ready - Viewer pronto');
                        window.isReportViewerLoading = false;
                        window.telerikReportViewer = $viewer.data('telerik_ReportViewer');
                        setTimeout(() =>
                        {
                            if (!$('#modalViagens').hasClass('show')) return;
                            if (window.telerikReportViewer && typeof window.telerikReportViewer.scale === 'function')
                            {
                                try
                                {
                                    window.telerikReportViewer.scale({ scale: 1.4, scaleMode: 'SPECIFIC' });
                                    console.log('[Relatório] Zoom automático aplicado: 140%');
                                } catch (e)
                                {
                                    console.warn('[Relatório] Erro ao aplicar zoom:', e);
                                }
                            }
                        }, 500);
                        if (typeof kendo !== 'undefined' && kendo.ui && kendo.ui.progress)
                        {
                            kendo.ui.progress($viewer, false);
                        }
                    } catch (error)
                    {
                        console.error('[Relatório] Erro no callback ready:', error);
                        window.isReportViewerLoading = false;
                    }
                },

                renderingBegin: function ()
                {
                    try
                    {
                        console.log('[Relatório] 🎬 renderingBegin');

                        const modalAberto = $('#modalViagens').hasClass('show');
                        if (!modalAberto)
                        {
                            console.warn('[Relatório] ⚠️ Modal fechado durante renderingBegin');
                            window.esconderLoadingRelatorio();
                            return;
                        }
                    } catch (error)
                    {
                        console.error('[Relatório] Erro no callback renderingBegin:', error);
                        window.esconderLoadingRelatorio();
                    }
                },

                renderingEnd: function ()
                {
                    try
                    {
                        window.esconderLoadingRelatorio();
                        console.log('[Relatório] ✅ renderingEnd - Overlay removido');

                        const modalAberto = $('#modalViagens').hasClass('show');
                        if (!modalAberto)
                        {
                            console.warn('[Relatório] ⚠️ Modal fechado durante renderingEnd');
                            return;
                        }
                    } catch (error)
                    {
                        console.error('[Relatório] Erro no callback renderingEnd:', error);
                        window.esconderLoadingRelatorio();
                    }
                },

                error: function (e, args)
                {
                    window.esconderLoadingRelatorio();
                    console.error('[Relatório] ❌ Erro - Overlay removido:', args);
                    window.isReportViewerLoading = false;

                    // Mostrar erro no container
                    $viewer.html(`
                    <div class="alert alert-danger m-3">
                        <i class="fa fa-exclamation-circle"></i>
                        <strong>Erro ao carregar relatório</strong><br>
                        ${args.message || 'Erro desconhecido'}
                    </div>
                `);

                    if (typeof AppToast !== 'undefined')
                    {
                        AppToast.show('Vermelho', 'Erro ao carregar relatório', 3000);
                    }
                }
            });

            // 12. Mostrar o card do relatório
            $('#cardRelatorio').slideDown(300);
            $('#ReportContainerAgenda').show();

            // 13. Fazer scroll suave até o relatório (opcional)
            setTimeout(() =>
            {
                const cardElement = document.getElementById('cardRelatorio');
                if (cardElement)
                {
                    cardElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 500);

            console.log('[Relatório] ✅ Processo concluído com sucesso');

        } catch (error)
        {
            console.error('[Relatório] ❌ Erro crítico:', error);
            window.isReportViewerLoading = false;

            if (typeof Alerta !== 'undefined' && Alerta.TratamentoErroComLinha)
            {
                Alerta.TratamentoErroComLinha("relatorio.js", "carregarRelatorioViagem", error);
            }

            // Mostrar erro no container
            $('#reportViewerAgenda').html(`
            <div class="alert alert-danger m-3">
                <i class="fa fa-exclamation-circle"></i>
                <strong>Erro ao inicializar relatório</strong><br>
                ${error.message}
            </div>
        `);
        }
    };

    /**
     * 🧹 Limpa o relatório com destruição completa
     */
    window.limparRelatorio = async function ()
    {
        try
        {
            console.log('[Relatório] 🧹 Iniciando limpeza segura...');

            // PASSO 1: Verificar se já está limpando
            if (window.isReportViewerDestroying)
            {
                console.log('[Relatório] ⚠️ Limpeza já em andamento, aguardando...');

                if (window.reportViewerDestroyPromise)
                {
                    await window.reportViewerDestroyPromise;
                }

                console.log('[Relatório] ✅ Limpeza anterior concluída');
                return;
            }

            // PASSO 2: Marcar que está destruindo
            window.isReportViewerDestroying = true;

            // PASSO 3: Cancelar carregamento pendente
            if (window.isReportViewerLoading)
            {
                console.log('[Relatório] ⚠️ Cancelando carregamento pendente...');
                window.isReportViewerLoading = false;

                if (loadTimeout)
                {
                    clearTimeout(loadTimeout);
                    loadTimeout = null;
                }
            }

            // PASSO 4: Criar Promise de destruição
            window.reportViewerDestroyPromise = new Promise(async (resolve) =>
            {
                try
                {
                    const $viewer = $('#reportViewerAgenda');

                    if ($viewer.length > 0)
                    {
                        const instance = $viewer.data('telerik_ReportViewer');

                        if (instance)
                        {
                            console.log('[Relatório] 🗑️ Destruindo instância do viewer...');

                            try
                            {
                                if (typeof instance.dispose === 'function')
                                {
                                    instance.dispose();
                                }
                                else if (typeof instance.destroy === 'function')
                                {
                                    instance.destroy();
                                }

                                await new Promise(r => setTimeout(r, 200));

                            } catch (e)
                            {
                                console.warn('[Relatório] ⚠️ Erro ao destruir viewer:', e);
                            }
                        }

                        $viewer.removeData('telerik_ReportViewer');
                        $viewer.empty();
                    }

                    $('#cardRelatorio').hide();
                    $('#ReportContainerAgenda').hide();

                    reportViewerInstance = null;
                    window.telerikReportViewer = null;
                    $('#txtViagemIdRelatorio').val('');

                    console.log('[Relatório] ✅ Limpeza concluída');

                } catch (error)
                {
                    console.error('[Relatório] ❌ Erro durante limpeza:', error);
                }
                finally
                {
                    window.isReportViewerDestroying = false;
                    window.reportViewerDestroyPromise = null;
                    resolve();
                }
            });

            await window.reportViewerDestroyPromise;

        } catch (error)
        {
            console.error('[Relatório] ❌ Erro na limpeza:', error);

            window.isReportViewerDestroying = false;
            window.reportViewerDestroyPromise = null;
        }
    };


    /**
     * ℹ️ Obtém informações sobre o estado atual
     * returns {Object}
     */
    function obterEstado()
    {
        return {
            temInstancia: !!reportViewerInstance,
            cardVisivel: obterCard()?.style.display !== 'none',
            containerVisivel: obterContainer()?.style.display !== 'none',
            viewerDisponivel: !!obterViewer(),
            viagemId: $(`#${CONFIG.HIDDEN_ID}`).val() || window.currentViagemId
        };
    }

    // ================================================================
    // 🔧 FUNÇÃO DE DIAGNÓSTICO (DEBUG)
    // ================================================================

    /**
     * 🔍 Diagnostica visibilidade do relatório
     * Função útil para debug em produção
     */
    function diagnosticarVisibilidadeRelatorio()
    {
        console.log("🔍 ===== DIAGNÓSTICO DE VISIBILIDADE =====");

        // 1. Verificar container principal
        const reportContainer = document.getElementById(CONFIG.VIEWER_ID);
        if (!reportContainer)
        {
            console.error(`❌ #${CONFIG.VIEWER_ID} NÃO EXISTE no DOM`);
            return;
        }

        console.log(`✅ #${CONFIG.VIEWER_ID} existe`);
        console.log("📏 Dimensões:", {
            offsetWidth: reportContainer.offsetWidth,
            offsetHeight: reportContainer.offsetHeight,
            clientWidth: reportContainer.clientWidth,
            clientHeight: reportContainer.clientHeight,
            scrollWidth: reportContainer.scrollWidth,
            scrollHeight: reportContainer.scrollHeight
        });

        const styles = window.getComputedStyle(reportContainer);
        console.log("🎨 Estilos computados:", {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            height: styles.height,
            minHeight: styles.minHeight,
            maxHeight: styles.maxHeight,
            position: styles.position,
            zIndex: styles.zIndex,
            overflow: styles.overflow
        });

        // 2. Verificar container ReportContainerAgenda
        const reportContainerAgenda = document.getElementById(CONFIG.CONTAINER_ID);
        if (reportContainerAgenda)
        {
            console.log(`✅ #${CONFIG.CONTAINER_ID} existe`);
            const styles2 = window.getComputedStyle(reportContainerAgenda);
            console.log("📏 Dimensões:", {
                offsetWidth: reportContainerAgenda.offsetWidth,
                offsetHeight: reportContainerAgenda.offsetHeight
            });
            console.log("🎨 Estilos:", {
                display: styles2.display,
                visibility: styles2.visibility,
                opacity: styles2.opacity,
                height: styles2.height,
                minHeight: styles2.minHeight
            });
        } else
        {
            console.warn(`⚠️ #${CONFIG.CONTAINER_ID} NÃO EXISTE`);
        }

        // 3. Verificar card
        const cardRelatorio = document.getElementById(CONFIG.CARD_ID);
        if (cardRelatorio)
        {
            console.log(`✅ #${CONFIG.CARD_ID} existe`);
            const styles3 = window.getComputedStyle(cardRelatorio);
            console.log("📏 Dimensões:", {
                offsetWidth: cardRelatorio.offsetWidth,
                offsetHeight: cardRelatorio.offsetHeight
            });
            console.log("🎨 Estilos:", {
                display: styles3.display,
                visibility: styles3.visibility,
                opacity: styles3.opacity
            });
        } else
        {
            console.warn(`⚠️ #${CONFIG.CARD_ID} NÃO EXISTE`);
        }

        // 4. Verificar conteúdo HTML
        const htmlLength = reportContainer.innerHTML.length;
        console.log("📄 Tamanho do HTML:", htmlLength);
        if (htmlLength > 0)
        {
            console.log("📄 Primeiros 500 caracteres:", reportContainer.innerHTML.substring(0, 500));
        }

        // 5. Verificar instância do viewer
        const viewerInstance = $(`#${CONFIG.VIEWER_ID}`).data('telerik_ReportViewer');
        console.log("🔧 Instância do viewer:", viewerInstance ? "EXISTE" : "NÃO EXISTE");

        if (viewerInstance)
        {
            try
            {
                console.log("📊 Estado do viewer:", {
                    reportSource: viewerInstance.reportSource ? viewerInstance.reportSource() : null,
                    serviceUrl: viewerInstance.serviceUrl ? viewerInstance.serviceUrl() : null
                });
            } catch (e)
            {
                console.warn("⚠️ Erro ao obter estado do viewer:", e);
            }
        }

        console.log("🔍 ===== FIM DO DIAGNÓSTICO =====");
    }

    // ================================================================
    // REGISTRAR FUNÇÕES NO ESCOPO GLOBAL
    // ================================================================

    window.carregarRelatorioViagem = carregarRelatorioViagem;
    window.mostrarRelatorio = mostrarRelatorio;
    window.esconderRelatorio = esconderRelatorio;
    window.limparRelatorio = limparRelatorio;
    window.obterEstadoRelatorio = obterEstado;
    window.diagnosticarVisibilidadeRelatorio = diagnosticarVisibilidadeRelatorio;

    console.log("✅ Módulo de relatório carregado!");
    console.log("✅ Funções registradas globalmente:", {
        carregarRelatorioViagem: typeof carregarRelatorioViagem,
        mostrarRelatorio: typeof mostrarRelatorio,
        esconderRelatorio: typeof esconderRelatorio,
        limparRelatorio: typeof limparRelatorio,
        obterEstadoRelatorio: typeof obterEstado,
        diagnosticarVisibilidadeRelatorio: typeof diagnosticarVisibilidadeRelatorio
    });

})();

/**
* ⏳ Aguarda o Telerik ReportViewer estar disponível
* returns {Promise<boolean>}
*/
async function aguardarTelerikReportViewer()
{
    console.log('[Relatório] Aguardando Telerik ReportViewer...');

    const maxTentativas = 50; // 5 segundos no total
    const intervalo = 100; // 100ms entre tentativas

    for (let i = 0; i < maxTentativas; i++)
    {
        // Verificar se Telerik está disponível
        if (typeof $ !== 'undefined' &&
            typeof $.fn !== 'undefined' &&
            typeof $.fn.telerik_ReportViewer === 'function')
        {

            console.log('[Relatório] ✅ Telerik ReportViewer disponível após', i * intervalo, 'ms');

            // Verificar também se os enums estão disponíveis
            if (typeof telerikReportViewer === 'undefined' && typeof window.telerikReportViewer === 'undefined')
            {
                console.warn('[Relatório] ⚠️ Objeto telerikReportViewer global não encontrado');

                // Tentar localizar em outros lugares possíveis
                if (typeof Telerik !== 'undefined' && Telerik.ReportViewer)
                {
                    window.telerikReportViewer = Telerik.ReportViewer;
                    console.log('[Relatório] Objeto telerikReportViewer encontrado em Telerik.ReportViewer');
                }
            }

            return true;
        }

        await new Promise(resolve => setTimeout(resolve, intervalo));
    }

    throw new Error('Telerik ReportViewer não foi carregado após 5 segundos');
}

// Correção de compatibilidade - garante que a função existe
if (typeof window.carregarRelatorioViagem !== 'function')
{
    window.carregarRelatorioViagem = function (viagemId)
    {
        console.log('[Relatório] Função simplificada - ViagemId:', viagemId);

        try
        {
            // Verificação básica
            if (!viagemId)
            {
                console.error('[Relatório] ViagemId não fornecido');
                return;
            }

            const $viewer = $('#reportViewerAgenda');
            if ($viewer.length === 0 || !$.fn.telerik_ReportViewer)
            {
                console.error('[Relatório] Viewer não disponível');
                return;
            }

            // Limpar anterior
            const oldViewer = $viewer.data('telerik_ReportViewer');
            if (oldViewer && oldViewer.dispose)
            {
                try { oldViewer.dispose(); } catch (e) { }
            }

            // Configuração mínima
            $viewer.empty().telerik_ReportViewer({
                serviceUrl: '/api/reports/',
                reportSource: {
                    report: 'Agendamento.trdp',
                    parameters: {
                        ViagemId: viagemId.toString().toUpperCase()
                    }
                },
                scale: 1.0
            });

            // Mostrar
            $('#cardRelatorio').show();
            $('#ReportContainerAgenda').show();

        } catch (error)
        {
            console.error('[Relatório] Erro:', error);
        }
    };
}

/**
* 🗑️ Destrói completamente o viewer anterior
*/
async function destruirViewerAnterior()
{
    console.log('[Relatório] Destruindo viewer anterior...');

    try
    {
        // 1. Buscar todas as possíveis instâncias
        const $viewer = $('#reportViewerAgenda');

        if ($viewer.length > 0)
        {
            // Tentar destruir instância do Telerik
            const instance = $viewer.data('telerik_ReportViewer');
            if (instance)
            {
                console.log('[Relatório] Destruindo instância Telerik...');

                try
                {
                    // Tentar diferentes métodos de destruição
                    if (typeof instance.dispose === 'function')
                    {
                        instance.dispose();
                    }
                    if (typeof instance.destroy === 'function')
                    {
                        instance.destroy();
                    }
                } catch (e)
                {
                    console.warn('[Relatório] Erro ao destruir instância:', e);
                }

                // Limpar data
                $viewer.removeData('telerik_ReportViewer');
            }

            // Limpar todos os event handlers
            $viewer.off();

            // Remover classes do Telerik
            $viewer.removeClass('trv-report-viewer');

            // Limpar HTML
            $viewer.empty();
        }

        // 2. Limpar variáveis globais
        if (window.telerikReportViewer)
        {
            try
            {
                if (typeof window.telerikReportViewer.dispose === 'function')
                {
                    window.telerikReportViewer.dispose();
                }
            } catch (e)
            {
                // Ignorar erro
            }
            window.telerikReportViewer = null;
        }

        // 3. Limpar quaisquer elementos órfãos do Kendo/Telerik
        $('.k-window, .k-overlay').remove();

        // 4. Aguardar um momento para garantir limpeza
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('[Relatório] ✅ Viewer anterior destruído');

    } catch (error)
    {
        console.error('[Relatório] Erro ao destruir viewer:', error);
        // Continuar mesmo com erro
    }
}
