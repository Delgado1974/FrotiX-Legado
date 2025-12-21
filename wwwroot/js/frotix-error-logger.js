/**
 * FrotiX Error Logger - Sistema de captura de erros JavaScript
 * Captura erros globais, Promise rejections e erros em funções
 * Envia automaticamente para a API de log do servidor
 * 
 * @version 1.0.0
 * @author FrotiX Team
 */

window.FrotiXErrorLogger = (function () {
    'use strict';

    // ========== CONFIGURAÇÃO ==========
    const CONFIG = {
        apiEndpoint: '/api/LogErros/LogJavaScript',
        maxStackLines: 15,
        debounceTime: 100, // ms entre logs iguais
        enabled: true
    };

    // Cache para evitar logs duplicados
    const recentErrors = new Map();

    // ========== FUNÇÕES AUXILIARES ==========

    /**
     * Extrai informações do stack trace
     */
    function parseStackTrace(stack) {
        if (!stack) return { arquivo: null, linha: null, coluna: null, funcao: null };

        try {
            // Padrões de stack trace
            const patterns = [
                // Chrome/Edge: "at functionName (http://...file.js:10:20)"
                /at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/,
                // Chrome/Edge sem nome de função: "at http://...file.js:10:20"
                /at\s+(.+?):(\d+):(\d+)/,
                // Firefox: "functionName@http://...file.js:10:20"
                /(.+?)@(.+?):(\d+):(\d+)/,
                // Safari: "functionName@http://...file.js:10:20"
                /(\w+)@(.+):(\d+):(\d+)/
            ];

            const lines = stack.split('\n');

            for (const line of lines) {
                for (const pattern of patterns) {
                    const match = line.match(pattern);
                    if (match) {
                        if (match.length === 5) {
                            // Com nome de função
                            return {
                                funcao: match[1].trim(),
                                arquivo: extractFileName(match[2]),
                                linha: parseInt(match[3], 10),
                                coluna: parseInt(match[4], 10)
                            };
                        } else if (match.length === 4) {
                            // Sem nome de função
                            return {
                                funcao: null,
                                arquivo: extractFileName(match[1]),
                                linha: parseInt(match[2], 10),
                                coluna: parseInt(match[3], 10)
                            };
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('FrotiXErrorLogger: Erro ao parsear stack trace', e);
        }

        return { arquivo: null, linha: null, coluna: null, funcao: null };
    }

    /**
     * Extrai nome do arquivo de uma URL completa
     */
    function extractFileName(url) {
        if (!url) return null;
        try {
            // Remove query string
            const cleanUrl = url.split('?')[0];
            // Pega última parte do path
            const parts = cleanUrl.split('/');
            return parts[parts.length - 1] || cleanUrl;
        } catch {
            return url;
        }
    }

    /**
     * Verifica se é erro duplicado recente
     */
    function isDuplicateError(errorKey) {
        const now = Date.now();
        const lastTime = recentErrors.get(errorKey);

        if (lastTime && (now - lastTime) < CONFIG.debounceTime) {
            return true;
        }

        recentErrors.set(errorKey, now);

        // Limpa cache antigo
        if (recentErrors.size > 100) {
            const oldEntries = Array.from(recentErrors.entries())
                .filter(([, time]) => (now - time) > 5000);
            oldEntries.forEach(([key]) => recentErrors.delete(key));
        }

        return false;
    }

    /**
     * Envia erro para o servidor
     */
    async function sendErrorToServer(errorData) {
        if (!CONFIG.enabled) return;

        const errorKey = `${errorData.mensagem}-${errorData.arquivo}-${errorData.linha}`;
        if (isDuplicateError(errorKey)) return;

        try {
            const response = await fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(errorData)
            });

            if (!response.ok) {
                console.warn('FrotiXErrorLogger: Falha ao enviar erro para servidor', response.status);
            }
        } catch (e) {
            // Não loga erro de rede para evitar loop infinito
            console.warn('FrotiXErrorLogger: Erro de rede ao enviar log', e.message);
        }
    }

    // ========== HANDLERS DE ERRO GLOBAL ==========

    /**
     * Handler para window.onerror (erros de script)
     */
    function globalErrorHandler(message, source, lineno, colno, error) {
        const stackInfo = error ? parseStackTrace(error.stack) : {};

        const errorData = {
            mensagem: message || 'Erro JavaScript desconhecido',
            arquivo: extractFileName(source) || stackInfo.arquivo,
            metodo: stackInfo.funcao,
            linha: lineno || stackInfo.linha,
            coluna: colno || stackInfo.coluna,
            stack: error?.stack || null,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        sendErrorToServer(errorData);

        // Não impede propagação do erro
        return false;
    }

    /**
     * Handler para Promise rejections não tratadas
     */
    function unhandledRejectionHandler(event) {
        const error = event.reason;
        const stackInfo = error instanceof Error ? parseStackTrace(error.stack) : {};

        const errorData = {
            mensagem: error instanceof Error ? error.message : String(error),
            arquivo: stackInfo.arquivo || 'Promise',
            metodo: stackInfo.funcao || 'unhandledRejection',
            linha: stackInfo.linha,
            coluna: stackInfo.coluna,
            stack: error instanceof Error ? error.stack : null,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        sendErrorToServer(errorData);
    }

    // ========== API PÚBLICA ==========

    /**
     * Wrapper para tratamento de erros em funções
     * Uso: FrotiXErrorLogger.TratamentoErroComLinha('Classe', 'metodo', erro)
     */
    function TratamentoErroComLinha(classe, metodo, erro) {
        const stackInfo = erro instanceof Error ? parseStackTrace(erro.stack) : {};

        const errorData = {
            mensagem: erro instanceof Error ? erro.message : String(erro),
            arquivo: stackInfo.arquivo || classe,
            metodo: metodo || stackInfo.funcao,
            linha: stackInfo.linha,
            coluna: stackInfo.coluna,
            stack: erro instanceof Error ? erro.stack : null,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        sendErrorToServer(errorData);

        // Exibe alerta visual se disponível
        if (window.Alerta && window.Alerta.TratamentoErroComLinha) {
            window.Alerta.TratamentoErroComLinha(classe, metodo, erro);
        } else if (window.SweetAlertInterop && window.SweetAlertInterop.ShowErrorUnexpected) {
            window.SweetAlertInterop.ShowErrorUnexpected(classe, metodo, erro);
        } else {
            console.error(`[FrotiX Error] ${classe}.${metodo}:`, erro);
        }
    }

    /**
     * Log manual de erro
     */
    function logError(message, arquivo, metodo, details) {
        const errorData = {
            mensagem: message,
            arquivo: arquivo || extractFileName(window.location.pathname),
            metodo: metodo,
            linha: null,
            coluna: null,
            stack: details?.stack || null,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        sendErrorToServer(errorData);
    }

    /**
     * Log de warning
     */
    function logWarning(message, arquivo, metodo) {
        console.warn(`[FrotiX Warning] ${arquivo || ''}.${metodo || ''}: ${message}`);
        // Warnings não são enviados ao servidor por padrão
    }

    /**
     * Wrapper para try-catch em funções async
     * Uso: await FrotiXErrorLogger.safeAsync(async () => { ... }, 'Classe', 'metodo')
     */
    async function safeAsync(fn, classe, metodo) {
        try {
            return await fn();
        } catch (erro) {
            TratamentoErroComLinha(classe, metodo, erro);
            throw erro; // Re-lança para manter comportamento esperado
        }
    }

    /**
     * Wrapper para try-catch em funções síncronas
     * Uso: FrotiXErrorLogger.safeSync(() => { ... }, 'Classe', 'metodo')
     */
    function safeSync(fn, classe, metodo) {
        try {
            return fn();
        } catch (erro) {
            TratamentoErroComLinha(classe, metodo, erro);
            throw erro;
        }
    }

    /**
     * Habilita/desabilita o logger
     */
    function setEnabled(enabled) {
        CONFIG.enabled = enabled;
    }

    /**
     * Configura endpoint da API
     */
    function setApiEndpoint(endpoint) {
        CONFIG.apiEndpoint = endpoint;
    }

    // ========== INICIALIZAÇÃO ==========

    function init() {
        // Registra handlers globais
        window.onerror = globalErrorHandler;
        window.addEventListener('unhandledrejection', unhandledRejectionHandler);

        console.log('[FrotiXErrorLogger] Inicializado com sucesso');
    }

    // Inicializa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ========== EXPÕE API PÚBLICA ==========

    return {
        TratamentoErroComLinha,
        logError,
        logWarning,
        safeAsync,
        safeSync,
        setEnabled,
        setApiEndpoint
    };

})();

// ========== ALIAS GLOBAL PARA COMPATIBILIDADE ==========

// Mantém compatibilidade com o padrão existente no FrotiX
window.Alerta = window.Alerta || {};
window.Alerta.TratamentoErroComLinha = window.Alerta.TratamentoErroComLinha || function (classe, metodo, erro) {
    FrotiXErrorLogger.TratamentoErroComLinha(classe, metodo, erro);

    // Se SweetAlert2 estiver disponível, mostra modal de erro
    if (typeof Swal !== 'undefined') {
        const stackInfo = erro instanceof Error && erro.stack ?
            erro.stack.split('\n').slice(0, 5).join('<br>') : '';

        Swal.fire({
            icon: 'error',
            title: 'Erro Sem Tratamento',
            html: `
                <div style="text-align: left; font-size: 14px;">
                    <p><b>📚 Classe:</b> ${classe}</p>
                    <p><b>🖋️ Método:</b> ${metodo}</p>
                    <p><b>❌ Erro:</b> ${erro?.message || erro}</p>
                    ${stackInfo ? `<details><summary>Stack Trace</summary><pre style="font-size: 11px; overflow-x: auto;">${stackInfo}</pre></details>` : ''}
                </div>
            `,
            confirmButtonText: 'OK',
            confirmButtonColor: '#dc3545'
        });
    } else {
        // Fallback para alert nativo
        alert(`Erro em ${classe}.${metodo}: ${erro?.message || erro}`);
    }
};

// Função global para uso em try-catch
function TratamentoErroComLinha(classe, metodo, erro) {
    window.Alerta.TratamentoErroComLinha(classe, metodo, erro);
}
