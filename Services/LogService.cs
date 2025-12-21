using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace FrotiX.Services;

/// <summary>
/// Implementação do serviço de logging centralizado para FrotiWeb
/// Grava logs em arquivos diários na pasta Logs
/// </summary>
public class LogService : ILogService
{
    private readonly IWebHostEnvironment _environment;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly string _logDirectory;
    private readonly object _lockObject = new();

    // Evento disparado quando um novo erro ocorre (para notificações em tempo real)
    public event Action<string>? OnErrorOccurred;

    public LogService(IWebHostEnvironment environment, IHttpContextAccessor httpContextAccessor)
    {
        _environment = environment;
        _httpContextAccessor = httpContextAccessor;
        _logDirectory = Path.Combine(_environment.ContentRootPath, "Logs");

        // Garante que a pasta de logs existe
        if (!Directory.Exists(_logDirectory))
        {
            Directory.CreateDirectory(_logDirectory);
        }

        // Log de inicialização
        Info("LogService inicializado", "LogService.cs", "Constructor");
    }

    private string GetLogFilePath(DateTime? date = null)
    {
        var logDate = date ?? DateTime.Now;
        return Path.Combine(_logDirectory, $"frotix_log_{logDate:yyyy-MM-dd}.txt");
    }

    private string GetCurrentUser()
    {
        try
        {
            return _httpContextAccessor.HttpContext?.User?.Identity?.Name ?? "Anônimo";
        }
        catch
        {
            return "Anônimo";
        }
    }

