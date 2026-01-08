using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;

namespace FrotiX.Pages.Multa
{
    public class UpsertTipoMultaModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<UpsertTipoMultaModel> _logger;
        private readonly INotyfService _notyf;

        public UpsertTipoMultaModel(
            IUnitOfWork unitOfWork ,
            ILogger<UpsertTipoMultaModel> logger ,
            INotyfService notyf
        )
        {
            try
            {
                _unitOfWork = unitOfWork;
                _logger = logger;
                _notyf = notyf;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "UpsertTipoMulta.cshtml.cs" ,
                    "UpsertTipoMultaModel" ,
                    error
                );
            }
        }

        [BindProperty]
        public Models.TipoMulta TipoMultaObj
        {
            get; set;
        }

        public IActionResult OnGet(Guid id)
        {
            try
            {
                TipoMultaObj = new Models.TipoMulta();

                if (id != Guid.Empty)
                {
                    TipoMultaObj = _unitOfWork.TipoMulta.GetFirstOrDefault(u =>
                        u.TipoMultaId == id
                    );
                    if (TipoMultaObj == null)
                    {
                        return NotFound();
                    }
                }

                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UpsertTipoMulta.cshtml.cs" , "OnGet" , error);
                return Page();
            }
        }

        public IActionResult OnPostSubmit()
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Page();
                }

                // Verifica Duplicado
                var existeTipoMulta = _unitOfWork.TipoMulta.GetFirstOrDefault(u =>
                    u.Artigo.ToUpper() == TipoMultaObj.Artigo.ToUpper()
                );

                if (TipoMultaObj.TipoMultaId != Guid.Empty && existeTipoMulta != null)
                {
                    if (TipoMultaObj.TipoMultaId != existeTipoMulta.TipoMultaId)
                    {
                        AppToast.show("Vermelho" , "Já existe esta infração cadastrada!" , 3000);
                        return Page();
                    }
                }
                else if (existeTipoMulta != null)
                {
                    AppToast.show("Vermelho" , "Já existe esta infração cadastrada!" , 3000);
                    return Page();
                }

                if (TipoMultaObj.TipoMultaId == Guid.Empty)
                {
                    _unitOfWork.TipoMulta.Add(TipoMultaObj);
                    AppToast.show("Verde" , "Infração cadastrada com sucesso!" , 3000);
                }
                else
                {
                    _unitOfWork.TipoMulta.Update(TipoMultaObj);
                    AppToast.show("Verde" , "Infração atualizada com sucesso!" , 3000);
                }
                _unitOfWork.Save();

                return RedirectToPage("./ListaTiposMulta");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UpsertTipoMulta.cshtml.cs" , "OnPostSubmit" , error);
                return RedirectToPage("./ListaTiposMulta");
            }
        }
    }
}
