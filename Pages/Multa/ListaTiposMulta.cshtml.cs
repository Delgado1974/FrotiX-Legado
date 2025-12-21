using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Multa
{
    public class ListaTiposMultaModel : PageModel
    {
        public void OnGet()
        {
            try
            {
                // Página apenas exibe lista via DataTables AJAX
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaTiposMulta.cshtml.cs", "OnGet", error);
            }
        }
    }
}
