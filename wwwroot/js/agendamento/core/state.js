// ====================================================================
// STATE MANAGER - Gerenciamento centralizado de estado
// ====================================================================

/**
 * Gerenciador de estado global da aplicação
 */
class StateManager
{
    constructor()
    {
        this.state = {
            // Dados da viagem atual
            viagem: {
                id: "",
                idAJAX: "",
                recorrenciaId: "",
                recorrenciaIdAJAX: "",
                dataInicial: "",
                dataInicialList: "",
                horaInicial: "",
                status: "Aberta",
                dados: null
            },

            // Estado da UI
            ui: {
                modalAberto: false,
                modalLock: false,
                isSubmitting: false,
                carregandoAgendamento: false,
                carregandoViagemBloqueada: false,
                inserindoRequisitante: false,
                transformandoEmViagem: false
            },

            // Recorrência
            recorrencia: {
                agendamentos: [],
                editarTodos: false,
                datasSelecionadas: []
            },

            // Calendário
            calendario: {
                instancia: null,
                selectedDates: []
            }
        };

        this.listeners = new Map();
    }

    /**
     * Obter valor do estado
     * param {string} path - Caminho do estado (ex: "viagem.id")
     * returns {*} Valor do estado
     */
    get(path)
    {
        try
        {
            return path.split('.').reduce((obj, key) => obj?.[key], this.state);
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("state.js", "get", error);
            return null;
        }
    }

    /**
     * Definir valor do estado
     * param {string} path - Caminho do estado
     * param {*} value - Novo valor
     */
    set(path, value)
    {
        try
        {
            const keys = path.split('.');
            const lastKey = keys.pop();
            const target = keys.reduce((obj, key) => obj[key], this.state);

            const oldValue = target[lastKey];
            target[lastKey] = value;

            // Notificar listeners
            this.notify(path, value, oldValue);
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("state.js", "set", error);
        }
    }

    /**
     * Atualizar múltiplos valores
     * param {Object} updates - Objeto com paths e valores
     */
    update(updates)
    {
        try
        {
            Object.entries(updates).forEach(([path, value]) =>
            {
                this.set(path, value);
            });
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("state.js", "update", error);
        }
    }

    /**
     * Observar mudanças em um path
     * param {string} path - Caminho a observar
     * param {Function} callback - Função callback
     * returns {Function} Função para cancelar a observação
     */
    subscribe(path, callback)
    {
        try
        {
            if (!this.listeners.has(path))
            {
                this.listeners.set(path, []);
            }
            this.listeners.get(path).push(callback);

            return () =>
            {
                const callbacks = this.listeners.get(path);
                const index = callbacks.indexOf(callback);
                if (index > -1)
                {
                    callbacks.splice(index, 1);
                }
            };
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("state.js", "subscribe", error);
            return () => { };
        }
    }

    /**
     * Notificar listeners
     */
    notify(path, newValue, oldValue)
    {
        try
        {
            const callbacks = this.listeners.get(path) || [];
            callbacks.forEach(callback =>
            {
                try
                {
                    callback(newValue, oldValue);
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("state.js", "notify_callback", error);
                }
            });
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("state.js", "notify", error);
        }
    }

    /**
     * Resetar estado
     */
    reset()
    {
        try
        {
            this.state = {
                viagem: {
                    id: "",
                    idAJAX: "",
                    recorrenciaId: "",
                    recorrenciaIdAJAX: "",
                    dataInicial: "",
                    dataInicialList: "",
                    horaInicial: "",
                    status: "Aberta",
                    dados: null
                },
                ui: {
                    modalAberto: false,
                    modalLock: false,
                    isSubmitting: false,
                    carregandoAgendamento: false,
                    carregandoViagemBloqueada: false,
                    inserindoRequisitante: false,
                    transformandoEmViagem: false
                },
                recorrencia: {
                    agendamentos: [],
                    editarTodos: false,
                    datasSelecionadas: []
                },
                calendario: {
                    instancia: null,
                    selectedDates: []
                }
            };

            this.notify('*', this.state, null);
        } catch (error)
        {
            Alerta.TratamentoErroComLinha("state.js", "reset", error);
        }
    }

