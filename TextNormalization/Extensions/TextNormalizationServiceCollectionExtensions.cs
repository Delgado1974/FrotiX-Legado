using System; // <-- necessário para Func<,>
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting; // IHostEnvironment
using Microsoft.Extensions.Logging;

namespace FrotiX.TextNormalization.Extensions
    {
    public static class TextNormalizationServiceCollectionExtensions
        {
        /// <summary>
        /// Registra o NormalizationService (JSON como cache padrío) e aplica configuração imutável via opts.With(...).
        /// </summary>
        public static IServiceCollection AddTextNormalization(
            this IServiceCollection services,
            Func<NormalizerOptions, NormalizerOptions>? configure = null
        )
            {
            services.AddSingleton<NormalizationService>(sp =>
            {
                var env = sp.GetRequiredService<IHostEnvironment>(); // usa IHostEnvironment
                var logger = sp.GetService<ILoggerFactory>()?.CreateLogger("TextNormalization");

                var baseOpts = NormalizerOptions.Default.With(logger: msg =>
                    logger?.LogInformation("[TextNormalization] {Msg}", msg)
                );

                var opts = configure is null ? baseOpts : configure(baseOpts);

                var cachePath = System.IO.Path.Combine(env.ContentRootPath, "Cache", "proper.json");
                var cache = new JsonCacheStore(cachePath);

                return new NormalizationService(cache, opts);
            });

            return services;
            }
        }
    }


