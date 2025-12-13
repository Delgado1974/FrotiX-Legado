// ==================================================================
// PROTEÇÃO CONTRA FECHAMENTO DO MODAL DURANTE RENDERIZAÇÃO
// ==================================================================
// Este script intercepta tentativas de fechar o modal enquanto o
// Telerik Report Viewer está renderizando e adia o fechamento para
// após a renderização completa.
// ==================================================================

(function ()
{
    'use strict';

    // ================================================================
    // FLAGS GLOBAIS
    // ================================================================
    window.isReportViewerLoading = window.isReportViewerLoading === true ? true : false;
    window._pendingCloseAfterRender = window._pendingCloseAfterRender === true ? true : false;

    // ================================================================
    // FUNÇÃO: Fechar modal programaticamente
    // ================================================================
    function closeModalViagens()
    {
        try
        {
            const el = document.getElementById('modalViagens');
            if (!el) return;

            console.log('[CloseGuard] 🚪 Fechando modal programaticamente...');

            // Tentar Bootstrap 5
            if (window.bootstrap && bootstrap.Modal && bootstrap.Modal.getOrCreateInstance)
            {
                bootstrap.Modal.getOrCreateInstance(el).hide();
            }
            // Fallback para Bootstrap 4/jQuery
            else if (window.$ && $('#modalViagens').modal)
            {
                $('#modalViagens').modal('hide');
            }
            // Fallback manual
            else
            {
                el.classList.remove('show');
                el.setAttribute('aria-hidden', 'true');
            }

            console.log('[CloseGuard] ✅ Modal fechado');
        } catch (e)
        {
            console.warn('[CloseGuard] ❌ Erro ao fechar modal:', e);
        }
    }

    // ================================================================
    // PATCH: Plugin Telerik ReportViewer
    // ================================================================
    // Intercepta a criação do viewer para envolver os callbacks
    function patchReportViewerPlugin($)
    {
        if (!$ || !$.fn || !$.fn.telerik_ReportViewer || $.fn._trv_patched)
        {
            return;
        }

        console.log('[CloseGuard] 🔧 Aplicando patch no Telerik ReportViewer...');

        const original = $.fn.telerik_ReportViewer;

        $.fn.telerik_ReportViewer = function (options)
        {
            try
            {
                if (options && typeof options === 'object')
                {
                    // Guardar callbacks originais
                    const originalRenderingBegin = options.renderingBegin;
                    const originalRenderingEnd = options.renderingEnd;
                    const originalReady = options.ready;
                    const originalError = options.error;

                    // WRAP: renderingBegin
                    options.renderingBegin = function ()
                    {
                        console.log('[CloseGuard] 🎬 renderingBegin - BLOQUEANDO fechamento');
                        window.isReportViewerLoading = true;
                        window._pendingCloseAfterRender = false;

                        if (typeof originalRenderingBegin === 'function')
                        {
                            originalRenderingBegin.apply(this, arguments);
                        }
                    };

                    // WRAP: renderingEnd
                    options.renderingEnd = function ()
                    {
                        console.log('[CloseGuard] 🎬 renderingEnd - DESBLOQUEANDO');
                        window.isReportViewerLoading = false;

                        // Se havia tentativa de fechar pendente, fechar agora
                        if (window._pendingCloseAfterRender)
                        {
                            console.log('[CloseGuard] 🚪 Executando fechamento pendente...');
                            window._pendingCloseAfterRender = false;
                            setTimeout(() => closeModalViagens(), 100);
                        }

                        if (typeof originalRenderingEnd === 'function')
                        {
                            originalRenderingEnd.apply(this, arguments);
                        }
                    };

                    // WRAP: ready
                    options.ready = function ()
                    {
                        console.log('[CloseGuard] ✅ ready - DESBLOQUEANDO');
                        window.isReportViewerLoading = false;

                        // Se havia tentativa de fechar pendente, fechar agora
                        if (window._pendingCloseAfterRender)
                        {
                            console.log('[CloseGuard] 🚪 Executando fechamento pendente...');
                            window._pendingCloseAfterRender = false;
                            setTimeout(() => closeModalViagens(), 100);
                        }

                        if (typeof originalReady === 'function')
                        {
                            originalReady.apply(this, arguments);
                        }
                    };

                    // WRAP: error
                    options.error = function ()
                    {
                        console.log('[CloseGuard] ❌ error - DESBLOQUEANDO');
                        window.isReportViewerLoading = false;
                        window._pendingCloseAfterRender = false;

                        if (typeof originalError === 'function')
                        {
                            originalError.apply(this, arguments);
                        }
                    };
                }
            } catch (e)
            {
                console.warn('[CloseGuard] ❌ Erro ao aplicar patch:', e);
            }

            return original.apply(this, arguments);
        };

        $.fn._trv_patched = true;
        console.log('[CloseGuard] ✅ Patch aplicado com sucesso');
    }

    // ================================================================
    // INTERCEPTAÇÃO: Tentativas de fechar modal
    // ================================================================
    function bindModalGuard()
    {
        function onAttemptClose(e)
        {
            try
            {
                if (window.isReportViewerLoading)
                {
                    console.log('[CloseGuard] 🛑 Tentativa de fechar BLOQUEADA - relatório renderizando');

                    // PREVENIR fechamento
                    if (e && e.preventDefault) e.preventDefault();
                    if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();

                    // Marcar que quer fechar
                    window._pendingCloseAfterRender = true;

                    // Mostrar alerta ao usuário
                    if (window.Alerta && typeof window.Alerta.Alerta === 'function')
                    {
                        window.Alerta.Alerta(
                            'Relatório em processamento',
                            'Aguarde a renderização completa da Ficha de Viagem. O modal fechará automaticamente ao terminar.'
                        );
                    }

                    return false;
                }
            } catch (err)
            {
                console.warn('[CloseGuard] ❌ Erro em onAttemptClose:', err);
            }
        }

        // Bind via jQuery (delegação)
        if (window.$ && $(document).on)
        {
            $(document).off('hide.bs.modal', '#modalViagens', onAttemptClose);
            $(document).on('hide.bs.modal', '#modalViagens', onAttemptClose);
            console.log('[CloseGuard] ✅ Event listener jQuery registrado');
        }

        // Bind nativo (capture phase)
        const el = document.getElementById('modalViagens');
        if (el && el.addEventListener)
        {
            el.addEventListener('hide.bs.modal', onAttemptClose, { capture: true });
            console.log('[CloseGuard] ✅ Event listener nativo registrado');
        }

        console.log('[CloseGuard] 🛡️ Modal guard ativo');
    }

    // ================================================================
    // INICIALIZAÇÃO
    // ================================================================
    function init()
    {
        try
        {
            console.log('[CloseGuard] 🚀 Inicializando proteção...');

            if (window.$)
            {
                patchReportViewerPlugin(window.$);
            }

            bindModalGuard();

            console.log('[CloseGuard] ✅ Proteção ativa');
        } catch (e)
        {
            console.warn('[CloseGuard] ❌ Erro na inicialização:', e);
        }
    }

    // Executar quando DOM estiver pronto
    if (document.readyState === 'loading')
    {
        document.addEventListener('DOMContentLoaded', init);
    } else
    {
        init();
    }
})();
