using System;
using System.Collections.Generic;

namespace FrotiX.Services;

/// <summary>
/// Serviço de logging centralizado para toda a aplicação FrotiWeb
/// Captura erros de: Razor Pages (.cshtml/.cs), Controllers, Services, Helpers e JavaScript
/// </summary>
public interface ILogService
{
    /// <summary>
    /// Registra uma mensagem informativa
    /// </summary>
    void Info(string message, string? arquivo = null, string? metodo = null);

    /// <summary>
    /// Registra um aviso
    /// </summary>
    void Warning(string message, string? arquivo = null, string? metodo = null);

    /// <summary>
    /// Registra um erro com exceção opcional
    /// </summary>
    void Error(string message, Exception? exception = null, string? arquivo = null, string? metodo = null, int? linha = null);

    /// <summary>
    /// Registra erro de JavaScript (client-side)
    /// </summary>
    void ErrorJS(string message, string? arquivo = null, string? metodo = null, int? linha = null, int? coluna = null, string? stack = null, string? userAgent = null, string? url = null);

    /// <summary>
    /// Registra uma mensagem de debug (apenas em modo DEBUG)
    /// </summary>
    void Debug(string message, string? arquivo = null);

    /// <summary>
    /// Registra o início de uma operação
    /// </summary>
    void OperationStart(string operationName, string? arquivo = null);

    /// <summary>
    /// Registra o sucesso de uma operação
    /// </summary>
    void OperationSuccess(string operationName, string? details = null);

    /// <summary>
    /// Registra a falha de uma operação
    /// </summary>
    void OperationFailed(string operationName, Exception exception, string? arquivo = null);

    /// <summary>
    /// Registra uma ação do usuário
    /// </summary>
    void UserAction(string action, string? details = null, string? usuario = null);

    /// <summary>
    /// Registra erro de requisição HTTP
    /// </summary>
    void HttpError(int statusCode, string path, string method, string? message = null, string? usuario = null);

    /// <summary>
    /// Obtém todos os logs
    /// </summary>
    string GetAllLogs();

    /// <summary>
    /// Obtém logs filtrados por data
    /// </summary>
    string GetLogsByDate(DateTime date);

    /// <summary>
    /// Obtém lista de arquivos de log disponíveis
    /// </summary>
    List<LogFileInfo> GetLogFiles();

    /// <summary>
    /// Limpa todos os logs
    /// </summary>
    void ClearLogs();

    /// <summary>
    /// Limpa logs anteriores a uma data
    /// </summary>
    void ClearLogsBefore(DateTime date);

    /// <summary>
    /// Obtém a contagem atual de erros
    /// </summary>
    int GetErrorCount();

    /// <summary>
    /// Obtém estatísticas dos logs
    /// </summary>
    LogStats GetStats();
}

/// <summary>
/// Informações sobre arquivo de log
/// </summary>
public class LogFileInfo
{
    public string FileName { get; set; } = "";
    public DateTime Date { get; set; }
    public long SizeBytes { get; set; }
    public string SizeFormatted => FormatSize(SizeBytes);

    private static string FormatSize(long bytes)
    {
        if (bytes < 1024) return $"{bytes} B";
        if (bytes < 1024 * 1024) return $"{bytes / 1024.0:F1} KB";
        return $"{bytes / (1024.0 * 1024.0):F1} MB";
    }
}

/// <summary>
/// Estatísticas dos logs
/// </summary>
public class LogStats
{
    public int TotalLogs { get; set; }
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
    public int InfoCount { get; set; }
    public int JSErrorCount { get; set; }
    public int HttpErrorCount { get; set; }
    public DateTime? FirstLogDate { get; set; }
    public DateTime? LastLogDate { get; set; }
}
