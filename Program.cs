// Program.cs
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using FrotiX.Services;
using System;
using System.IO;

namespace FrotiX
{
    public class Program
    {
        public static void Main(string[] args)
        {
            try
            {
                // EnableTracing();
                var host = CreateHostBuilder(args).Build();

                // Configura handlers de exceção global após build
                ConfigureGlobalExceptionHandlers(host.Services);

                host.Run();
            }
            catch (Exception ex)
            {
                // Tenta logar com o serviço se disponível, senão usa o método estático
                try
                {
                    LogErrorToFile("Program.cs", "Main", ex);
                }
                catch { }

                Alerta.TratamentoErroComLinha("Program.cs", "Main", ex);
                throw;
            }
        }

        /// <summary>
        /// Configura handlers globais para exceções não tratadas
        /// </summary>
        private static void ConfigureGlobalExceptionHandlers(IServiceProvider services)
        {
            try
            {
                var logService = services.GetService<ILogService>();
                if (logService == null) return;

                // Exceções não tratadas no domínio atual
                AppDomain.CurrentDomain.UnhandledException += (sender, e) =>
                {
                    var exception = e.ExceptionObject as Exception;
                    logService.Error(
                        "ERRO NÃO TRATADO (AppDomain)",
                        exception,
                        "AppDomain",
                        "UnhandledException"
                    );
                };

                // Tasks não observadas
                System.Threading.Tasks.TaskScheduler.UnobservedTaskException += (sender, e) =>
                {
                    logService.Error(
                        "ERRO TASK NÃO OBSERVADA",
                        e.Exception,
                        "TaskScheduler",
                        "UnobservedTaskException"
                    );
                    e.SetObserved();
                };

                logService.Info("Sistema de log de erros inicializado", "Program.cs", "ConfigureGlobalExceptionHandlers");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Erro ao configurar handlers globais: {ex.Message}");
            }
        }

        /// <summary>
        /// Log de emergência direto em arquivo (quando DI não está disponível)
        /// </summary>
        private static void LogErrorToFile(string arquivo, string metodo, Exception ex)
        {
            try
            {
                var logDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Logs");
                if (!Directory.Exists(logDir))
                    Directory.CreateDirectory(logDir);

                var logPath = Path.Combine(logDir, $"frotix_log_{DateTime.Now:yyyy-MM-dd}.txt");
                var logMessage = $"[{DateTime.Now:HH:mm:ss.fff}] [ERROR] ❌ Erro crítico na inicialização\n" +
                                 $"  📄 Arquivo: {arquivo}\n" +
                                 $"  🔧 Método: {metodo}\n" +
                                 $"  ⚡ Exception: {ex.GetType().Name}\n" +
                                 $"  💬 Message: {ex.Message}\n" +
                                 $"  📚 StackTrace: {ex.StackTrace}\n\n";

                File.AppendAllText(logPath, logMessage);
            }
            catch { }
        }

        static void EnableTracing()
        {
            try
            {
                System.Diagnostics.Trace.Listeners.Add(
                    new System.Diagnostics.TextWriterTraceListener(File.CreateText("log.txt"))
                );
                System.Diagnostics.Trace.AutoFlush = true;
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("Program.cs", "EnableTracing", ex);
                throw;
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args)
        {
            try
            {
                return Host.CreateDefaultBuilder(args)
                    .ConfigureWebHostDefaults(webBuilder =>
                    {
                        webBuilder.UseStartup<Startup>();
                    });
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("Program.cs", "CreateHostBuilder", ex);

                // Fallback mínimo para satisfazer o compilador
                return Host.CreateDefaultBuilder(args)
                    .ConfigureWebHostDefaults(webBuilder =>
                    {
                        webBuilder.UseStartup<Startup>();
                    });
            }
        }
    }
}
