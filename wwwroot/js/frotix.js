/**
 * Corta as bordas transparentes de uma imagem PNG e redimensiona para largura e altura desejadas
 * param {HTMLImageElement} img - Elemento de imagem já carregado
 * param {number} targetWidth - Largura final desejada após o trim e resize
 * param {number} targetHeight - Altura final desejada após o trim e resize
 * returns {HTMLCanvasElement} - Canvas com imagem cortada e redimensionada
 */

function trimTransparentPNG(img, targetWidth, targetHeight)
{
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');

    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    const w = imageData.width;
    const h = imageData.height;

    let top = null, bottom = null, left = null, right = null;

    for (let y = 0; y < h; y++)
    {
        for (let x = 0; x < w; x++)
        {
            const alpha = pixels[(y * w + x) * 4 + 3];
            if (alpha > 0)
            {
                if (top === null) top = y;
                bottom = y;
                if (left === null || x < left) left = x;
                if (right === null || x > right) right = x;
            }
        }
    }

    const trimmedWidth = right - left + 1;
    const trimmedHeight = bottom - top + 1;
    const trimmedData = ctx.getImageData(left, top, trimmedWidth, trimmedHeight);

    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = targetWidth;
    resultCanvas.height = targetHeight;
    const resultCtx = resultCanvas.getContext('2d');

    // Criar canvas temporário com a imagem cortada
    const trimmedCanvas = document.createElement('canvas');
    trimmedCanvas.width = trimmedWidth;
    trimmedCanvas.height = trimmedHeight;
    trimmedCanvas.getContext('2d').putImageData(trimmedData, 0, 0);

    // Redimensionar para tamanho final desejado
    resultCtx.drawImage(trimmedCanvas, 0, 0, targetWidth, targetHeight);

    return resultCanvas;
}

// Módulo global para controlar o Spinner
(function ()
{
    const KEY = 'ftx:spin:next';

    // Core minimalista
    window.FtxSpin = {
        _el: null,
        show(msg)
        {
            if (this._el) { this.setMsg(msg); this._el.style.display = 'flex'; return; }
            const ov = document.createElement('div'); ov.className = 'ftx-spin-overlay';
            ov.innerHTML = `
        <div class="ftx-spin-box" role="status" aria-live="assertive">
          <div class="ftx-spinner" aria-hidden="true"></div>
          <div class="ftx-spin-msg">${msg || 'Carregando…'}</div>
        </div>`;
            document.body.appendChild(ov);
            this._el = ov;
        },
        hide() { if (this._el) this._el.style.display = 'none'; },
        setMsg(msg)
        {
            const t = this._el && this._el.querySelector('.ftx-spin-msg');
            if (t && msg) t.textContent = msg;
        }
    };

    // 1) Ao clicar em qualquer <a data-ftx-spin>, mostra e marca intenção para a próxima página
    document.addEventListener('click', function (ev)
    {
        const a = ev.target.closest && ev.target.closest('a[data-ftx-spin]');
        if (!a) return;
        const msg = a.getAttribute('data-ftx-spin') || 'Carregando…';
        try { sessionStorage.setItem(KEY, msg); } catch (e) { }
        // não impedir a navegação — apenas mostra já
        FtxSpin.show(msg);
    }, true);

    // 2) Se chegamos a uma nova página com intenção pendente, reabrir o spinner o quanto antes
    (function autoOpenOnLoad()
    {
        let msg = null;
        try { msg = sessionStorage.getItem(KEY); } catch (e) { }
        if (!msg) return;
        try { sessionStorage.removeItem(KEY); } catch (e) { }
        // Se body ainda não existe, aguarde o DOM mínimo
        if (!document.body)
        {
            document.addEventListener('DOMContentLoaded', function () { FtxSpin.show(msg); }, { once: true });
        } else
        {
            FtxSpin.show(msg);
        }
    })();
})();

