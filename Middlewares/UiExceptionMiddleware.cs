using System;
using System.Linq; // ← Para .Any()
using System.Net.Mime; // ← Para MediaTypeNames
using System.Text.Json;
using System.Threading.Tasks; // ← Para Task
using Microsoft.AspNetCore.Http;

namespace FrotiX.Middlewares
{
    public sealed class UiExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public UiExceptionMiddleware(RequestDelegate next)
            {
            ArgumentNullException.ThrowIfNull(next);
            _next = next;
            }

        public async Task Invoke(HttpContext http)
        {
            try
            {
                await _next(http);
            }
            catch (Exception ex)
            {
                // Usa payload já registrado (se houver) ou monta um básico
                var payload =
                    http.Items.TryGetValue("UiError", out var v) && v is not null
                        ? v
                        : new
                        {
                            Origem = "Middleware",
                            Mensagem = ex.Message,
                            Stack = ex.StackTrace,
                        };

                // Decide se a resposta deve ser JSON (AJAX/API) ou HTML (Razor/View)
                bool wantsJson = false;

                var accept = http.Request.Headers["Accept"];
                if (accept.Count > 0)
                    wantsJson = accept.Any(h =>
                        h?.Contains("application/json", StringComparison.OrdinalIgnoreCase) == true
                    );

                if (!wantsJson)
                {
                    var xrw = http.Request.Headers["X-Requested-With"];
                    if (xrw.Count > 0)
                        wantsJson = xrw.Any(h =>
                            string.Equals(h, "XMLHttpRequest", StringComparison.OrdinalIgnoreCase)
                        );
                }

                http.Response.StatusCode = StatusCodes.Status500InternalServerError;

                if (wantsJson)
                {
                    http.Response.ContentType = MediaTypeNames.Application.Json;

                    var problemJson = JsonSerializer.Serialize(
                        new
                        {
                            title = "Erro no servidor",
                            status = 500,
                            detail = payload,
                        }
                    );

                    await http.Response.WriteAsync(problemJson);
                    return; // garante que todos os caminhos retornam
                }
                else
                {
                    // HTML: redireciona para uma página de erro (que lerá TempData["UiError"])
                    http.Response.Redirect("/Erro");
                    return; // garante que todos os caminhos retornam
                }
            }
        }
    }
}
