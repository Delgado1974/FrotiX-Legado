/*
    ═══════════════════════════════════════════════════════════════════════════════
    📄 DOCUMENTAÇÃO COMPLETA DISPONÍVEL
    ═══════════════════════════════════════════════════════════════════════════════
    
    📍 Localização: Documentacao/JavaScript/alerta.js.md
    📅 Última Atualização: 08/01/2026
    📋 Versão: 2.0 (Padrão FrotiX Simplificado)
    
    Este arquivo fornece uma interface simplificada para exibir alertas, confirmações
    e tratamento de erros em todo o sistema FrotiX. Para entender completamente a
    funcionalidade, consulte a documentação acima.
    ═══════════════════════════════════════════════════════════════════════════════
*/

// ================================
// Arquivo: alerta.js
// Wrapper utilitário para SweetAlertInterop
// VERSÃO CORRIGIDA - NOVA ESTRUTURA DE ERRO
// Integrado com ErrorHandler Unificado
// ================================

(function initAlerta()
{
    window.Alerta = window.Alerta || {};

    function callIf(fn, ...args)
    {
        try { if (typeof fn === "function") return fn(...args); }
        catch (e) { console.error("[Alerta] erro ao chamar função:", e); }
    }

    // ---- Feedbacks básicos ----
    window.Alerta.Erro = window.Alerta.Erro || function (titulo, texto, confirm = "OK")
    {
        if (window.SweetAlertInterop?.ShowError)
        {
            return SweetAlertInterop.ShowError(titulo, texto, confirm);
        }
        console.error("SweetAlertInterop.ShowError não está disponível.", titulo, texto);
        return Promise.resolve();
    };

    window.Alerta.Sucesso = window.Alerta.Sucesso || function (titulo, texto, confirm = "OK")
    {
        if (window.SweetAlertInterop?.ShowSuccess)
        {
            return SweetAlertInterop.ShowSuccess(titulo, texto, confirm);
        }
        console.error("SweetAlertInterop.ShowSuccess não está disponível.");
        return Promise.resolve();
    };

    window.Alerta.Info = window.Alerta.Info || function (titulo, texto, confirm = "OK")
    {
        if (window.SweetAlertInterop?.ShowInfo)
        {
            return SweetAlertInterop.ShowInfo(titulo, texto, confirm);
        }
        console.error("SweetAlertInterop.ShowInfo não está disponível.");
        return Promise.resolve();
    };

    window.Alerta.Warning = window.Alerta.Warning || function (titulo, texto, confirm = "OK")
    {
        if (window.SweetAlertInterop?.ShowWarning)
        {
            return SweetAlertInterop.ShowWarning(titulo, texto, confirm);
        }
        console.error("SweetAlertInterop.ShowWarning não está disponível.");
        return Promise.resolve();
    };

    window.Alerta.Alerta = window.Alerta.Alerta || function (titulo, texto, confirm = "OK")
    {
        return callIf(window.Alerta.Warning, titulo, texto, confirm);
    };

    window.Alerta.Confirmar = window.Alerta.Confirmar || function (titulo, texto, confirm = "Sim", cancel = "Cancelar")
    {
        if (window.SweetAlertInterop?.ShowConfirm)
        {
            return SweetAlertInterop.ShowConfirm(titulo, texto, confirm, cancel);
        }
        console.error("SweetAlertInterop.ShowConfirm não está disponível.");
        return Promise.resolve(false);
    };

    window.Alerta.Confirmar3 = window.Alerta.Confirmar3 || function (titulo, texto, buttonTodos = "Todos", buttonAtual = "Atual", buttonCancel = "Cancelar")
    {
        if (window.SweetAlertInterop?.ShowConfirm3)
        {
            return SweetAlertInterop.ShowConfirm3(titulo, texto, buttonTodos, buttonAtual, buttonCancel);
        }
        console.error("SweetAlertInterop.ShowConfirm3 não está disponível.");
        return Promise.resolve(false);
    };

    // ===== VALIDAÇÃO IA - Alerta para análises inteligentes baseadas em estatísticas =====

    /**
     * Alerta de confirmação da validação IA (com análise estatística)
     * Usa o bonequinho padrão + badge de IA
     * IMPORTANTE: Use apenas para análises complexas com Z-Score e histórico do veículo.
     *             Para erros simples (data futura, km final < inicial), use Alerta.Erro
     * @param {string} titulo - Título do alerta
     * @param {string} mensagem - Mensagem com análise detalhada (suporta HTML e \n)
     * @param {string} confirm - Texto do botão de confirmação
     * @param {string} cancel - Texto do botão de cancelamento
     * @returns {Promise<boolean>} true se confirmou, false se cancelou
     */
    window.Alerta.ValidacaoIAConfirmar = window.Alerta.ValidacaoIAConfirmar || function (titulo, mensagem, confirm = "Confirmar", cancel = "Corrigir")
    {
        if (window.SweetAlertInterop?.ShowValidacaoIAConfirmar)
        {
            return SweetAlertInterop.ShowValidacaoIAConfirmar(titulo, mensagem, confirm, cancel);
        }
        // Fallback para confirmação padrão
        console.warn("SweetAlertInterop.ShowValidacaoIAConfirmar não disponível, usando fallback.");
        return window.Alerta.Confirmar(titulo, mensagem, confirm, cancel);
    };

    // ===== FUNÇÃO MELHORADA: Tratamento de Erros =====
    function _TratamentoErroComLinha(classeOuArquivo, metodo, erro)
    {
        console.log('=== TratamentoErroComLinha INICIADO ===');
        console.log('Classe/Arquivo:', classeOuArquivo);
        console.log('Método:', metodo);
        console.log('Erro recebido:', erro);
        console.log('Tipo do erro:', typeof erro);
        console.log('É Error?', erro instanceof Error);
        console.log('Nome do erro:', erro?.name);
        console.log('Construtor:', erro?.constructor?.name);

        // Log todas as propriedades do erro
        if (erro && typeof erro === 'object')
        {
            console.log('Propriedades do erro:', Object.keys(erro));
            try
            {
                console.log('Erro completo JSON:', JSON.stringify(erro, Object.getOwnPropertyNames(erro), 2));
            } catch (e)
            {
                console.log('Não foi possível serializar o erro');
            }
        }

        // Verificar se SweetAlertInterop está disponível
        if (!window.SweetAlertInterop?.ShowErrorUnexpected)
        {
            console.error("SweetAlertInterop.ShowErrorUnexpected não está disponível!");
            console.error("Erro:", classeOuArquivo, metodo, erro);
            return Promise.resolve();
        }

        // ===== FUNÇÃO AUXILIAR: EXTRAIR MENSAGEM =====
        function extrairMensagem(erro)
        {
            // Tentar propriedades comuns primeiro
            const propriedadesMsg = [
                'erro', 'message', 'mensagem', 'msg', 'error',
                'errorMessage', 'description', 'statusText', 'detail'
            ];

            for (const prop of propriedadesMsg)
            {
                if (erro[prop] && typeof erro[prop] === 'string' && erro[prop].trim())
                {
                    console.log(`✓ Mensagem encontrada em '${prop}':`, erro[prop]);
                    return erro[prop];
                }
            }

            // Se não encontrou, tentar toString() do erro
            if (erro.toString && typeof erro.toString === 'function')
            {
                const strErro = erro.toString();
                if (strErro && strErro !== '[object Object]')
                {
                    console.log('✓ Mensagem extraída via toString():', strErro);
                    return strErro;
                }
            }

            // Última tentativa: serializar o objeto
            try
            {
                const serializado = JSON.stringify(erro, null, 2);
                if (serializado && serializado !== '{}' && serializado !== 'null')
                {
                    console.log('✓ Mensagem serializada:', serializado);
                    return `Erro: ${serializado}`;
                }
            } catch (e)
            {
                console.error('Erro ao serializar:', e);
            }

            return 'Erro sem mensagem específica';
        }

        // ===== PREPARAR OBJETO DE ERRO =====
        let erroObj;

        if (typeof erro === 'string')
        {
            // String simples
            const tempError = new Error(erro);
            erroObj = {
                message: erro,
                erro: erro,
                stack: tempError.stack,
                name: 'Error'
            };
            console.log('✓ Erro string convertido para objeto');
        }
        else if (erro instanceof Error || erro?.constructor?.name === 'Error' ||
            erro?.constructor?.name?.endsWith('Error')) // SyntaxError, TypeError, etc
        {
            // Error nativo ou derivado
            const mensagem = erro.message || extrairMensagem(erro);

            erroObj = {
                message: mensagem,
                erro: mensagem,
                stack: erro.stack || new Error(mensagem).stack,
                name: erro.name || 'Error',
                // Preservar propriedades específicas de erro
                ...(erro.fileName && { arquivo: erro.fileName }),
                ...(erro.lineNumber && { linha: erro.lineNumber }),
                ...(erro.columnNumber && { coluna: erro.columnNumber })
            };
            console.log('✓ Erro Error object processado, mensagem:', mensagem);
        }
        else if (typeof erro === 'object' && erro !== null)
        {
            // Objeto genérico
            const mensagemExtraida = extrairMensagem(erro);

            erroObj = {
                message: mensagemExtraida,
                erro: mensagemExtraida,
                stack: erro.stack || new Error(mensagemExtraida).stack,
                name: erro.name || 'Error',
                // Preservar TODAS as propriedades originais
                ...erro
            };

            console.log('✓ Erro object processado, mensagem extraída:', mensagemExtraida);
        }
        else
        {
            // Fallback para outros tipos
            const errorStr = String(erro || 'Erro desconhecido');
            const tempError = new Error(errorStr);
            erroObj = {
                message: errorStr,
                erro: errorStr,
                stack: tempError.stack,
                name: 'Error'
            };
            console.log('✓ Erro fallback criado');
        }

        // Log final para debug
        console.log('📦 Objeto de erro final que será enviado:');
        console.log('  - message:', erroObj.message);
        console.log('  - erro:', erroObj.erro);
        console.log('  - name:', erroObj.name);
        console.log('  - stack presente?', !!erroObj.stack);
        console.log('  - Objeto completo:', erroObj);
        console.log('=== TratamentoErroComLinha ENVIANDO ===');

        return SweetAlertInterop.ShowErrorUnexpected(classeOuArquivo, metodo, erroObj);
    }

    // Exportar a função
    window.Alerta.TratamentoErroComLinha = window.Alerta.TratamentoErroComLinha || _TratamentoErroComLinha;
    window.TratamentoErroComLinha = window.TratamentoErroComLinha || _TratamentoErroComLinha;

    console.log('[Alerta] Módulo inicializado com sucesso');
})();

