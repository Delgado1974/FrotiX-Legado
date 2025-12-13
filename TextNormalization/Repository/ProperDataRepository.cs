// TextNormalization/Repository/ProperDataRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace FrotiX.TextNormalization
    {
    /// <summary>
    /// Orquestra o carregamento de dados de nomes próprios e siglas:
    /// - IBGE (nomes)
    /// - Wikidata (siglas)
    /// - (opcional) Azure NER
    /// - Seeds offline (nomes e sobrenomes)
    ///
    /// Persiste/recupera em cache via <see cref="ICacheStore"/>.
    /// </summary>
    public sealed class ProperDataRepository
        {
        private readonly HttpClient _http;
        private readonly ICacheStore _cache;
        private readonly NormalizerOptions _opts;
        private readonly SemaphoreSlim _gate = new(1, 1);

        public ProperDataRepository(HttpClient http, ICacheStore cache, NormalizerOptions options)
            {
            _http = http ?? throw new ArgumentNullException(nameof(http));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _opts = options ?? NormalizerOptions.Default;
            }

        /// <summary>
        /// Retorna o conjunto de nomes próprios e siglas, usando cache quando válido.
        /// </summary>
        public async Task<(ISet<string> ProperNames, ISet<string> Acronyms)> GetAsync(
            IEnumerable<string>? nerWarmupTexts = null,
            CancellationToken ct = default
        )
            {
            await _gate.WaitAsync(ct);
            try
                {
                var cached = await _cache.LoadAsync(ct);
                var now = DateTimeOffset.UtcNow;

                bool namesFresh = cached is not null && (now - cached.FetchedAt) < _opts.NamesTtl;
                bool acrFresh = cached is not null && (now - cached.FetchedAt) < _opts.AcronymsTtl;

                var names = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                var acrs = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                if (cached is not null)
                    {
                    if (cached.ProperNames is not null)
                        names.UnionWith(cached.ProperNames);
                    if (cached.Acronyms is not null)
                        acrs.UnionWith(cached.Acronyms);
                    }

                if (!namesFresh || !acrFresh)
                    {
                    var (freshNames, freshAcrs) = await FetchFreshAsync(
                        nerWarmupTexts ?? Array.Empty<string>(),
                        ct
                    );

                    if (!namesFresh)
                        names = new HashSet<string>(freshNames, StringComparer.OrdinalIgnoreCase);
                    if (!acrFresh)
                        acrs = new HashSet<string>(freshAcrs, StringComparer.OrdinalIgnoreCase);

                    await _cache.SaveAsync(
                        new ProperCacheModel
                            {
                            FetchedAt = now,
                            ProperNames = new List<string>(names),
                            Acronyms = new List<string>(acrs),
                            },
                        ct
                    );
                    }

                return (names, acrs);
                }
            finally
                {
                _gate.Release();
                }
            }

        /// <summary>
        /// Busca dados “frescos” das fontes externas e seeds.
        /// </summary>
        private async Task<(ISet<string> names, ISet<string> acrs)> FetchFreshAsync(
            IEnumerable<string> nerWarmup,
            CancellationToken ct
        )
            {
            var names = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var acrs = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            // --- IBGE: primeiros N nomes (configurável via _opts.IbgeTopNames) ---
            foreach (
                var n in await NamedEntitySources.FetchBrazilianGivenNamesAsync(
                    _http,
                    _opts.IbgeTopNames,
                    ct
                )
            )
                names.Add(n);

            // --- Wikidata: siglas (short name/P1813) ---
            foreach (
                var a in await NamedEntitySources.FetchAcronymsFromWikidataAsync(
                    _http,
                    _opts.WikidataAcronymsLimit,
                    ct
                )
            )
                acrs.Add(a);

#if AZURE_LANGUAGE
            // --- Azure NER (opcional) ---
            if (
                _opts.UseAzureNer
                && !string.IsNullOrWhiteSpace(_opts.AzureEndpoint)
                && !string.IsNullOrWhiteSpace(_opts.AzureKey)
            )
            {
                try
                {
                    var detected = await NamedEntitySources.DetectProperNamesWithAzureAsync(
                        _opts.AzureEndpoint!,
                        _opts.AzureKey!,
                        nerWarmup,
                        ct
                    );
                    foreach (var n in detected)
                        names.Add(n);
                }
                catch (Exception ex)
                {
                    _opts.Logger?.Invoke(
                        $"Azure NER falhou: {ex.Message}. Prosseguindo com IBGE+Wikidata."
                    );
                    if (!_opts.FallbackToLocalOnAzureFailure)
                        throw;
                }
            }
#endif

            // --- Seeds offline: garantem boa cobertura mesmo sem internet ---
            foreach (var n in BrGivenNamesSeed.Values)
                names.Add(n);
            foreach (var s in BrSurnamesSeed.Values)
                names.Add(s);
            foreach (var a in BrAcronymsSeed.Values)
                acrs.Add(a); // <<< NOVO

            return (names, acrs);
            }
        }
    }


