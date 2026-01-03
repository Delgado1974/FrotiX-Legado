using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Manutencao
{
    public class DashboardLavagemModel : PageModel
    {
        public void OnGet()
        {
            // Dashboard de Lavagem nao precisa de dados pre-carregados
            // Todos os dados sao carregados via API no JavaScript
        }
    }
}