// ============================================================================
// HELPER PARA ERROS AJAX
// ============================================================================

/**
 * Converte erro AJAX para objeto compatível com TratamentoErroComLinha
 * param {Object} jqXHR - Objeto jQuery XHR
 * param {string} textStatus - Status do erro
 * param {string} errorThrown - Exceção lançada
 * param {Object} ajaxSettings - Configurações do AJAX (use 'this' no callback)
 * returns {Object} Objeto de erro enriquecido
 * 
 * @example
 * $.ajax({
 *     url: "/api/endpoint",
 *     error: function(jqXHR, textStatus, errorThrown) {
 *         const erro = criarErroAjax(jqXHR, textStatus, errorThrown, this);
 *         Alerta.TratamentoErroComLinha("meuArquivo.js", "minhaFuncao", erro);
 *     }
 * });
 */
window.criarErroAjax = function (jqXHR, textStatus, errorThrown, ajaxSettings = {}) 
{
    const erro = {
        message: errorThrown || textStatus || "Erro na requisição AJAX",
        erro: errorThrown || textStatus || "Erro na requisição",
        status: jqXHR.status,
        statusText: jqXHR.statusText,
        responseText: jqXHR.responseText,
        url: ajaxSettings.url || "URL não disponível",
        method: ajaxSettings.type || "GET",
        textStatus: textStatus,
        readyState: jqXHR.readyState,
        tipoErro: 'AJAX'
    };

    // Tentar obter headers
    try 
    {
        erro.headers = jqXHR.getAllResponseHeaders();
    }
    catch (e) 
    {
        // Headers não disponíveis
    }

    // Tentar extrair mensagem do servidor
    try 
    {
        const responseJson = JSON.parse(jqXHR.responseText);
        erro.serverMessage = responseJson.message || responseJson.error || responseJson.Message;
        erro.responseJson = responseJson;

        // Se o servidor enviou uma mensagem, usar ela como principal
        if (erro.serverMessage) 
        {
            erro.message = erro.serverMessage;
            erro.erro = erro.serverMessage;
        }
    }
    catch (e) 
    {
        // Resposta não é JSON - tentar extrair HTML ou texto
        if (jqXHR.responseText && jqXHR.responseText.length > 0) 
        {
            // Se for HTML, extrair apenas texto
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = jqXHR.responseText;
            const textoExtraido = tempDiv.textContent || tempDiv.innerText || "";

            // Limitar tamanho para não poluir o erro (primeiros 500 caracteres)
            if (textoExtraido.trim()) 
            {
                erro.serverMessage = textoExtraido.substring(0, 500);
            }
        }
    }

    // Criar stack trace sintético
    erro.stack = new Error(erro.message).stack;

    // Adicionar informações de timeout se aplicável
    if (textStatus === 'timeout') 
    {
        erro.message = `Timeout: A requisição para ${erro.url} demorou muito para responder`;
        erro.erro = erro.message;
    }

    // Adicionar informações de abort se aplicável
    if (textStatus === 'abort') 
    {
        erro.message = `Abort: A requisição para ${erro.url} foi cancelada`;
        erro.erro = erro.message;
    }

    // Mensagens amigáveis por código HTTP
    if (!erro.serverMessage) 
    {
        const mensagensPorStatus = {
            0: 'Sem conexão com o servidor',
            400: 'Requisição inválida',
            401: 'Não autorizado - faça login novamente',
            403: 'Acesso negado',
            404: 'Recurso não encontrado',
            408: 'Tempo de requisição esgotado',
            500: 'Erro interno do servidor',
            502: 'Gateway inválido',
            503: 'Serviço temporariamente indisponível',
            504: 'Gateway timeout'
        };

        const mensagemAmigavel = mensagensPorStatus[erro.status];
        if (mensagemAmigavel) 
        {
            erro.mensagemAmigavel = mensagemAmigavel;
        }
    }

    console.log('📡 [criarErroAjax] Erro AJAX enriquecido:', erro);

    return erro;
};

