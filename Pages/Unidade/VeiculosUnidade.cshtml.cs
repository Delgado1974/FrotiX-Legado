using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;

namespace FrotiX.Pages.Unidade
{
    public class VeiculosUnidadeModel :PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly INotyfService _notyf;

        public VeiculosUnidadeModel(IUnitOfWork unitOfWork , ILogger<IndexModel> logger , INotyfService notyf)
        {
            try
            {
                _unitOfWork = unitOfWork;
                _logger = logger;
                _notyf = notyf;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("VeiculosUnidade.cshtml.cs" , "VeiculosUnidadeModel" , error);
            }
        }

        public static Guid unidadeId;

        [BindProperty]
        public Models.Unidade UnidadeObj
        {
            get; set;
        }

        public IActionResult OnGet(Guid id)
        {
            try
            {
                UnidadeObj = new Models.Unidade();
                if (id != Guid.Empty)
                {
                    UnidadeObj = _unitOfWork.Unidade.GetFirstOrDefault(u => u.UnidadeId == id);
                    if (UnidadeObj == null)
                    {
                        return NotFound();
                    }
                }
                unidadeId = UnidadeObj.UnidadeId;
                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("VeiculosUnidade.cshtml.cs" , "OnGet" , error);
                return Page();
            }
        }

        public IActionResult OnPostSubmit()
        {
            try
            {
                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("VeiculosUnidade.cshtml.cs" , "OnPostSubmit" , error);
                return Page();
            }
        }
    }
}
