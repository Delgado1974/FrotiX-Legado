// ====================================================================
// AJAX HELPER - Utilitários para chamadas AJAX
// ====================================================================

/**
 * Cria objeto de erro detalhado a partir de falha AJAX
 * param {jqXHR} jqXHR - Objeto jQuery XHR
 * param {string} textStatus - Status textual (timeout, error, abort, parsererror)
 * param {string} errorThrown - Erro lançado
 * param {Object} ajaxSettings - Configurações da chamada AJAX (this)
 * returns {Object} Objeto de erro enriquecido
 */
window.criarErroAjax = function (jqXHR, textStatus, errorThrown, ajaxSettings)
{
    try
    {
        const erro = {
            // Informações básicas
            status: jqXHR.status || 0,
            statusText: jqXHR.statusText || textStatus || 'Erro desconhecido',
            errorThrown: errorThrown || 'Sem detalhes',

            // Informações da requisição
            url: ajaxSettings?.url || 'URL não disponível',
            method: ajaxSettings?.type || 'GET',

            // Response
            responseText: jqXHR.responseText || '',
            responseJSON: null,

            // Timestamp
            timestamp: new Date().toISOString(),

            // Mensagem amigável
            mensagemUsuario: ''
        };

        // Tentar parsear JSON da resposta
        try
        {
            if (jqXHR.responseText)
            {
                erro.responseJSON = JSON.parse(jqXHR.responseText);
            }
        } catch (e)
        {
            // Não é JSON, tudo bem
        }

        // Definir mensagem amigável baseada no status
        switch (erro.status)
        {
            case 0:
                erro.mensagemUsuario = 'Sem conexão com o servidor. Verifique sua internet.';
                break;
            case 400:
                erro.mensagemUsuario = 'Dados inválidos enviados ao servidor.';
                break;
            case 401:
                erro.mensagemUsuario = 'Sessão expirada. Por favor, faça login novamente.';
                break;
            case 403:
                erro.mensagemUsuario = 'Você não tem permissão para esta operação.';
                break;
            case 404:
                erro.mensagemUsuario = 'Recurso não encontrado no servidor.';
                break;
            case 500:
                erro.mensagemUsuario = 'Erro interno do servidor. Tente novamente mais tarde.';
                break;
            case 503:
                erro.mensagemUsuario = 'Servidor temporariamente indisponível.';
                break;
            default:
                if (textStatus === 'timeout')
                {
                    erro.mensagemUsuario = 'A operação demorou muito. Tente novamente.';
                } else if (textStatus === 'abort')
                {
                    erro.mensagemUsuario = 'Operação cancelada.';
                } else if (textStatus === 'parsererror')
                {
                    erro.mensagemUsuario = 'Erro ao processar resposta do servidor.';
                } else
                {
                    erro.mensagemUsuario = `Erro ao comunicar com o servidor (${erro.status}).`;
                }
        }

        // Construir mensagem de erro completa
        const mensagemCompleta = [
            `Status: ${erro.status} - ${erro.statusText}`,
            `URL: ${erro.url}`,
            `Método: ${erro.method}`,
            `Mensagem: ${erro.mensagemUsuario}`
        ].join('\n');

        // Retornar objeto Error com propriedades adicionais
        const errorObj = new Error(mensagemCompleta);
        errorObj.ajax = erro;

        return errorObj;

    } catch (e)
    {
        // Se falhar ao criar o erro, retornar erro básico
        return new Error(`Erro AJAX: ${textStatus || 'Desconhecido'}`);
    }
};

/**
 * Exemplo de uso:
 * 
 * $.ajax({
 *     url: "/api/endpoint",
 *     type: "POST",
 *     success: function(data) {
 *         // ...
 *     },
 *     error: function(jqXHR, textStatus, errorThrown) {
 *         const erro = criarErroAjax(jqXHR, textStatus, errorThrown, this);
 *         Alerta.TratamentoErroComLinha("arquivo.js", "nomeFuncao", erro);
 *     }
 * });
 */
