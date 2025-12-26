using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;

namespace FrotiX.Pages.NotaFiscal
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly INotyfService _notyf;

        public UpsertModel(
            IUnitOfWork unitOfWork,
            ILogger<IndexModel> logger,
            IWebHostEnvironment hostingEnvironment,
            INotyfService notyf
        )
        {
            try
            {
                _unitOfWork = unitOfWork;
                _logger = logger;
                _hostingEnvironment = hostingEnvironment;
                _notyf = notyf;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "UpsertModel", error);
            }
        }

        [BindProperty]
        public NotaFiscalViewModel NotaFiscalObj { get; set; }

        private void SetViewModel()
        {
            try
            {
                NotaFiscalObj = new NotaFiscalViewModel
                {
                    ContratoList = _unitOfWork.Contrato.GetDropDown(""),
                    AtaList = _unitOfWork.AtaRegistroPrecos.GetAtaListForDropDown(1),
                    NotaFiscal = new Models.NotaFiscal(),
                };
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "SetViewModel", error);
                return;
            }
        }

        public IActionResult OnGet(Guid id)
        {
            try
            {
                SetViewModel();

                if (id != Guid.Empty)
                {
                    NotaFiscalObj.NotaFiscal = _unitOfWork.NotaFiscal.GetFirstOrDefault(u =>
                        u.NotaFiscalId == id
                    );
                    if (NotaFiscalObj.NotaFiscal == null)
                    {
                        return NotFound();
                    }
                }
                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "OnGet", error);
                return Page();
            }
        }
    }
}
