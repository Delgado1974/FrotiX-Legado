using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
#if AZURE_LANGUAGE
using Azure.AI.TextAnalytics;
#endif

namespace FrotiX.TextNormalization
    {
    public static class NamedEntitySources
        {
        private static readonly CultureInfo Pt = new("pt-BR");

        // IBGE – top nomes (Censo)
        public static async Task<IEnumerable<string>> FetchBrazilianGivenNamesAsync(
            HttpClient http,
            int top,
            CancellationToken ct = default
        )
            {
            var urls = new[]
            {
                "https://servicodados.ibge.gov.br/api/v2/censos/nomes/ranking?localidade=BR",
                "https://servicodados.ibge.gov.br/api/v2/censos/nomes/ranking?localidade=BR&sexo=M",
                "https://servicodados.ibge.gov.br/api/v2/censos/nomes/ranking?localidade=BR&sexo=F",
                $"https://servicodados.ibge.gov.br/api/v2/censos/nomes/ranking?localidade=BR&qtd={top}",
            };

            var names = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var url in urls)
                {
                try
                    {
                    using var resp = await http.GetAsync(url, ct);
                    if (!resp.IsSuccessStatusCode)
                        continue;

                    using var doc = await JsonDocument.ParseAsync(
                        await resp.Content.ReadAsStreamAsync(ct),
                        cancellationToken: ct
                    );
                    if (doc.RootElement.ValueKind != JsonValueKind.Array)
                        continue;

                    foreach (var elem in doc.RootElement.EnumerateArray())
                        {
                        if (elem.TryGetProperty("res", out var resArr))
                            {
                            foreach (var r in resArr.EnumerateArray())
                                {
                                if (r.TryGetProperty("nome", out var nomeProp))
                                    names.Add(ToTitleCasePt(nomeProp.GetString()!));
                                if (r.TryGetProperty("ranking", out var rankingArr))
                                    foreach (var rk in rankingArr.EnumerateArray())
                                        if (rk.TryGetProperty("nome", out var nomeRk))
                                            names.Add(ToTitleCasePt(nomeRk.GetString()!));
                                }
                            }
                        if (elem.TryGetProperty("ranking", out var rankingOnly))
                            {
                            foreach (var rk in rankingOnly.EnumerateArray())
                                if (rk.TryGetProperty("nome", out var nomeRk))
                                    names.Add(ToTitleCasePt(nomeRk.GetString()!));
                            }
                        }
                    }
                catch
                    {
                    // tolerante a falhas/variações
                    }

                if (names.Count >= top)
                    break;
                }

            if (names.Count == 0)
                names.UnionWith(
                    new[]
                    {
                        "Maria",
                        "João",
                        "José",
                        "Ana",
                        "Francisco",
                        "Antônio",
                        "Paulo",
                        "Carlos",
                        "Pedro",
                        "Lucas",
                    }
                );

            return names.Take(top);
            }

        // Wikidata – siglas (P1813 short name), PT/EN, 2–10 letras A–Z
        public static async Task<IEnumerable<string>> FetchAcronymsFromWikidataAsync(
            HttpClient http,
            int limit,
            CancellationToken ct = default
        )
            {
            var sparql =
                $@"
SELECT DISTINCT (STR(?s) AS ?abbr) WHERE {{
  ?item wdt:P1813 ?s .
  FILTER(LANG(?s) = 'pt' || LANG(?s) = 'en')
  FILTER(REGEX(STR(?s), '^[A-Z]{{2,10}}$'))
}}
LIMIT {limit}";

            using var req = new HttpRequestMessage(
                HttpMethod.Post,
                "https://query.wikidata.org/sparql"
            );
            req.Headers.UserAgent.ParseAdd("FrotiX-Normalizer/1.0 (+dotnet)");
            req.Content = new StringContent(sparql);
            req.Content.Headers.ContentType = new MediaTypeHeaderValue("application/sparql-query");
            req.Headers.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/sparql-results+json")
            );

            var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            try
                {
                using var resp = await http.SendAsync(req, ct);
                if (!resp.IsSuccessStatusCode)
                    return set;

                using var doc = await JsonDocument.ParseAsync(
                    await resp.Content.ReadAsStreamAsync(ct),
                    cancellationToken: ct
                );
                var bindings = doc.RootElement.GetProperty("results").GetProperty("bindings");
                foreach (var b in bindings.EnumerateArray())
                    if (
                        b.TryGetProperty("abbr", out var v) && v.TryGetProperty("value", out var vv)
                    )
                        set.Add(vv.GetString()!.Trim());
                }
            catch
                {
                // silencioso
                }

            return set;
            }

#if AZURE_LANGUAGE
        // Azure AI Language – NER (opcional)
        public static async Task<IEnumerable<string>> DetectProperNamesWithAzureAsync(
            string endpoint,
            string key,
            IEnumerable<string> texts,
            CancellationToken ct = default
        )
        {
            var list = texts?.Where(t => !string.IsNullOrWhiteSpace(t)).ToList() ?? new();
            if (list.Count == 0)
                return Array.Empty<string>();

            var client = new TextAnalyticsClient(
                new Uri(endpoint),
                new Azure.AzureKeyCredential(key)
            );
            var response = await client.RecognizeEntitiesBatchAsync(list, cancellationToken: ct);

            var proper = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var doc in response.Value)
            {
                foreach (var e in doc.Entities)
                {
                    var cat = e.Category;
                    if (
                        cat == EntityCategory.Person
                        || cat == EntityCategory.Organization
                        || cat == EntityCategory.Location
                    )
                    {
                        proper.Add(e.Text);
                    }
                }
            }
            return proper;
        }
#endif

        private static string ToTitleCasePt(string s) =>
            CultureInfo.GetCultureInfo("pt-BR").TextInfo.ToTitleCase(s.ToLower(Pt));
        }
    }


