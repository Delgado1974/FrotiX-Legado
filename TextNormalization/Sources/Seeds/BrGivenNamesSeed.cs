using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace FrotiX.TextNormalization
    {
    /// <summary>
    /// Seed de nomes brasileiros (fallback offline). Gera milhares de nomes combinando bases
    /// comuns (IBGE) + variações (compostos, diminutivos) + versões sem acento.
    /// </summary>
    internal static class BrGivenNamesSeed
        {
        public static IReadOnlyCollection<string> Values => _values.Value;

        private static readonly Lazy<IReadOnlyCollection<string>> _values = new(
            Build,
            isThreadSafe: true
        );

        private static IReadOnlyCollection<string> Build()
            {
            var pt = CultureInfo.GetCultureInfo("pt-BR");
            var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            void Add(params string[] items)
                {
                foreach (var s in items)
                    {
                    if (string.IsNullOrWhiteSpace(s))
                        continue;
                    var t = pt.TextInfo.ToTitleCase(s.Trim().ToLower(pt));
                    set.Add(t);
                    }
                }

            // ========= Bases femininas/masculinas (ampliadas) =========
            Add(
                // fem.
                "Ana",
                "Maria",
                "Mariana",
                "Marina",
                "Isabela",
                "Isabella",
                "Beatriz",
                "Bianca",
                "Camila",
                "Carla",
                "Carolina",
                "Catarina",
                "Cecília",
                "Cecilia",
                "Helena",
                "Alice",
                "Valentina",
                "Sophia",
                "Sofia",
                "Heloísa",
                "Heloisa",
                "Melissa",
                "Aparecida",
                "Rita",
                "Antônia",
                "Antonia",
                "Patrícia",
                "Patricia",
                "Renata",
                "Roberta",
                "Simone",
                "Sílvia",
                "Silvia",
                "Tatiane",
                "Tânia",
                "Tania",
                "Lívia",
                "Livia",
                "Olívia",
                "Olivia",
                "Mara",
                "Andria",
                "Érica",
                "Erica",
                "Elaine",
                "Aline",
                "Alessandra",
                "Gabriela",
                "Rafaela",
                "Sabrina",
                "Thaís",
                "Thais",
                "Yasmin",
                "Yasmim",
                "Júlia",
                "Julia",
                "Luana",
                "Larissa",
                "Letícia",
                "Leticia",
                // masc.
                "Alexandre",
                "Alexandra",
                "Alex",
                "Alessandro",
                "Pedro",
                "Paulo",
                "Carlos",
                "Lucas",
                "Gustavo",
                "Fernando",
                "Felipe",
                "Ricardo",
                "Rodrigo",
                "Rafael",
                "Bruno",
                "Diego",
                "Thiago",
                "Tiago",
                "Matheus",
                "Mateus",
                "Miguel",
                "Gabriel",
                "Eduardo",
                "Henrique",
                "Vitor",
                "Victor",
                "Leandro",
                "Renato",
                "Roberto",
                "Sérgio",
                "Sergio",
                "Fábio",
                "Fabio",
                "Daniel",
                "André",
                "Andre",
                "Caio",
                "Igor",
                "Iago",
                "Marcelo",
                "Marcos",
                "Antônio",
                "Antonio",
                "José",
                "Jose",
                "João",
                "Joao",
                "Luís",
                "Luis",
                "Luiz",
                "Mário",
                "Mario",
                "Otávio",
                "Otavio",
                "Vinícius",
                "Vinicius",
                "Joaquim",
                "Bernardo",
                "Heitor",
                "Davi",
                "Enzo",
                "Caíque",
                "Caique",
                "Maurício",
                "Mauricio",
                "Samuel",
                "Nathan",
                "Natan",
                "Pietro",
                "Emanuel",
                "Zé",
                "Zeca",
                "Chico",
                "Neto",
                "Júnior",
                "Junior",
                "Jr"
            );

            // ========= Combinações populares =========
            string[] segAna =
            {
                "Beatriz",
                "Carolina",
                "Clara",
                "Laura",
                "Luiza",
                "Lívia",
                "Julia",
                "Sophia",
                "Helena",
                "Cecilia",
                "Gabriela",
                "Paula",
                "Raquel",
                "Teresa",
                "Maria",
                "Alice",
                "Vitória",
                "Vitoria",
                "Isabel",
                "Isabela",
                "Carla",
                "Luana",
                "Valentina",
                "Flávia",
                "Flavia",
                "Letícia",
                "Leticia",
                "Camila",
                "Caroline",
            };
            string[] segMaria =
            {
                "Clara",
                "Eduarda",
                "Luiza",
                "Lívia",
                "Helena",
                "Alice",
                "Julia",
                "Laura",
                "Isadora",
                "Fernanda",
                "Rita",
                "Aparecida",
                "Cecilia",
                "Thereza",
                "Tereza",
                "Beatriz",
                "Carolina",
                "Paula",
                "Cristina",
                "Antonia",
                "Antônia",
                "Teresa",
                "Valentina",
                "Luana",
                "Caroline",
                "Vitória",
                "Vitoria",
                "Isabel",
            };
            string[] segJoao =
            {
                "Pedro",
                "Paulo",
                "Victor",
                "Vitor",
                "Guilherme",
                "Gabriel",
                "Miguel",
                "Felipe",
                "Lucas",
                "Henrique",
                "Carlos",
                "Antônio",
                "Antonio",
                "Marcelo",
                "Otávio",
                "Otavio",
                "Vinicius",
                "Vinícius",
                "Eduardo",
                "Ricardo",
                "Luiz",
                "Luis",
                "Lorenzo",
                "Francisco",
                "Augusto",
                "Caetano",
            };
            string[] segCarlos =
            {
                "Eduardo",
                "Alberto",
                "Henrique",
                "André",
                "Andre",
                "Daniel",
                "Roberto",
                "Augusto",
                "Miguel",
                "Alexandre",
                "Vinícius",
                "Vinicius",
                "César",
                "Cesar",
                "Antônio",
                "Antonio",
            };
            string[] segPedro =
            {
                "Henrique",
                "Lucas",
                "Miguel",
                "Paulo",
                "Afonso",
                "Augusto",
                "Arthur",
                "Luiz",
                "Luis",
                "Guilherme",
            };

            void Comb(string primeiro, IEnumerable<string> segundos)
                {
                foreach (var s in segundos)
                    Add($"{primeiro} {s}");
                }

            Comb("Ana", segAna);
            Comb("Maria", segMaria);
            Comb("João", segJoao);
            Comb("Joao", segJoao);
            Comb("Carlos", segCarlos);
            Comb("Pedro", segPedro);

            // ========= Diminutivos / apelidos (usa 'pt' => NÃO estático) =========
            string Diminutivo(string s)
                {
                if (s.EndsWith("a", true, pt))
                    return s + "zinha";
                if (s.EndsWith("o", true, pt))
                    return s + "zinho";
                return s;
                }

            // gera diminutivos a partir de um snapshot
            var snapshot1 = new List<string>(set);
            foreach (var n in snapshot1)
                {
                var dim = Diminutivo(n);
                if (!string.Equals(dim, n, StringComparison.OrdinalIgnoreCase))
                    set.Add(pt.TextInfo.ToTitleCase(dim.ToLower(pt)));
                }

            // ========= Versões sem acento (pode ser estático) =========
            static string NoAccents(string s)
                {
                var norm = s.Normalize(NormalizationForm.FormD);
                var sb = new StringBuilder(s.Length);
                foreach (var ch in norm)
                    if (CharUnicodeInfo.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark)
                        sb.Append(ch);
                return sb.ToString().Normalize(NormalizationForm.FormC);
                }

            // >>> ESTE É O LOOP QUE FALTAVA <<<
            var snapshot2 = new List<string>(set);
            foreach (var n in snapshot2)
                {
                var no = NoAccents(n);
                if (!set.Contains(no))
                    set.Add(no);
                }

            // Retorno sem LINQ
            return new List<string>(set);
            }
        }
    }


