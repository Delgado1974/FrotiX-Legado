# Documentação: frotix.js - Utilitários Globais e Sistemas de UI

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0  
> **Padrão**: FrotiX Simplificado

---

## Objetivos

O arquivo **frotix.js** é uma biblioteca central de utilitários JavaScript que fornece funcionalidades essenciais para toda a aplicação FrotiX. Ele contém sistemas de UI (spinner, ripple, loading), funções de formatação, manipulação de imagens e utilitários diversos.

**Principais funcionalidades:**
- ✅ **Manipulação de imagens** (trim de PNG transparente)
- ✅ **Sistema de spinner global** (FtxSpin) com logo pulsante
- ✅ **Sistema de loading automático** em botões/links
- ✅ **Sistema de ripple** (efeito de onda ao clicar)
- ✅ **Formatação de datas e horas** (BR e ISO)
- ✅ **Normalização de texto** (remover acentos para nomes de arquivo)
- ✅ **Validação de formulários** (HTML5 e jQuery Validate)

---

## Arquivos Envolvidos

1. **wwwroot/js/frotix.js** - Arquivo principal (753 linhas)
2. **wwwroot/css/frotix.css** - Estilos complementares (spinner, ripple, loading)
3. **Pages/Shared/_ScriptsBasePlugins.cshtml** - Carregamento global do arquivo
4. **wwwroot/Images/logo_gota_frotix_transparente.png** - Logo usado no spinner

---

## 1. Manipulação de Imagens - trimTransparentPNG

### Problema
Remover bordas transparentes de imagens PNG e redimensionar para dimensões específicas, útil para otimização de uploads e exibição consistente.

### Solução
Implementar função que analisa pixels da imagem, encontra limites não-transparentes, corta e redimensiona usando Canvas API.

### Código

```javascript
/**
 * Corta as bordas transparentes de uma imagem PNG e redimensiona para largura e altura desejadas
 * @param {HTMLImageElement} img - Elemento de imagem já carregado
 * @param {number} targetWidth - Largura final desejada após o trim e resize
 * @param {number} targetHeight - Altura final desejada após o trim e resize
 * @returns {HTMLCanvasElement} - Canvas com imagem cortada e redimensionada
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

    // Encontra limites não-transparentes
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
```

**✅ Comentários:**
- Analisa canal alpha (transparência) de cada pixel
- Encontra primeiro e último pixels não-transparentes em cada direção
- Cria canvas intermediário com imagem cortada
- Redimensiona para dimensões finais usando `drawImage` com escala

**Exemplo de uso:**

```javascript
const img = new Image();
img.onload = function() {
    const canvas = trimTransparentPNG(img, 200, 200);
    // Converter para blob ou data URL
    canvas.toBlob(function(blob) {
        // Upload ou exibição
    });
};
img.src = '/path/to/image.png';
```

---

## 2. Sistema de Spinner Global (FtxSpin)

### Problema
Exibir indicador de carregamento consistente em toda a aplicação, especialmente durante navegação entre páginas.

### Solução
Criar sistema que mostra spinner com logo FrotiX pulsante e barra de progresso, persistindo entre navegações usando `sessionStorage`.

### Código

