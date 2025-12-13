using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;
using System.Security.Claims;

namespace FrotiX.Pages.Intel
{
    public class AnalyticsDashboardModel :PageModel
    {
        private readonly ILogger<AnalyticsDashboardModel> _logger;
        private readonly IUnitOfWork _unitOfWork;

        public AnalyticsDashboardModel(ILogger<AnalyticsDashboardModel> logger , IUnitOfWork unitOfWork)
        {
            try
            {
                _logger = logger;
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AnalyticsDashboard.cshtml.cs" , "AnalyticsDashboardModel" , error);
            }
        }

        public void OnGet()
        {
            try
            {
                string usuarioCorrentePonto;
                // Pega o usuário corrente
                // =======================
                ClaimsPrincipal currentUser = User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                var objUsuario = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == currentUserID);
                usuarioCorrentePonto = objUsuario.Ponto;
                Settings.GlobalVariables.gPontoUsuario = objUsuario.Ponto;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AnalyticsDashboard.cshtml.cs" , "OnGet" , error);
                return;
            }
        }
    }
}
