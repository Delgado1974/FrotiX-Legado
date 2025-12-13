using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;

namespace FrotiX.Pages.ModeloVeiculo
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public UpsertModel(
            IUnitOfWork unitOfWork ,
            ILogger<IndexModel> logger ,
            IWebHostEnvironment hostingEnvironment
        )
        {
            try
            {
                _unitOfWork = unitOfWork;
                _logger = logger;
                _hostingEnvironment = hostingEnvironment;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "UpsertModel" , error);
            }
        }

        [BindProperty]
        public ModeloVeiculoViewModel ModeloVeiculoObj
        {
            get; set;
        }

        private void SetViewModel()
        {
            try
            {
                ModeloVeiculoObj = new ModeloVeiculoViewModel
                {
                    MarcaList = _unitOfWork.MarcaVeiculo.GetMarcaVeiculoListForDropDown() ,
                    ModeloVeiculo = new Models.ModeloVeiculo()
                    {
                        Status = true  // ✅ CHECKBOX MARCADO POR PADríO
                    } ,
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
                    ModeloVeiculoObj.ModeloVeiculo = _unitOfWork.ModeloVeiculo.GetFirstOrDefault(u => u.ModeloId == id);
                    if (ModeloVeiculoObj == null)
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
                    SetViewModel();
                    return Page();
                }

                if (ChecaDuplicado(Guid.Empty))
                {
                    AppToast.show("Vermelho" , "Já existe este modelo para esta marca!" , 2000);
                    SetViewModel();
                    return Page();
                }

                _unitOfWork.ModeloVeiculo.Add(ModeloVeiculoObj.ModeloVeiculo);
                _unitOfWork.Save();

                AppToast.show("Verde" , "Modelo cadastrado com sucesso!" , 2000);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostSubmit" , error);
                return RedirectToPage("./Index");
            }
        }

        public IActionResult OnPostEdit(Guid id)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    SetViewModel();
                    ModeloVeiculoObj.ModeloVeiculo.ModeloId = id;
                    return Page();
                }

                ModeloVeiculoObj.ModeloVeiculo.ModeloId = id;

                if (ChecaDuplicado(ModeloVeiculoObj.ModeloVeiculo.ModeloId))
                {
                    AppToast.show("Vermelho" , "Já existe este modelo para esta marca!" , 2000);
                    SetViewModel();
                    ModeloVeiculoObj.ModeloVeiculo.ModeloId = id;
                    return Page();
                }

                _unitOfWork.ModeloVeiculo.Update(ModeloVeiculoObj.ModeloVeiculo);
                _unitOfWork.Save();

                AppToast.show("Verde" , "Modelo atualizado com sucesso!" , 2000);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostEdit" , error);
                return RedirectToPage("./Index");
            }
        }

        private bool ChecaDuplicado(Guid id)
        {
            try
            {
                var existeModelo = _unitOfWork.ModeloVeiculo.GetFirstOrDefault(u =>
                    u.DescricaoModelo.ToUpper() == ModeloVeiculoObj.ModeloVeiculo.DescricaoModelo.ToUpper()
                    && u.MarcaId == ModeloVeiculoObj.ModeloVeiculo.MarcaId
                );
                // Corrigido: Guid nunca é null, então verificamos se é Guid.Empty para novo registro
                if (id == Guid.Empty && existeModelo != null)
                {
                    return true;
                }
                if (existeModelo != null && existeModelo.ModeloId != ModeloVeiculoObj.ModeloVeiculo.ModeloId)
                {
                    return true;
                }
                return false;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "ChecaDuplicado" , error);
                return false;
            }
        }
    }
}
