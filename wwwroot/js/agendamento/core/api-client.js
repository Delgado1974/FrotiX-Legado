// ====================================================================
// API CLIENT - Cliente HTTP centralizado
// ====================================================================

/**
 * Cliente HTTP para comunicação com API
 */
class ApiClient
{
    constructor(baseUrl = '')
    {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json; charset=utf-8'
        };
    }

    /**
     * Requisição GET
     * param {string} url - URL do endpoint
     * param {Object} params - Parâmetros da query string
     * returns {Promise} Promise com resposta
     */
    async get(url, params = {})
    {
        try
        {
            return new Promise((resolve, reject) =>
            {
                $.ajax({
                    url: this.baseUrl + url,
                    type: 'GET',
                    data: params,
                    dataType: 'json',
                    success: function (data)
                    {
                        resolve(data);
                    },
                    error: function (jqXHR, textStatus, errorThrown)
                    {
                        const erro = criarErroAjax(jqXHR, textStatus, errorThrown, this);
                        reject(erro);
                    }
                });
            });
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("api-client.js", "get", error);
            throw error;
        }
    }

    /**
     * Requisição POST
     * param {string} url - URL do endpoint
     * param {Object} data - Dados a enviar
     * returns {Promise} Promise com resposta
     */
    async post(url, data = {})
    {
        try
        {
            return new Promise((resolve, reject) =>
            {
                $.ajax({
                    url: this.baseUrl + url,
                    type: 'POST',
                    contentType: this.defaultHeaders['Content-Type'],
                    dataType: 'json',
                    data: JSON.stringify(data),
                    success: function (response)
                    {
                        resolve(response);
                    },
                    error: function (jqXHR, textStatus, errorThrown)
                    {
                        const erro = criarErroAjax(jqXHR, textStatus, errorThrown, this);
                        reject(erro);
                    }
                });
            });
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("api-client.js", "post", error);
            throw error;
        }
    }

    /**
     * Requisição PUT
     * param {string} url - URL do endpoint
     * param {Object} data - Dados a enviar
     * returns {Promise} Promise com resposta
     */
    async put(url, data = {})
    {
        try
        {
            return new Promise((resolve, reject) =>
            {
                $.ajax({
                    url: this.baseUrl + url,
                    type: 'PUT',
                    contentType: this.defaultHeaders['Content-Type'],
                    dataType: 'json',
                    data: JSON.stringify(data),
                    success: function (response)
                    {
                        resolve(response);
                    },
                    error: function (jqXHR, textStatus, errorThrown)
                    {
                        const erro = criarErroAjax(jqXHR, textStatus, errorThrown, this);
                        reject(erro);
                    }
                });
            });
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("api-client.js", "put", error);
            throw error;
        }
    }

    /**
     * Requisição DELETE
     * param {string} url - URL do endpoint
     * param {Object} params - Parâmetros
     * returns {Promise} Promise com resposta
     */
    async delete(url, params = {})
    {
        try
        {
            return new Promise((resolve, reject) =>
            {
                $.ajax({
                    url: this.baseUrl + url,
                    type: 'DELETE',
                    data: params,
                    dataType: 'json',
                    success: function (response)
                    {
                        resolve(response);
                    },
                    error: function (jqXHR, textStatus, errorThrown)
                    {
                        const erro = criarErroAjax(jqXHR, textStatus, errorThrown, this);
                        reject(erro);
                    }
                });
            });
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("api-client.js", "delete", error);
            throw error;
        }
    }

    /**
     * Requisição com fetch nativo
     * param {string} url - URL do endpoint
     * param {Object} options - Opções do fetch
     * returns {Promise} Promise com resposta
     */
    async fetch(url, options = {})
    {
        try
        {
            const response = await fetch(this.baseUrl + url, {
                ...options,
                headers: {
                    ...this.defaultHeaders,
                    ...(options.headers || {})
                }
            });

            if (!response.ok)
            {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("api-client.js", "fetch", error);
            throw error;
        }
    }
}

// Instância global
window.ApiClient = new ApiClient();
