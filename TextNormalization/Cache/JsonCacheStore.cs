using System;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace FrotiX.TextNormalization
    {
    public sealed class JsonCacheStore : ICacheStore
        {
        private readonly string _filePath;

        public JsonCacheStore(string filePath)
            {
            _filePath = filePath ?? throw new ArgumentNullException(nameof(filePath));
            }

        public async Task<ProperCacheModel?> LoadAsync(CancellationToken ct = default)
            {
            if (!File.Exists(_filePath))
                return null;

            await using var fs = File.OpenRead(_filePath);
            return await JsonSerializer.DeserializeAsync<ProperCacheModel>(
                fs,
                cancellationToken: ct
            );
            }

        public async Task SaveAsync(ProperCacheModel model, CancellationToken ct = default)
            {
            var dir = Path.GetDirectoryName(_filePath)!;
            Directory.CreateDirectory(dir);

            var opts = new JsonSerializerOptions { WriteIndented = true };
            await using var fs = File.Create(_filePath);
            await JsonSerializer.SerializeAsync(fs, model, opts, ct);
            }
        }
    }


