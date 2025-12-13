using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Usuarios
{
    public class IndexModel : PageModel
    {
        public void OnGet()
        {
            try
            {
                // Página carrega dados via API/DataTables
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs", "OnGet", error);
            }
        }
    }
}
