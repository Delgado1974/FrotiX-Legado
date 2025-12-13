using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Page
{
    public class ForumDiscussionModel : PageModel
    {
        private readonly ILogger<ForumDiscussionModel> _logger;

        public ForumDiscussionModel(ILogger<ForumDiscussionModel> logger)
        {
            try
            {

                _logger = logger;
                
            }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("ForumDiscussion.cshtml.cs", "ForumDiscussionModel", error);
        }
}

public void OnGet()
{
    try
    {

        
    }
catch (Exception error)
{
    Alerta.TratamentoErroComLinha("ForumDiscussion.cshtml.cs", "OnGet", error);
    return; // padronizado
}
}
}
}


