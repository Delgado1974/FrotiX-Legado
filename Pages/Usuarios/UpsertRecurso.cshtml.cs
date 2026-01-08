using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;

namespace FrotiX.Pages.Usuarios
{
    public class UpsertRecursoModel :PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly INotyfService _notyf;

        public static Guid recursoId;
        public static byte[] FotoRecurso;

        public UpsertRecursoModel(
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
                Alerta.TratamentoErroComLinha("UpsertRecurso.cshtml.cs" , "UpsertRecursoModel" , error);
            }
        }

        [BindProperty]
        public RecursoViewModel RecursoObj
        {
            get; set;
        }

        private void SetViewModel()
        {
            try
            {
                RecursoObj = new RecursoViewModel { Recurso = new Models.Recurso() };
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UpsertRecurso.cshtml.cs" , "SetViewModel" , error);
                return;
            }
        }

        public IActionResult OnGet(Guid id)
        {
            try
            {
                SetViewModel();

                recursoId = id;

                if (id != Guid.Empty)
                {
                    RecursoObj.Recurso = _unitOfWork.Recurso.GetFirstOrDefault(u => u.RecursoId == id);

                    if (RecursoObj == null)
                    {
                        return NotFound();
                    }
                }

                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UpsertRecurso.cshtml.cs" , "OnGet" , error);
                return Page();
            }
        }

        public IActionResult OnPostSubmit()
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    foreach (var modelState in ModelState.Values)
                    {
                        foreach (var modelError in modelState.Errors)
                        {
                            var erromodel = modelError.ErrorMessage;
                            SetViewModel();
                            return Page();
                        }
                    }
                }

                if (ChecaDuplicado(Guid.Empty))
                {
                    SetViewModel();
                    return Page();
                }

                _unitOfWork.Recurso.Add(RecursoObj.Recurso);

                Guid RecursoId = RecursoObj.Recurso.RecursoId;

                _unitOfWork.Save();

                // Insere o Recursos nos Usuários Disponíveis
                var objUsers = _unitOfWork.AspNetUsers.GetAll();

                foreach (var user in objUsers)
                {
                    var objAcesso = new ControleAcesso
                    {
                        UsuarioId = user.Id ,
                        RecursoId = RecursoId ,
                        Acesso = true
                    };

                    _unitOfWork.ControleAcesso.Add(objAcesso);
                    _unitOfWork.Save();
                }

                _notyf.Success("Recurso inserido com sucesso!" , 3);

                return RedirectToPage("./Recursos");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UpsertRecurso.cshtml.cs" , "OnPostSubmit" , error);
                return RedirectToPage("./Recursos");
            }
        }

        public IActionResult OnPostEdit(Guid id)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    SetViewModel();
                    RecursoObj.Recurso.RecursoId = id;
                    return Page();
                }

                RecursoObj.Recurso.RecursoId = id;

                if (ChecaDuplicado(RecursoObj.Recurso.RecursoId))
                {
                    SetViewModel();
                    RecursoObj.Recurso.RecursoId = id;
                    return Page();
                }

                _unitOfWork.Recurso.Update(RecursoObj.Recurso);
                _unitOfWork.Save();

                _notyf.Success("Recurso atualizado com sucesso!" , 3);

                return RedirectToPage("./Recursos");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UpsertRecurso.cshtml.cs" , "OnPostEdit" , error);
                return RedirectToPage("./Recursos");
            }
        }

        private bool ChecaDuplicado(Guid id)
        {
            try
            {
                return false;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UpsertRecurso.cshtml.cs" , "ChecaDuplicado" , error);
                return false;
            }
        }
    }
}
