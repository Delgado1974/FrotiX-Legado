using System.Threading;
using System.Threading.Tasks;

namespace FrotiX.TextNormalization
    {
    public interface ICacheStore
        {
        Task<ProperCacheModel?> LoadAsync(CancellationToken ct = default);
        Task SaveAsync(ProperCacheModel model, CancellationToken ct = default);
        }
    }


