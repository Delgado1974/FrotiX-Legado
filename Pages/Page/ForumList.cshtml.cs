using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Page
{
    public class ForumListModel : PageModel
    {
        private readonly ILogger<ForumListModel> _logger;

        public ForumListModel(ILogger<ForumListModel> logger)
        {
            try
            {

                _logger = logger;
                
            }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("ForumList.cshtml.cs", "ForumListModel", error);
        }
}

public void OnGet()
{
    try
    {

        
    }
catch (Exception error)
{
    Alerta.TratamentoErroComLinha("ForumList.cshtml.cs", "OnGet", error);
    return; // padronizado
}
}
}
}


