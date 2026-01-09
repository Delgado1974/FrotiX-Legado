# Documentação: alerta.js - Sistema de Alertas Unificado

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0  
> **Padrão**: FrotiX Simplificado

---

## Objetivos

O arquivo **alerta.js** é um wrapper utilitário que fornece uma interface simplificada e padronizada para exibir alertas, confirmações e mensagens de erro em todo o sistema FrotiX. Ele funciona como uma camada de abstração sobre o `SweetAlertInterop`, oferecendo métodos de conveniência e tratamento robusto de erros.

**Principais funcionalidades:**
- ✅ **Alertas básicos** (Erro, Sucesso, Info, Warning) com interface unificada
- ✅ **Confirmações** simples e com 3 opções (Todos/Atual/Cancelar)
- ✅ **Validação IA** com alertas específicos para análises estatísticas
- ✅ **Tratamento de erros** com extração inteligente de mensagens e stack traces
- ✅ **Integração com ErrorHandler** para logging e rastreamento
- ✅ **Helper para erros AJAX** com enriquecimento de contexto

---

## Arquivos Envolvidos

1. **wwwroot/js/alerta.js** - Arquivo principal (wrapper e funções utilitárias)
2. **wwwroot/js/sweetalert_interop.js** - Camada de baixo nível que renderiza os modais
3. **wwwroot/js/error_handler.js** - Sistema de tratamento de erros unificado
4. **Pages/Shared/_ScriptsBasePlugins.cshtml** - Carregamento global do arquivo

---

## 1. Estrutura Geral do Arquivo

### Problema
Criar uma API simples e consistente para exibir alertas em todo o sistema, abstraindo a complexidade do SweetAlert2 e fornecendo tratamento robusto de erros.

### Solução
Implementar um módulo IIFE (Immediately Invoked Function Expression) que expõe funções globais através do namespace `window.Alerta`, com fallbacks seguros e integração com sistemas de erro.

### Código

```javascript
// ================================
// Arquivo: alerta.js
// Wrapper utilitário para SweetAlertInterop
// VERSÃO CORRIGIDA - NOVA ESTRUTURA DE ERRO
// Integrado com ErrorHandler Unificado
// ================================

(function initAlerta()
{
    window.Alerta = window.Alerta || {};
    
    // Função auxiliar para chamar funções com segurança
    function callIf(fn, ...args)
    {
        try { 
            if (typeof fn === "function") return fn(...args); 
        }
        catch (e) { 
            console.error("[Alerta] erro ao chamar função:", e); 
        }
    }
    
    // ... resto do código
})();
```

**✅ Comentários:**
- O módulo usa IIFE para evitar poluição do escopo global
- `window.Alerta` é criado ou reutilizado (permite múltiplas inicializações)
- `callIf` previne erros se funções não estiverem disponíveis

---

## 2. Alertas Básicos (Erro, Sucesso, Info, Warning)

### Problema
Fornecer métodos simples e consistentes para exibir mensagens de feedback ao usuário.

### Solução
Criar funções que delegam para `SweetAlertInterop`, com fallback para console se a dependência não estiver disponível.

### Código

```javascript
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

// Alias para compatibilidade
window.Alerta.Alerta = window.Alerta.Alerta || function (titulo, texto, confirm = "OK")
{
    return callIf(window.Alerta.Warning, titulo, texto, confirm);
};
```

**✅ Comentários:**
- Todas as funções retornam `Promise` para permitir `.then()` e `await`
- Uso de `?.` (optional chaining) previne erros se `SweetAlertInterop` não existir
- Fallback para console garante que erros sejam sempre registrados
- `Alerta.Alerta` é um alias para `Warning` (compatibilidade com código legado)

**Exemplo de uso:**

```javascript
// Alerta de sucesso
await Alerta.Sucesso("Operação Concluída", "O registro foi salvo com sucesso!");

// Alerta de erro
await Alerta.Erro("Erro ao Salvar", "Não foi possível salvar o registro.");

// Alerta informativo
await Alerta.Info("Informação", "Este processo pode levar alguns minutos.");

// Alerta de aviso
await Alerta.Warning("Atenção", "Você tem alterações não salvas.");
```

