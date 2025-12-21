using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FrotiX.Filters;

/// <summary>
/// Filtro global para capturar exceções em Controllers MVC e API
/// Registra detalhes completos do erro incluindo arquivo, método e linha
/// </summary>
public class GlobalExceptionFilter : IExceptionFilter
{
    private readonly ILogService _logService;
    private readonly ILogger<GlobalExceptionFilter> _logger;
    private readonly IWebHostEnvironment _environment;

    public GlobalExceptionFilter(
        ILogService logService,
        ILogger<GlobalExceptionFilter> logger,
        IWebHostEnvironment environment)
    {
        _logService = logService;
        _logger = logger;
        _environment = environment;
    }

    public void OnException(ExceptionContext context)
    {
        var exception = context.Exception;

        // Extrai informações detalhadas do erro
        var arquivo = ExtractFileName(exception);
        var metodo = exception.TargetSite?.Name ?? "Desconhecido";
        var linha = ExtractLineNumber(exception);
        var controller = context.RouteData.Values["controller"]?.ToString() ?? "Unknown";
        var action = context.RouteData.Values["action"]?.ToString() ?? "Unknown";

        // Monta mensagem detalhada
        var message = $"Erro em {controller}/{action}: {exception.Message}";

        // Registra o erro
        _logService.Error(
            message,
            exception,
            arquivo,
            metodo,
            linha
        );

        _logger.LogError(exception, "Exceção capturada no controller {Controller}/{Action}", controller, action);

        // Se for requisição AJAX/API, retorna JSON
        if (IsAjaxRequest(context.HttpContext.Request) || context.HttpContext.Request.Path.StartsWithSegments("/api"))
        {
            context.Result = new JsonResult(new
            {
                success = false,
                error = _environment.IsDevelopment() ? exception.Message : "Ocorreu um erro interno. Por favor, tente novamente.",
                errorId = DateTime.Now.Ticks.ToString(),
                details = _environment.IsDevelopment() ? new
                {
                    arquivo,
                    metodo,
                    linha,
                    stackTrace = exception.StackTrace?.Split('\n').Take(5).ToArray()
                } : null
            })
            {
                StatusCode = 500
            };
            context.ExceptionHandled = true;
        }
        // Para requisições normais, deixa o handler padrão tratar
    }

    private static string ExtractFileName(Exception exception)
    {
        try
        {
            // Primeiro tenta do TargetSite
            var declaringType = exception.TargetSite?.DeclaringType;
            if (declaringType != null)
            {
                var typeName = declaringType.Name;
                var namespaceParts = declaringType.Namespace?.Split('.') ?? Array.Empty<string>();
                var lastPart = namespaceParts.LastOrDefault() ?? "";

                // Retorna algo como "Controllers/ViagemController.cs"
                return $"{lastPart}/{typeName}.cs";
            }

            // Tenta extrair do StackTrace
            if (!string.IsNullOrEmpty(exception.StackTrace))
            {
                // Padrão: "at Namespace.Class.Method() in C:\Path\File.cs:line 123"
                var match = Regex.Match(exception.StackTrace, @"in (.+\.cs):line \d+");
                if (match.Success)
                {
                    var fullPath = match.Groups[1].Value;
                    return Path.GetFileName(fullPath);
                }
            }
        }
        catch { }

        return "Arquivo não identificado";
    }

    private static int? ExtractLineNumber(Exception exception)
    {
        try
        {
            if (!string.IsNullOrEmpty(exception.StackTrace))
            {
                var match = Regex.Match(exception.StackTrace, @":line (\d+)");
                if (match.Success && int.TryParse(match.Groups[1].Value, out var line))
                {
                    return line;
                }
            }
        }
        catch { }

        return null;
    }

    private static bool IsAjaxRequest(HttpRequest request)
    {
        return request.Headers["X-Requested-With"] == "XMLHttpRequest"
            || request.Headers.Accept.ToString().Contains("application/json");
    }
}

/// <summary>
/// Filtro de exceção assíncrono para operações async
/// </summary>
public class AsyncExceptionFilter : IAsyncExceptionFilter
{
    private readonly ILogService _logService;
    private readonly ILogger<AsyncExceptionFilter> _logger;

    public AsyncExceptionFilter(ILogService logService, ILogger<AsyncExceptionFilter> logger)
    {
        _logService = logService;
        _logger = logger;
    }

    public Task OnExceptionAsync(ExceptionContext context)
    {
        var exception = context.Exception;

        // Para exceções de Task canceladas, apenas loga como warning
        if (exception is TaskCanceledException || exception is OperationCanceledException)
        {
            _logService.Warning(
                $"Operação cancelada: {context.RouteData.Values["controller"]}/{context.RouteData.Values["action"]}",
                exception.TargetSite?.DeclaringType?.Name + ".cs",
                exception.TargetSite?.Name
            );
            return Task.CompletedTask;
        }

        // Para outras exceções, o GlobalExceptionFilter vai tratar
        return Task.CompletedTask;
    }
}
