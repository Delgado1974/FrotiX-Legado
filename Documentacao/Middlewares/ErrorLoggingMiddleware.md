# Documentação: ErrorLoggingMiddleware.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `ErrorLoggingMiddleware` é um middleware ASP.NET Core que captura e registra erros HTTP em toda a aplicação, interceptando exceções não tratadas e erros de status HTTP (4xx e 5xx).

**Principais características:**

✅ **Captura Global**: Intercepta todas as requisições  
✅ **Logging Estruturado**: Logs detalhados com `ILogService`  
✅ **Status HTTP**: Registra erros 4xx e 5xx  
✅ **Extração de Linha**: Extrai linha do erro do stack trace  
✅ **Correlação**: Integra com sistema de logging do FrotiX

---

## Estrutura da Classe

### Middleware ASP.NET Core

```csharp
public class ErrorLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorLoggingMiddleware> _logger;
}
```

**Padrão**: Middleware padrão do ASP.NET Core

---

## Construtor

```csharp
public ErrorLoggingMiddleware(RequestDelegate next, ILogger<ErrorLoggingMiddleware> logger)
{
    _next = next;
    _logger = logger;
}
```

**Parâmetros**:
- `next`: Próximo middleware no pipeline
- `logger`: Logger para erros do próprio middleware

---

## Método Principal

### `InvokeAsync(HttpContext context, ILogService logService)`

**Descrição**: Processa requisição e captura erros

**Fluxo**:
1. Executa próximo middleware (`await _next(context)`)
2. Verifica status HTTP após execução
3. Se status >= 400, registra erro HTTP
4. Se exceção lançada, captura e registra
5. Re-lança exceção para handler padrão

---

## Funcionalidades

### 1. Captura de Erros HTTP (4xx e 5xx)

```csharp
if (context.Response.StatusCode >= 400)
{
    var statusCode = context.Response.StatusCode;
    var path = context.Request.Path.Value ?? "";
    var method = context.Request.Method;
    var message = GetStatusMessage(statusCode);

    logService.HttpError(statusCode, path, method, message);
}
```

**Registra**:
- Status code
- Path da requisição
- Método HTTP (GET, POST, etc.)
- Mensagem descritiva do status

---

### 2. Captura de Exceções Não Tratadas

```csharp
catch (Exception ex)
{
    _logger.LogError(ex, "Erro não tratado na requisição");

    // Extrai informações do erro
    var arquivo = ex.TargetSite?.DeclaringType?.FullName ?? "Desconhecido";
    var metodo = ex.TargetSite?.Name ?? "Desconhecido";
    int? linha = null;

    // Tenta extrair linha do StackTrace
    if (!string.IsNullOrEmpty(ex.StackTrace))
    {
        var match = Regex.Match(ex.StackTrace, @":line (\d+)");
        if (match.Success && int.TryParse(match.Groups[1].Value, out var l))
        {
            linha = l;
        }
    }

    logService.Error(
        $"Exceção não tratada: {ex.Message}",
        ex,
        arquivo,
        metodo,
        linha
    );

    // Registra também como erro HTTP 500
    logService.HttpError(500, context.Request.Path.Value ?? "", context.Request.Method, ex.Message);

    throw; // Re-lança para handler padrão
}
```

**Extrai**:
- Arquivo (via `TargetSite.DeclaringType`)
- Método (via `TargetSite.Name`)
- Linha (via regex no stack trace)

**Registra**:
- Erro detalhado via `logService.Error()`
- Erro HTTP 500 via `logService.HttpError()`

---

### 3. Mensagens de Status HTTP

```csharp
private static string GetStatusMessage(int statusCode)
{
    return statusCode switch
    {
        400 => "Bad Request - Requisição inválida",
        401 => "Unauthorized - Não autorizado",
        403 => "Forbidden - Acesso negado",
        404 => "Not Found - Página não encontrada",
        // ... e muitos outros
    };
}
```

**Cobertura**: 4xx e 5xx comuns

---

## Extension Method

### `UseErrorLogging(this IApplicationBuilder builder)`

**Descrição**: Facilita registro do middleware no pipeline

**Uso**:
```csharp
// Startup.cs ou Program.cs
app.UseErrorLogging();
```

**Equivalente a**:
```csharp
app.UseMiddleware<ErrorLoggingMiddleware>();
```

---

## Interconexões

### Quem Usa Este Middleware

- **Startup.cs/Program.cs**: Registrado no pipeline HTTP
- **Sistema de Logging**: Via `ILogService`

### O Que Este Middleware Usa

- **Microsoft.AspNetCore.Http**: `HttpContext`, `RequestDelegate`
- **Microsoft.Extensions.Logging**: `ILogger`
- **FrotiX.Services**: `ILogService`
- **System.Text.RegularExpressions**: Para extrair linha do stack trace

---

## Configuração no Pipeline

### Ordem Recomendada

```csharp
// Program.cs ou Startup.cs
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseErrorLogging(); // ← Registrado aqui
app.UseEndpoints(...);
```

**Posição**: Após autenticação/autorização, antes dos endpoints

---

## Exemplos de Logs Gerados

### Erro HTTP 404

```
HTTP Error 404 | path=/api/veiculo/123 | method=GET | message=Not Found - Página não encontrada
```

### Exceção Não Tratada

```
Unexpected error | arquivo=MeuController.cs | metodo=Salvar | linha=42 | 
message=Exceção não tratada: Timeout expired
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do ErrorLoggingMiddleware

**Arquivos Afetados**:
- `Middlewares/ErrorLoggingMiddleware.cs`

**Impacto**: Documentação de referência para logging de erros HTTP

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
