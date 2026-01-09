/*
    ═══════════════════════════════════════════════════════════════════════════════
    📄 DOCUMENTAÇÃO COMPLETA DISPONÍVEL
    ═══════════════════════════════════════════════════════════════════════════════
    
    📍 Localização: Documentacao/JavaScript/global-toast.js.md
    📅 Última Atualização: 08/01/2026
    📋 Versão: 2.0 (Padrão FrotiX Simplificado)
    
    Este arquivo fornece sistema de notificações toast nativo (sem dependências),
    com animações suaves e barra de progresso. Para entender completamente a
    funcionalidade, consulte a documentação acima.
    ═══════════════════════════════════════════════════════════════════════════════
*/

// wwwroot/js/global-toast.js
// VERSÃO DEFINITIVA - AppToast Puro (JavaScript Nativo)
// Sem dependência do Syncfusion - 100% confiável

(function ()
{
    'use strict';

    // Previne múltiplas inicializações
    if (window.AppToast)
    {
        console.warn('⚠️ AppToast já foi inicializado');
        return;
    }

    // ============================================
    // CONFIGURAÇÕES DE ESTILO
    // ============================================
    const STYLE_MAP = {
        "Verde": {
            gradient: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
            icon: '<i class="fa-duotone fa-solid fa-thumbs-up" style="font-size:48px;color:#fff;width:48px;height:48px;display:flex;align-items:center;justify-content:center;flex-shrink:0;" aria-hidden="true"></i>'
        },
        "Vermelho": {
            gradient: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
            icon: '<i class="fa-duotone fa-solid fa-face-eyes-xmarks" style="font-size:48px;color:#fff;width:48px;height:48px;display:flex;align-items:center;justify-content:center;flex-shrink:0;" aria-hidden="true"></i>'
        },
        "Amarelo": {
            gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
            icon: '<i class="fa-duotone fa-solid fa-circle-radiation" style="font-size:48px;color:#fff;width:48px;height:48px;display:flex;align-items:center;justify-content:center;flex-shrink:0;" aria-hidden="true"></i>'
        }
    };

    // ============================================
    // VARIÁVEIS PRIVADAS
    // ============================================
    let container = null;
    let currentToast = null;
    let closeTimer = null;
    let animationFrameId = null;

    // ============================================
    // FUNÇÕES AUXILIARES
    // ============================================

    function getContainer()
    {
        if (!container)
        {
            container = document.createElement('div');
            container.id = 'app-toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 100000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    function sanitizeText(text)
    {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function clearTimers()
    {
        if (closeTimer)
        {
            clearTimeout(closeTimer);
            closeTimer = null;
        }

        if (animationFrameId)
        {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    function close()
    {
        clearTimers();

        if (currentToast)
        {
            currentToast.style.animation = 'slideOutRight 0.4s ease forwards';

            setTimeout(() =>
            {
                if (currentToast && currentToast.parentNode)
                {
                    currentToast.parentNode.removeChild(currentToast);
                }
                currentToast = null;
            }, 400);
        }
    }

    function show(estilo, mensagem, duracaoMs)
    {
        // Fecha toast anterior
        close();

        const timeout = Number.isFinite(duracaoMs) ? Math.max(0, duracaoMs) : 3000;
        const style = STYLE_MAP[estilo] || STYLE_MAP["Amarelo"];
        const text = sanitizeText(mensagem);
        const progressId = 'app-toast-progress-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

        console.log(`%c[AppToast] Mostrando toast "${estilo}" por ${timeout}ms`, 'color: #4caf50; font-weight: bold;');

        // Cria elemento do toast
        const toast = document.createElement('div');
        toast.className = 'app-toast-item';
        toast.style.cssText = `
            background: ${style.gradient};
            min-width: 380px;
            max-width: 480px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            overflow: hidden;
            margin-bottom: 12px;
            pointer-events: auto;
            animation: slideInRight 0.4s ease forwards;
            cursor: pointer;
        `;

        toast.innerHTML = `
            <div style="display:flex;align-items:center;gap:16px;padding:16px 20px;">
                ${style.icon}
                <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
                    <div style="font-size:16px;font-weight:700;line-height:1.4;color:#fff;">${text}</div>
                    <div style="position:relative;width:100%;height:4px;background:rgba(255,255,255,0.3);border-radius:4px;overflow:hidden;">
                        <div id="${progressId}" style="height:100%;width:100%;background:#fff;transform-origin:left;transform:scaleX(1);transition:none;"></div>
                    </div>
                </div>
            </div>
        `;

        // Adiciona ao container
        const cont = getContainer();
        cont.appendChild(toast);
        currentToast = toast;

        // Anima barra de progresso
        if (timeout > 0)
        {
            const progressBar = document.getElementById(progressId);
            const startTime = performance.now();

            function animateProgress(currentTime)
            {
                const elapsed = currentTime - startTime;
                const progress = Math.max(0, 1 - (elapsed / timeout));

                if (progressBar)
                {
                    progressBar.style.transform = `scaleX(${progress})`;
                }

                if (progress > 0)
                {
                    animationFrameId = requestAnimationFrame(animateProgress);
                }
                else
                {
                    animationFrameId = null;
                }
            }

            animationFrameId = requestAnimationFrame(animateProgress);

            // Fecha automaticamente após o timeout
            closeTimer = setTimeout(() =>
            {
                console.log(`%c[AppToast] Fechando toast após ${timeout}ms`, 'color: #f44336; font-weight: bold;');
                close();
            }, timeout);
        }

        // Clique no toast fecha
        toast.addEventListener('click', () =>
        {
            console.log('[AppToast] Toast fechado por clique');
            close();
        });
    }

    function setPosition(x, y)
    {
        const cont = getContainer();

        const horizontalPositions = {
            'Right': 'right: 20px; left: auto;',
            'Left': 'left: 20px; right: auto;',
            'Center': 'left: 50%; transform: translateX(-50%);'
        };

        const verticalPositions = {
            'Top': 'top: 20px; bottom: auto;',
            'Bottom': 'bottom: 20px; top: auto;'
        };

        cont.style.cssText = `
            position: fixed;
            z-index: 100000;
            pointer-events: none;
            ${horizontalPositions[x] || horizontalPositions['Right']}
            ${verticalPositions[y] || verticalPositions['Top']}
        `;
    }

    // ============================================
    // ADICIONA ANIMAÇÕES CSS
    // ============================================

    function addStyles()
    {
        if (!document.getElementById('app-toast-styles'))
        {
            const style = document.createElement('style');
            style.id = 'app-toast-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideOutRight {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }

                .app-toast-item:hover {
                    box-shadow: 0 12px 32px rgba(0,0,0,0.2) !important;
                    transform: translateY(-2px);
                    transition: all 0.2s ease;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    // ESC fecha o toast
    document.addEventListener('keydown', (e) =>
    {
        if (e.key === 'Escape')
        {
            close();
        }
    });

    // Inicializa estilos
    addStyles();

    // ============================================
    // EXPORTA API PÚBLICA
    // ============================================

    window.AppToast = Object.freeze({
        show: show,
        close: close,
        setPosition: setPosition,
        version: '5.0-final'
    });

    console.log('%c✓ AppToast v5.0-final carregado', 'color: #4caf50; font-weight: bold;');

})();
