using FrotiX.Helpers;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Motorista
{
    public class DashboardMotoristasModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;

        public DashboardMotoristasModel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public void OnGet()
        {
            ViewData["lstMotoristas"] = new ListaMotorista(_unitOfWork).MotoristaList();
        }
    }
}
