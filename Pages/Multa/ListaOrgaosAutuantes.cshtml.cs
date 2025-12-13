using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Multa
{
    public class ListaOrgaosAutuantesModel :PageModel
    {
        public void OnGet()
        {
            try
            {
                // Método vazio - lógica no JavaScript
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ListaOrgaosAutuantes.cshtml.cs" , "OnGet" , error);
                return;
            }
        }
    }
}
