using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;

namespace FrotiX.Pages.Secao
{
    public class UpsertModel :PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly INotyfService _notyf;

        public static Guid secaoId;

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
        public FrotiX.Models.Cadastros.SecaoPatrimonial SecaoObj
        {
            get; set;
        }

        private void SetModel()
        {
            try
            {
                SecaoObj = new Models.Cadastros.SecaoPatrimonial();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "SetModel" , error);
                return;
            }
        }

        public IActionResult OnGet(Guid id)
        {
            try
            {
                SetModel();
                secaoId = id;

                if (id != Guid.Empty)
                {
                    SecaoObj = _unitOfWork.SecaoPatrimonial.GetFirstOrDefault(u => u.SecaoId == id);
                    if (SecaoObj == null)
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
                //As validações estão no back e no front pelo JS
                //Verifica se existe um Nome da Seção
                if (SecaoObj.NomeSecao == "" || SecaoObj.NomeSecao == null)
                {
                    ModelState.AddModelError(string.Empty , "O nome da seção não pode estar vazia");
                    SetModel();
                    AppToast.show("Vermelho" , "O nome da seção não pode estar vazia" , 3000);
                    return Page();
                }
                //Verifica se já não tem um Setor com esse Id
                //====================
                if (SecaoObj.SecaoId == Guid.Empty)
                {
                    if (SecaoObj.SetorId == Guid.Empty)
                    {
                        ModelState.AddModelError(string.Empty , "O Setor não pode estar vazio");
                        SetModel();
                        AppToast.show("Vermelho" , "O Setor não pode estar vazio" , 3000);
                        return Page();
                    }

                    _unitOfWork.SecaoPatrimonial.Add(SecaoObj);
                }

                _unitOfWork.Save();
                AppToast.show("Verde" , "Seção adicionada com sucesso!" , 3000);
                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostSubmit" , error);
                AppToast.show("Vermelho" , "Erro ao adicionar seção. Tente novamente." , 3000);
                return RedirectToPage("./Index");
            }
        }

        public IActionResult OnPostEdit(Guid id)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    SetModel();
                    SecaoObj.SecaoId = id;
                    return Page();
                }

                if (SecaoObj.NomeSecao == "" || SecaoObj.NomeSecao == null)
                {
                    ModelState.AddModelError(string.Empty , "O nome da seção não pode estar vazia");
                    SetModel();
                    AppToast.show("Vermelho" , "O nome da seção não pode estar vazia" , 3000);
                    return Page();
                }
                if (SecaoObj.SetorId == Guid.Empty)
                {
                    ModelState.AddModelError(string.Empty , "O Setor não pode estar vazio");
                    SetModel();
                    AppToast.show("Vermelho" , "O Setor não pode estar vazio" , 3000);
                    return Page();
                }

                SecaoObj.SecaoId = id;

                _unitOfWork.SecaoPatrimonial.Update(SecaoObj);
                _unitOfWork.Save();

                AppToast.show("Verde" , "Seção atualizada com sucesso!" , 3000);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostEdit" , error);
                AppToast.show("Vermelho" , "Erro ao atualizar seção. Tente novamente." , 3000);
                return RedirectToPage("./Index");
            }
        }
    }
}
