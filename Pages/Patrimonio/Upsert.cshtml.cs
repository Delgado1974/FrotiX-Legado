using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;
using System.IO;

namespace FrotiX.Pages.Patrimonio
{
    public class UpsertModel :PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly INotyfService _notyf;

        public static Guid patrimonioId;

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
        public PatrimonioViewModel PatrimonioObj
        {
            get; set;
        }

        private void SetViewModel()
        {
            try
            {
                PatrimonioObj = new PatrimonioViewModel
                {
                    Patrimonio = new Models.Patrimonio() ,
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

                patrimonioId = id;

                if (id != Guid.Empty)
                {
                    PatrimonioObj.Patrimonio = _unitOfWork.Patrimonio.GetFirstOrDefault(u =>
                        u.PatrimonioId == id
                    );
                    if (PatrimonioObj == null)
                    {
                        return NotFound();
                    }
                    PatrimonioObj.PatrimonioId = PatrimonioObj.Patrimonio.PatrimonioId;
                }
                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnGet" , error);
                return Page();
            }
        }

        public IActionResult OnPostSubmit(IFormFile UploadedFile)
        {
            try
            {
                //Validações:

                //Verifica se já não tem um Patrimonio com esse Id
                //====================
                if (PatrimonioObj.Patrimonio.PatrimonioId == Guid.Empty)
                {
                    if (
                        _unitOfWork.Patrimonio.GetFirstOrDefault(n =>
                            n.NPR == PatrimonioObj.Patrimonio.NPR
                        ) != null
                    )
                    {
                        ModelState.AddModelError(string.Empty , "O NPR já existe no sistema");
                        SetViewModel();
                        AppToast.show("Vermelho" , "O NPR já existe no sistema" , 3000);
                        return Page();
                    }
                    if (PatrimonioObj.Patrimonio.NPR == "")
                    {
                        ModelState.AddModelError(string.Empty , "O NPR não pode estar vazio");
                        SetViewModel();
                        AppToast.show("Vermelho" , "O NPR não pode estar vazio" , 3000);
                        return Page();
                    }
                    if (PatrimonioObj.Patrimonio.SetorId == Guid.Empty)
                    {
                        ModelState.AddModelError(string.Empty , "O setor não pode estar vazio");
                        SetViewModel();
                        AppToast.show("Vermelho" , "O setor não pode estar vazio" , 3000);
                        return Page();
                    }
                    else if (PatrimonioObj.Patrimonio.SecaoId == Guid.Empty)
                    {
                        ModelState.AddModelError(string.Empty , "A seção não pode estar vazia");
                        SetViewModel();
                        AppToast.show("Vermelho" , "A seção não pode estar vazia" , 3000);
                        return Page();
                    }
                    else if (string.IsNullOrWhiteSpace(PatrimonioObj.Patrimonio.Descricao))
                    {
                        ModelState.AddModelError(string.Empty , "A descrição não pode estar vazia");
                        SetViewModel();
                        AppToast.show("Vermelho" , "A descrição não pode estar vazia" , 3000);
                        return Page();
                    }
                    else if (PatrimonioObj.Patrimonio.Situacao == "")
                    {
                        ModelState.AddModelError(string.Empty , "A situação não pode estar vazia");
                        SetViewModel();
                        AppToast.show("Vermelho" , "A situação não pode estar vazia" , 3000);
                        return Page();
                    }

                    if (UploadedFile != null)
                    {
                        string uploadsFolder = Path.Combine(
                            _hostingEnvironment.WebRootPath ,
                            "ImagensPatrimonio"
                        );
                        Directory.CreateDirectory(uploadsFolder);

                        string uniqueFileName =
                            Guid.NewGuid().ToString() + Path.GetExtension(UploadedFile.FileName);
                        string filePath = Path.Combine(uploadsFolder , uniqueFileName);

                        using (var fileStream = new FileStream(filePath , FileMode.Create))
                        {
                            UploadedFile.CopyTo(fileStream);
                        }

                        PatrimonioObj.Patrimonio.ImageUrl = "/ImagensPatrimonio/" + uniqueFileName;
                    }

                    _unitOfWork.Patrimonio.Add(PatrimonioObj.Patrimonio);
                }
                _unitOfWork.Save();

                AppToast.show("Verde" , "Patrimônio adicionado com sucesso!" , 3000);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostSubmit" , error);
                AppToast.show("Vermelho" , "Erro ao adicionar patrimônio. Tente novamente." , 3000);
                return RedirectToPage("./Index");
            }
        }

        public IActionResult OnPostEdit(Guid id , string npratual)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    SetViewModel();
                    PatrimonioObj.Patrimonio.PatrimonioId = id;
                    return Page();
                }

                // Verificar se o NPR já existe
                var patrimonioExistente = _unitOfWork.Patrimonio.GetFirstOrDefault(n =>
                    n.NPR == PatrimonioObj.Patrimonio.NPR
                );
                if (patrimonioExistente != null && patrimonioExistente.NPR != npratual)
                {
                    ModelState.AddModelError(string.Empty , "O NPR já existe no sistema");
                    SetViewModel();
                    AppToast.show("Vermelho" , "O NPR já existe no sistema" , 3000);
                    return Page();
                }

                // Validações adicionais
                if (string.IsNullOrWhiteSpace(PatrimonioObj.Patrimonio.NPR))
                {
                    ModelState.AddModelError(string.Empty , "O NPR não pode estar vazio");
                    SetViewModel();
                    AppToast.show("Vermelho" , "O NPR não pode estar vazio" , 3000);
                    return Page();
                }
                if (PatrimonioObj.Patrimonio.SetorId == Guid.Empty)
                {
                    ModelState.AddModelError(string.Empty , "O setor não pode estar vazio");
                    SetViewModel();
                    AppToast.show("Vermelho" , "O setor não pode estar vazio" , 3000);
                    return Page();
                }
                if (PatrimonioObj.Patrimonio.SecaoId == Guid.Empty)
                {
                    ModelState.AddModelError(string.Empty , "A seção não pode estar vazia");
                    SetViewModel();
                    AppToast.show("Vermelho" , "A seção não pode estar vazia" , 3000);
                    return Page();
                }
                if (string.IsNullOrWhiteSpace(PatrimonioObj.Patrimonio.Descricao))
                {
                    ModelState.AddModelError(string.Empty , "A descrição não pode estar vazia");
                    SetViewModel();
                    AppToast.show("Vermelho" , "A descrição não pode estar vazia" , 3000);
                    return Page();
                }
                if (string.IsNullOrWhiteSpace(PatrimonioObj.Patrimonio.Situacao))
                {
                    ModelState.AddModelError(string.Empty , "A situação não pode estar vazia");
                    SetViewModel();
                    AppToast.show("Vermelho" , "A situação não pode estar vazia" , 3000);
                    return Page();
                }

                // Atualizar patrimônio
                PatrimonioObj.Patrimonio.PatrimonioId = id;

                _unitOfWork.Patrimonio.Update(PatrimonioObj.Patrimonio);
                _unitOfWork.Save();

                AppToast.show("Verde" , "Patrimônio atualizado com sucesso!" , 3000);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostEdit" , error);
                AppToast.show("Vermelho" , "Erro ao atualizar patrimônio. Tente novamente." , 3000);
                return RedirectToPage("./Index");
            }
        }
    }
}
