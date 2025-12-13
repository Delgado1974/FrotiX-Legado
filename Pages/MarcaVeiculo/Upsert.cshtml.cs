using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;

namespace FrotiX.Pages.MarcaVeiculo
{
    public class UpsertModel :PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;

        public UpsertModel(IUnitOfWork unitOfWork , ILogger<IndexModel> logger)
        {
            try
            {
                _unitOfWork = unitOfWork;
                _logger = logger;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "UpsertModel" , error);
            }
        }

        [BindProperty]
        public Models.MarcaVeiculo MarcaVeiculoObj
        {
            get; set;
        }

        public IActionResult OnGet(Guid id)
        {
            try
            {
                MarcaVeiculoObj = new Models.MarcaVeiculo
                {
                    Status = true  // ✅ CHECKBOX MARCADO POR PADríO
                };

                if (id != Guid.Empty)
                {
                    MarcaVeiculoObj = _unitOfWork.MarcaVeiculo.GetFirstOrDefault(u => u.MarcaId == id);
                    if (MarcaVeiculoObj == null)
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

                var existeMarca = _unitOfWork.MarcaVeiculo.GetFirstOrDefault(u => u.DescricaoMarca.ToUpper() == MarcaVeiculoObj.DescricaoMarca.ToUpper());

                if (MarcaVeiculoObj.MarcaId != Guid.Empty && existeMarca != null)
                {
                    if (MarcaVeiculoObj.MarcaId != existeMarca.MarcaId)
                    {
                        AppToast.show("Vermelho" , "Já existe esta marca cadastrada!" , 3000);
                        return Page();
                    }
                }
                else if (existeMarca != null)
                {
                    AppToast.show("Vermelho" , "Já existe esta marca cadastrada!" , 3000);
                    return Page();
                }

                if (MarcaVeiculoObj.MarcaId == Guid.Empty)
                {
                    _unitOfWork.MarcaVeiculo.Add(MarcaVeiculoObj);
                    AppToast.show("Verde" , "Marca cadastrada com sucesso!" , 3000);
                }
                else
                {
                    _unitOfWork.MarcaVeiculo.Update(MarcaVeiculoObj);
                    AppToast.show("Verde" , "Marca atualizada com sucesso!" , 3000);
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
