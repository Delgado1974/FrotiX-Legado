using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Motorista
{
    public class IndexModel : PageModel
    {
        public void OnGet()
        {
            try
            {
                // Página carregada via AJAX no DataTable
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs", "OnGet", error);
                return;
            }
        }
    }
}