```javascript
// Módulo global para controlar o Spinner - Padrão FrotiX com Logo Pulsando
(function ()
{
    const KEY = 'ftx:spin:next';

    // Core com padrão FrotiX (logo pulsando + barra de progresso)
    window.FtxSpin = {
        _el: null,
        show(msg)
        {
            if (this._el) { 
                this.setMsg(msg); 
                this._el.style.display = 'flex'; 
                return; 
            }
            const ov = document.createElement('div');
            ov.className = 'ftx-spin-overlay';
            ov.innerHTML = `
        <div class="ftx-spin-box" role="status" aria-live="assertive" style="text-align: center; min-width: 300px;">
          <img src="/images/logo_gota_frotix_transparente.png" alt="FrotiX" class="ftx-loading-logo" style="display: block;" />
          <div class="ftx-loading-bar"></div>
          <div class="ftx-loading-text ftx-spin-msg">${msg || 'Carregando…'}</div>
          <div class="ftx-loading-subtext">Aguarde, por favor</div>
        </div>`;
            document.body.appendChild(ov);
            this._el = ov;
        },
        hide() { 
            if (this._el) this._el.style.display = 'none'; 
        },
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
        try { 
            sessionStorage.setItem(KEY, msg); 
        } catch (e) { }
        // não impedir a navegação — apenas mostra já
        FtxSpin.show(msg);
    }, true);

    // 2) Se chegamos a uma nova página com intenção pendente, reabrir o spinner o quanto antes
    (function autoOpenOnLoad()
    {
        let msg = null;
        try { 
            msg = sessionStorage.getItem(KEY); 
        } catch (e) { }
        if (!msg) return;
        try { 
            sessionStorage.removeItem(KEY); 
        } catch (e) { }
        // Se body ainda não existe, aguarde o DOM mínimo
        if (!document.body)
        {
            document.addEventListener('DOMContentLoaded', function () { 
                FtxSpin.show(msg); 
            }, { once: true });
        } else
        {
            FtxSpin.show(msg);
        }
    })();
})();
```

**✅ Comentários:**
- Usa `sessionStorage` para persistir mensagem entre navegações
- Mostra spinner imediatamente ao clicar em link com `data-ftx-spin`
- Reabre spinner na próxima página se houver intenção pendente
- Suporta elementos dinâmicos através de delegação de eventos

**Exemplo de uso:**

```html
<!-- Link com spinner automático -->
<a href="/Operador/Upsert" data-ftx-spin="Carregando formulário...">
    Adicionar Operador
</a>

<!-- Controle manual via JavaScript -->
<script>
    FtxSpin.show("Processando dados...");
    // ... operação assíncrona ...
    FtxSpin.hide();
</script>
```

---

## 3. Sistema de Loading Automático em Botões/Links

### Problema
Prevenir duplo clique e fornecer feedback visual durante operações assíncronas em botões e links.

### Solução
Implementar sistema que detecta elementos com `data-ftx-loading`, substitui ícone por spinner, desabilita elemento e restaura automaticamente após timeout ou navegação.

### Código