    private string GetCurrentUrl()
    {
        try
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            if (request != null)
            {
                return $"{request.Path}{request.QueryString}";
            }
        }
        catch { }
        return "";
    }

    // ========== MÉTODOS PÚBLICOS ==========

    public void Info(string message, string? arquivo = null, string? metodo = null)
    {
        try
        {
            var sb = new StringBuilder();
            sb.Append($"[INFO] {message}");
            if (!string.IsNullOrEmpty(arquivo)) sb.Append($" | Arquivo: {arquivo}");
            if (!string.IsNullOrEmpty(metodo)) sb.Append($" | Método: {metodo}");

            WriteLog(sb.ToString());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao registrar log Info: {ex.Message}");
        }
    }

    public void Warning(string message, string? arquivo = null, string? metodo = null)
    {
        try
        {
            var sb = new StringBuilder();
            sb.Append($"[WARN] ⚠️ {message}");
            if (!string.IsNullOrEmpty(arquivo)) sb.Append($" | Arquivo: {arquivo}");
            if (!string.IsNullOrEmpty(metodo)) sb.Append($" | Método: {metodo}");

            WriteLog(sb.ToString());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao registrar log Warning: {ex.Message}");
        }
    }

    public void Error(string message, Exception? exception = null, string? arquivo = null, string? metodo = null, int? linha = null)
    {
        try
        {
            WriteLogError("ERROR", message, exception, arquivo, metodo, linha);
            OnErrorOccurred?.Invoke(message);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao registrar log Error: {ex.Message}");
        }
    }

    public void ErrorJS(string message, string? arquivo = null, string? metodo = null, int? linha = null, int? coluna = null, string? stack = null, string? userAgent = null, string? url = null)
    {
        try
        {
            var sb = new StringBuilder();
            sb.AppendLine($"[ERROR-JS] ❌ {message}");
            sb.AppendLine($"  📄 Arquivo: {arquivo ?? "(não identificado)"}");
            if (!string.IsNullOrEmpty(metodo)) sb.AppendLine($"  🔧 Função: {metodo}");
            if (linha.HasValue) sb.AppendLine($"  📍 Linha: {linha}" + (coluna.HasValue ? $", Coluna: {coluna}" : ""));
            if (!string.IsNullOrEmpty(url)) sb.AppendLine($"  🌐 URL: {url}");
            if (!string.IsNullOrEmpty(userAgent)) sb.AppendLine($"  🖥️ Browser: {userAgent}");
            sb.AppendLine($"  👤 Usuário: {GetCurrentUser()}");
            if (!string.IsNullOrEmpty(stack))
            {
                sb.AppendLine($"  📚 Stack Trace:");
                foreach (var line in stack.Split('\n').Take(10))
                {
                    sb.AppendLine($"      {line.Trim()}");
                }
            }

            WriteLog(sb.ToString());
            OnErrorOccurred?.Invoke($"[JS] {message}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao registrar log ErrorJS: {ex.Message}");
        }
    }

    public void Debug(string message, string? arquivo = null)
    {
#if DEBUG
        try
        {
            var sb = new StringBuilder();
            sb.Append($"[DEBUG] 🐛 {message}");
            if (!string.IsNullOrEmpty(arquivo)) sb.Append($" | Arquivo: {arquivo}");

            WriteLog(sb.ToString());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao registrar log Debug: {ex.Message}");
        }
#endif
    }

    public void OperationStart(string operationName, string? arquivo = null)
    {
        try
        {
            var sb = new StringBuilder();
            sb.Append($"[OPERATION] ▶️ Iniciando: {operationName}");
            if (!string.IsNullOrEmpty(arquivo)) sb.Append($" | Arquivo: {arquivo}");

            WriteLog(sb.ToString());
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao registrar início de operação: {ex.Message}");
        }
    }

    public void OperationSuccess(string operationName, string? details = null)
    {
        try
        {
            var message = $"[OPERATION] ✅ Sucesso: {operationName}";
            if (!string.IsNullOrEmpty(details))
                message += $" - {details}";

            WriteLog(message);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao registrar sucesso de operação: {ex.Message}");
        }
    }

    public void OperationFailed(string operationName, Exception exception, string? arquivo = null)
    {
        try
        {
            WriteLogError("OPERATION-FAIL", $"❌ Falha: {operationName}", exception, arquivo);
            OnErrorOccurred?.Invoke($"Falha: {operationName}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao registrar falha de operação: {ex.Message}");
        }
    }

    public void UserAction(string action, string? details = null, string? usuario = null)
    {
        try
        {
            var user = usuario ?? GetCurrentUser();
            var message = $"[USER] 👤 {user} - {action}";
            if (!string.IsNullOrEmpty(details))
                message += $" - {details}";

            WriteLog(message);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao registrar ação do usuário: {ex.Message}");
        }
    }

    public void HttpError(int statusCode, string path, string method, string? message = null, string? usuario = null)
    {
        try
        {
            var sb = new StringBuilder();
            sb.AppendLine($"[HTTP-ERROR] 🌐 Status: {statusCode}");
            sb.AppendLine($"  📍 Path: {path}");
            sb.AppendLine($"  🔧 Method: {method}");
            if (!string.IsNullOrEmpty(message)) sb.AppendLine($"  💬 Message: {message}");
            sb.AppendLine($"  👤 Usuário: {usuario ?? GetCurrentUser()}");

            WriteLog(sb.ToString());
            OnErrorOccurred?.Invoke($"[HTTP {statusCode}] {path}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao registrar HttpError: {ex.Message}");
        }
    }

    public string GetAllLogs()
    {
        try
        {
            var logPath = GetLogFilePath();
            if (File.Exists(logPath))
            {
                lock (_lockObject)
                {
                    // Lê com encoding UTF-8 explícito para suportar emojis
                    return File.ReadAllText(logPath, Encoding.UTF8);
                }
            }
            return "Nenhum log disponível para hoje.";
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao obter logs: {ex.Message}");
            return $"Erro ao obter logs: {ex.Message}";
        }
    }

    public string GetLogsByDate(DateTime date)
    {
        try
        {
            var logPath = GetLogFilePath(date);
            if (File.Exists(logPath))
            {
                lock (_lockObject)
                {
                    return File.ReadAllText(logPath);
                }
            }
            return $"Nenhum log disponível para {date:dd/MM/yyyy}.";
        }
        catch (Exception ex)
        {
            return $"Erro ao obter logs: {ex.Message}";
        }
    }

    public List<LogFileInfo> GetLogFiles()
    {
        var files = new List<LogFileInfo>();
        try
        {
            if (Directory.Exists(_logDirectory))
            {
                var logFiles = Directory.GetFiles(_logDirectory, "frotix_log_*.txt")
                    .OrderByDescending(f => f);

                foreach (var file in logFiles)
                {
                    var fileInfo = new FileInfo(file);
                    var fileName = Path.GetFileNameWithoutExtension(file);
                    var dateStr = fileName.Replace("frotix_log_", "");

                    if (DateTime.TryParse(dateStr, out var date))
                    {
                        files.Add(new LogFileInfo
                        {
                            FileName = fileInfo.Name,
                            Date = date,
                            SizeBytes = fileInfo.Length
                        });
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao listar arquivos de log: {ex.Message}");
        }
        return files;
    }

    public void ClearLogs()
    {
        try
        {
            var logPath = GetLogFilePath();
            lock (_lockObject)
            {
                if (File.Exists(logPath))
                    File.Delete(logPath);
            }
            WriteLog("========== LOGS LIMPOS ==========");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao limpar logs: {ex.Message}");
        }
    }

    public void ClearLogsBefore(DateTime date)
    {
        try
        {
            if (Directory.Exists(_logDirectory))
            {
                var logFiles = Directory.GetFiles(_logDirectory, "frotix_log_*.txt");
                foreach (var file in logFiles)
                {
                    var fileName = Path.GetFileNameWithoutExtension(file);
                    var dateStr = fileName.Replace("frotix_log_", "");

                    if (DateTime.TryParse(dateStr, out var fileDate) && fileDate < date)
                    {
                        File.Delete(file);
                    }
                }
            }
            Info($"Logs anteriores a {date:dd/MM/yyyy} foram limpos");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao limpar logs antigos: {ex.Message}");
        }
    }

    public int GetErrorCount()
    {
        try
        {
            var logs = GetAllLogs();
            if (string.IsNullOrEmpty(logs))
                return 0;

            return Regex.Matches(logs, @"\[ERROR", RegexOptions.IgnoreCase).Count;
        }
        catch
        {
            return 0;
        }
    }

    public LogStats GetStats()
    {
        var stats = new LogStats();
        try
        {
            var logs = GetAllLogs();
            if (string.IsNullOrEmpty(logs) || logs.StartsWith("Nenhum log"))
                return stats;

            var lines = logs.Split('\n', StringSplitOptions.RemoveEmptyEntries);
            
            // Regex para identificar linhas principais (com timestamp no início)
            // Formato: [HH:mm:ss.fff] [TIPO]
            var regexEntrada = new Regex(@"^\[\d{2}:\d{2}:\d{2}\.\d{3}\]\s*\[([A-Z-]+)\]");
            
            // Conta apenas linhas que são entradas principais (não linhas de detalhe)
            var entradasPrincipais = lines.Where(l => regexEntrada.IsMatch(l)).ToList();
            
            stats.TotalLogs = entradasPrincipais.Count;
            
            // Conta por tipo - apenas [ERROR] puro, não [ERROR-JS]
            stats.ErrorCount = entradasPrincipais.Count(l => 
                regexEntrada.Match(l).Groups[1].Value == "ERROR" || 
                l.Contains("[OPERATION-FAIL]"));
            
            stats.WarningCount = entradasPrincipais.Count(l => 
                regexEntrada.Match(l).Groups[1].Value == "WARN");
            
            stats.InfoCount = entradasPrincipais.Count(l => 
            {
                var match = regexEntrada.Match(l);
                var tipo = match.Success ? match.Groups[1].Value : "";
                return tipo == "INFO" || tipo == "USER" || tipo == "OPERATION" || tipo == "DEBUG";
            });
            
            stats.JSErrorCount = entradasPrincipais.Count(l => 
                regexEntrada.Match(l).Groups[1].Value == "ERROR-JS");
            
            stats.HttpErrorCount = entradasPrincipais.Count(l => 
                regexEntrada.Match(l).Groups[1].Value == "HTTP-ERROR");

            // Extrai datas do primeiro e último log
            if (entradasPrincipais.Any())
            {
                var dateRegex = new Regex(@"\[(\d{2}:\d{2}:\d{2}\.\d{3})\]");
                var firstMatch = dateRegex.Match(entradasPrincipais.First());
                var lastMatch = dateRegex.Match(entradasPrincipais.Last());

                if (firstMatch.Success)
                {
                    try
                    {
                        var timeParts = firstMatch.Groups[1].Value.Split('.');
                        stats.FirstLogDate = DateTime.Today.Add(TimeSpan.Parse(timeParts[0]));
                    }
                    catch { }
                }
                if (lastMatch.Success)
                {
                    try
                    {
                        var timeParts = lastMatch.Groups[1].Value.Split('.');
                        stats.LastLogDate = DateTime.Today.Add(TimeSpan.Parse(timeParts[0]));
                    }
                    catch { }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao calcular estatísticas: {ex.Message}");
        }
        return stats;
    }

    // ========== MÉTODOS PRIVADOS ==========

    private void WriteLog(string message)
    {
        try
        {
            var logPath = GetLogFilePath();
            var logMessage = $"[{DateTime.Now:HH:mm:ss.fff}] {message}";

            lock (_lockObject)
            {
                // Usa UTF-8 explícito para suportar emojis e caracteres especiais
                File.AppendAllText(logPath, logMessage + Environment.NewLine, Encoding.UTF8);
            }

            System.Diagnostics.Debug.WriteLine(logMessage);
        }
        catch { }
    }

    private void WriteLogError(string type, string message, Exception? exception = null, string? arquivo = null, string? metodo = null, int? linha = null)
    {
        try
        {
            var sb = new StringBuilder();
            sb.AppendLine($"[{type}] ❌ {message}");

            if (!string.IsNullOrEmpty(arquivo)) sb.AppendLine($"  📄 Arquivo: {arquivo}");
            if (!string.IsNullOrEmpty(metodo)) sb.AppendLine($"  🔧 Método: {metodo}");
            if (linha.HasValue) sb.AppendLine($"  📍 Linha: {linha}");

            var url = GetCurrentUrl();
            if (!string.IsNullOrEmpty(url)) sb.AppendLine($"  🌐 URL: {url}");

            sb.AppendLine($"  👤 Usuário: {GetCurrentUser()}");

            if (exception != null)
            {
                sb.AppendLine($"  ⚡ Exception: {exception.GetType().Name}");
                sb.AppendLine($"  💬 Message: {exception.Message}");

                // Extrai arquivo e linha do StackTrace
                if (!string.IsNullOrEmpty(exception.StackTrace))
                {
                    var stackMatch = Regex.Match(exception.StackTrace, @"in (.+):line (\d+)");
                    if (stackMatch.Success)
                    {
                        sb.AppendLine($"  📍 Local do Erro: {stackMatch.Groups[1].Value}:linha {stackMatch.Groups[2].Value}");
                    }

                    sb.AppendLine($"  📚 StackTrace:");
                    foreach (var line in exception.StackTrace.Split('\n').Take(15))
                    {
                        sb.AppendLine($"      {line.Trim()}");
                    }
                }

                if (exception.InnerException != null)
                {
                    sb.AppendLine($"  🔗 InnerException: {exception.InnerException.GetType().Name}");
                    sb.AppendLine($"     Message: {exception.InnerException.Message}");
                }
            }

            var logPath = GetLogFilePath();
            var timestamp = $"[{DateTime.Now:HH:mm:ss.fff}] ";

            lock (_lockObject)
            {
                // Usa UTF-8 explícito para suportar emojis e caracteres especiais
                File.AppendAllText(logPath, timestamp + sb.ToString() + Environment.NewLine, Encoding.UTF8);
            }

            System.Diagnostics.Debug.WriteLine(timestamp + sb.ToString());
        }
        catch { }
    }
}
