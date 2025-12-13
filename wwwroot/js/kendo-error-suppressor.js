// ====================================================================
// SUPRESSOR DE ERRO: Kendo "collapsible"
// ====================================================================
// IMPORTANTE: Incluir ANTES de todos os outros scripts
// ====================================================================

(function() {
    'use strict';
    
    // Guardar funções originais
    const originalError = console.error;
    const originalOnError = window.onerror;
    
    // Sobrescrever console.error
    console.error = function(...args) {
        const msg = args.join(' ').toLowerCase();
        
        // Bloquear erros específicos do Kendo
        if (msg.includes('collapsible') || 
            (msg.includes('cannot read properties of undefined') && msg.includes('toggle'))) {
            console.warn('[SUPRIMIDO] Erro do Kendo ignorado:', ...args);
            return;
        }
        
        // Chamar original para outros erros
        originalError.apply(console, args);
    };
    
    // Sobrescrever window.onerror
    window.onerror = function(message, source, lineno, colno, error) {
        const msg = (message || '').toString().toLowerCase();
        const src = (source || '').toString().toLowerCase();
        
        // Bloquear erros do Kendo
        if (msg.includes('collapsible') || 
            (msg.includes('cannot read properties of undefined') && src.includes('kendo'))) {
            console.warn('[SUPRIMIDO] Erro global do Kendo ignorado:', message);
            return true; // Previne propagação
        }
        
        // Chamar handler original
        if (originalOnError) {
            return originalOnError.apply(this, arguments);
        }
        
        return false;
    };
    
    console.log('[SUPRESSOR] ✅ Ativo - erros do Kendo serão suprimidos');
})();