```javascript
(function initFtxLoadingSystem() {
    'use strict';

    // Configuração do sistema
    const FTX_LOADING_CONFIG = {
        spinnerClass: 'fa-duotone fa-spinner-third fa-spin',
        loadingClass: 'ftx-btn-loading',
        timeout: 30000, // 30 segundos para timeout
        disableOnClick: true
    };

    // Seletor de elementos que terão loading automático
    const LOADING_SELECTOR = '[data-ftx-loading]';

    /**
     * Aplica o estado de loading em um elemento
     * @param {HTMLElement} element - Botão ou link
     */
    function applyLoading(element) {
        if (!element || element.classList.contains(FTX_LOADING_CONFIG.loadingClass)) {
            return false;
        }

        // Salva estado original
        const icon = element.querySelector('i[class*="fa-"]');
        if (icon) {
            element.dataset.ftxOriginalIcon = icon.className;
            icon.className = FTX_LOADING_CONFIG.spinnerClass;
        } else {
            // Se não tem ícone, adiciona um spinner no início
            const spinner = document.createElement('i');
            spinner.className = FTX_LOADING_CONFIG.spinnerClass + ' me-1';
            spinner.dataset.ftxTempSpinner = 'true';
            element.insertBefore(spinner, element.firstChild);
        }

        // Salva largura para evitar "pulo"
        const rect = element.getBoundingClientRect();
        element.style.minWidth = rect.width + 'px';

        // Marca como loading
        element.classList.add(FTX_LOADING_CONFIG.loadingClass);

        // Desabilita para evitar duplo clique
        if (FTX_LOADING_CONFIG.disableOnClick) {
            if (element.tagName === 'BUTTON' || element.tagName === 'INPUT') {
                element.disabled = true;
            }
            element.style.pointerEvents = 'none';
        }

        // Timeout para restaurar (caso a página não navegue)
        element._ftxLoadingTimeout = setTimeout(() => {
            resetLoading(element);
        }, FTX_LOADING_CONFIG.timeout);

        return true;
    }

    /**
     * Remove o estado de loading de um elemento
     * @param {HTMLElement} element - Botão ou link
     */
    function resetLoading(element) {
        if (!element || !element.classList.contains(FTX_LOADING_CONFIG.loadingClass)) {
            return;
        }

        // Limpa timeout
        if (element._ftxLoadingTimeout) {
            clearTimeout(element._ftxLoadingTimeout);
            element._ftxLoadingTimeout = null;
        }

        // Remove spinner temporário
        const tempSpinner = element.querySelector('[data-ftx-temp-spinner]');
        if (tempSpinner) {
            tempSpinner.remove();
        }

        // Restaura ícone original
        const icon = element.querySelector('i[class*="fa-spin"]');
        if (icon && element.dataset.ftxOriginalIcon) {
            icon.className = element.dataset.ftxOriginalIcon;
            delete element.dataset.ftxOriginalIcon;
        }

        // Remove classe e estilos
        element.classList.remove(FTX_LOADING_CONFIG.loadingClass);
        element.style.minWidth = '';
        element.style.pointerEvents = '';

        // Reabilita
        if (element.tagName === 'BUTTON' || element.tagName === 'INPUT') {
            element.disabled = false;
        }
    }

    /**
     * Handler de clique com delegação
     */
    function handleLoadingClick(event) {
        const target = event.target.closest(LOADING_SELECTOR);
        
        if (!target) return;

        // Evita duplo clique
        if (target.classList.contains(FTX_LOADING_CONFIG.loadingClass)) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        // Aplica loading
        applyLoading(target);
    }

    // Registra listener global com delegação
    document.addEventListener('click', handleLoadingClick, true);

    // Reseta loading quando página volta do cache (bfcache)
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            // Página veio do cache, reseta todos os loadings
            document.querySelectorAll('.' + FTX_LOADING_CONFIG.loadingClass).forEach(resetLoading);
        }
    });

    // Expõe funções globalmente
    window.FtxLoading = {
        apply: applyLoading,
        reset: resetLoading,
        resetAll: function() {
            document.querySelectorAll('.' + FTX_LOADING_CONFIG.loadingClass).forEach(resetLoading);
        }
    };
})();
```

**✅ Comentários:**
- Detecta elementos com `data-ftx-loading` automaticamente
- Substitui ícone existente ou adiciona spinner temporário
- Preserva largura do botão para evitar "pulo" visual
- Timeout de 30s restaura estado se página não navegar
- Reseta loadings quando página volta do cache do navegador

**Exemplo de uso:**

```html
<!-- Botão com loading automático -->
<button type="submit" data-ftx-loading>
    <i class="fa-duotone fa-save"></i>
    Salvar
</button>

<!-- Link com loading -->
<a href="/api/exportar" data-ftx-loading>
    <i class="fa-duotone fa-download"></i>
    Exportar
</a>

<!-- Controle manual via JavaScript -->
<script>
    const btn = document.getElementById('meuBotao');
    FtxLoading.apply(btn);
    // ... operação assíncrona ...
    FtxLoading.reset(btn);
</script>
```

---

## 4. Sistema de Ripple (Efeito de Onda)

### Problema
Adicionar feedback visual moderno ao clicar em botões e elementos interativos, seguindo padrões de Material Design.

### Solução
Implementar sistema que cria círculo animado no ponto exato do clique, com gradiente radial e animação de escala, funcionando com elementos dinâmicos.

### Código