---

## 3. Confirmações (Simples e com 3 Opções)

### Problema
Permitir que o usuário confirme ações críticas antes de executá-las, com opções flexíveis.

### Solução
Implementar dois tipos de confirmação: simples (Sim/Cancelar) e avançada (Todos/Atual/Cancelar).

### Código

```javascript
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
```

**✅ Comentários:**
- `Confirmar` retorna `true` se confirmado, `false` se cancelado
- `Confirmar3` retorna `"Todos"`, `"Atual"` ou `false`
- Textos dos botões são customizáveis

**Exemplo de uso:**

```javascript
// Confirmação simples
const confirmado = await Alerta.Confirmar(
    "Confirmar Exclusão",
    "Você tem certeza que deseja excluir este registro?",
    "Sim, excluir",
    "Cancelar"
);

if (confirmado) {
    // Executar exclusão
    excluirRegistro();
}

// Confirmação com 3 opções
const opcao = await Alerta.Confirmar3(
    "Aplicar Alterações",
    "Deseja aplicar as alterações para todos os registros ou apenas o atual?",
    "Todos",
    "Apenas este",
    "Cancelar"
);

if (opcao === "Todos") {
    aplicarParaTodos();
} else if (opcao === "Atual") {
    aplicarParaAtual();
}
```

---

## 4. Validação IA - Alertas de Análise Estatística

### Problema
Exibir alertas específicos para validações inteligentes baseadas em análise estatística (Z-Score, histórico do veículo, etc.), diferenciando-os de erros simples.

### Solução
Criar função dedicada que usa design específico com badge de IA e permite confirmação ou correção.

### Código

```javascript
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
```

**✅ Comentários:**
- Design específico com badge laranja "Atenção - Análise IA"
- Suporta HTML e quebras de linha (`\n`) na mensagem
- Fallback para confirmação padrão se a função específica não estiver disponível
- **IMPORTANTE:** Usar apenas para análises complexas, não para validações simples

**Exemplo de uso:**

```javascript
const mensagemIA = `
    📊 Análise Estatística Detectada:
    
    O consumo de combustível está 2.5 desvios padrão acima da média histórica deste veículo.
    
    Média histórica: 8.5 km/L
    Consumo atual: 6.2 km/L
    Z-Score: 2.5
    
    Isso pode indicar:
    - Problema mecânico
    - Erro de preenchimento
    - Condições de tráfego atípicas
`;

const confirmado = await Alerta.ValidacaoIAConfirmar(
    "Validação Inteligente",
    mensagemIA,
    "Confirmar mesmo assim",
    "Corrigir dados"
);

if (!confirmado) {
    // Usuário escolheu corrigir - voltar para edição
    voltarParaEdicao();
}
```

---

## 5. Tratamento de Erros com Extração Inteligente

### Problema
Erros podem vir em diversos formatos (string, Error object, objetos genéricos, AJAX responses) e precisam ser exibidos de forma clara ao usuário, com informações de contexto (arquivo, método, linha).

### Solução
Implementar função robusta que extrai mensagens de qualquer tipo de erro, enriquece com contexto e exibe através do `SweetAlertInterop.ShowErrorUnexpected`.

### Código

```javascript
// ===== FUNÇÃO MELHORADA: Tratamento de Erros =====
function _TratamentoErroComLinha(classeOuArquivo, metodo, erro)
{
    console.log('=== TratamentoErroComLinha INICIADO ===');
    console.log('Classe/Arquivo:', classeOuArquivo);
    console.log('Método:', metodo);
    console.log('Erro recebido:', erro);
    
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

        // Se não encontrou, tentar toString()
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
    console.log('=== TratamentoErroComLinha ENVIANDO ===');

    return SweetAlertInterop.ShowErrorUnexpected(classeOuArquivo, metodo, erroObj);
}

// Exportar a função
window.Alerta.TratamentoErroComLinha = window.Alerta.TratamentoErroComLinha || _TratamentoErroComLinha;
window.TratamentoErroComLinha = window.TratamentoErroComLinha || _TratamentoErroComLinha;
```

