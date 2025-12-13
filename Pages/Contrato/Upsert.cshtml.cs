using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;

namespace FrotiX.Pages.Contrato
{
    [Consumes("application/json")]
    [IgnoreAntiforgeryToken]
    public class UpsertModel :PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly INotyfService _notyf;

        public static Guid contratoId;

        public UpsertModel(
            IUnitOfWork unitOfWork ,
            ILogger<IndexModel> logger ,
            IWebHostEnvironment hostingEnvironment ,
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
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "UpsertModel" , error);
            }
        }

        [BindProperty]
        public ContratoViewModel ContratoObj
        {
            get; set;
        }

        private void SetViewModel()
        {
            try
            {
                ContratoObj = new ContratoViewModel
                {
                    FornecedorList = _unitOfWork.Fornecedor.GetFornecedorListForDropDown() ,
                    Contrato = new Models.Contrato() ,
                };
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "SetViewModel" , error);
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
                    ContratoObj.Contrato = _unitOfWork.Contrato.GetFirstOrDefault(u =>
                        u.ContratoId == id
                    );
                    if (ContratoObj == null)
                    {
                        return NotFound();
                    }
                }
                else
                {
                    ContratoObj.Contrato.Status = true;
                }
                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnGet" , error);
                return Page();
            }
        }

        public JsonResult OnPostInsereContrato(Models.Contrato contrato)
        {
            try
            {
                var existeContrato = _unitOfWork.Contrato.GetFirstOrDefault(u =>
                    (u.AnoContrato == contrato.AnoContrato)
                    && (u.NumeroContrato == contrato.NumeroContrato)
                );
                if (existeContrato != null && existeContrato.ContratoId != contrato.ContratoId)
                {
                    _notyf.Error("Já existe um contrato com esse número!" , 3);
                    SetViewModel();
                    return new JsonResult(new
                    {
                        data = "00000000-0000-0000-0000-000000000000"
                    });
                }

                _unitOfWork.Contrato.Add(contrato);
                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = contrato.ContratoId ,
                        message = "Contrato Adicionado com Sucesso"
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostInsereContrato" , error);
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        public IActionResult OnPostEdit(Guid id)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    SetViewModel();
                    ContratoObj.Contrato.ContratoId = id;
                    return Page();
                }

                ContratoObj.Contrato.ContratoId = id;

                var existeContrato = _unitOfWork.Contrato.GetFirstOrDefault(u =>
                    (u.AnoContrato == ContratoObj.Contrato.AnoContrato)
                    && (u.NumeroContrato == ContratoObj.Contrato.NumeroContrato)
                );
                if (
                    existeContrato != null
                    && existeContrato.ContratoId != ContratoObj.Contrato.ContratoId
                )
                {
                    _notyf.Error("Já existe um contrato com esse número!" , 3);
                    SetViewModel();
                    ContratoObj.Contrato.ContratoId = id;
                    return Page();
                }

                _unitOfWork.Contrato.Update(ContratoObj.Contrato);
                _unitOfWork.Save();

                _notyf.Success("Contrato atualizado com sucesso!" , 3);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostEdit" , error);
                return RedirectToPage("./Index");
            }
        }
    }
}