```javascript
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
        if (element.disabled || element.classList.contains('disabled') || 
            element.getAttribute('aria-disabled') === 'true')
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

        // Verifica se é botão laranja (ripple externo maior)
        const isOrangeButton = element.classList.contains('btn-fundo-laranja') ||
                               element.classList.contains('btn-header-orange');

        // Tamanho: 1.0x para todos os botões
        const multiplier = 1.0;
        const size = Math.max(rect.width, rect.height) * multiplier;
        const duration = isOrangeButton ? 900 : 600;

        // Cria o elemento do ripple com estilos inline (garante funcionamento)
        const ripple = document.createElement('span');
        ripple.className = 'ftx-ripple-circle';

        // Gradiente mais intenso para botões laranja
        const gradient = isOrangeButton
            ? 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0.3) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)';

        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            transform: scale(0);
            animation: ftxRippleAnim ${duration}ms ease-out forwards;
            background: ${gradient};
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            margin-left: -${size / 2}px;
            margin-top: -${size / 2}px;
            z-index: 9999;
        `;

        // Adiciona o ripple ao elemento
        element.appendChild(ripple);

        // Remove o ripple após a animação
        setTimeout(() =>
        {
            ripple.dataset.removing = 'true';
            ripple.remove();
        }, duration);

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
})();
```

**✅ Comentários:**
- Calcula posição exata do clique relativa ao elemento
- Tamanho do ripple baseado na maior dimensão do elemento
- Duração maior (900ms) para botões laranja (mais visível)
- Remove ripples anteriores para evitar acúmulo
- Funciona com elementos dinâmicos através de delegação

**Exemplo de uso:**

```html
<!-- Automático - funciona em qualquer botão -->
<button class="btn btn-primary">Clique aqui</button>

<!-- Desabilitar ripple em elemento específico -->
<button class="btn no-ripple">Sem ripple</button>

<!-- Adicionar ripple manualmente -->
<script>
    const elemento = document.getElementById('meuElemento');
    elemento.addEventListener('click', function(e) {
        createRipple(e, elemento);
    });
</script>
```

---

## 5. Formatação de Datas e Horas

### Problema
Converter datas e horas de diversos formatos (ISO 8601, .NET ticks, formatos brasileiros) para formato brasileiro padronizado.

### Solução
Implementar funções que usam Moment.js para parsing flexível e formatação consistente.

### Código

```javascript
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
```

**✅ Comentários:**
- Suporta múltiplos formatos de entrada (ISO, brasileiro, .NET ticks)
- Modo strict garante parsing preciso
- `formatarHora` detecta se há hora na string original
- Retorna string vazia se parsing falhar

**Exemplo de uso:**

```javascript
// Formatação de data
formatarDataBR("2025-01-08T14:30:00Z");        // "08/01/2025"
formatarDataBR("08/01/2025");                  // "08/01/2025"
formatarDataBR("/Date(1704727800000)/");       // "08/01/2025"

