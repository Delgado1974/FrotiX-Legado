using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using FrotiX.Validations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace FrotiX.Pages.Usuarios
{
    [IgnoreAntiforgeryToken(Order = 1001)]
    [AllowAnonymous]
    public class RegisterModel :PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailSender _emailSender;
        private readonly ILogger<RegisterModel> _logger;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;
        private IMailService _mailService;

        public RegisterModel(
            UserManager<IdentityUser> userManager ,
            SignInManager<IdentityUser> signInManager ,
            ILogger<RegisterModel> logger ,
            IEmailSender emailSender ,
            IMailService mailService ,
            IUnitOfWork unitOfWork
        )
        {
            try
            {
                _userManager = userManager;
                _signInManager = signInManager;
                _logger = logger;
                _emailSender = emailSender;
                _unitOfWork = unitOfWork;
                _mailService = mailService;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Registrar.cshtml.cs" , "RegisterModel" , error);
            }
        }

        [BindProperty]
        public InputModel Input
        {
            get; set;
        }

        public string ReturnUrl
        {
            get; set;
        }

        public void OnGet(string returnUrl = null)
        {
            try
            {
                ReturnUrl = returnUrl;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Registrar.cshtml.cs" , "OnGet" , error);
                return;
            }
        }

        public async Task<IActionResult> OnPostAsync(string returnUrl = null)
        {
            try
            {
                returnUrl = returnUrl ?? Url.Content("~/");

                if (ModelState.IsValid)
                {
                    var user = new Models.AspNetUsers
                    {
                        UserName = Input.Ponto ,
                        Email = Input.Email ,
                        NomeCompleto = Input.NomeCompleto ,
                        Ponto = Input.Ponto ,
                    };

                    var result = await _userManager.CreateAsync(user , "visual");

                    if (result.Succeeded)
                    {
                        _logger.LogInformation("User created a new account with password.");

                        var code = "";
                        var callbackUrl = Url.Page(
                            "/Account/ConfirmarSenha" ,
                            null ,
                            new
                            {
                                userId = user.Id ,
                                code
                            } ,
                            Request.Scheme
                        );

                        // Insere o Usuário nos Recursos Disponíveis
                        var objRecursos = _unitOfWork.Recurso.GetAll();

                        foreach (var recurso in objRecursos)
                        {
                            var objAcesso = new ControleAcesso
                            {
                                UsuarioId = user.Id ,
                                RecursoId = recurso.RecursoId ,
                                Acesso = false
                            };

                            _unitOfWork.ControleAcesso.Add(objAcesso);
                            _unitOfWork.Save();
                        }

                        await _signInManager.SignInAsync(user , false);
                        return LocalRedirect("/Identity/Account/LoginFrotiX");
                    }

                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError(string.Empty , error.Description);
                    }
                }

                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Registrar.cshtml.cs" , "OnPostAsync" , error);
                return Page();
            }
        }

        public class InputModel
        {
            [Required]
            [Display(Name = "Ponto")]
            public string Ponto
            {
                get; set;
            }

            [Required]
            [Display(Name = "Nome Completo")]
            public string NomeCompleto
            {
                get; set;
            }

            [Required]
            [EmailAddress]
            [ValidateDomainAtEnd(domainValue: "@camara.leg.br")]
            [Display(Name = "Email")]
            public string Email
            {
                get; set;
            }

            [DataType(DataType.Password)]
            [Display(Name = "Senha")]
            public string Senha
            {
                get; set;
            }

            [DataType(DataType.Password)]
            [Display(Name = "Confirmação de Senha")]
            [Compare("Senha" , ErrorMessage = "A senha e a confirmação não combinam.")]
            public string ConfirmacaoSenha
            {
                get; set;
            }
        }
    }
}