    /**
     * Obter estado completo (para debug)
     */
    getState()
    {
        return { ...this.state };
    }
}

// Instância global
window.AppState = new StateManager();

// Aliases para compatibilidade com código legado
Object.defineProperty(window, 'viagemId', {
    get: () => window.AppState.get('viagem.id'),
    set: (value) => window.AppState.set('viagem.id', value)
});

Object.defineProperty(window, 'viagemId_AJAX', {
    get: () => window.AppState.get('viagem.idAJAX'),
    set: (value) => window.AppState.set('viagem.idAJAX', value)
});

Object.defineProperty(window, 'recorrenciaViagemId', {
    get: () => window.AppState.get('viagem.recorrenciaId'),
    set: (value) => window.AppState.set('viagem.recorrenciaId', value)
});

Object.defineProperty(window, 'recorrenciaViagemId_AJAX', {
    get: () => window.AppState.get('viagem.recorrenciaIdAJAX'),
    set: (value) => window.AppState.set('viagem.recorrenciaIdAJAX', value)
});

Object.defineProperty(window, 'dataInicial', {
    get: () => window.AppState.get('viagem.dataInicial'),
    set: (value) => window.AppState.set('viagem.dataInicial', value)
});

Object.defineProperty(window, 'dataInicial_List', {
    get: () => window.AppState.get('viagem.dataInicialList'),
    set: (value) => window.AppState.set('viagem.dataInicialList', value)
});

Object.defineProperty(window, 'horaInicial', {
    get: () => window.AppState.get('viagem.horaInicial'),
    set: (value) => window.AppState.set('viagem.horaInicial', value)
});

Object.defineProperty(window, 'StatusViagem', {
    get: () => window.AppState.get('viagem.status'),
    set: (value) => window.AppState.set('viagem.status', value)
});

Object.defineProperty(window, 'modalLock', {
    get: () => window.AppState.get('ui.modalLock'),
    set: (value) => window.AppState.set('ui.modalLock', value)
});

Object.defineProperty(window, 'isSubmitting', {
    get: () => window.AppState.get('ui.isSubmitting'),
    set: (value) => window.AppState.set('ui.isSubmitting', value)
});

Object.defineProperty(window, 'CarregandoAgendamento', {
    get: () => window.AppState.get('ui.carregandoAgendamento'),
    set: (value) => window.AppState.set('ui.carregandoAgendamento', value)
});

Object.defineProperty(window, 'CarregandoViagemBloqueada', {
    get: () => window.AppState.get('ui.carregandoViagemBloqueada'),
    set: (value) => window.AppState.set('ui.carregandoViagemBloqueada', value)
});

Object.defineProperty(window, 'InserindoRequisitante', {
    get: () => window.AppState.get('ui.inserindoRequisitante'),
    set: (value) => window.AppState.set('ui.inserindoRequisitante', value)
});

Object.defineProperty(window, 'transformandoEmViagem', {
    get: () => window.AppState.get('ui.transformandoEmViagem'),
    set: (value) => window.AppState.set('ui.transformandoEmViagem', value)
});

Object.defineProperty(window, 'agendamentosRecorrentes', {
    get: () => window.AppState.get('recorrencia.agendamentos'),
    set: (value) => window.AppState.set('recorrencia.agendamentos', value)
});

Object.defineProperty(window, 'editarTodosRecorrentes', {
    get: () => window.AppState.get('recorrencia.editarTodos'),
    set: (value) => window.AppState.set('recorrencia.editarTodos', value)
});

Object.defineProperty(window, 'datasSelecionadas', {
    get: () => window.AppState.get('recorrencia.datasSelecionadas'),
    set: (value) => window.AppState.set('recorrencia.datasSelecionadas', value)
});

Object.defineProperty(window, 'calendar', {
    get: () => window.AppState.get('calendario.instancia'),
    set: (value) => window.AppState.set('calendario.instancia', value)
});

Object.defineProperty(window, 'selectedDates', {
    get: () => window.AppState.get('calendario.selectedDates'),
    set: (value) => window.AppState.set('calendario.selectedDates', value)
});
