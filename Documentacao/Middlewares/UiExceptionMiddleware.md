# Documentação: UiExceptionMiddleware.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `UiExceptionMiddleware` é um middleware ASP.NET Core que captura exceções não tratadas e decide se deve retornar resposta JSON (para requisições AJAX/API) ou redirecionar para página de erro HTML (para requisições Razor/View).

**Principais características:**

✅ **Detecção Automática**: Detecta tipo de requisição (AJAX vs HTML)  
✅ **Resposta JSON**: Retorna JSON para requisições AJAX/API  
✅ **Redirecionamento HTML**: Redireciona para `/Erro` para views Razor  
✅ **Payload Customizado**: Suporta payload pré-registrado em `HttpContext.Items`

---

## Estrutura da Classe

### Middleware ASP.NET Core

```csharp
public sealed class UiExceptionMiddleware
{
    private readonly RequestDelegate _next;
}
```

**Padrão**: Middleware padrão do ASP.NET Core  
**Modificador**: `sealed` - não pode ser herdada

---

## Construtor

```csharp
public UiExceptionMiddleware(RequestDelegate next)
{
    ArgumentNullException.ThrowIfNull(next);
    _next = next;
}
```

**Validação**: Lança `ArgumentNullException` se `next` for null

---

## Método Principal

### `Invoke(HttpContext http)`

**Descrição**: Processa requisição e captura exceções

**Fluxo**:
1. Executa próximo middleware
2. Se exceção lançada, captura
3. Detecta tipo de requisição (JSON vs HTML)
4. Retorna resposta apropriada

---

## Funcionalidades

### 1. Captura de Exceções

```csharp
try
{
    await _next(http);
}
catch (Exception ex)
{
    // Processa exceção
}
```

**Comportamento**: Captura qualquer exceção não tratada

---

### 2. Payload Customizado

```csharp
var payload =
    http.Items.TryGetValue("UiError", out var v) && v is not null
        ? v
        : new
        {
            Origem = "Middleware",
            Mensagem = ex.Message,
            Stack = ex.StackTrace,
        };
```

**Lógica**:
- Se `HttpContext.Items["UiError"]` existe, usa esse payload
- Caso contrário, cria payload padrão com mensagem e stack trace

**Uso**: Permite que outros middlewares/controllers pré-registrem informações de erro

---

### 3. Detecção de Tipo de Requisição

```csharp
bool wantsJson = false;

// Verifica header Accept
var accept = http.Request.Headers["Accept"];
if (accept.Count > 0)
    wantsJson = accept.Any(h =>
        h?.Contains("application/json", StringComparison.OrdinalIgnoreCase) == true
    );

// Verifica header X-Requested-With (AJAX)
if (!wantsJson)
{
    var xrw = http.Request.Headers["X-Requested-With"];
    if (xrw.Count > 0)
        wantsJson = xrw.Any(h =>
            string.Equals(h, "XMLHttpRequest", StringComparison.OrdinalIgnoreCase)
        );
}
```

**Critérios**:
1. Header `Accept` contém `application/json`
2. Header `X-Requested-With` é `XMLHttpRequest`

**Resultado**: `wantsJson = true` se qualquer critério for atendido

---

### 4. Resposta JSON (AJAX/API)

```csharp
if (wantsJson)
{
    http.Response.StatusCode = StatusCodes.Status500InternalServerError;
    http.Response.ContentType = MediaTypeNames.Application.Json;

    var problemJson = JsonSerializer.Serialize(
        new
        {
            title = "Erro no servidor",
            status = 500,
            detail = payload,
        }
    );

    await http.Response.WriteAsync(problemJson);
    return;
}
```

**Formato**: RFC 7807 Problem Details (padrão para APIs)

**Estrutura JSON**:
```json
{
  "title": "Erro no servidor",
  "status": 500,
  "detail": {
    "Origem": "Middleware",
    "Mensagem": "Mensagem do erro",
    "Stack": "Stack trace completo"
  }
}
```

---

### 5. Redirecionamento HTML (Razor/View)

```csharp
else
{
    // HTML: redireciona para uma página de erro
    http.Response.Redirect("/Erro");
    return;
}
```

**Comportamento**: Redireciona para `/Erro` (página de erro do sistema)

**Nota**: A página `/Erro` deve ler `TempData["UiError"]` se necessário

---

## Interconexões

### Quem Usa Este Middleware

- **Startup.cs/Program.cs**: Registrado no pipeline HTTP
- **Página /Erro**: Recebe redirecionamentos
- **JavaScript/AJAX**: Recebe respostas JSON

### O Que Este Middleware Usa

- **Microsoft.AspNetCore.Http**: `HttpContext`, `RequestDelegate`
- **System.Text.Json**: `JsonSerializer`
- **System.Net.Mime**: `MediaTypeNames`

---

## Configuração no Pipeline

### Ordem Recomendada

```csharp
// Program.cs ou Startup.cs
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseUiExceptionMiddleware(); // ← Registrado aqui
app.UseEndpoints(...);
```

**Posição**: Após autenticação/autorização, antes dos endpoints

**Nota**: Se `UseErrorLogging()` também estiver registrado, `UiExceptionMiddleware` deve vir depois para capturar exceções que escaparam do `ErrorLoggingMiddleware`

---

## Comparação com ErrorLoggingMiddleware

| Característica | ErrorLoggingMiddleware | UiExceptionMiddleware |
|----------------|------------------------|----------------------|
| **Foco** | Logging | Resposta ao Cliente |
| **Logging** | ✅ Sim (ILogService) | ❌ Não |
| **Resposta JSON** | ❌ Não | ✅ Sim |
| **Redirecionamento** | ❌ Não | ✅ Sim |
| **Detecção AJAX** | ❌ Não | ✅ Sim |

**Uso Recomendado**: Usar ambos em conjunto:
1. `ErrorLoggingMiddleware`: Para logging
2. `UiExceptionMiddleware`: Para resposta ao cliente

---

## Exemplos de Uso

### Exemplo 1: Requisição AJAX

**Requisição**:
```javascript
fetch('/api/veiculo/123', {
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
})
```

**Resposta** (se erro):
```json
{
  "title": "Erro no servidor",
  "status": 500,
  "detail": {
    "Origem": "Middleware",
    "Mensagem": "Veículo não encontrado",
    "Stack": "..."
  }
}
```

### Exemplo 2: Requisição HTML

**Requisição**: Navegação normal do navegador

**Resposta** (se erro): Redirecionamento HTTP 302 para `/Erro`

---

## Pré-registro de Payload

### Exemplo: Controller Registra Payload

```csharp
public IActionResult MinhaAction()
{
    try
    {
        // código
    }
    catch (Exception ex)
    {
        HttpContext.Items["UiError"] = new
        {
            Origem = "MeuController",
            Mensagem = "Erro customizado",
            Stack = ex.StackTrace,
            DadosAdicionais = "Informação extra"
        };
        throw; // Middleware captura e usa payload customizado
    }
}
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do UiExceptionMiddleware

**Arquivos Afetados**:
- `Middlewares/UiExceptionMiddleware.cs`

**Impacto**: Documentação de referência para tratamento de exceções na UI

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
