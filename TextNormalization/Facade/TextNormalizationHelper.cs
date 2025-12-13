using System;
using System.Threading;
using System.Threading.Tasks;

namespace FrotiX.TextNormalization
    {
    public static class TextNormalizationHelper
        {
        private static readonly object _lock = new();
        private static NormalizationService? _svc;
        private static NormalizerOptions _opts = NormalizerOptions.Default;
        private static string _jsonPath = System.IO.Path.Combine(
            AppContext.BaseDirectory,
            "Cache",
            "proper.json"
        );

        public static void Configure(
            NormalizerOptions? options = null,
            string? jsonCachePath = null
        )
            {
            lock (_lock)
                {
                _opts = options ?? NormalizerOptions.Default;
                if (!string.IsNullOrWhiteSpace(jsonCachePath))
                    _jsonPath = jsonCachePath!;
                if (_svc != null)
                    {
                    _svc.DisposeAsync().AsTask().GetAwaiter().GetResult();
                    _svc = null;
                    }
                }
            }

        private static NormalizationService EnsureService()
            {
            lock (_lock)
                {
                if (_svc == null)
                    {
#if AZURE_LANGUAGE
                    if (_opts.AutoEnableAzureNerIfEnv)
                    {
                        var ep = Environment.GetEnvironmentVariable("AZURE_LANGUAGE_ENDPOINT");
                        var key = Environment.GetEnvironmentVariable("AZURE_LANGUAGE_KEY");
                        if (
                            !string.IsNullOrWhiteSpace(ep)
                            && !string.IsNullOrWhiteSpace(key)
                            && !_opts.UseAzureNer
                        )
                        {
                            _opts = _opts.With(useAzureNer: true, azureEndpoint: ep, azureKey: key);
                            _opts.Logger?.Invoke(
                                "Azure NER habilitado automaticamente via variáveis de ambiente."
                            );
                        }
                    }
#endif
                    var cache = new JsonCacheStore(_jsonPath);
                    _svc = new NormalizationService(cache, _opts);
                    }
                return _svc;
                }
            }

        public static Task<string> NormalizeAsync(string input, CancellationToken ct = default) =>
            EnsureService().NormalizeAsync(input, ct);

        public static string Normalize(string input) =>
            NormalizeAsync(input).GetAwaiter().GetResult();
        }
    }