**✅ Comentários:**
- Extrai mensagens de múltiplas propriedades comuns (`erro`, `message`, `mensagem`, etc.)
- Converte strings simples em objetos Error com stack trace
- Preserva propriedades específicas de erros nativos (`fileName`, `lineNumber`)
- Expõe tanto `Alerta.TratamentoErroComLinha` quanto `TratamentoErroComLinha` global (compatibilidade)
- Logs detalhados para debug (podem ser removidos em produção)

**Exemplo de uso:**

```javascript
try {
    // Código que pode gerar erro
    processarDados();
} catch (error) {
    Alerta.TratamentoErroComLinha("meuArquivo.js", "processarDados", error);
}

// Também funciona com strings
Alerta.TratamentoErroComLinha("meuArquivo.js", "validar", "Campo obrigatório não preenchido");

// E com objetos genéricos
Alerta.TratamentoErroComLinha("api.js", "chamarAPI", {
    status: 500,
    message: "Erro interno do servidor",
    detalhes: { codigo: "ERR_001" }
});
```

---

## 6. Helper para Erros AJAX

### Problema
Erros AJAX têm estrutura específica (jqXHR, textStatus, errorThrown) e precisam ser convertidos para o formato esperado pelo tratamento de erros.

### Solução
Criar função auxiliar que enriquece erros AJAX com informações de contexto (URL, método, status HTTP, resposta do servidor).

### Código

```javascript
/**
 * Converte erro AJAX para objeto compatível com TratamentoErroComLinha
 * @param {Object} jqXHR - Objeto jQuery XHR
 * @param {string} textStatus - Status do erro
 * @param {string} errorThrown - Exceção lançada
 * @param {Object} ajaxSettings - Configurações do AJAX (use 'this' no callback)
 * @returns {Object} Objeto de erro enriquecido
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
```

**✅ Comentários:**
- Extrai mensagens de respostas JSON do servidor
- Converte respostas HTML em texto puro
- Adiciona mensagens amigáveis para códigos HTTP comuns
- Trata casos especiais (timeout, abort)
- Cria stack trace sintético para rastreamento

**Exemplo de uso:**

```javascript
$.ajax({
    url: "/api/operador",
    type: "POST",
    data: JSON.stringify(dados),
    contentType: "application/json",
    success: function(data) {
        // Sucesso
    },
    error: function(jqXHR, textStatus, errorThrown) {
        const erro = criarErroAjax(jqXHR, textStatus, errorThrown, this);
        Alerta.TratamentoErroComLinha("operador.js", "salvarOperador", erro);
    }
});
```

---

## 7. Integração com ErrorHandler

### Problema
Integrar com o sistema de tratamento de erros unificado (`ErrorHandler`) para logging centralizado e rastreamento.

### Solução
Aguardar carregamento do `ErrorHandler` e criar funções de conveniência que expõem funcionalidades adicionais.

### Código

```javascript
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
```

**✅ Comentários:**
- Aguarda até 5 segundos pelo carregamento do `ErrorHandler`
- Expõe funções de conveniência para contexto adicional
- Permite definir contexto global para todos os erros subsequentes
- Fornece acesso ao log de erros para debug

**Exemplo de uso:**

```javascript
// Adicionar contexto manual a um erro
Alerta.TratamentoErroComLinhaEnriquecido(
    "viagem.js",
    "salvarViagem",
    erro,
    {
        viagemId: 123,
        usuarioId: 456,
        timestamp: new Date().toISOString()
    }
);

// Definir contexto global
Alerta.setContextoGlobal({
    sessao: "12345",
    usuario: "João Silva"
});

// Todos os erros subsequentes terão esse contexto
Alerta.TratamentoErroComLinha("arquivo.js", "funcao", erro);

// Limpar contexto
Alerta.limparContextoGlobal();
```

---

## Fluxo de Funcionamento

### 1. Inicialização
1. Arquivo é carregado via `_ScriptsBasePlugins.cshtml`
2. Módulo IIFE executa imediatamente
3. Cria ou reutiliza `window.Alerta`
4. Expõe funções básicas (Erro, Sucesso, Info, Warning, Confirmar, etc.)
5. Inicia tentativas de integração com `ErrorHandler`

