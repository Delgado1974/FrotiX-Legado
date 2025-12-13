using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace FrotiX.TextNormalization
    {
    /// <summary>
    /// Seed de sobrenomes brasileiros (fallback offline).
    /// Normaliza para TitleCase e inclui variações sem acento.
    /// </summary>
    internal static class BrSurnamesSeed
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

            // ==== Sobrenomes comuns + variações com/sem acento ====
            Add(
                "Silva",
                "Santos",
                "Oliveira",
                "Souza",
                "Sousa",
                "Pereira",
                "Ferreira",
                "Alves",
                "Lima",
                "Gomes",
                "Costa",
                "Ribeiro",
                "Martins",
                "Rodrigues",
                "Carvalho",
                "Rocha",
                "Almeida",
                "Barbosa",
                "Barros",
                "Dias",
                "Pinto",
                "Teixeira",
                "Correia",
                "Moura",
                "Machado",
                "Moreira",
                "Cardoso",
                "Gonçalves",
                "Goncalves",
                "Vieira",
                "Melo",
                "Mello",
                "Araújo",
                "Araujo",
                "Nascimento",
                "Nunes",
                "Castro",
                "Campos",
                "Ramos",
                "Monteiro",
                "Batista",
                "Xavier",
                "Borges",
                "Macedo",
                "Farias",
                "Faria",
                "Prado",
                "Pires",
                "Amaral",
                "Queiroz",
                "Queiróz",
                "Neves",
                "Aguiar",
                "Peixoto",
                "Cavalcante",
                "Mendonça",
                "Mendonca",
                "Assis",
                "Medeiros",
                "Miranda",
                "Tavares",
                "Soares",
                "Sales",
                "Salles",
                "Cunha",
                "Coelho",
                "Barreto",
                "Antunes",
                "Andrade",
                "Rezende",
                "Resende",
                "Siqueira",
                "Quevedo",
                "Mota",
                "Motta",
                "Sarmento",
                "Braga",
                "Camargo",
                "Azevedo",
                "Esteves",
                "Castilho",
                "Bittencourt",
                "Bittencurti",
                "Bittencurt",
                "Rosa",
                "Lopes",
                "Leite",
                "Guimaríes",
                "Guimaraes",
                "Matos",
                "Mattos",
                "Fonseca",
                "Figueiredo",
                "Fagundes",
                "Pacheco",
                "Pedrosa",
                "Pedroso",
                "Torres",
                "Cavalcanti",
                "Albuquerque",
                "Bezerra",
                "Moraes",
                "Morais",
                "Reis",
                "Arruda",
                "Severino",
                "Navarro",
                "Santana",
                "Maia",
                "Dantas",
                "Duarte",
                "Freitas",
                "Nóbrega",
                "Nobrega",
                "Teles",
                "Telles",
                "Mesquita",
                "Delgado",
                "Porto",
                "Portela",
                "Villela",
                "Vilela",
                "Valente",
                "Valentim",
                "Cordeiro",
                "Cabral",
                "Chaves",
                "Chávez",
                "Chavez",
                "César",
                "Cesar",
                "Amorim",
                "Aranha",
                "Carneiro",
                "Cavalheiro",
                "Félix",
                "Felix",
                "Garcia",
                "Guerra",
                "Leal",
                "Lacerda",
                "Lourenço",
                "Lourenco",
                "Paiva",
                "Paixão",
                "Paixao",
                "Queiroga",
                "Sodré",
                "Sodre",
                "Toledo",
                "Trindade",
                "Vargas",
                "Vasques",
                "Vaz",
                "Viana",
                "Vidal",
                "Sant’Anna",
                "Santana",
                "Santanna",
                "Silveira",
                "Seixas",
                "Rangel",
                "Pagnoncelli",
                "Nicolau",
                "Nicolai",
                "Zimmermann",
                "Zimmerman",
                "Schmidt",
                "Schmitz",
                "Weber",
                "Klein",
                "Krause",
                "Müller",
                "Muller",
                "Hoffmann",
                "Hoffman",
                "Keller",
                "Fischer",
                "Roque",
                "Nogueira",
                "Ferraz",
                "Araújo Silva",
                "Da Silva",
                "De Souza",
                "Dos Santos",
                "Da Costa",
                "Do Nascimento",
                "Da Conceição",
                "Da Conceicao"
            );

            // ==== Versões sem acento (loop completo, sem LINQ) ====
            static string NoAccents(string s)
                {
                var norm = s.Normalize(NormalizationForm.FormD);
                var sb = new StringBuilder(s.Length);
                foreach (var ch in norm)
                    {
                    var cat = CharUnicodeInfo.GetUnicodeCategory(ch);
                    if (cat != UnicodeCategory.NonSpacingMark)
                        sb.Append(ch);
                    }
                return sb.ToString().Normalize(NormalizationForm.FormC);
                }

            var snapshot = new List<string>(set);
            foreach (var n in snapshot)
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