// ============================================================================
// INTEGRAÇÃO COM ERRORHANDLER
// ============================================================================

/**
 * Integração com ErrorHandler Unificado
 * Aguarda ErrorHandler estar disponível e cria funções de conveniência
 */
(function integrarErrorHandler() 
{
    let tentativas = 0;
    const maxTentativas = 50; // 5 segundos (50 x 100ms)

    function tentarIntegrar() 
    {
        tentativas++;

        if (typeof ErrorHandler !== 'undefined') 
        {
            console.log('✅ [Alerta] Integrado com ErrorHandler');

            // Expor criarErroAjax também no namespace Alerta
            window.Alerta.criarErroAjax = window.criarErroAjax;

            // Criar função de conveniência para contexto adicional
            window.Alerta.TratamentoErroComLinhaEnriquecido = function (arquivo, funcao, erro, contextoAdicional = {}) 
            {
                // Se vier com contexto adicional, enriquecer o erro
                if (contextoAdicional && Object.keys(contextoAdicional).length > 0) 
                {
                    // Se erro for objeto, adicionar contexto
                    if (typeof erro === 'object' && erro !== null) 
                    {
                        erro.contextoManual = contextoAdicional;
                    }
                    else 
                    {
                        // Se for string ou primitivo, criar objeto
                        const mensagem = String(erro);
                        erro = {
                            message: mensagem,
                            erro: mensagem,
                            contextoManual: contextoAdicional,
                            stack: new Error(mensagem).stack
                        };
                    }
                }

                // Chamar o tratamento original
                return window.Alerta.TratamentoErroComLinha(arquivo, funcao, erro);
            };

            // Expor função para definir contexto global
            window.Alerta.setContextoGlobal = function (contexto) 
            {
                if (ErrorHandler && ErrorHandler.setContexto) 
                {
                    ErrorHandler.setContexto(contexto);
                }
            };

            // Expor função para limpar contexto global
            window.Alerta.limparContextoGlobal = function () 
            {
                if (ErrorHandler && ErrorHandler.limparContexto) 
                {
                    ErrorHandler.limparContexto();
                }
            };

            // Expor função para obter log de erros
            window.Alerta.obterLogErros = function () 
            {
                if (ErrorHandler && ErrorHandler.obterLog) 
                {
                    return ErrorHandler.obterLog();
                }
                return [];
            };

            // Expor função para limpar log de erros
            window.Alerta.limparLogErros = function () 
            {
                if (ErrorHandler && ErrorHandler.limparLog) 
                {
                    ErrorHandler.limparLog();
                }
            };

            console.log('📋 [Alerta] Funções adicionais disponíveis:');
            console.log('  - Alerta.criarErroAjax(jqXHR, textStatus, errorThrown, ajaxSettings)');
            console.log('  - Alerta.TratamentoErroComLinhaEnriquecido(arquivo, funcao, erro, contexto)');
            console.log('  - Alerta.setContextoGlobal(contexto)');
            console.log('  - Alerta.limparContextoGlobal()');
            console.log('  - Alerta.obterLogErros()');
            console.log('  - Alerta.limparLogErros()');
        }
        else if (tentativas < maxTentativas) 
        {
            // Tentar novamente em 100ms
            setTimeout(tentarIntegrar, 100);
        }
        else 
        {
            console.warn('⚠️ [Alerta] ErrorHandler não foi carregado após 5 segundos');
            console.warn('   Certifique-se de que error_handler.js está sendo carregado');
        }
    }

    // Iniciar tentativas de integração
    tentarIntegrar();
})();

// ============================================================================
// LOG FINAL
// ============================================================================

console.log('%c[Alerta] Sistema completo carregado',
    'background: #28a745; color: white; font-weight: bold; padding: 5px; border-radius: 3px;');
