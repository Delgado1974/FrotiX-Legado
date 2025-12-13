using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Unidade
{
    public class IndexModel :PageModel
    {
        public IActionResult OnGet()
        {
            try
            {
                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "OnGet" , error);
                return Page();
            }
        }
    }
}
