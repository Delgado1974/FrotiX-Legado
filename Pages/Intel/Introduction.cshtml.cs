using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Intel
{
    public class IntroductionModel : PageModel
    {
        private readonly ILogger<IntroductionModel> _logger;

        public IntroductionModel(ILogger<IntroductionModel> logger)
        {
            try
            {

                _logger = logger;
                
            }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("Introduction.cshtml.cs", "IntroductionModel", error);
        }
}

public void OnGet()
{
    try
    {

        
    }
catch (Exception error)
{
    Alerta.TratamentoErroComLinha("Introduction.cshtml.cs", "OnGet", error);
    return; // padronizado
}
}
}
}


