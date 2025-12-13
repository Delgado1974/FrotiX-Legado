using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.MovimentacaoPatrimonio
{
    public class IndexModel :PageModel
    {
        public void OnGet()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "OnGet" , error);
                return;
            }
        }
    }
}
