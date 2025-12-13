// ====================================================================
// AGENDAMENTO SERVICE - Serviço para gerenciamento de agendamentos
// ====================================================================

class AgendamentoService
{
    constructor()
    {
        this.api = window.ApiClient;
    }

    /**
     * Busca viagem por ID
     * param {string} id - ID da viagem
     * returns {Promise<Object>} Dados da viagem
     */
    async buscarViagem(id)
    {
        try
        {
            const response = await this.api.get('/api/Agenda/RecuperaViagem', { id });
            return {
                success: true,
                data: response.data
            };
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento.service.js", "buscarViagem", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Cria ou atualiza agendamento
     * param {Object} dados - Dados do agendamento
     * returns {Promise<Object>} Resultado da operação
     */
    async salvar(dados)
    {
        try
        {
            const response = await this.api.post('/api/Agenda/Agendamento', dados);

            if (response.success || response.data)
            {
                return {
                    success: true,
                    data: response
                };
            } else
            {
                return {
                    success: false,
                    message: response.message || "Falha ao salvar agendamento"
                };
            }
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento.service.js", "salvar", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Exclui agendamento
     * param {string} viagemId - ID da viagem
     * returns {Promise<Object>} Resultado da operação
     */
    async excluir(viagemId)
    {
        try
        {
            const response = await this.api.post('/api/Agenda/ApagaAgendamento', { ViagemId: viagemId });

            if (response.success)
            {
                return {
                    success: true,
                    message: response.message
                };
            } else
            {
                return {
                    success: false,
                    message: response.message || "Erro ao excluir agendamento"
                };
            }
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento.service.js", "excluir", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Cancela agendamento
     * param {string} viagemId - ID da viagem
     * param {string} descricao - Descrição do cancelamento
     * returns {Promise<Object>} Resultado da operação
     */
    async cancelar(viagemId, descricao)
    {
        try
        {
            const response = await this.api.post('/api/Agenda/CancelaAgendamento', {
                ViagemId: viagemId,
                Descricao: descricao
            });

            if (response.success)
            {
                return {
                    success: true,
                    message: response.message
                };
            } else
            {
                return {
                    success: false,
                    message: response.message || "Erro ao cancelar agendamento"
                };
            }
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento.service.js", "cancelar", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtém agendamentos recorrentes
     * param {string} recorrenciaViagemId - ID da recorrência
     * returns {Promise<Array>} Lista de agendamentos
     */
    async obterRecorrentes(recorrenciaViagemId)
    {
        try
        {
            const data = await this.api.get('/api/Agenda/ObterAgendamentoExclusao', {
                recorrenciaViagemId
            });

            return {
                success: true,
                data: data
            };
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento.service.js", "obterRecorrentes", error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Obtém agendamento inicial de recorrência
     * param {string} viagemId - ID da viagem
     * returns {Promise<Object>} Dados do agendamento inicial
     */
    async obterRecorrenteInicial(viagemId)
    {
        try
        {
            const data = await this.api.get('/api/Agenda/ObterAgendamentoEdicaoInicial', {
                viagemId
            });

            return {
                success: true,
                data: data
            };
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento.service.js", "obterRecorrenteInicial", error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Obtém agendamento para edição
     * param {string} viagemId - ID da viagem
     * returns {Promise<Object>} Dados do agendamento
     */
    async obterParaEdicao(viagemId)
    {
        try
        {
            const response = await this.api.get('/api/Agenda/ObterAgendamentoEdicao', {
                viagemId
            });

            const objViagem = Array.isArray(response) ? response[0] : response;

            return {
                success: true,
                data: objViagem
            };
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento.service.js", "obterParaEdicao", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtém datas de viagem
     * param {string} viagemId - ID da viagem
     * param {string} recorrenciaViagemId - ID da recorrência
     * returns {Promise<Array>} Lista de datas
     */
    async obterDatas(viagemId, recorrenciaViagemId)
    {
        try
        {
            const data = await this.api.get('/api/Agenda/GetDatasViagem', {
                viagemId,
                recorrenciaViagemId
            });

            return {
                success: true,
                data: data
            };
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento.service.js", "obterDatas", error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Carrega eventos do calendário
     * param {Object} fetchInfo - Informações de fetch do FullCalendar
     * returns {Promise<Array>} Lista de eventos
     */
    async carregarEventos(fetchInfo)
    {
        try
        {
            const resp = await fetch(`/api/Agenda/Eventos?start=${fetchInfo.startStr}&end=${fetchInfo.endStr}`);
            const payload = await resp.json();

            const events = (payload?.data || payload || []).map(item => ({
                id: item.id,
                title: item.title || item.descricao || "",
                description: item.descricao || "",
                start: item.start,
                end: item.end,
                backgroundColor: item.backgroundColor || undefined,
                textColor: item.textColor || undefined,
                allDay: item.allDay === true
            }));

            return {
                success: true,
                data: events
            };
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("agendamento.service.js", "carregarEventos", error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
}

// Instância global
window.AgendamentoService = new AgendamentoService();
