/*
    ═══════════════════════════════════════════════════════════════════════════════
    📄 DOCUMENTAÇÃO COMPLETA DISPONÍVEL
    ═══════════════════════════════════════════════════════════════════════════════
    
    📍 Localização: Documentacao/JavaScript/syncfusion_tooltips.js.md
    📅 Última Atualização: 08/01/2026
    📋 Versão: 2.0 (Padrão FrotiX Simplificado)
    
    Este arquivo gerencia tooltips globais usando Syncfusion EJ2, substituindo
    tooltips do Bootstrap e funcionando com elementos dinâmicos. Para entender
    completamente a funcionalidade, consulte a documentação acima.
    ═══════════════════════════════════════════════════════════════════════════════
*/

// syncfusion_tooltips.js - Tooltip GLOBAL para todos os elementos com data-ejtip
(function ()
{
    function initializeTooltip()
    {
        // Verifica se o Syncfusion está carregado
        if (typeof ej === 'undefined' || !ej.popups || !ej.popups.Tooltip)
        {
            console.warn('Syncfusion não carregado. Tentando novamente em 500ms...');
            setTimeout(initializeTooltip, 500);
            return;
        }

        // Desabilita tooltips do Bootstrap 5 usando try-catch
        document.querySelectorAll('[data-ejtip]').forEach(function (el)
        {
            try
            {
                el.removeAttribute('data-bs-toggle');
                el.removeAttribute('data-bs-original-title');
                el.removeAttribute('title');

                if (window.bootstrap?.Tooltip?.getInstance)
                {
                    const bsTooltip = window.bootstrap.Tooltip.getInstance(el);
                    bsTooltip?.dispose();
                }
            } catch (e)
            {
                console.warn('Erro ao limpar tooltip Bootstrap:', e);
            }
        });

        // Destrói instância anterior se existir
        if (window.ejTooltip)
        {
            try
            {
                window.ejTooltip.destroy();
            } catch (e)
            {
                console.warn('Erro ao destruir tooltip anterior:', e);
            }
        }

        // Adiciona CSS customizado para o tooltip (COM REMOÇÃO DE SETAS)
        if (!document.getElementById('custom-tooltip-style'))
        {
            const style = document.createElement('style');
            style.id = 'custom-tooltip-style';
            style.textContent = `
                .e-tooltip-wrap {
                    background-color: #4a6b8a !important;
                    color: #ffffff !important;
                    border: 1px solid #7a8a9a !important;
                    border-radius: 8px !important;
                    padding: 8px 12px !important;
                    font-size: 13px !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
                    z-index: 99999 !important;
                }
                .e-tooltip-wrap .e-tip-content {
                    color: #ffffff !important;
                    line-height: 1.4 !important;
                    display: block !important;
                    visibility: visible !important;
                }
                .e-tooltip-wrap.e-popup {
                    background-color: #4a6b8a !important;
                }
                
                /* ===== REMOÇÃO DAS SETAS ===== */
                .e-tooltip-wrap .e-arrow-tip,
                .e-tooltip-wrap .e-arrow-tip-outer,
                .e-tooltip-wrap .e-arrow-tip-inner { 
                    display: none !important; 
                }
                .e-tooltip-wrap.e-tip-top { 
                    margin-bottom: 0 !important; 
                }
                .e-tooltip-wrap.e-tip-bottom { 
                    margin-top: 0 !important; 
                }
                /* (Opcional) Bootstrap tooltip */
                .tooltip .tooltip-arrow { 
                    display: none !important; 
                }
            `;
            document.head.appendChild(style);
        }

        // Cria nova instância GLOBAL com content como FUNÇÃO
        window.ejTooltip = new ej.popups.Tooltip({
            target: '[data-ejtip]',
            opensOn: 'Hover',
            position: 'TopCenter',
            showTipPointer: false, // ← DESATIVA A SETA PROGRAMATICAMENTE
            cssClass: 'custom-dark-tooltip',
            // CRÍTICO: content como função que retorna o texto
            content: function (args)
            {
                const tooltipText = args.getAttribute('data-ejtip');
                console.log('Tooltip text:', tooltipText);
                return tooltipText || 'Sem descrição';
            },
            beforeOpen: function (args)
            {
                // Garante que o conteúdo seja definido antes de abrir
                const target = args.target;
                const tooltipText = target.getAttribute('data-ejtip');

                if (tooltipText)
                {
                    this.content = tooltipText;
                    console.log('Tooltip configurado com:', tooltipText);
                } else
                {
                    console.warn('Elemento sem data-ejtip:', target);
                    this.content = 'Sem descrição';
                }
            },
            afterOpen: function (args)
            {
                // Força o fechamento após 2 segundos
                const tooltipElement = args.element;
                const closeTimeout = setTimeout(() =>
                {
                    this.close();
                }, 2000);

                tooltipElement.setAttribute('data-close-timeout', closeTimeout);
            },
            beforeClose: function (args)
            {
                const closeTimeout = args.element.getAttribute('data-close-timeout');
                if (closeTimeout)
                {
                    clearTimeout(parseInt(closeTimeout));
                    args.element.removeAttribute('data-close-timeout');
                }
            }
        });

        window.ejTooltip.appendTo('body');
        console.log('✓ Tooltip GLOBAL Syncfusion inicializado (sem setas)');
    }

    // Refresher para elementos dinâmicos
    window.refreshTooltips = function ()
    {
        document.querySelectorAll('[data-ejtip]').forEach(function (el)
        {
            el.removeAttribute('data-bs-toggle');
            el.removeAttribute('data-bs-original-title');
            el.removeAttribute('title');
        });

        if (window.ejTooltip)
        {
            window.ejTooltip.refresh();
            console.log('✓ Tooltips atualizados');
        } else
        {
            console.warn('⚠ ejTooltip não está inicializado. Inicializando...');
            initializeTooltip();
        }
    };

    // Inicializa quando DOM estiver pronto
    if (document.readyState === 'loading')
    {
        document.addEventListener('DOMContentLoaded', initializeTooltip);
    } else
    {
        initializeTooltip();
    }

    // Observer para detectar elementos adicionados dinamicamente
    const observer = new MutationObserver(() =>
    {
        document.querySelectorAll('[data-ejtip]').forEach(function (el)
        {
            el.removeAttribute('data-bs-toggle');
            el.removeAttribute('data-bs-original-title');
            el.removeAttribute('title');
        });

        if (window.ejTooltip)
        {
            window.ejTooltip.refresh();
        }
    });

    if (document.readyState === 'loading')
    {
        document.addEventListener('DOMContentLoaded', () =>
        {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    } else
    {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();
