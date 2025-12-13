// ====================================================================
// EVENTO SERVICE - Serviço para gerenciamento de eventos
// ====================================================================

class EventoService
{
    constructor()
    {
        this.api = window.ApiClient;
    }

    /**
     * Adiciona novo evento
     * param {Object} dados - Dados do evento
     * returns {Promise<Object>} Resultado da operação
     */
    async adicionar(dados)
    {
        try
        {
            const response = await this.api.post('/api/Viagem/AdicionarEvento', dados);

            if (response.success)
            {
                return {
                    success: true,
                    message: response.message,
                    eventoId: response.eventoId,
                    eventoText: response.eventoText
                };
            } else
            {
                return {
                    success: false,
                    message: response.message || "Erro ao adicionar evento"
                };
            }
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("evento.service.js", "adicionar", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Lista eventos
     * returns {Promise<Array>} Lista de eventos
     */
    async listar()
    {
        try
        {
            return new Promise((resolve, reject) =>
            {
                $.ajax({
                    url: "/Viagens/Upsert?handler=AJAXPreencheListaEventos",
                    method: "GET",
                    datatype: "json",
                    success: function (res)
                    {
                        const eventos = res.data.map(item => ({
                            EventoId: item.eventoId,
                            Evento: item.nome
                        }));

                        resolve({
                            success: true,
                            data: eventos
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown)
                    {
                        const erro = criarErroAjax(jqXHR, textStatus, errorThrown, this);
                        Alerta.TratamentoErroComLinha("evento.service.js", "listar", erro);
                        reject(erro);
                    }
                });
            });
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("evento.service.js", "listar", error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Atualiza lista de eventos em dropdown
     * param {number} eventoId - ID do evento para selecionar
     * returns {Promise<void>}
     */
    async atualizarListaDropdown(eventoId = null)
    {
        try
        {
            const result = await this.listar();

            if (!result.success)
            {
                throw new Error(result.error);
            }

            const lstEventosElement = document.getElementById("lstEventos");
            if (!lstEventosElement || !lstEventosElement.ej2_instances || !lstEventosElement.ej2_instances[0])
            {
                return;
            }

            const lstEventos = lstEventosElement.ej2_instances[0];
            lstEventos.dataSource = result.data;
            lstEventos.dataBind();

            if (eventoId)
            {
                lstEventos.value = eventoId;
            }
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("evento.service.js", "atualizarListaDropdown", error);
        }
    }
}

// Instância global
window.EventoService = new EventoService();
