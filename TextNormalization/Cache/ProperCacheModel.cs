using System;
using System.Collections.Generic;

namespace FrotiX.TextNormalization
    {
    public sealed class ProperCacheModel
        {
        public DateTimeOffset FetchedAt { get; set; }
        public List<string> ProperNames { get; set; } = new();
        public List<string> Acronyms { get; set; } = new();
        }
    }


