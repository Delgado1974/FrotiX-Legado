/*
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                          ║
 * ║  📚 DOCUMENTAÇÃO DISPONÍVEL                                              ║
 * ║                                                                          ║
 * ║  Este arquivo está completamente documentado em:                         ║
 * ║  📄 Documentacao/Pages/Contrato - Index.md                                ║
 * ║                                                                          ║
 * ║  Última atualização: 08/01/2026                                          ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Contrato
{
    public class IndexModel : PageModel
    {
        public void OnGet()
        {
            try
            {
                // Página de listagem - dados carregados via AJAX/DataTable
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs", "OnGet", error);
            }
        }
    }
}
