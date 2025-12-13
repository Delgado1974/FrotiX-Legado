using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Abastecimentos
{
    public class ImportarModel : PageModel
    {
        public void OnGet()
        {
            try
            {
                // Página carrega dados via JavaScript
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Importacao.cshtml.cs", "OnGet", error);
            }
        }
    }
}
