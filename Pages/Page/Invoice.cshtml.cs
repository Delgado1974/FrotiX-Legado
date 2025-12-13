using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Page
{
    public class InvoiceModel : PageModel
    {
        private readonly ILogger<InvoiceModel> _logger;

        public InvoiceModel(ILogger<InvoiceModel> logger)
        {
            try
            {

                _logger = logger;
                
            }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("Invoice.cshtml.cs", "InvoiceModel", error);
        }
}

public void OnGet()
{
    try
    {

        
    }
catch (Exception error)
{
    Alerta.TratamentoErroComLinha("Invoice.cshtml.cs", "OnGet", error);
    return; // padronizado
}
}
}
}


