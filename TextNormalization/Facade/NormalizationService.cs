using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace FrotiX.TextNormalization
    {
    public sealed class NormalizationService : IAsyncDisposable
        {
        private readonly HttpClient _http;
        private readonly ProperDataRepository _repo;
        private readonly NormalizerOptions _opts;

        public NormalizationService(
            ICacheStore cacheStore,
            NormalizerOptions? options = null,
            HttpMessageHandler? handler = null
        )
            {
            _opts = options ?? NormalizerOptions.Default;
            _http = handler is null ? new HttpClient() : new HttpClient(handler);
            _repo = new ProperDataRepository(_http, cacheStore, _opts);
            }

        public async Task WarmupAsync(
            IEnumerable<string>? sampleTexts = null,
            CancellationToken ct = default
        )
            {
            _ = await _repo.GetAsync(sampleTexts, ct);
            }

        public async Task<string> NormalizeAsync(string input, CancellationToken ct = default)
            {
            var (names, acrs) = await _repo.GetAsync(null, ct);
            return SentenceCaseNormalizer.Normalize(input, names, acrs, _opts.ProperPhrases);
            }

        public ValueTask DisposeAsync()
            {
            _http.Dispose();
            return ValueTask.CompletedTask;
            }
        }
    }


