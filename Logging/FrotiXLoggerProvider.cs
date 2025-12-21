using System;
using System.Collections.Concurrent;
using FrotiX.Services;
using Microsoft.Extensions.Logging;

namespace FrotiX.Logging;

/// <summary>
/// Provider de logging customizado que integra com o LogService do FrotiX
/// Captura TODOS os logs do ASP.NET Core, incluindo erros de inicialização
/// </summary>
public class FrotiXLoggerProvider : ILoggerProvider
{
    private readonly ILogService _logService;
    private readonly ConcurrentDictionary<string, FrotiXLogger> _loggers = new();
    private readonly LogLevel _minimumLevel;

    public FrotiXLoggerProvider(ILogService logService, LogLevel minimumLevel = LogLevel.Warning)
    {
        _logService = logService;
        _minimumLevel = minimumLevel;
    }

    public ILogger CreateLogger(string categoryName)
    {
        return _loggers.GetOrAdd(categoryName, name => new FrotiXLogger(name, _logService, _minimumLevel));
    }

    public void Dispose()
    {
        _loggers.Clear();
    }
}

/// <summary>
/// Logger customizado que envia logs para o LogService
/// </summary>
public class FrotiXLogger : ILogger
{
    private readonly string _categoryName;
    private readonly ILogService _logService;
    private readonly LogLevel _minimumLevel;

    public FrotiXLogger(string categoryName, ILogService logService, LogLevel minimumLevel)
    {
        _categoryName = categoryName;
        _logService = logService;
        _minimumLevel = minimumLevel;
    }

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull
    {
        return null;
    }

    public bool IsEnabled(LogLevel logLevel)
    {
        return logLevel >= _minimumLevel;
    }

    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
    {
        if (!IsEnabled(logLevel))
            return;

        try
        {
            var message = formatter(state, exception);
            
            // Ignora logs muito verbosos ou internos
            if (ShouldIgnore(_categoryName, message))
                return;

            var arquivo = ExtractCategoryFile(_categoryName);

            switch (logLevel)
            {
                case LogLevel.Critical:
                case LogLevel.Error:
                    _logService.Error(
                        $"[{_categoryName}] {message}",
                        exception,
                        arquivo,
                        "ASP.NET Core"
                    );
                    break;

                case LogLevel.Warning:
                    _logService.Warning(
                        $"[{_categoryName}] {message}",
                        arquivo,
                        "ASP.NET Core"
                    );
                    break;

                case LogLevel.Information:
                    // Só loga INFO se for importante
                    if (IsImportantInfo(_categoryName, message))
                    {
                        _logService.Info(
                            $"[{_categoryName}] {message}",
                            arquivo,
                            "ASP.NET Core"
                        );
                    }
                    break;
            }
        }
        catch
        {
            // Ignora erros no próprio logger para evitar loops
        }
    }

    private static string ExtractCategoryFile(string categoryName)
    {
        // Extrai o nome do arquivo/classe da categoria
        var parts = categoryName.Split('.');
        if (parts.Length > 0)
        {
            var lastPart = parts[^1];
            return $"{lastPart}.cs";
        }
        return categoryName;
    }

    private static bool ShouldIgnore(string category, string message)
    {
        // Ignora categorias muito verbosas
        if (category.StartsWith("Microsoft.AspNetCore.Routing"))
            return true;
        if (category.StartsWith("Microsoft.AspNetCore.Mvc.Infrastructure"))
            return true;
        if (category.StartsWith("Microsoft.AspNetCore.StaticFiles"))
            return true;
        if (category.StartsWith("Microsoft.AspNetCore.Hosting.Diagnostics"))
            return true;
        if (category.StartsWith("Microsoft.EntityFrameworkCore.Query"))
            return true;
        if (category.StartsWith("Microsoft.EntityFrameworkCore.Database.Command"))
            return true;

        // Ignora mensagens específicas
        if (message.Contains("Executing endpoint"))
            return true;
        if (message.Contains("Request starting"))
            return true;
        if (message.Contains("Request finished"))
            return true;

        return false;
    }

    private static bool IsImportantInfo(string category, string message)
    {
        // Loga INFO apenas para categorias importantes
        if (category.StartsWith("FrotiX"))
            return true;
        if (message.Contains("started") || message.Contains("initialized"))
            return true;
        if (message.Contains("failed") || message.Contains("error"))
            return true;

        return false;
    }
}

/// <summary>
/// Extensions para registrar o FrotiXLoggerProvider
/// </summary>
public static class FrotiXLoggerExtensions
{
    public static ILoggingBuilder AddFrotiXLogger(this ILoggingBuilder builder, ILogService logService, LogLevel minimumLevel = LogLevel.Warning)
    {
        builder.AddProvider(new FrotiXLoggerProvider(logService, minimumLevel));
        return builder;
    }
}
