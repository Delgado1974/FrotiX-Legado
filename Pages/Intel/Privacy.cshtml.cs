using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Intel
{
    public class PrivacyModel : PageModel
    {
        private readonly ILogger<PrivacyModel> _logger;

        public PrivacyModel(ILogger<PrivacyModel> logger)
        {
            try
            {

                _logger = logger;
                
            }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("Privacy.cshtml.cs", "PrivacyModel", error);
        }
}

public void OnGet()
{
    try
    {

        
    }
catch (Exception error)
{
    Alerta.TratamentoErroComLinha("Privacy.cshtml.cs", "OnGet", error);
    return; // padronizado
}
}
}
}


