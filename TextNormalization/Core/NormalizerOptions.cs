using System;
using System.Collections.Generic;

namespace FrotiX.TextNormalization
    {
    public sealed class NormalizerOptions
        {
        public bool UseAzureNer { get; init; } = false;
        public string? AzureEndpoint { get; init; }
        public string? AzureKey { get; init; }

        public int IbgeTopNames { get; init; } = 10000; // era 500
        public int WikidataAcronymsLimit { get; init; } = 5000;

        public TimeSpan NamesTtl { get; init; } = TimeSpan.FromDays(30);
        public TimeSpan AcronymsTtl { get; init; } = TimeSpan.FromDays(30);

        public IDictionary<string, string>? ProperPhrases { get; init; }

        public bool AutoEnableAzureNerIfEnv { get; init; } = true;
        public bool FallbackToLocalOnAzureFailure { get; init; } = true;
        public Action<string>? Logger { get; init; }

        public static NormalizerOptions Default => new();

        public NormalizerOptions With(
            bool? useAzureNer = null,
            string? azureEndpoint = null,
            string? azureKey = null,
            int? ibgeTopNames = null,
            int? wikidataAcronymsLimit = null,
            TimeSpan? namesTtl = null,
            TimeSpan? acronymsTtl = null,
            IDictionary<string, string>? properPhrases = null,
            bool? autoEnableAzureNerIfEnv = null,
            bool? fallbackToLocalOnAzureFailure = null,
            Action<string>? logger = null
        )
            {
            return new NormalizerOptions
                {
                UseAzureNer = useAzureNer ?? UseAzureNer,
                AzureEndpoint = azureEndpoint ?? AzureEndpoint,
                AzureKey = azureKey ?? AzureKey,
                IbgeTopNames = ibgeTopNames ?? IbgeTopNames,
                WikidataAcronymsLimit = wikidataAcronymsLimit ?? WikidataAcronymsLimit,
                NamesTtl = namesTtl ?? NamesTtl,
                AcronymsTtl = acronymsTtl ?? AcronymsTtl,
                ProperPhrases = properPhrases ?? ProperPhrases,
                AutoEnableAzureNerIfEnv = autoEnableAzureNerIfEnv ?? AutoEnableAzureNerIfEnv,
                FallbackToLocalOnAzureFailure =
                    fallbackToLocalOnAzureFailure ?? FallbackToLocalOnAzureFailure,
                Logger = logger ?? Logger,
                };
            }
        }
    }


