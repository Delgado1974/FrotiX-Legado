using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Usuarios
{
    public class ReportModel :PageModel
    {
        public void OnGet()
        {
            try
            {

            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Report.cshtml.cs" , "OnGet" , error);
                return;
            }
        }
    }
}
