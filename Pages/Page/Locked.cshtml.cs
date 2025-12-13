using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Page
{
    public class LockedModel : PageModel
    {
        private readonly ILogger<LockedModel> _logger;

        public LockedModel(ILogger<LockedModel> logger)
        {
            try
            {

                _logger = logger;
                
            }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("Locked.cshtml.cs", "LockedModel", error);
        }
}

public void OnGet()
{
    try
    {

        
    }
catch (Exception error)
{
    Alerta.TratamentoErroComLinha("Locked.cshtml.cs", "OnGet", error);
    return; // padronizado
}
}
}
}


