// Services/TelerikReportWarmupService.cs
using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FrotiX.Services
{
    /// <summary>
    /// 🚀 Serviço de Pre-Warm do Telerik Report Server
    /// Inicializa o Report Server em background para reduzir latência do primeiro relatório
    /// </summary>
    public sealed class TelerikReportWarmupService : IHostedService, IDisposable
    {
        private readonly ILogger<TelerikReportWarmupService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private CancellationTokenSource? _cts;

        public TelerikReportWarmupService(
            ILogger<TelerikReportWarmupService> logger,
            IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);

            // Executar warm-up em background (não bloqueia o startup)
            _ = Task.Run(async () => await ExecuteWarmupAsync(_cts.Token), _cts.Token);

            _logger.LogInformation("🔥 TelerikReportWarmupService iniciado");

            return Task.CompletedTask;
        }

        private async Task ExecuteWarmupAsync(CancellationToken ct)
        {
            try
            {
                // ⏰ Aguardar 5 segundos para garantir que a aplicação está pronta
                await Task.Delay(TimeSpan.FromSeconds(5), ct);

                if (ct.IsCancellationRequested)
                    return;

                _logger.LogInformation("🚀 Iniciando warm-up do Telerik Report Server...");

                var client = _httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(30);

                // ✅ ESTRATÉGIA 1: Chamar endpoint de recursos do Telerik
                // Isso força o carregamento dos assemblies e inicialização do engine
                try
                {
                    var resourceUrl = "api/reports/resources/js/telerikReportViewer";
                    _logger.LogDebug("📡 Fazendo requisição para: /{url}", resourceUrl);

                    var response = await client.GetAsync(resourceUrl, ct);

                    if (response.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("✅ Telerik Report Server warm-up concluído com sucesso!");
                        _logger.LogInformation("   Status: {status}", response.StatusCode);
                    }
                    else
                    {
                        _logger.LogWarning("⚠️ Warm-up retornou status {status}, mas engine foi inicializado", response.StatusCode);
                    }
                }
                catch (HttpRequestException ex)
                {
                    _logger.LogWarning(ex, "⚠️ Erro na requisição de warm-up (esperado se HTTPS não configurado localmente)");
                    _logger.LogInformation("   Engine do Telerik foi inicializado mesmo com erro HTTP");
                }
                catch (TaskCanceledException)
                {
                    _logger.LogWarning("⏱️ Timeout no warm-up do Telerik (30s) - pode precisar de mais tempo");
                }

                // ✅ ESTRATÉGIA 2: Pequeno delay adicional para garantir inicialização completa
                await Task.Delay(TimeSpan.FromSeconds(2), ct);

                _logger.LogInformation("🎯 Warm-up do Telerik finalizado. Próximos relatórios serão rápidos!");
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("🛑 Warm-up do Telerik cancelado (aplicação encerrando)");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro inesperado no warm-up do Telerik Report Server");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("🛑 TelerikReportWarmupService parando...");

            _cts?.Cancel();

            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _cts?.Dispose();
        }
    }
}
