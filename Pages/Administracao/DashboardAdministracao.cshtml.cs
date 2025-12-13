using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Administracao
{
    [Authorize]
    public class DashboardAdministracaoModel : PageModel
    {
        public void OnGet()
        {
        }
    }
}
