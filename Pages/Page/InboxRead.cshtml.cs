using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Page
{
    public class InboxReadModel : PageModel
    {
        private readonly ILogger<InboxReadModel> _logger;

        public InboxReadModel(ILogger<InboxReadModel> logger)
        {
            try
            {

                _logger = logger;
                
            }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("InboxRead.cshtml.cs", "InboxReadModel", error);
        }
}

public void OnGet()
{
    try
    {

        
    }
catch (Exception error)
{
    Alerta.TratamentoErroComLinha("InboxRead.cshtml.cs", "OnGet", error);
    return; // padronizado
}
}
}
}


