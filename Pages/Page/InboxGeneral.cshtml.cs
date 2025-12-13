using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Page
{
    public class InboxGeneralModel : PageModel
    {
        private readonly ILogger<InboxGeneralModel> _logger;

        public InboxGeneralModel(ILogger<InboxGeneralModel> logger)
        {
            try
            {

                _logger = logger;
                
            }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("InboxGeneral.cshtml.cs", "InboxGeneralModel", error);
        }
}

public void OnGet()
{
    try
    {

        
    }
catch (Exception error)
{
    Alerta.TratamentoErroComLinha("InboxGeneral.cshtml.cs", "OnGet", error);
    return; // padronizado
}
}
}
}


