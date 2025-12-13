using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Usuarios
{
    public class RecursosModel :PageModel
    {
        public void OnGet()
        {
            try
            {

            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Recursos.cshtml.cs" , "OnGet" , error);
                return;
            }
        }
    }
}
