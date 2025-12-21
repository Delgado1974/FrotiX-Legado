using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Administracao
{
    [AllowAnonymous]
    public class LogErrosModel : PageModel
    {
        public void OnGet()
        {
            try
            {

            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("LogErros.cshtml.cs", "OnGet", error);
                return;
            }
        }
    }
}
