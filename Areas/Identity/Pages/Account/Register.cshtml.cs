using System.ComponentModel.DataAnnotations;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using FrotiX.Models;
using FrotiX.Services;
using FrotiX.Validations;

namespace FrotiX.Areas.Identity.Pages.Account
    {
    [AllowAnonymous]
    public class RegisterModel : PageModel
        {
        private readonly IEmailSender _emailSender;
        private readonly ILogger<RegisterModel> _logger;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;

        public RegisterModel(UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager, ILogger<RegisterModel> logger,
            IEmailSender emailSender)
            {
            _userManager = userManager;
            _signInManager = signInManager;
            _logger = logger;
            _emailSender = emailSender;
            }

        [BindProperty] public InputModel Input { get; set; }

        public string ReturnUrl { get; set; }

        public void OnGet(string returnUrl = null) => ReturnUrl = returnUrl;

        public async Task<IActionResult> OnPostAsync(string returnUrl = null)
            {
            returnUrl = returnUrl ?? Url.Content("~/");
            if (ModelState.IsValid)
                {
                var user = new AspNetUsers
                    {
                    UserName = Input.Ponto,
                    Email = Input.Email,
                    NomeCompleto = Input.NomeCompleto,
                    Ponto = Input.Ponto
                    };
                var result = await _userManager.CreateAsync(user, Input.Senha);
                if (result.Succeeded)
                    {
                    _logger.LogInformation("User created a new account with password.");

                    // var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    // var callbackUrl = Url.Page("/Account/ConfirmEmail", null, new {userId = user.Id, code}, Request.Scheme);

                    //await _emailSender.SendEmailAsync(Input.Email, "Confirm your email",
                    //    $"Please confirm your account by <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clicking here</a>.");

                    await _signInManager.SignInAsync(user, false);
                    return LocalRedirect("/Identity/Account/LoginFrotiX");
                    }

                foreach (var error in result.Errors)
                    {
                    ModelState.AddModelError(string.Empty, error.Description);
                    }
                }

            // If we got this far, something failed, redisplay form
            return Page();
            }

        public class InputModel
            {
            [Required]
            [Display(Name = "Ponto")]
            public string Ponto { get; set; }

            [Required]
            [Display(Name = "Nome Completo")]
            public string NomeCompleto { get; set; }

            [Required]
            [EmailAddress]
            [ValidateDomainAtEnd(domainValue: "@camara.leg.br")]
            [Display(Name = "Email")]
            public string Email { get; set; }

            [Required]
            //[StringLength(10, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
            [DataType(DataType.Password)]
            [Display(Name = "Senha")]
            public string Senha { get; set; }

            [DataType(DataType.Password)]
            [Display(Name = "Confirmação de Senha")]
            [Compare("Senha", ErrorMessage = "A senha e a confirmação não combinam.")]
            public string ConfirmacaoSenha { get; set; }

            //[Required]
            //[Display(Name = "I agree to terms & conditions")]
            //public bool AgreeToTerms { get; set; }

            //[Display(Name = "Sign up for newsletters")]
            //public bool SignUp { get; set; }
            }
        }
    }


