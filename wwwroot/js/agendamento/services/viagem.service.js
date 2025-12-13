// ====================================================================
// VIAGEM SERVICE - Serviço para gerenciamento de viagens
// ====================================================================

class ViagemService
{
    constructor()
    {
        this.api = window.ApiClient;
    }

    /**
     * Verifica status da viagem (aberta/fechada)
     * param {string} viagemId - ID da viagem
     * returns {Promise<boolean>} true se aberta, false se fechada
     */
    async verificarStatus(viagemId)
    {
        try
        {
            const isAberta = await this.api.get('/api/Viagem/PegarStatusViagem', { viagemId });

            return {
                success: true,
                data: isAberta
            };
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("viagem.service.js", "verificarStatus", error);
            return {
                success: false,
                error: error.message,
                data: false
            };
        }
    }

    /**
     * Recupera usuário por ID
     * param {string} id - ID do usuário
     * returns {Promise<string>} Nome do usuário
     */
    async recuperarUsuario(id)
    {
        try
        {
            const data = await this.api.get('/api/Agenda/RecuperaUsuario', { id });

            let nomeUsuario = "";
            $.each(data, function (key, val)
            {
                nomeUsuario = val;
            });

            return {
                success: true,
                data: nomeUsuario
            };
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("viagem.service.js", "recuperarUsuario", error);
            return {
                success: false,
                error: error.message,
                data: ""
            };
        }
    }

    /**
     * Verifica número de ficha de vistoria
     * param {string} noFicha - Número da ficha
     * returns {Promise<Object>} Informações da validação
     */
    async verificarFicha(noFicha)
    {
        try
        {
            return new Promise((resolve, reject) =>
            {
                $.ajax({
                    url: "/Viagens/Upsert?handler=VerificaFicha",
                    method: "GET",
                    datatype: "json",
                    data: { id: noFicha },
                    success: function (res)
                    {
                        const maxFicha = parseInt(res.data);
                        const diferencaGrande = noFicha > maxFicha + 100 || noFicha < maxFicha - 100;

                        resolve({
                            success: true,
                            maxFicha: maxFicha,
                            diferencaGrande: diferencaGrande
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown)
                    {
                        const erro = criarErroAjax(jqXHR, textStatus, errorThrown, this);
                        Alerta.TratamentoErroComLinha("viagem.service.js", "verificarFicha", erro);
                        reject(erro);
                    }
                });
            });
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("viagem.service.js", "verificarFicha", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verifica se ficha já existe
     * param {string} noFicha - Número da ficha
     * returns {Promise<boolean>} true se existe
     */
    async fichaExiste(noFicha)
    {
        try
        {
            return new Promise((resolve, reject) =>
            {
                $.ajax({
                    url: "/Viagens/Upsert?handler=FichaExistente",
                    method: "GET",
                    datatype: "json",
                    data: { id: noFicha },
                    success: function (res)
                    {
                        resolve({
                            success: true,
                            existe: res.data === true
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown)
                    {
                        const erro = criarErroAjax(jqXHR, textStatus, errorThrown, this);
                        Alerta.TratamentoErroComLinha("viagem.service.js", "fichaExiste", erro);
                        reject(erro);
                    }
                });
            });
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("viagem.service.js", "fichaExiste", error);
            return {
                success: false,
                error: error.message,
                existe: false
            };
        }
    }

    /**
     * Lista setores
     * returns {Promise<Array>} Lista de setores
     */
    async listarSetores()
    {
        try
        {
            return new Promise((resolve, reject) =>
            {
                $.ajax({
                    url: "/Viagens/Upsert?handler=AJAXPreencheListaSetores",
                    method: "GET",
                    datatype: "json",
                    success: function (res)
                    {
                        const setores = res.data.map(item => ({
                            SetorSolicitanteId: item.setorSolicitanteId,
                            SetorPaiId: item.setorPaiId,
                            Nome: item.nome,
                            HasChild: item.hasChild
                        }));

                        resolve({
                            success: true,
                            data: setores
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown)
                    {
                        const erro = criarErroAjax(jqXHR, textStatus, errorThrown, this);
                        Alerta.TratamentoErroComLinha("viagem.service.js", "listarSetores", erro);
                        reject(erro);
                    }
                });
            });
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("viagem.service.js", "listarSetores", error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
}

// Instância global
window.ViagemService = new ViagemService();
