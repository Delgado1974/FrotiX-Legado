using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Page
{
    public class InboxWriteModel : PageModel
    {
        private readonly ILogger<InboxWriteModel> _logger;

        public InboxWriteModel(ILogger<InboxWriteModel> logger)
        {
            try
            {

                _logger = logger;
                
            }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("InboxWrite.cshtml.cs", "InboxWriteModel", error);
        }
}

public void OnGet()
{
    try
    {

        
    }
catch (Exception error)
{
    Alerta.TratamentoErroComLinha("InboxWrite.cshtml.cs", "OnGet", error);
    return; // padronizado
}
}
}
}


