// ================================
// Arquivo: error_handler.js
// Sistema Unificado de Tratamento de Erros
// Integra com SweetAlertInterop + Alerta.js
// VERSÃO: Sem handler global de AJAX (tratamento manual)
// ================================

(function initErrorHandler() 
{
    'use strict';

    /**
     * ErrorHandler Central - Unifica todos os tratamentos de erro
     * Integra com o sistema existente de Alerta.TratamentoErroComLinha
     */
    const ErrorHandler = {
        /**
         * Contexto adicional para enriquecer o erro
         */
        contextoAtual: {},

        /**
         * Handler central que enriquece e envia para Alerta.TratamentoErroComLinha
         * param {string} origem - Origem do erro (global, ajax, promise, etc)
         * param {Error|Object} error - Objeto de erro
         * param {Object} contexto - Contexto adicional
         */
        capturar: function (origem, error, contexto = {}) 
        {
            try 
            {
                console.group(`🔴 [ErrorHandler] Erro capturado - Origem: ${origem}`);

                // Construir informações detalhadas do erro
                const errorInfo = {
                    origem: origem,
                    mensagem: error.message || error.reason || error.erro || 'Erro desconhecido',
                    stack: error.stack || '',
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    contexto: { ...this.contextoAtual, ...contexto }
                };

                // Adicionar propriedades específicas do tipo de origem
                if (origem === 'ajax' && contexto.url) 
                {
                    errorInfo.tipoRequisicao = contexto.method || 'GET';
                    errorInfo.urlRequisicao = contexto.url;
                    errorInfo.statusCode = contexto.status;
                }

                // Logar informações completas no console
                console.log('📍 Detalhes do erro:', errorInfo);
                console.groupEnd();

                // Determinar o arquivo e função de origem
                let arquivo = this.extrairArquivo(error, contexto);
                let funcao = this.extrairFuncao(error, origem);

                // Criar objeto de erro enriquecido para Alerta.TratamentoErroComLinha
                const errorEnriquecido = this.criarErroEnriquecido(error, errorInfo, contexto);

                // Enviar para o sistema Alerta.TratamentoErroComLinha
                if (typeof Alerta !== 'undefined' && Alerta.TratamentoErroComLinha) 
                {
                    console.log('📤 Enviando para Alerta.TratamentoErroComLinha');
                    Alerta.TratamentoErroComLinha(arquivo, funcao, errorEnriquecido);
                }
                else 
                {
                    console.error('❌ Alerta.TratamentoErroComLinha não disponível!');
                }

                // Registrar métrica
                this.registrarMetrica(origem, errorInfo);
            }
            catch (err) 
            {
                // Fallback caso o handler falhe
                console.error('❌ ERRO CRÍTICO no ErrorHandler:', err);
                console.error('Erro original:', error);
            }
        },

        /**
         * Cria objeto de erro enriquecido mantendo todas as propriedades
         */
        criarErroEnriquecido: function (error, errorInfo, contexto) 
        {
            // Base do erro
            let errorEnriquecido;

            if (error instanceof Error) 
            {
                errorEnriquecido = error;
            }
            else if (typeof error === 'object' && error !== null) 
            {
                errorEnriquecido = new Error(errorInfo.mensagem);
                // Copiar todas as propriedades do erro original
                Object.assign(errorEnriquecido, error);
            }
            else 
            {
                errorEnriquecido = new Error(String(error));
            }

            // Enriquecer com contexto
            errorEnriquecido.contexto = errorInfo.contexto;
            errorEnriquecido.origem = errorInfo.origem;
            errorEnriquecido.timestamp = errorInfo.timestamp;

            // Adicionar detalhes específicos de AJAX
            if (contexto.url) 
            {
                errorEnriquecido.detalhes = errorEnriquecido.detalhes || {};
                errorEnriquecido.detalhes.url = contexto.url;
                errorEnriquecido.detalhes.method = contexto.method;
                errorEnriquecido.detalhes.status = contexto.status;
                errorEnriquecido.detalhes.statusText = contexto.statusText;
                errorEnriquecido.detalhes.responseText = contexto.responseText;
                errorEnriquecido.detalhes.serverMessage = contexto.serverMessage;
            }

            // Preservar stack
            if (!errorEnriquecido.stack && error.stack) 
            {
                errorEnriquecido.stack = error.stack;
            }

            return errorEnriquecido;
        },

        /**
         * Extrai arquivo do erro ou contexto
         */
        extrairArquivo: function (error, contexto) 
        {
            // Prioridade 1: Arquivo do contexto
            if (contexto.filename) return contexto.filename;

            // Prioridade 2: Arquivo do erro
            if (error.fileName) return error.fileName;
            if (error.arquivo) return error.arquivo;
            if (error.detalhes?.arquivo) return error.detalhes.arquivo;

            // Prioridade 3: Extrair do stack
            if (error.stack) 
            {
                const match = error.stack.match(/(?:https?:)?\/\/[^\/]+\/(?:.*\/)?([\w\-_.]+\.(?:js|ts|jsx|tsx))/);
                if (match) return match[1];
            }

            return 'agendamento_viagem.js';
        },

        /**
         * Extrai função do erro
         */
        extrairFuncao: function (error, origem) 
        {
            // Tentar extrair do stack
            if (error.stack) 
            {
                const lines = error.stack.split('\n');
                if (lines.length > 1) 
                {
                    const match = lines[1].match(/at\s+(\w+)/);
                    if (match) return match[1];
                }
            }

            return origem;
        },

        /**
         * Registra métrica de erro (para análise futura)
         */
        registrarMetrica: function (origem, errorInfo) 
        {
            try 
            {
                // Salvar no localStorage para análise
                if (window.DEBUG_MODE && localStorage) 
                {
                    const erros = JSON.parse(localStorage.getItem('erros_log') || '[]');
                    erros.push({
                        origem,
                        info: errorInfo,
                        timestamp: Date.now()
                    });

                    // Manter apenas os últimos 50 erros
                    if (erros.length > 50) erros.shift();

                    localStorage.setItem('erros_log', JSON.stringify(erros));
                }
            }
            catch (error) 
            {
                // Falha silenciosa
            }
        },

        /**
         * Define contexto atual
         */
        setContexto: function (contexto) 
        {
            this.contextoAtual = { ...this.contextoAtual, ...contexto };
        },

        /**
         * Limpa contexto
         */
        limparContexto: function () 
        {
            this.contextoAtual = {};
        },

        /**
         * Obtém log de erros
         */
        obterLog: function () 
        {
            try 
            {
                return JSON.parse(localStorage.getItem('erros_log') || '[]');
            }
            catch (error) 
            {
                return [];
            }
        },

        /**
         * Limpa log de erros
         */
        limparLog: function () 
        {
            try 
            {
                localStorage.removeItem('erros_log');
                console.log('✅ Log de erros limpo');
            }
            catch (error) 
            {
                // Falha silenciosa
            }
        }
    };

    // ============================================================================
    // HANDLERS GLOBAIS INTEGRADOS
    // ============================================================================

    /**
     * Handler de erros JavaScript globais
     */
    window.addEventListener('error', function (event) 
    {
        try 
        {
            // Prevenir que erros de terceiros quebrem a aplicação
            if (event.filename && !event.filename.includes('agendamento_viagem.js')) 
            {
                console.warn('⚠️ Erro de biblioteca externa:', event.message);
                return;
            }

            // Construir contexto do erro
            const contexto = {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                tipo: 'JavaScript Error'
            };

            // Enviar para o handler central
            ErrorHandler.capturar('global', event.error || new Error(event.message), contexto);
        }
        catch (error) 
        {
            console.error('Erro no handler global de erros:', error);
        }
    });

    /**
     * Handler de Promises não capturadas
     */
    window.addEventListener('unhandledrejection', function (event) 
    {
        try 
        {
            // Prevenir que o erro seja jogado no console
            event.preventDefault();

            // Construir contexto
            const contexto = {
                promise: event.promise,
                tipo: 'Unhandled Promise Rejection'
            };

            // Criar objeto de erro
            const error = event.reason instanceof Error
                ? event.reason
                : new Error(String(event.reason));

            // Enviar para o handler central
            ErrorHandler.capturar('promise', error, contexto);
        }
        catch (error) 
        {
            console.error('Erro no handler de unhandledrejection:', error);
        }
    });

    // ============================================================================
    // ❌ HANDLER GLOBAL DE AJAX REMOVIDO
    // ============================================================================
    // 
    // O tratamento de erros AJAX é feito manualmente em cada $.ajax()
    // usando o helper criarErroAjax() disponível em alerta.js
    //
    // Padrío de uso:
    // $.ajax({
    //     error: function (jqXHR, textStatus, errorThrown) {
    //         const erro = criarErroAjax(jqXHR, textStatus, errorThrown, this);
    //         Alerta.TratamentoErroComLinha("arquivo.js", "funcao", erro);
    //     }
    // });
    //
    // ============================================================================

    // ============================================================================
    // EXPOSIÇÃO GLOBAL
    // ============================================================================

    // Tornar ErrorHandler disponível globalmente
    window.ErrorHandler = ErrorHandler;

    // Adicionar ao namespace AgendamentoViagens se existir
    if (window.AgendamentoViagens) 
    {
        window.AgendamentoViagens.errorHandler = ErrorHandler;
    }

    // ============================================================================
    // LOG DE INICIALIZAÇÃO
    // ============================================================================

    console.log('%c🛡️ ErrorHandler Unificado Inicializado',
        'background: #dc3545; color: white; font-weight: bold; padding: 5px;');

    console.log('%c📡 AJAX: Tratamento manual com criarErroAjax()',
        'background: #007bff; color: white; padding: 3px;');

    if (window.DEBUG_MODE) 
    {
        console.log('📊 Para ver log de erros: ErrorHandler.obterLog()');
        console.log('🧹 Para limpar log: ErrorHandler.limparLog()');
    }

})();
