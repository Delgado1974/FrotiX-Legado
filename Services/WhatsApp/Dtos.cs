using System;

namespace FrotiX.Services.WhatsApp
{
    public sealed class StartSessionRequest
    {
        public string Session { get; set; }
    }

    public sealed class SendTextRequest
    {
        public string Session { get; set; }
        public string PhoneE164 { get; set; } // ex.: 5591988887777
        public string Message { get; set; }
    }

    public sealed class SendMediaRequest
    {
        public string Session { get; set; }
        public string PhoneE164 { get; set; }
        public string FileName { get; set; }  // ex.: foto.jpg
        public string Caption { get; set; }
        public string Base64Data { get; set; } // "data:image/jpeg;base64,...." ou apenas base64
    }

    public sealed class ApiResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }

        public static ApiResult Ok(string msg = null) => new() { Success = true , Message = msg };

        public static ApiResult Fail(string msg) => new() { Success = false , Message = msg };
    }

    public sealed class SessionStatusDto
    {
        public string Session { get; set; }
        public string Status { get; set; } // ex.: "CONNECTED", "QRCODE", "DISCONNECTED"
        public DateTime? UpdatedAt { get; set; }
        public string QrCodeBase64 { get; set; } // se status == QRCODE
    }
}
