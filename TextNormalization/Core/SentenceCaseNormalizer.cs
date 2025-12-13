using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace FrotiX.TextNormalization
    {
    public static class SentenceCaseNormalizer
        {
        private static readonly CultureInfo Pt = new("pt-BR");

        // Stopwords/termos funcionais – NUNCA devem ser tratadas como sigla (case-insensitive)
        private static readonly HashSet<string> AcronymStopwordsPt = new(
            StringComparer.OrdinalIgnoreCase
        )
        {
            // Artigos / contrações
            "a",
            "as",
            "o",
            "os",
            "um",
            "uma",
            "uns",
            "umas",
            "à",
            "às",
            "ao",
            "aos",
            "dum",
            "duma",
            "duns",
            "dumas",
            "num",
            "numa",
            "nuns",
            "numas",
            "do",
            "da",
            "dos",
            "das",
            "deste",
            "desta",
            "destes",
            "destas",
            "daquele",
            "daquela",
            "daqueles",
            "daquelas",
            "no",
            "na",
            "nos",
            "nas",
            "neste",
            "nesta",
            "nestes",
            "nestas",
            "naquele",
            "naquela",
            "naqueles",
            "naquelas",
            "pelo",
            "pela",
            "pelos",
            "pelas",
            "doutro",
            "doutra",
            "noutro",
            "noutra",
            // Preposições / locuções
            "de",
            "em",
            "por",
            "para",
            "pra",
            "pro",
            "perante",
            "após",
            "apos",
            "antes",
            "depois",
            "desde",
            "durante",
            "entre",
            "sem",
            "com",
            "sobre",
            "sob",
            "contra",
            "conforme",
            "segundo",
            "mediante",
            "exceto",
            "excepto",
            "salvo",
            "através",
            "atraves",
            "através de",
            "atraves de",
            "acerca",
            "acerca de",
            "ao invés de",
            "ao inves de",
            // Conjunções / conectivos
            "e",
            "ou",
            "mas",
            "porém",
            "porem",
            "todavia",
            "contudo",
            "entretanto",
            "logo",
            "portanto",
            "pois",
            "porque",
            "que",
            "se",
            "caso",
            "como",
            "quando",
            "enquanto",
            "onde",
            "quanto",
            "quanta",
            "quantos",
            "quantas",
            "senão",
            "senao",
            "quer",
            "ora",
            "já",
            "ja",
            "tampouco",
            "nem",
            "também",
            "tambem",
            "além",
            "alem",
            // Pronomes pessoais/possessivos/demonstrativos/relativos/indefinidos
            "eu",
            "tu",
            "ele",
            "ela",
            "nós",
            "nos",
            "vós",
            "vos",
            "vocês",
            "voces",
            "você",
            "voce",
            "eles",
            "elas",
            "me",
            "te",
            "se",
            "lhe",
            "lhes",
            "mim",
            "ti",
            "si",
            "conosco",
            "convosco",
            "comigo",
            "contigo",
            "consigo",
            "meu",
            "minha",
            "meus",
            "minhas",
            "teu",
            "tua",
            "teus",
            "tuas",
            "seu",
            "sua",
            "seus",
            "suas",
            "nosso",
            "nossa",
            "nossos",
            "nossas",
            "vosso",
            "vossa",
            "vossos",
            "vossas",
            "este",
            "esta",
            "estes",
            "estas",
            "esse",
            "essa",
            "esses",
            "essas",
            "aquele",
            "aquela",
            "aqueles",
            "aquelas",
            "isto",
            "isso",
            "aquilo",
            "qual",
            "quais",
            "cujo",
            "cuja",
            "cujos",
            "cujas",
            // Advérbios/comuns
            "não",
            "nao",
            "sim",
            "também",
            "tambem",
            "ainda",
            "até",
            "ate",
            "apenas",
            "só",
            "so",
            "já",
            "ja",
            "aqui",
            "aí",
            "ai",
            "ali",
            "lá",
            "la",
            "muito",
            "muita",
            "muitos",
            "muitas",
            "pouco",
            "pouca",
            "poucos",
            "poucas",
            "mais",
            "menos",
            "tanto",
            "tanta",
            "tantos",
            "tantas",
            "tão",
            "tao",
            "quase",
            "sempre",
            "nunca",
            "jamais",
            "talvez",
            "agora",
            "depois",
            "antes",
            "hoje",
            "ontem",
            "amanhã",
            "amanha",
            "cedo",
            "tarde",
            "fora",
            "dentro",
            "bem",
            "mal",
            "melhor",
            "pior",
            "longe",
            "perto",
            "assim",
            "então",
            "entao",
            "portanto",
            "logo",
            // Colloquiais / contracões usuais
            "pra",
            "pras",
            "pro",
            "pros",
            "num",
            "numa",
            "nuns",
            "numas",
            "dum",
            "duma",
            "duns",
            "dumas",
            "tá",
            "ta",
            "tô",
            "to",
            "cê",
            "ce",
            "tava",
            "tavam",
            "tô",
            "to",
            "né",
            "ne",
            "daí",
            "dai",
            // Interjeições e similares comuns
            "opa",
            "olá",
            "ola",
            "ok",
            "beleza",
            "poxa",
            "ixi",
            "eita",
            "ufa",
            // Palavras que apareceram em CAPS nos seus textos
            "muito",
            "nomes",
            "meio",
            "pra",
            "saber",
            "que",
            "ele",
            "faz",
            "no",
            "com",
            "do",
            "da",
            "dos",
            "das",
            "o",
            "a",
            // verbos comuns: evitar falsas siglas
            "faz",
            "fez",
            "fazem",
            "fazia",
            "fazer",
            "feito",
        };

        // Unidades de medida (não são siglas)
        private static readonly HashSet<string> UnitsLower = new(StringComparer.OrdinalIgnoreCase)
        {
            // distância/área/volume
            "km",
            "m",
            "cm",
            "mm",
            "µm",
            "um",
            "nm",
            "km²",
            "m²",
            "cm²",
            "mm²",
            "km2",
            "m2",
            "cm2",
            "mm2",
            "m³",
            "cm³",
            "mm³",
            "m3",
            "cm3",
            "mm3",
            "l",
            "ml",
            "µl",
            "ul",
            // massa
            "kg",
            "g",
            "mg",
            "µg",
            "ug",
            "t",
            // tempo
            "s",
            "ms",
            "µs",
            "us",
            "ns",
            "min",
            "h",
            "hr",
            "hrs",
            "dia",
            "dias",
            // eletricidade/energia/potência
            "v",
            "kv",
            "a",
            "ma",
            "ah",
            "mah",
            "w",
            "kw",
            "mw",
            "gw",
            "wh",
            "kwh",
            "mwh",
            "gwh",
            // pressão/força
            "pa",
            "kpa",
            "mpa",
            "bar",
            "psi",
            "n",
            "kn",
            "mmhg",
            // temperatura
            "°c",
            "c°",
            "°f",
            "k",
            // velocidade/taxa
            "km/h",
            "m/s",
            "l/100km",
            "rpm",
            "rps",
            // frequência
            "hz",
            "khz",
            "mhz",
            "ghz",
            "thz",
            // som
            "db",
            // dados
            "b",
            "kb",
            "mb",
            "gb",
            "tb",
            "pb",
        };

        public static string Normalize(
            string text,
            IEnumerable<string>? properNames,
            IEnumerable<string>? acronyms,
            IDictionary<string, string>? properPhrases = null
        )
            {
            if (string.IsNullOrEmpty(text))
                return text ?? string.Empty;

            // dicionário de nomes (IBGE/seed/Azure)
            var nameMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            if (properNames != null)
                foreach (var n in properNames)
                    if (!string.IsNullOrWhiteSpace(n))
                        nameMap[n.ToLower(Pt)] = n;

            // conjunto de siglas (Wikidata + seed)
            var acrSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            if (acronyms != null)
                foreach (var a in acronyms)
                    if (!string.IsNullOrWhiteSpace(a))
                        acrSet.Add(a);

            var sb = new StringBuilder(text.Length);
            var origWord = new StringBuilder();
            var normWord = new StringBuilder();

            bool capitalizeNext = true;
            bool inTag = false; // <...>
            bool inEntity = false; // &...;
            bool wordAtSentenceStart = false;

            void FlushWord()
                {
                if (origWord.Length == 0)
                    return;

                var orig = origWord.ToString();
                var lowerKey = orig.ToLower(Pt);

                if (nameMap.TryGetValue(lowerKey, out var canonical))
                    {
                    // Nome próprio conhecido
                    sb.Append(canonical);
                    }
                else if (UnitsLower.Contains(lowerKey))
                    {
                    // Unidade — já vem 'Km/ km' conforme início de sentença
                    sb.Append(normWord.ToString());
                    }
                else if (acrSet.Contains(orig) && !AcronymStopwordsPt.Contains(lowerKey))
                    {
                    // Sigla verdadeira (não bloqueada) → ALL CAPS
                    sb.Append(orig.ToUpper(Pt));
                    }
                else
                    {
                    // Palavra comum → case de sentença
                    sb.Append(normWord.ToString());
                    }

                origWord.Clear();
                normWord.Clear();
                wordAtSentenceStart = false;
                }

            for (int i = 0; i < text.Length; i++)
                {
                char ch = text[i];

                // Dentro de TAG HTML
                if (inTag)
                    {
                    sb.Append(ch);
                    if (ch == '>')
                        inTag = false;
                    continue;
                    }
                // Dentro de ENTIDADE (&nbsp; etc.)
                if (inEntity)
                    {
                    sb.Append(ch);
                    if (ch == ';')
                        inEntity = false;
                    continue;
                    }
                if (ch == '<')
                    {
                    FlushWord();
                    inTag = true;
                    sb.Append(ch);
                    continue;
                    }
                if (ch == '&')
                    {
                    FlushWord();
                    inEntity = true;
                    sb.Append(ch);
                    continue;
                    }

                // Letras (inclui LetterNumber)
                if (
                    char.IsLetter(ch)
                    || CharUnicodeInfo.GetUnicodeCategory(ch) == UnicodeCategory.LetterNumber
                )
                    {
                    origWord.Append(ch);
                    var lower = char.ToLower(ch, Pt);
                    if (normWord.Length == 0)
                        {
                        wordAtSentenceStart = capitalizeNext;
                        if (capitalizeNext)
                            {
                            normWord.Append(char.ToUpper(lower, Pt)); // 1ª maiúscula
                            capitalizeNext = false;
                            }
                        else
                            {
                            normWord.Append(lower); // meio de frase
                            }
                        }
                    else
                        {
                        normWord.Append(lower);
                        }
                    continue;
                    }

                // Hífen/apóstrofos dentro da palavra
                if (ch == '\'' || ch == '’' || ch == '-')
                    {
                    if (origWord.Length > 0)
                        {
                        origWord.Append(ch);
                        normWord.Append(ch);
                        continue;
                        }
                    }

                // Separador
                FlushWord();
                sb.Append(ch);

                // Fim de sentença ou quebra de linha
                if (IsSentenceEnd(ch) || ch == '\n')
                    capitalizeNext = true;
                }

            FlushWord();

            var result = sb.ToString();

            // Frases compostas/nomes cadastrados manualmente
            if (properPhrases is { Count: > 0 })
                {
                foreach (var kvp in properPhrases)
                    {
                    if (string.IsNullOrWhiteSpace(kvp.Key) || string.IsNullOrWhiteSpace(kvp.Value))
                        continue;
                    var pattern = $@"\b{Regex.Escape(kvp.Key)}\b";
                    result = Regex.Replace(
                        result,
                        pattern,
                        kvp.Value,
                        RegexOptions.IgnoreCase | RegexOptions.CultureInvariant
                    );
                    }
                }

            return result;
            }

        private static bool IsSentenceEnd(char ch) => ch is '.' or '!' or '?' or '…';
        }
    }


