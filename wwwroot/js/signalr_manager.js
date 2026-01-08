// signalr_manager.js
// Gerenciador Global de Conexão SignalR
// Este arquivo deve ser carregado ANTES de qualquer script que use SignalR

var SignalRManager = (function ()
{
    'use strict';

    // Variáveis privadas
    var connection = null;
    var isConnecting = false;
    var isInitialized = false;
    var eventHandlers = {};
    var reconnectCallbacks = [];
    var connectionPromise = null; // Nova variável para controlar promise única

    // Configurações
    var config = {
        hubUrl: "/alertasHub",
        reconnectDelays: [0, 2000, 5000, 10000, 30000],
        logLevel: signalR.LogLevel.Warning,
        maxReconnectAttempts: 5,
        reconnectAttempt: 0,
        initialDelay: 1000, // Delay inicial antes de conectar
        // Começar com LongPolling para evitar erros de WebSocket em ambientes restritos
        fallbackToLongPolling: true // Flag para controlar fallback
    };

    /**
     * Função auxiliar de delay
     */
    function delay(ms) 
    {
        return new Promise(function (resolve) 
        {
            setTimeout(resolve, ms);
        });
    }

    /**
     * Detecta o transporte usado pela conexão
     */
    function getTransportName(conn)
    {
        try
        {
            // Tentar vários caminhos possíveis onde o SignalR armazena o transporte
            if (conn && conn.connection)
            {
                // SignalR 7.x
                if (conn.connection.transport && conn.connection.transport.name)
                {
                    return conn.connection.transport.name;
                }

                // SignalR 6.x ou propriedade privada
                if (conn.connection._transport && conn.connection._transport.name)
                {
                    return conn.connection._transport.name;
                }

                // Tentativa via connectionStarted
                if (conn.connection.connectionStarted && conn.connection.transport)
                {
                    return conn.connection.transport.name || conn.connection.transport.constructor.name;
                }

                // Verificar propriedades internas
                var keys = Object.keys(conn.connection);
                for (var i = 0; i < keys.length; i++)
                {
                    var key = keys[i];
                    if (key.includes('transport') && conn.connection[key] && conn.connection[key].name)
                    {
                        return conn.connection[key].name;
                    }
                }
            }

            // Se está usando fallback, retornar indicação
            if (config.fallbackToLongPolling)
            {
                return "LongPolling (fallback)";
            }

            return "Não detectado";
        }
        catch (error)
        {
            return "Erro na detecção";
        }
    }

    /**
     * Cria a conexão SignalR
     */
    function createConnection(useFallback)
    {
        try
        {
            if (connection && !useFallback)
            {
                console.log("⚠️ Conexão SignalR já existe, retornando existente");
                return connection;
            }

            console.log("🔧 Criando nova conexão SignalR...");

            // Se deve usar fallback ou já teve erro de WebSocket
            if (useFallback || config.fallbackToLongPolling)
            {
                console.log("🔄 Usando LongPolling como transporte...");
            }

            try
            {
                var builder = new signalR.HubConnectionBuilder()
                    .withUrl(config.hubUrl, {
                        transport: (useFallback || config.fallbackToLongPolling)
                            ? signalR.HttpTransportType.LongPolling
                            : signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
                        skipNegotiation: false, // NUNCA usar true com múltiplos transportes
                        withCredentials: true
                    })
                    .withAutomaticReconnect(config.reconnectDelays)
                    .configureLogging(config.logLevel);

                connection = builder.build();
                setupConnectionHandlers();
                isInitialized = true;

                console.log("✅ Conexão SignalR criada com sucesso");
                return connection;

            } catch (innerError)
            {
                TratamentoErroComLinha("signalr_manager.js", "createConnection.build", innerError);
                connection = null;
                isInitialized = false;
                throw innerError;
            }
        }
        catch (error)
        {
            TratamentoErroComLinha("signalr_manager.js", "createConnection", error);
            connection = null;
            isInitialized = false;
            throw error;
        }
    }

    /**
     * Configura os handlers de eventos da conexão
     */
    function setupConnectionHandlers()
    {
        try
        {
            if (!connection) return;

            // Reconexão iniciada
            connection.onreconnecting(function (error)
            {
                try
                {
                    console.log("🔄 SignalR reconectando...");
                    if (error)
                    {
                        console.log("Motivo:", error.toString());
                    }
                    config.reconnectAttempt++;

                    // Notificar UI
                    if (typeof AppToast !== 'undefined')
                    {
                        AppToast.show("Amarelo", "Reconectando ao servidor...", 2000);
                    }

                    // Notificar todos os callbacks registrados
                    notifyAllCallbacks('onReconnecting', error);
                }
                catch (callbackError)
                {
                    TratamentoErroComLinha("signalr_manager.js", "onreconnecting.callback", callbackError);
                }
            });

            // Reconexão bem-sucedida
            connection.onreconnected(function (connectionId)
            {
                try
                {
                    console.log("✅ SignalR reconectado com sucesso!");
                    console.log("Connection ID:", connectionId);
                    config.reconnectAttempt = 0;

                    // Notificar UI
                    if (typeof AppToast !== 'undefined')
                    {
                        AppToast.show("Verde", "Conexão restabelecida", 2000);
                    }

                    // Reregistrar todos os event handlers
                    reregisterEventHandlers();

                    // Notificar todos os callbacks registrados
                    notifyAllCallbacks('onReconnected', connectionId);
                }
                catch (callbackError)
                {
                    TratamentoErroComLinha("signalr_manager.js", "onreconnected.callback", callbackError);
                }
            });

            // Conexão fechada
            connection.onclose(function (error)
            {
                try
                {
                    console.log("❌ Conexão SignalR fechada");
                    if (error)
                    {
                        var errorMessage = error.toString().toLowerCase();
                        var isWebSocketIssue = errorMessage.includes('websocket');

                        if (isWebSocketIssue && !config.fallbackToLongPolling)
                        {
                            console.log("🔄 Erro de WebSocket detectado, tentando fallback para LongPolling...");
                            config.fallbackToLongPolling = true;
                        }

                        // Log em nível de aviso para erros esperados de WebSocket
                        if (isWebSocketIssue) {
                            console.warn("WebSocket indisponível, usando fallback:", error.toString());
                        } else {
                            console.error("Erro:", error.toString());
                        }
                    }

                    // Limpar estado
                    connection = null;
                    isConnecting = false;
                    isInitialized = false;
                    connectionPromise = null;

                    // Notificar todos os callbacks registrados
                    notifyAllCallbacks('onClose', error);

                    // Tentar reconectar se não excedeu tentativas
                    if (config.reconnectAttempt < config.maxReconnectAttempts)
                    {
                        var retryDelay = config.reconnectDelays[Math.min(config.reconnectAttempt, config.reconnectDelays.length - 1)];
                        console.log("🔄 Tentando reconectar em " + retryDelay + "ms...");

                        setTimeout(function ()
                        {
                            try
                            {
                                console.log("🔄 Tentando reconectar automaticamente...");
                                getConnection().catch(function (err)
                                {
                                    try
                                    {
                                        console.error("❌ Falha na reconexão automática:", err);
                                    }
                                    catch (logError)
                                    {
                                        TratamentoErroComLinha("signalr_manager.js", "onclose.reconnect.catch", logError);
                                    }
                                });
                            }
                            catch (reconnectError)
                            {
                                TratamentoErroComLinha("signalr_manager.js", "onclose.setTimeout", reconnectError);
                            }
                        }, retryDelay);
                    } else
                    {
                        console.error("❌ Máximo de tentativas de reconexão excedido");
                        config.reconnectAttempt = 0;

                        if (typeof ShowErrorUnexpected !== 'undefined')
                        {
                            ShowErrorUnexpected("Sistema de notificações indisponível. Por favor, recarregue a página.");
                        }
                    }
                }
                catch (callbackError)
                {
                    TratamentoErroComLinha("signalr_manager.js", "onclose.callback", callbackError);
                }
            });
        }
        catch (error)
        {
            TratamentoErroComLinha("signalr_manager.js", "setupConnectionHandlers", error);
        }
    }

    /**
     * Reregistra todos os event handlers após reconexão
     */
    function reregisterEventHandlers()
    {
        try
        {
            if (!connection) return;

            console.log("📡 Reregistrando event handlers...");

            Object.keys(eventHandlers).forEach(function (eventName)
            {
                try
                {
                    var handlers = eventHandlers[eventName];
                    handlers.forEach(function (handler)
                    {
                        try
                        {
                            connection.on(eventName, handler);
                        }
                        catch (handlerError)
                        {
                            TratamentoErroComLinha("signalr_manager.js", "reregisterEventHandlers.forEach.handler", handlerError);
                        }
                    });
                }
                catch (eventError)
                {
                    TratamentoErroComLinha("signalr_manager.js", "reregisterEventHandlers.forEach", eventError);
                }
            });

            console.log("✅ Event handlers reregistrados:", Object.keys(eventHandlers).length);
        }
        catch (error)
        {
            TratamentoErroComLinha("signalr_manager.js", "reregisterEventHandlers", error);
        }
    }

    /**
     * Notifica todos os callbacks registrados
     */
    function notifyAllCallbacks(callbackName, data)
    {
        try
        {
            reconnectCallbacks.forEach(function (callback)
            {
                try
                {
                    if (typeof callback[callbackName] === 'function')
                    {
                        try
                        {
                            callback[callbackName](data);
                        } catch (execError)
                        {
                            TratamentoErroComLinha("signalr_manager.js", "notifyAllCallbacks.execute", execError);
                        }
                    }
                }
                catch (callbackError)
                {
                    TratamentoErroComLinha("signalr_manager.js", "notifyAllCallbacks.forEach", callbackError);
                }
            });
        }
        catch (error)
        {
            TratamentoErroComLinha("signalr_manager.js", "notifyAllCallbacks", error);
        }
    }

    /**
     * Obtém a conexão (criando se necessário e conectando)
     */
    function getConnection()
    {
        try
        {
            // Se já está conectado, retorna imediatamente
            if (connection && connection.state === signalR.HubConnectionState.Connected)
            {
                return Promise.resolve(connection);
            }

            // Se já existe uma promise de conexão em andamento, retorna ela
            if (connectionPromise)
            {
                console.log("⏳ Retornando promise de conexão existente...");
                return connectionPromise;
            }

            // Criar nova promise de conexão
            connectionPromise = new Promise(function (resolve, reject)
            {
                try
                {
                    // Se está conectando, aguarda
                    if (isConnecting)
                    {
                        console.log("⏳ Aguardando conexão em andamento...");
                        var checkInterval = setInterval(function ()
                        {
                            try
                            {
                                if (connection && connection.state === signalR.HubConnectionState.Connected)
                                {
                                    clearInterval(checkInterval);
                                    connectionPromise = null;
                                    resolve(connection);
                                } else if (!isConnecting)
                                {
                                    clearInterval(checkInterval);
                                    connectionPromise = null;
                                    reject(new Error("Conexão falhou"));
                                }
                            }
                            catch (checkError)
                            {
                                clearInterval(checkInterval);
                                connectionPromise = null;
                                TratamentoErroComLinha("signalr_manager.js", "getConnection.checkInterval", checkError);
                                reject(checkError);
                            }
                        }, 100);
                        return;
                    }

                    // Iniciar nova conexão
                    isConnecting = true;

                    // Adicionar delay inicial antes de conectar (evita erro de WebSocket)
                    console.log("⏰ Aguardando " + config.initialDelay + "ms antes de conectar...");

                    delay(config.initialDelay).then(function ()
                    {
                        try
                        {
                            var conn = createConnection(config.fallbackToLongPolling);

                            console.log("🚀 Iniciando conexão SignalR...");

                            // Criar timeout para a conexão
                            var timeoutId = setTimeout(function ()
                            {
                                try
                                {
                                    console.error("⏱️ Timeout na conexão SignalR");
                                    isConnecting = false;
                                    connectionPromise = null;

                                    // Se foi timeout com WebSocket, tentar LongPolling
                                    if (!config.fallbackToLongPolling)
                                    {
                                        console.log("🔄 Tentando fallback para LongPolling após timeout...");
                                        config.fallbackToLongPolling = true;
                                        connection = null;
                                        isInitialized = false;

                                        // Tentar novamente
                                        setTimeout(function ()
                                        {
                                            getConnection().then(resolve).catch(reject);
                                        }, 1000);
                                    }
                                    else
                                    {
                                        reject(new Error("Timeout na conexão"));
                                    }
                                }
                                catch (timeoutError)
                                {
                                    TratamentoErroComLinha("signalr_manager.js", "getConnection.timeout", timeoutError);
                                    reject(timeoutError);
                                }
                            }, 30000); // Timeout de 30 segundos

                            conn.start()
                                .then(function ()
                                {
                                    try
                                    {
                                        clearTimeout(timeoutId);
                                        console.log("✅✅✅ SIGNALR CONECTADO COM SUCESSO ✅✅✅");
                                        console.log("Estado:", conn.state);
                                        console.log("Connection ID:", conn.connectionId);

                                        // Detectar e mostrar o transporte usado
                                        var transportName = getTransportName(conn);
                                        console.log("Transporte:", transportName);

                                        isConnecting = false;
                                        connectionPromise = null;
                                        config.reconnectAttempt = 0;
                                        resolve(conn);
                                    }
                                    catch (thenError)
                                    {
                                        TratamentoErroComLinha("signalr_manager.js", "getConnection.start.then", thenError);
                                        isConnecting = false;
                                        connectionPromise = null;
                                        reject(thenError);
                                    }
                                })
                                .catch(function (err)
                                {
                                    try
                                    {
                                        clearTimeout(timeoutId);

                                        var errorMessage = err.toString().toLowerCase();

                                        // Só mostrar erro se NÃO for WebSocket (erro esperado)
                                        if (!errorMessage.includes('websocket'))
                                        {
                                            console.error("❌❌❌ ERRO AO CONECTAR SIGNALR ❌❌❌");
                                            console.error("Erro:", err.toString());
                                        } else
                                        {
                                            // Log silencioso para erro esperado de WebSocket
                                            console.log("⚠️ WebSocket indisponível, tentando fallback para LongPolling...");
                                        }

                                        // Verificar se é erro de WebSocket
                                        if (errorMessage.includes('websocket') && !config.fallbackToLongPolling)
                                        {
                                            console.log("🔄 Erro de WebSocket, tentando LongPolling...");
                                            config.fallbackToLongPolling = true;
                                            connection = null;
                                            isInitialized = false;
                                            isConnecting = false;
                                            connectionPromise = null;

                                            // Tentar novamente com LongPolling
                                            setTimeout(function ()
                                            {
                                                getConnection().then(resolve).catch(reject);
                                            }, 1000);
                                            return;
                                        }

                                        // Verificar se é erro de autenticação
                                        if (errorMessage.includes('401') || errorMessage.includes('unauthorized'))
                                        {
                                            console.error("🔴 Erro de autenticação no SignalR");
                                            if (typeof ShowErrorUnexpected !== 'undefined')
                                            {
                                                ShowErrorUnexpected("Erro de autenticação. Por favor, faça login novamente.");
                                            }
                                        }
                                        else
                                        {
                                            TratamentoErroComLinha("signalr_manager.js", "getConnection.start.catch", err);
                                        }

                                        isConnecting = false;
                                        connectionPromise = null;
                                        connection = null;
                                        isInitialized = false;
                                        reject(err);
                                    }
                                    catch (catchError)
                                    {
                                        TratamentoErroComLinha("signalr_manager.js", "getConnection.start.catch.inner", catchError);
                                        isConnecting = false;
                                        connectionPromise = null;
                                        reject(catchError);
                                    }
                                });
                        }
                        catch (startError)
                        {
                            TratamentoErroComLinha("signalr_manager.js", "getConnection.delay.then", startError);
                            isConnecting = false;
                            connectionPromise = null;
                            connection = null;
                            isInitialized = false;
                            reject(startError);
                        }
                    })
                        .catch(function (delayError)
                        {
                            TratamentoErroComLinha("signalr_manager.js", "getConnection.delay.catch", delayError);
                            isConnecting = false;
                            connectionPromise = null;
                            reject(delayError);
                        });
                }
                catch (error)
                {
                    TratamentoErroComLinha("signalr_manager.js", "getConnection.promise", error);
                    isConnecting = false;
                    connectionPromise = null;
                    connection = null;
                    isInitialized = false;
                    reject(error);
                }
            });

            return connectionPromise;
        }
        catch (error)
        {
            TratamentoErroComLinha("signalr_manager.js", "getConnection", error);
            connectionPromise = null;
            return Promise.reject(error);
        }
    }

    /**
     * Registra um event handler
     */
    function on(eventName, handler)
    {
        try
        {
            if (typeof handler !== 'function')
            {
                console.error("Handler deve ser uma função");
                return;
            }

            // Armazenar para reregistrar após reconexão
            if (!eventHandlers[eventName])
            {
                eventHandlers[eventName] = [];
            }
            eventHandlers[eventName].push(handler);

            // Se conexão existe, registrar imediatamente
            if (connection)
            {
                try
                {
                    connection.on(eventName, handler);
                    console.log("📡 Event handler registrado:", eventName);
                }
                catch (registerError)
                {
                    TratamentoErroComLinha("signalr_manager.js", "on.connection.on", registerError);
                }
            }
        }
        catch (error)
        {
            TratamentoErroComLinha("signalr_manager.js", "on", error);
        }
    }

    /**
     * Remove um event handler
     */
    function off(eventName, handler)
    {
        try
        {
            if (eventHandlers[eventName])
            {
                eventHandlers[eventName] = eventHandlers[eventName].filter(function (h)
                {
                    return h !== handler;
                });
            }

            if (connection)
            {
                try
                {
                    connection.off(eventName, handler);
                    console.log("📡 Event handler removido:", eventName);
                }
                catch (offError)
                {
                    TratamentoErroComLinha("signalr_manager.js", "off.connection.off", offError);
                }
            }
        }
        catch (error)
        {
            TratamentoErroComLinha("signalr_manager.js", "off", error);
        }
    }

    /**
     * Invoca um método no servidor
     */
    function invoke(methodName)
    {
        try
        {
            var args = Array.prototype.slice.call(arguments, 1);

            return getConnection().then(function (conn)
            {
                try
                {
                    console.log("📤 Invocando método:", methodName);
                    return conn.invoke.apply(conn, [methodName].concat(args));
                }
                catch (invokeError)
                {
                    TratamentoErroComLinha("signalr_manager.js", "invoke.then", invokeError);
                    throw invokeError;
                }
            }).catch(function (err)
            {
                TratamentoErroComLinha("signalr_manager.js", "invoke.catch", err);
                throw err;
            });
        }
        catch (error)
        {
            TratamentoErroComLinha("signalr_manager.js", "invoke", error);
            return Promise.reject(error);
        }
    }

    /**
     * Registra callbacks para eventos de conexão
     */
    function registerCallback(callback)
    {
        try
        {
            if (typeof callback !== 'object')
            {
                console.error("Callback deve ser um objeto com métodos");
                return;
            }

            reconnectCallbacks.push(callback);
            console.log("✅ Callback registrado");
        }
        catch (error)
        {
            TratamentoErroComLinha("signalr_manager.js", "registerCallback", error);
        }
    }

    /**
     * Remove um callback registrado
     */
    function unregisterCallback(callback)
    {
        try
        {
            var index = reconnectCallbacks.indexOf(callback);
            if (index > -1)
            {
                reconnectCallbacks.splice(index, 1);
                console.log("✅ Callback removido");
            }
        }
        catch (error)
        {
            TratamentoErroComLinha("signalr_manager.js", "unregisterCallback", error);
        }
    }

    /**
     * Obtém o estado atual da conexão
     */
    function getState()
    {
        try
        {
            if (!connection)
            {
                return "Disconnected";
            }

            switch (connection.state)
            {
                case signalR.HubConnectionState.Connected:
                    return "Connected";
                case signalR.HubConnectionState.Connecting:
                    return "Connecting";
                case signalR.HubConnectionState.Reconnecting:
                    return "Reconnecting";
                case signalR.HubConnectionState.Disconnected:
                    return "Disconnected";
                default:
                    return "Unknown";
            }
        }
        catch (error)
        {
            TratamentoErroComLinha("signalr_manager.js", "getState", error);
            return "Error";
        }
    }

    /**
     * Desconecta manualmente
     */
    function disconnect()
    {
        try
        {
            if (connection)
            {
                return connection.stop().then(function ()
                {
                    try
                    {
                        console.log("✅ Desconectado manualmente");
                        connection = null;
                        isConnecting = false;
                        isInitialized = false;
                        connectionPromise = null;
                        config.fallbackToLongPolling = false;
                        config.reconnectAttempt = 0;
                    }
                    catch (stopError)
                    {
                        TratamentoErroComLinha("signalr_manager.js", "disconnect.stop.then", stopError);
                    }
                }).catch(function (err)
                {
                    TratamentoErroComLinha("signalr_manager.js", "disconnect.stop.catch", err);
                });
            }
            return Promise.resolve();
        }
        catch (error)
        {
            TratamentoErroComLinha("signalr_manager.js", "disconnect", error);
            return Promise.reject(error);
        }
    }

    /**
     * Força reconexão (útil para testes)
     */
    function forceReconnect()
    {
        try
        {
            console.log("🔄 Forçando reconexão...");
            config.reconnectAttempt = 0;

            if (connection)
            {
                return connection.stop().then(function ()
                {
                    connection = null;
                    isConnecting = false;
                    isInitialized = false;
                    connectionPromise = null;
                    config.fallbackToLongPolling = false;
                    return getConnection();
                });
            }
            else
            {
                return getConnection();
            }
        }
        catch (error)
        {
            TratamentoErroComLinha("signalr_manager.js", "forceReconnect", error);
            return Promise.reject(error);
        }
    }

    /**
     * Obtém informações de debug
     */
    function getDebugInfo()
    {
        try
        {
            var transportName = "N/A";

            // Tentar obter o nome do transporte
            if (connection)
            {
                transportName = getTransportName(connection);
            }

            return {
                isInitialized: isInitialized,
                isConnecting: isConnecting,
                state: getState(),
                connectionId: connection ? connection.connectionId : null,
                reconnectAttempt: config.reconnectAttempt,
                registeredEvents: Object.keys(eventHandlers),
                registeredCallbacks: reconnectCallbacks.length,
                usingFallback: config.fallbackToLongPolling,
                transport: transportName
            };
        }
        catch (error)
        {
            TratamentoErroComLinha("signalr_manager.js", "getDebugInfo", error);
            return {
                error: "Erro ao obter informações de debug",
                message: error.message
            };
        }
    }

    // API Pública
    return {
        getConnection: getConnection,
        on: on,
        off: off,
        invoke: invoke,
        registerCallback: registerCallback,
        unregisterCallback: unregisterCallback,
        getState: getState,
        disconnect: disconnect,
        forceReconnect: forceReconnect,
        getDebugInfo: getDebugInfo
    };
})();

// Expor globalmente
try
{
    window.SignalRManager = SignalRManager;
    console.log("✅ SignalRManager carregado e pronto para uso");
}
catch (error)
{
    // Fallback silencioso se window não existir (ex: Node.js)
    if (typeof console !== 'undefined' && console.error)
    {
        console.error("Erro ao expor SignalRManager globalmente:", error);
    }
}
