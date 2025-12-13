using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Intel
{
    public class PaginaPrincipalModel : PageModel
    {
        private readonly ILogger<PaginaPrincipalModel> _logger;

        public PaginaPrincipalModel(ILogger<PaginaPrincipalModel> logger)
        {
            try
            {

                _logger = logger;
                
            }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("PaginaPrincipal.cshtml.cs", "PaginaPrincipalModel", error);
        }
}

public void OnGet()
{
    try
    {

        
    }
catch (Exception error)
{
    Alerta.TratamentoErroComLinha("PaginaPrincipal.cshtml.cs", "OnGet", error);
    return; // padronizado
}
}
}
}


