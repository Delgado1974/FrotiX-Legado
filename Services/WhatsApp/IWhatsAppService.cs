using System.Threading;
using System.Threading.Tasks;

namespace FrotiX.Services.WhatsApp
{
    public interface IWhatsAppService
    {
        Task<ApiResult> StartSessionAsync(string session , CancellationToken ct = default);

        Task<SessionStatusDto> GetStatusAsync(string session , CancellationToken ct = default);

        Task<string> GetQrBase64Async(string session , CancellationToken ct = default);

        Task<ApiResult> SendTextAsync(string session , string phoneE164 , string message , CancellationToken ct = default);

        Task<ApiResult> SendMediaAsync(string session , string phoneE164 , string fileName , string base64Data , string caption = null , CancellationToken ct = default);
    }
}
