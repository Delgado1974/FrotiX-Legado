using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Threading.Tasks;

namespace FrotiX.Pages.AlertasFrotiX
{
    [Authorize]
    public class IndexModel :PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAlertasFrotiXRepository _alertasRepo;

        public IndexModel(IUnitOfWork unitOfWork , IAlertasFrotiXRepository alertasRepo)
        {
            try
            {
                _unitOfWork = unitOfWork;
                _alertasRepo = alertasRepo;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiX.cshtml.cs" , "IndexModel" , error);
            }
        }

        public async Task<IActionResult> OnGetAsync()
        {
            try
            {
                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiX.cshtml.cs" , "OnGetAsync" , error);
                TempData["erro"] = "Erro ao carregar a página de alertas";
                return Page();
            }
        }
    }
}
