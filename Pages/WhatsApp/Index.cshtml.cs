using FrotiX.Services.WhatsApp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Options;

namespace FrotiX.Pages.WhatsApp
{
    [Authorize]
    public class IndexModel : PageModel
    {
        public string DefaultSession { get; private set; }

        public IndexModel(IOptions<EvolutionApiOptions> opts)
        {
            DefaultSession = opts.Value.DefaultSession ?? "FrotiX";
        }

        public void OnGet()
        { }
    }
}
