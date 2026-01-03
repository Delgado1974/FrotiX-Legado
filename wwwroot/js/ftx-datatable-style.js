/**
 * FrotiX DataTable Header Style
 * Aplica estilo padrão FrotiX aos headers de DataTables
 * - DataTables normais: cor azul padrão #4a6fa5
 * - DataTables dentro de Modais: 20% mais claro que o header do modal
 * Adicionar no _Layout.cshtml APÓS o script do DataTables
 */
(function() {
    'use strict';

    // Cor padrão para DataTables fora de modais
    var corPadrao = '#4a6fa5';

    // Mapeamento de classes de header de modal conhecidas para suas cores base
    // DataTable interno = 20% mais claro que o header do modal
    var coresHeadersModal = {
        'modal-header-dinheiro': '#3d4a3d',      // Verde militar escuro → DataTable: #5A6B5A
        'modal-header-azul': '#325d88',           // Azul padrão FrotiX → DataTable: #4A7BA6
        'modal-header-verde': '#4A803B',          // Verde → DataTable: #6E9962
        'modal-header-vinho': '#6b1f1f',          // Vinho → DataTable: #8F4343
        'modal-header-terracota': '#a0522d',      // Terracota → DataTable: #C47651
        'modal-header-laranja': '#cc5500',        // Laranja → DataTable: #F07924
        'modal-header-roxo': '#6B2FA2',           // Roxo → DataTable: #8F53C6
        'ftx-modal-header': '#2d5a87',            // Azul padrão modal FrotiX
        'ftx-modal-header-azul': '#2d5a87',       // Azul (padrão FrotiX)
        'ftx-modal-header-terracota': '#b45a3c',  // Terracota (padrão FrotiX)
        'ftx-modal-header-verde': '#2e7d32',      // Verde (padrão FrotiX)
        'ftx-modal-header-vinho': '#722f37',      // Vinho (padrão FrotiX)
        'ftx-modal-header-laranja': '#e65100',    // Laranja (padrão FrotiX)
        'ftx-modal-header-roxo': '#5e35b1',       // Roxo (padrão FrotiX)
        'ftx-modal-header-cinza': '#455a64'       // Cinza (padrão FrotiX)
    };

    /**
     * Converte cor RGB para HSL
     */
    function rgbParaHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    /**
     * Converte HSL para cor hexadecimal
     */
    function hslParaHex(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        var r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            var hue2rgb = function(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        var toHex = function(x) {
            var hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return '#' + toHex(r) + toHex(g) + toHex(b);
    }

    /**
     * Clareia uma cor em percentual (0-100)
     */
    function clarearCor(cor, percentual) {
        // Remove # se existir
        cor = cor.replace('#', '');
        
        // Converte hex para RGB
        var r = parseInt(cor.substring(0, 2), 16);
        var g = parseInt(cor.substring(2, 4), 16);
        var b = parseInt(cor.substring(4, 6), 16);
        
        // Converte para HSL
        var hsl = rgbParaHsl(r, g, b);
        
        // Aumenta a luminosidade em percentual (limitado a 100)
        hsl.l = Math.min(100, hsl.l + percentual);
        
        // Retorna em hex
        return hslParaHex(hsl.h, hsl.s, hsl.l);
    }

    /**
     * Encontra o modal pai de um elemento
     */
    function encontrarModalPai(elemento) {
        if (!elemento || !elemento.closest) return null;
        return elemento.closest('.modal');
    }

    /**
     * Encontra o header do modal e retorna sua cor base
     * Usa mapeamento de classes conhecidas
     */
    function obterCorHeaderModal(modal) {
        if (!modal) return null;
        
        // Procura pelo modal-header
        var header = modal.querySelector('.modal-header');
        if (!header) return null;
        
        // Verifica classes conhecidas no mapeamento
        var classes = header.className.split(' ');
        for (var i = 0; i < classes.length; i++) {
            var classe = classes[i].trim();
            if (coresHeadersModal[classe]) {
                return coresHeadersModal[classe];
            }
        }
        
        // Fallback: tenta extrair cor computada
        try {
            var style = window.getComputedStyle(header);
            var bg = style.backgroundColor;
            if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
                var match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (match) {
                    var r = parseInt(match[1]).toString(16).padStart(2, '0');
                    var g = parseInt(match[2]).toString(16).padStart(2, '0');
                    var b = parseInt(match[3]).toString(16).padStart(2, '0');
                    var hex = '#' + r + g + b;
                    if (hex !== '#000000' && hex !== '#ffffff') {
                        return hex;
                    }
                }
            }
        } catch (e) {
            // Ignora erros
        }
        
        return null;
    }

    /**
     * Aplica estilo a um elemento thead ou th
     */
    function aplicarEstilo(el, cor) {
        el.style.setProperty('background', cor, 'important');
        el.style.setProperty('background-color', cor, 'important');
        el.style.setProperty('background-image', 'none', 'important');
        el.style.setProperty('color', '#ffffff', 'important');
        el.style.setProperty('font-family', "'Outfit', sans-serif", 'important');
        el.style.setProperty('font-weight', '600', 'important');
        el.style.setProperty('text-transform', 'uppercase', 'important');
        el.style.setProperty('font-size', '0.82rem', 'important');
        el.style.setProperty('letter-spacing', '0.3px', 'important');
    }

    /**
     * Função principal que aplica o estilo aos headers
     */
    function aplicarEstiloHeader() {
        document.querySelectorAll('thead, thead th').forEach(function(el) {
            // Verifica se está dentro de um modal
            var modal = encontrarModalPai(el);
            
            if (modal) {
                // Está dentro de modal - usa cor 20% mais clara que o header do modal
                var corModal = obterCorHeaderModal(modal);
                
                if (corModal) {
                    var corClara = clarearCor(corModal, 20);
                    aplicarEstilo(el, corClara);
                } else {
                    // Se não encontrou cor do modal, usa padrão
                    aplicarEstilo(el, corPadrao);
                }
            } else {
                // Fora de modal - usa cor padrão azul
                aplicarEstilo(el, corPadrao);
            }
        });
    }

    // Aplicar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', aplicarEstiloHeader);
    } else {
        aplicarEstiloHeader();
    }

    // Aplicar após window load (quando DataTables terminar)
    window.addEventListener('load', function() {
        aplicarEstiloHeader();
        // Aplicar novamente após 500ms (garante que DataTables terminou)
        setTimeout(aplicarEstiloHeader, 500);
    });

    // Observer para detectar quando DataTables adiciona elementos
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                aplicarEstiloHeader();
            }
        });
    });

    // Observar mudanças no body
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    // Expor funções globalmente para uso manual se necessário
    window.ftxAplicarEstiloDataTable = aplicarEstiloHeader;
    window.ftxClarearCor = clarearCor;
    window.ftxCoresHeadersModal = coresHeadersModal; // Permite adicionar novas cores em runtime
})();
