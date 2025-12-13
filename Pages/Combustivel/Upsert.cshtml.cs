using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;

namespace FrotiX.Pages.Combustivel
{
    public class UpsertModel :PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly INotyfService _notyf;

        public UpsertModel(IUnitOfWork unitOfWork , ILogger<IndexModel> logger , INotyfService notyf)
        {
            try
            {
                _unitOfWork = unitOfWork;
                _logger = logger;
                _notyf = notyf;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "UpsertModel.Constructor" , error);
            }
        }

        [BindProperty]
        public Models.Combustivel CombustivelObj
        {
            get; set;
        }

        public IActionResult OnGet(Guid id)
        {
            try
            {
                CombustivelObj = new Models.Combustivel();
                if (id != Guid.Empty)
                {
                    CombustivelObj = _unitOfWork.Combustivel.GetFirstOrDefault(u => u.CombustivelId == id);
                    if (CombustivelObj == null)
                    {
                        return NotFound();
                    }
                }
                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnGet" , error);
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

                // Verifica Duplicidades
                var existeCombustivel = _unitOfWork.Combustivel.GetFirstOrDefault(u =>
                    u.Descricao.ToUpper() == CombustivelObj.Descricao.ToUpper()
                );

                if (existeCombustivel != null && existeCombustivel.CombustivelId != CombustivelObj.CombustivelId)
                {
                    _notyf.Error("Já existe um combustível com esse nome!" , 3);
                    return Page();
                }

                if (CombustivelObj.CombustivelId == Guid.Empty)
                {
                    _notyf.Success("Combustível adicionado com sucesso!" , 3);
                    _unitOfWork.Combustivel.Add(CombustivelObj);
                }
                else
                {
                    _notyf.Success("Combustível atualizado com sucesso!" , 3);
                    _unitOfWork.Combustivel.Update(CombustivelObj);
                }

                _unitOfWork.Save();
                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostSubmit" , error);
                return RedirectToPage("./Index");
            }
        }
    }
}