// Formatação de hora
formatarHora("2025-01-08T14:30:00Z");          // "14:30"
formatarHora("08/01/2025 14:30");              // "14:30"
formatarHora("2025-01-08", true);              // "" (sem hora, preferVazioSeSemHora=true)
```

---

## 6. Normalização de Texto (tiraAcento)

### Problema
Remover acentos e caracteres especiais de strings para uso em nomes de arquivo, URLs ou comparações case-insensitive.

### Solução
Implementar função que normaliza Unicode, remove acentos, substitui caracteres especiais e limita tamanho.

### Código

```javascript
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
```

**✅ Comentários:**
- Usa `normalize('NFD')` para decompor caracteres acentuados
- Remove diacríticos com regex `[\u0300-\u036f]`
- Trata caracteres especiais específicos (ç, ñ, etc.)
- Remove caracteres inválidos para Windows/Linux
- Limita a 255 caracteres (limite de nomes de arquivo)

**Exemplo de uso:**

```javascript
tiraAcento("Açúcar & Café.pdf");        // "Acucar_Cafe.pdf"
tiraAcento("São Paulo/Rio");            // "Sao_PauloRio"
tiraAcento("Relatório 2024: análise");  // "Relatorio_2024_analise"
```

---

## 7. Global Busy Submit (Prevenção de Duplo Clique)

### Problema
Prevenir múltiplos envios de formulários quando usuário clica rapidamente no botão submit.

### Solução
Implementar sistema que detecta submit de formulários, valida formulário, e desabilita botão submit com spinner.

### Código

```javascript
/*!
* Global Busy Submit v1.0
* - Aplica spinner + trava de duplo clique em botões de submit
* - Por padrão, habilita em TODOS os forms (opt-out com data-auto-spinner="off")
*/
(function ()
{
    "use strict";

    var SUBMIT_SELECTOR = "button[type=submit], input[type=submit]";

    function isFormEnabled(form)
    {
        // Por padrão, ligado. Desligue com data-auto-spinner="off"
        return (form.dataset.autoSpinner || "on").toLowerCase() !== "off";
    }

    function getSubmitter(evt, form)
    {
        if (evt && evt.submitter) return evt.submitter; // padrão moderno
        if (form._lastClickedSubmit && form.contains(form._lastClickedSubmit)) 
            return form._lastClickedSubmit;
        // botão padrão por atributo
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
        if (!btn || btn.dataset.busy === "true" || btn.hasAttribute("data-no-busy")) 
            return false;

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
```

**✅ Comentários:**
- Ativo por padrão em todos os formulários (opt-out com `data-auto-spinner="off"`)
- Valida formulário antes de aplicar spinner (HTML5 e jQuery Validate)
- Rastreia último botão clicado para casos de Enter ou submit programático
- Preserva HTML original do botão para restauração
- Suporta `<button>` e `<input type="submit">`

**Exemplo de uso:**

```html
<!-- Formulário com spinner automático -->
<form method="post">
    <input type="text" name="nome" required>
    <button type="submit" data-spinner-text="Salvando...">
        Salvar
    </button>
</form>

<!-- Desabilitar spinner em formulário específico -->
<form method="post" data-auto-spinner="off">
    <!-- ... -->
</form>

<!-- Botão sem spinner -->
<button type="submit" data-no-busy>
    Enviar sem spinner
</button>
```

---

## Fluxo de Funcionamento

### 1. Inicialização
1. Arquivo é carregado via `_ScriptsBasePlugins.cshtml`
2. Todos os módulos IIFE executam imediatamente
3. Sistemas registram event listeners globais
4. Funções utilitárias ficam disponíveis globalmente

### 2. Sistema de Spinner
1. Link com `data-ftx-spin` é clicado
2. Mensagem é salva em `sessionStorage`
3. Spinner é exibido imediatamente
4. Navegação ocorre normalmente
5. Próxima página detecta mensagem pendente e reabre spinner

### 3. Sistema de Loading
1. Elemento com `data-ftx-loading` é clicado
2. Handler detecta clique e aplica loading
3. Ícone é substituído por spinner
4. Elemento é desabilitado
5. Após navegação ou timeout, estado é restaurado

### 4. Sistema de Ripple
1. Clique ocorre em elemento correspondente ao seletor
2. Posição do clique é calculada
3. Círculo de ripple é criado e animado
4. Ripple é removido após animação

---

## Troubleshooting

### ❌ Spinner não aparece ao navegar
**Causa:** `sessionStorage` pode estar desabilitado ou bloqueado  
**Solução:** Verificar se navegador permite `sessionStorage` e se não está em modo privado

### ❌ Loading não restaura após operação
**Causa:** Timeout de 30s pode não ser suficiente ou página não navega  
**Solução:** Chamar `FtxLoading.reset(elemento)` manualmente após operação

### ❌ Ripple não funciona em elementos dinâmicos
**Causa:** Elemento foi criado após inicialização do sistema  
**Solução:** Sistema usa delegação, então deve funcionar. Verificar se elemento corresponde ao seletor

### ❌ Formatação de data retorna vazio
**Causa:** Formato de entrada não é suportado ou Moment.js não está carregado  
**Solução:** Verificar formato de entrada e garantir que Moment.js está carregado antes de `frotix.js`

### ❌ Global Busy Submit trava formulário
**Causa:** Validação falha mas spinner foi aplicado  
**Solução:** Sistema valida antes de aplicar spinner, mas se houver erro de validação após submit, restaurar manualmente

---

## Changelog

**08/01/2026** - Versão 2.0 (Padrão FrotiX Simplificado)
- Documentação completa criada
- Todos os sistemas documentados com exemplos
- Troubleshooting adicionado

---

## Referências

- **CSS Complementar:** `wwwroot/css/frotix.css`
- **Moment.js:** Biblioteca externa para formatação de datas
- **Carregamento:** `Pages/Shared/_ScriptsBasePlugins.cshtml`
