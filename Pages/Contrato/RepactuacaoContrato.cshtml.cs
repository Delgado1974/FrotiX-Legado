using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;

namespace FrotiX.Pages.Contrato
{
    [Consumes("application/json")]
    [IgnoreAntiforgeryToken]
    public class RepactuacaoContratoModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<RepactuacaoContratoModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly INotyfService _notyf;

        public RepactuacaoContratoModel(
            IUnitOfWork unitOfWork,
            ILogger<RepactuacaoContratoModel> logger,
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
                Alerta.TratamentoErroComLinha(
                    "RepactuacaoContrato.cshtml.cs",
                    "RepactuacaoContratoModel",
                    error
                );
            }
        }

        [BindProperty]
        public ContratoViewModel ContratoObj { get; set; }

        public IActionResult OnGet()
        {
            try
            {
                ContratoObj = new ContratoViewModel
                {
                    FornecedorList = _unitOfWork.Fornecedor.GetFornecedorListForDropDown(),
                    Contrato = new Models.Contrato()
                };

                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("RepactuacaoContrato.cshtml.cs", "OnGet", error);
                return Page();
            }
        }
    }
}
