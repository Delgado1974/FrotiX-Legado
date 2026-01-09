/*
    ═══════════════════════════════════════════════════════════════════════════════
    📄 DOCUMENTAÇÃO COMPLETA DISPONÍVEL
    ═══════════════════════════════════════════════════════════════════════════════
    
    📍 Localização: Documentacao/Pages/Encarregado - Index.md
    📅 Última Atualização: 08/01/2026
    📋 Versão: 2.0 (Padrão FrotiX Simplificado)
    
    Este arquivo contém o PageModel (backend) da página de listagem de Encarregados.
    Para entender completamente a funcionalidade, consulte a documentação acima.
    ═══════════════════════════════════════════════════════════════════════════════
*/

using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Encarregado
{
    public class IndexModel : PageModel
    {
        public void OnGet()
        {
            try
            {

            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs", "OnGet", error);
                return;
            }
        }
    }
}