### 2. Uso de Alertas Básicos
1. Código chama `Alerta.Sucesso("Título", "Mensagem")`
2. Função verifica se `SweetAlertInterop.ShowSuccess` existe
3. Se existir, delega para `SweetAlertInterop`
4. Se não existir, registra no console e retorna Promise resolvida
5. `SweetAlertInterop` renderiza modal com design FrotiX

### 3. Tratamento de Erros
1. Código captura erro e chama `Alerta.TratamentoErroComLinha("arquivo.js", "funcao", erro)`
2. Função extrai mensagem do erro (múltiplas tentativas)
3. Converte erro para formato padronizado
4. Chama `SweetAlertInterop.ShowErrorUnexpected` com contexto completo
5. Modal exibe arquivo, método, linha e stack trace

### 4. Erros AJAX
1. Callback de erro AJAX recebe `jqXHR`, `textStatus`, `errorThrown`
2. Chama `criarErroAjax` para enriquecer erro
3. Função extrai mensagem do servidor (JSON ou HTML)
4. Adiciona informações de contexto (URL, método, status)
5. Retorna objeto enriquecido
6. Objeto é passado para `TratamentoErroComLinha`

---

## Endpoints API Resumidos

Este arquivo não faz chamadas diretas à API, mas é usado em conjunto com chamadas AJAX:

**Padrão comum:**

```javascript
$.ajax({
    url: "/api/endpoint",
    type: "POST",
    data: JSON.stringify(dados),
    contentType: "application/json",
    success: function(data) {
        if (data.success) {
            Alerta.Sucesso("Sucesso", data.message);
        } else {
            Alerta.Erro("Erro", data.message);
        }
    },
    error: function(jqXHR, textStatus, errorThrown) {
        const erro = criarErroAjax(jqXHR, textStatus, errorThrown, this);
        Alerta.TratamentoErroComLinha("arquivo.js", "funcao", erro);
    }
});
```

---

## Troubleshooting

### ❌ "SweetAlertInterop não está disponível"
**Causa:** `sweetalert_interop.js` não foi carregado antes de `alerta.js`  
**Solução:** Verificar ordem de carregamento em `_ScriptsBasePlugins.cshtml` (deve ser: `sweetalert_interop.js` → `alerta.js`)

### ❌ Erros não exibem stack trace
**Causa:** Erro não tem propriedade `stack` ou foi criado sem `new Error()`  
**Solução:** Usar `criarErroAjax` para erros AJAX ou garantir que erros sejam objetos Error

### ❌ "ErrorHandler não foi carregado"
**Causa:** `error_handler.js` não está sendo carregado ou está após `alerta.js`  
**Solução:** Verificar ordem de carregamento e garantir que `error_handler.js` existe

### ❌ Mensagens de erro aparecem como "[object Object]"
**Causa:** Erro é um objeto sem propriedades de mensagem conhecidas  
**Solução:** A função `extrairMensagem` tenta múltiplas propriedades, mas se nenhuma existir, serializa o objeto. Verificar logs do console para ver qual propriedade foi usada.

### ❌ Confirmações não retornam valor correto
**Causa:** Uso de `.then()` sem `await` ou Promise não resolvida corretamente  
**Solução:** Usar `await` ou garantir que `.then()` está sendo usado corretamente:

```javascript
// ✅ Correto
const resultado = await Alerta.Confirmar("Título", "Mensagem");

// ✅ Correto
Alerta.Confirmar("Título", "Mensagem").then(resultado => {
    if (resultado) {
        // Confirmado
    }
});

// ❌ Errado - não aguarda resolução
const resultado = Alerta.Confirmar("Título", "Mensagem"); // resultado será Promise, não boolean
```

---

## Changelog

**08/01/2026** - Versão 2.0 (Padrão FrotiX Simplificado)
- Documentação completa criada
- Integração com ErrorHandler documentada
- Helper para erros AJAX documentado
- Exemplos de uso adicionados

---

## Referências

- **SweetAlertInterop:** `wwwroot/js/sweetalert_interop.js`
- **ErrorHandler:** `wwwroot/js/error_handler.js`
- **Carregamento:** `Pages/Shared/_ScriptsBasePlugins.cshtml`