/*!
* Global Busy Submit v1.0
* - Aplica spinner + trava de duplo clique em botões de submit
* - Por padrío, habilita em TODOS os forms (opt-out com data-auto-spinner="off")
*/
(function ()
{
    "use strict";

    var SUBMIT_SELECTOR = "button[type=submit], input[type=submit]";

    function isFormEnabled(form)
    {
        // Por padrío, ligado. Desligue com data-auto-spinner="off"
        return (form.dataset.autoSpinner || "on").toLowerCase() !== "off";
    }

    function getSubmitter(evt, form)
    {
        if (evt && evt.submitter) return evt.submitter; // padrío moderno
        if (form._lastClickedSubmit && form.contains(form._lastClickedSubmit)) return form._lastClickedSubmit;
        // botão padrío por atributo
        var explicitDefault = form.querySelector("[data-default-submit]");
        if (explicitDefault) return explicitDefault;
        // primeiro submit do form
        return form.querySelector(SUBMIT_SELECTOR);
    }

    function htmlEscape(s)
    {
        return String(s).replace(/[&<>"']/g, function (ch)
        {
            return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
        });
    }

    function lockButton(btn)
    {
        if (!btn || btn.dataset.busy === "true" || btn.hasAttribute("data-no-busy")) return false;

        // manter largura para evitar "pulo" opcional
        if (btn.dataset.busyKeepWidth === "true")
        {
            var rect = btn.getBoundingClientRect();
            btn.style.minWidth = rect.width + "px";
        }

        btn.dataset.busy = "true";
        btn.setAttribute("disabled", "disabled");
        btn.setAttribute("aria-busy", "true");

        var text = btn.dataset.spinnerText || "Salvando...";
        var iconClass = btn.dataset.spinnerIcon || "fa-solid fa-spinner fa-spin me-2";

        if (btn.tagName === "BUTTON")
        {
            if (!btn.dataset.originalHtml) btn.dataset.originalHtml = btn.innerHTML;
            // troca conteúdo: ícone + texto
            btn.innerHTML = '<i class="' + htmlEscape(iconClass) + '"></i>' + htmlEscape(text);
        } else if (btn.tagName === "INPUT")
        {
            // para <input type="submit"> não há innerHTML; troca apenas o value
            if (!btn.dataset.originalValue) btn.dataset.originalValue = btn.value;
            btn.value = text;
            // dica: prefira <button> se quiser ícone
        }
        return true;
    }

    function maybeValid(form)
    {
        // 1) HTML5
        if (typeof form.checkValidity === "function" && !form.checkValidity()) return false;

        // 2) jQuery Validate (se presente)
        var $ = window.jQuery;
        if ($ && typeof $.fn.valid === "function")
        {
            var $form = $(form);
            if ($form.data("validator") && !$form.valid()) return false;
        }
        return true;
    }

    function onReady(fn)
    {
        if (document.readyState === "loading")
        {
            document.addEventListener("DOMContentLoaded", fn);
        } else
        {
            fn();
        }
    }

    onReady(function ()
    {
        // Rastreia o último botão submit clicado (cobre Enter/submitter ausente)
        document.addEventListener("click", function (ev)
        {
            var target = ev.target && ev.target.closest ? ev.target.closest(SUBMIT_SELECTOR) : null;
            if (!target) return;
            var form = target.form;
            if (!form || !isFormEnabled(form)) return;
            form._lastClickedSubmit = target;
        }, true); // capture = true para pegar mesmo com delegação em libs

        // Handler global de submit (não impede o envio)
        document.addEventListener("submit", function (ev)
        {
            var form = ev.target;
            if (!(form instanceof HTMLFormElement)) return;
            if (!isFormEnabled(form)) return;

            // só mostra spinner se o form estiver realmente válido
            if (!maybeValid(form)) return;

            var submitter = getSubmitter(ev, form);
            if (submitter) lockButton(submitter);
            // Não chamar preventDefault(); deixamos o post seguir normalmente
        }, false);
    });
})();

function formatarDataBR(raw)
{
    const s = (raw ?? '').toString().trim();
    if (!s) return '';

    const m = moment(s,
        [
            moment.ISO_8601,           // 2025-09-18T10:32:00[Z]
            "DD/MM/YYYY",
            "D/M/YYYY",
            "DD/MM/YYYY HH:mm",
            "D/M/YYYY H:mm",
            "YYYY-MM-DD",
            "x"                        // unix ms
        ],
        true                         // strict
    );

    return m.isValid() ? m.format("DD/MM/YYYY") : '';
}

function formatarHora(raw, preferVazioSeSemHora = false)
{
    const s = (raw ?? '').toString().trim();
    if (!s) return '';

    // extrai ticks do formato .NET /Date(1695004800000)/
    const ticks = +((s.match(/\d+/) || [])[0]);
    const candidato = s.startsWith('/Date(') ? ticks : s;

    const m = moment(candidato, [
        moment.ISO_8601,            // 2025-09-18T10:32:00Z / 2025-09-18T10:32
        "DD/MM/YYYY HH:mm:ss",
        "DD/MM/YYYY H:mm:ss",
        "DD/MM/YYYY HH:mm",
        "DD/MM/YYYY H:mm",
        "YYYY-MM-DD HH:mm:ss",
        "YYYY-MM-DD HH:mm",
        "YYYY-MM-DD",               // se vier só a data
        "x"                         // unix ms
    ], true); // strict

    if (!m.isValid()) return '';

    // opcional: se veio só data e você quer vazio em vez de 00:00
    const temHora = /[T\s]\d{1,2}:\d{2}/.test(s);
    if (preferVazioSeSemHora && !temHora) return '';

    return m.format("HH:mm");
}

// syncfusion_tooltips.js
// Gerenciamento básico de tooltips Syncfusion

let ejTooltip = new ej.popups.Tooltip({
    target: '[data-ejtip]',
    opensOn: 'Hover',
    beforeRender(args)
    {
        this.content = args.target.getAttribute('data-ejtip') || '';
    },
    afterOpen(args)
    {
        // Fecha automaticamente após 2 segundos
        setTimeout(() =>
        {
            this.close();
        }, 2000);
    }
});

ejTooltip.appendTo(document.body);


/**
 * Remove acentos e caracteres inválidos para nomes de arquivo
 * Substitui espaços por underscore
 */
function tiraAcento(texto)
{
    if (!texto || typeof texto !== 'string') return '';

    try
    {
        let resultado = texto
            // Normaliza e remove acentos
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')

            // Caracteres especiais comuns
            .replace(/[àáâãäåæ]/gi, 'a')
            .replace(/[èéêë]/gi, 'e')
            .replace(/[ìíîï]/gi, 'i')
            .replace(/[òóôõöø]/gi, 'o')
            .replace(/[ùúûü]/gi, 'u')
            .replace(/[ýÿ]/gi, 'y')
            .replace(/[ñ]/gi, 'n')
            .replace(/[ç]/gi, 'c')
            .replace(/[ß]/g, 'ss')
            .replace(/[œ]/gi, 'oe')
            .replace(/[æ]/gi, 'ae')
            .replace(/[ð]/gi, 'd')
            .replace(/[þ]/gi, 'th')

            // Remove caracteres inválidos para nomes de arquivo
            // Windows: < > : " / \ | ? *
            // Também remove caracteres de controle
            .replace(/[<>:"\/\\|?*\x00-\x1F\x7F]/g, '')

            // Remove caracteres especiais, mantendo apenas alfanuméricos, underscore, hífen e ponto
            .replace(/[^\w\s.\-]/g, '')

            // Substitui espaços por underscore
            .replace(/\s+/g, '_')

            // Remove múltiplos underscores/hífens/pontos consecutivos
            .replace(/_{2,}/g, '_')
            .replace(/-{2,}/g, '-')
            .replace(/\.{2,}/g, '.')

            // Remove underscore/hífen no início e fim
            .replace(/^[_\-]+|[_\-]+$/g, '');

        // Limita tamanho (255 caracteres)
        return resultado.length > 255 ? resultado.substring(0, 255) : resultado;

    } catch (error)
    {
        console.error('Erro em tiraAcento:', error);
        return '';
    }
}

// Exemplos:
// tiraAcento("Açúcar & Café.pdf")        → "Acucar_Cafe.pdf"
// tiraAcento("São Paulo/Rio")            → "Sao_PauloRio"
// tiraAcento("Relatório 2024: análise")  → "Relatorio_2024_analise"

/* ================================================================
   EFEITO RIPPLE - PADRÃO FROTIX
   Adicionar ao final do frotix.js
   ================================================================ */

/**
 * Cria o efeito ripple no ponto exato do clique
 * @param {MouseEvent} event - Evento de clique
 * @param {HTMLElement} element - Elemento que receberá o ripple
 */
function createRipple(event, element)
{
    try
    {
        // Não criar ripple em elementos desabilitados
        if (element.disabled || element.classList.contains('disabled') || element.getAttribute('aria-disabled') === 'true')
        {
            return;
        }

        // Não criar ripple se o elemento tem a classe no-ripple
        if (element.classList.contains('no-ripple'))
        {
            return;
        }

        // Remove ripples anteriores para evitar acúmulo
        const existingRipples = element.querySelectorAll('.ftx-ripple-circle');
        existingRipples.forEach(ripple =>
        {
            if (ripple.dataset.removing !== 'true')
            {
                ripple.remove();
            }
        });

        // Calcula posição do clique relativa ao elemento
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Calcula o tamanho do ripple baseado no elemento
        const size = Math.max(rect.width, rect.height) * 2;

        // Cria o elemento do ripple
        const ripple = document.createElement('span');
        ripple.className = 'ftx-ripple-circle';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.marginLeft = -(size / 2) + 'px';
        ripple.style.marginTop = -(size / 2) + 'px';

        // Adiciona o ripple ao elemento
        element.appendChild(ripple);

        // Remove o ripple após a animação (600ms)
        setTimeout(() =>
        {
            ripple.dataset.removing = 'true';
            ripple.remove();
        }, 600);

    } catch (error)
    {
        console.warn('Erro ao criar ripple:', error);
    }
}

/**
 * Inicializa o sistema de ripple com delegação de eventos
 * Funciona automaticamente com elementos dinâmicos (DataTables, modais, etc.)
 */
(function initRippleSystem()
{
    'use strict';

    // Seletor de elementos que receberão ripple automaticamente
    const RIPPLE_SELECTOR = [
        '.btn',
        '[class*="btn-"]',
        'button[type="button"]',
        'button[type="submit"]',
        '.btn-icon-28',
        '.btn-acao-ftx',
        '.ftx-ripple'
    ].join(',');

    // Handler do clique com delegação
    function handleRippleClick(event)
    {
        // Encontra o elemento mais próximo que deve ter ripple
        const target = event.target.closest(RIPPLE_SELECTOR);

        if (target)
        {
            createRipple(event, target);
        }
    }

    // Registra o listener no document para capturar todos os cliques
    // Usa capture:true para garantir que pegamos o evento antes de qualquer stopPropagation
    document.addEventListener('click', handleRippleClick, true);

    // Expõe a função globalmente para uso manual se necessário
    window.createRipple = createRipple;

    // Log de inicialização (pode remover em produção)
    // console.log('✨ FrotiX Ripple System initialized');
})();

/**
 * Função auxiliar para adicionar ripple manualmente a um elemento
 * Útil para elementos criados dinamicamente que não correspondem ao seletor padrão
 * 
 * Exemplo de uso:
 * addRippleToElement(document.getElementById('meuBotaoCustomizado'));
 * 
 * @param {HTMLElement} element - Elemento que receberá o ripple
 * @param {string} variant - 'light' (padrão), 'dark', 'subtle' ou 'intense'
 */
function addRippleToElement(element, variant = 'light')
{
    if (!element) return;

    // Adiciona as classes necessárias
    element.classList.add('ftx-ripple');

    if (variant === 'dark')
    {
        element.classList.add('ftx-ripple-dark');
    }
    else if (variant === 'subtle')
    {
        element.classList.add('ftx-ripple-subtle');
    }
    else if (variant === 'intense')
    {
        element.classList.add('ftx-ripple-intense');
    }
    else
    {
        element.classList.add('ftx-ripple-light');
    }

    // Garante que o elemento tem position:relative e overflow:hidden
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.position === 'static')
    {
        element.style.position = 'relative';
    }
    element.style.overflow = 'hidden';
}

/**
 * Remove o efeito ripple de um elemento
 * @param {HTMLElement} element - Elemento a ter o ripple removido
 */
function removeRippleFromElement(element)
{
    if (!element) return;

    element.classList.remove('ftx-ripple', 'ftx-ripple-light', 'ftx-ripple-dark', 'ftx-ripple-subtle', 'ftx-ripple-intense');

    // Remove qualquer ripple em andamento
    const ripples = element.querySelectorAll('.ftx-ripple-circle');
    ripples.forEach(r => r.remove());
}

// Expõe funções auxiliares globalmente
window.addRippleToElement = addRippleToElement;
window.removeRippleFromElement = removeRippleFromElement;
