using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using FrotiX.Models;
using System;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using FrotiX.Repository.IRepository;
using System.Security.Claims;

namespace FrotiX.Areas.Identity.Pages.Account
    {
    [AllowAnonymous]
    public class LoginFrotiX : PageModel
        {
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly ILogger<LoginModel> _logger;
        private readonly IUnitOfWork _unitOfWork;

        public LoginFrotiX(SignInManager<IdentityUser> signInManager, ILogger<LoginModel> logger, IUnitOfWork unitOfWork)
            {
            _signInManager = signInManager;
            _logger = logger;
            _unitOfWork = unitOfWork;
            }

        [BindProperty]
        public LoginFrotiXModel Input { get; set; }

        public IList<AuthenticationScheme> ExternalLogins { get; set; }

        public string ReturnUrl { get; set; }

        [TempData]
        public string ErrorMessage { get; set; }

        public class LoginFrotiXModel
            {
            [Required(ErrorMessage = "Insira o seu ponto! (p_xxxx)")]
            public string Ponto { get; set; }

            [Required(ErrorMessage = "A senha é obrigatória!")]
            [DataType(DataType.Password)]
            public string Password { get; set; }

            [Display(Name = "Remember me?")]
            public bool RememberMe { get; set; }
            }

        public async Task OnGetAsync(string returnUrl = null)
            {
            if (!string.IsNullOrEmpty(ErrorMessage))
                {
                ModelState.AddModelError(string.Empty, ErrorMessage);
                }

            returnUrl = returnUrl ?? Url.Content("~/");

            // Clear the existing external cookie to ensure a clean login process
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

            ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList();

            ReturnUrl = returnUrl;
            }


        public async Task<IActionResult> OnPostAsync(string returnUrl = null)
            {
            returnUrl = returnUrl ?? Url.Content("~/");

            if (ModelState.IsValid)
                {
                // This doesn't count login failures towards account lockout
                // To enable password failures to trigger account lockout, set lockoutOnFailure: true
                var result = await _signInManager.PasswordSignInAsync(Input.Ponto, Input.Password, Input.RememberMe, lockoutOnFailure: true);
                if (result.Succeeded)
                    {

                    _logger.LogInformation("User logged in.");
                    return new JsonResult(
                        new
                            {
                            isSuccess = true,
                            returnUrl = "/intel/analyticsdashboard"
                            });

                    //return LocalRedirect("/intel/analyticsdashboard");
                    }
                if (result.RequiresTwoFactor)
                    {
                    return new JsonResult(
                        new
                            {
                            isSuccess = true,
                            returnUrl = "./LoginWith2fa"
                            });

                    //return RedirectToPage("./LoginWith2fa", new { ReturnUrl = returnUrl, RememberMe = Input.RememberMe });
                    }
                if (result.IsLockedOut)
                    {
                    _logger.LogWarning("User account locked out.");
                    return new JsonResult(
                        new
                            {
                            isSuccess = true,
                            returnUrl = "./Lockout"
                            });
                    //return RedirectToPage("./Lockout");
                    }
                else
                    {
                    ModelState.AddModelError(string.Empty, "Login Inválido.");
                    return new JsonResult(
                        new
                            {
                            isSuccess = false
                            });
                    }
                }

            var errorMessage = "";

            foreach (var modelState in ViewData.ModelState.Values)
                {
                foreach (ModelError error in modelState.Errors)
                    {
                    errorMessage = error.ErrorMessage;
                    }
                }

            return new JsonResult(
                        new
                            {
                            isSuccess = false,
                            message = errorMessage
                            });

            // If we got this far, something failed, redisplay form
            //return Page();
            }
        }
    }


