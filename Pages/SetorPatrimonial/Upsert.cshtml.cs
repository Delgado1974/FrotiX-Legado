using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;

namespace FrotiX.Pages.Setor
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly INotyfService _notyf;

        public static Guid setorId;

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
        public FrotiX.Models.Cadastros.SetorPatrimonial SetorObj
        {
            get; set;
        }

        private void SetModel()
        {
            try
            {
                SetorObj = new Models.Cadastros.SetorPatrimonial();
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
                setorId = id;

                if (id != Guid.Empty)
                {
                    SetorObj = _unitOfWork.SetorPatrimonial.GetFirstOrDefault(u => u.SetorId == id);
                    if (SetorObj == null)
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
                if (SetorObj.NomeSetor == "" || SetorObj.NomeSetor == null)
                {
                    ModelState.AddModelError(string.Empty , "O Nome do setor não pode estar vazio");
                    SetModel();
                    AppToast.show("Vermelho" , "O Nome do setor não pode estar vazio" , 3000);
                    return Page();
                }
                //Verifica se já não tem um Setor com esse Id
                //====================
                if (SetorObj.SetorId == Guid.Empty)
                {
                    if (SetorObj.DetentorId == null || SetorObj.DetentorId == "")
                    {
                        ModelState.AddModelError(string.Empty , "O detentor não pode estar vazio");
                        SetModel();
                        AppToast.show("Vermelho" , "O detentor não pode estar vazio" , 3000);
                        return Page();
                    }

                    if (SetorObj.SetorBaixa == false)
                    {
                        SetorObj.SetorBaixa = false;
                    }

                    _unitOfWork.SetorPatrimonial.Add(SetorObj);
                }
                _unitOfWork.Save();
                AppToast.show("Verde" , "Setor adicionado com sucesso!" , 3000);
                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostSubmit" , error);
                AppToast.show("Vermelho" , "Erro ao adicionar setor. Tente novamente." , 3000);
                return RedirectToPage("./Index");
            }
        }

        public IActionResult OnPostEdit(Guid id)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    SetorObj.SetorId = id;
                    return Page();
                }
                if (SetorObj.NomeSetor == "" || SetorObj.NomeSetor == null)
                {
                    ModelState.AddModelError(string.Empty , "O Nome do setor não pode estar vazio");
                    SetModel();
                    AppToast.show("Vermelho" , "O Nome do setor não pode estar vazio" , 3000);
                    return Page();
                }
                if (SetorObj.DetentorId == null || SetorObj.DetentorId == "")
                {
                    ModelState.AddModelError(string.Empty , "O detentor não pode estar vazio");
                    SetModel();
                    AppToast.show("Vermelho" , "O detentor não pode estar vazio" , 3000);
                    return Page();
                }

                SetorObj.SetorId = id;

                _unitOfWork.SetorPatrimonial.Update(SetorObj);
                _unitOfWork.Save();

                AppToast.show("Verde" , "Setor atualizado com sucesso!" , 3000);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostEdit" , error);
                AppToast.show("Vermelho" , "Erro ao atualizar setor. Tente novamente." , 3000);
                return RedirectToPage("./Index");
            }
        }
    }
}
