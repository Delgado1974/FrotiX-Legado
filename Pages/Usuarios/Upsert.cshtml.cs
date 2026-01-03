using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Threading.Tasks;

namespace FrotiX.Pages.Usuarios
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly INotyfService _notyf;

        public static string UsuarioId;
        public static byte[] FotoUsuario;

        public UpsertModel(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            IUnitOfWork unitOfWork,
            ILogger<IndexModel> logger,
            IWebHostEnvironment hostingEnvironment,
            INotyfService notyf
        )
        {
            try
            {
                _unitOfWork = unitOfWork;
                _logger = logger;
                _hostingEnvironment = hostingEnvironment;
                _notyf = notyf;
                _userManager = userManager;
                _signInManager = signInManager;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "UpsertModel", error);
            }
        }

        [BindProperty]
        public UsuarioViewModel UsuarioObj { get; set; }

        [BindProperty]
        public IFormFile FotoUpload { get; set; }

        private void SetViewModel()
        {
            try
            {
                UsuarioObj = new UsuarioViewModel { AspNetUsers = new Models.AspNetUsers() };
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "SetViewModel", error);
            }
        }

        public IActionResult OnGet(string? id)
        {
            try
            {
                SetViewModel();

                if (id != null)
                {
                    UsuarioId = id;
                }

                if (id != null && id != "")
                {
                    UsuarioObj.AspNetUsers = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == id);

                    if (UsuarioObj == null)
                    {
                        return NotFound();
                    }
                }

                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "OnGet", error);
                return Page();
            }
        }

        public async Task<IActionResult> OnPostSubmit()
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

                if (ChecaDuplicado(null))
                {
                    SetViewModel();
                    return Page();
                }

                string valor = UsuarioObj.AspNetUsers.Ponto.Trim();

                if (!valor.StartsWith("p_") && !valor.StartsWith("P_"))
                {
                    valor = "p_" + valor;
                }

                UsuarioObj.AspNetUsers.UserName = valor;

                // Processa foto se foi enviada
                byte[] fotoBytes = null;
                if (FotoUpload != null && FotoUpload.Length > 0)
                {
                    using (var memoryStream = new MemoryStream())
                    {
                        await FotoUpload.CopyToAsync(memoryStream);
                        fotoBytes = memoryStream.ToArray();
                    }
                }

                var user = new Models.AspNetUsers
                {
                    UserName = UsuarioObj.AspNetUsers.UserName,
                    Email = UsuarioObj.AspNetUsers.Email,
                    NomeCompleto = UsuarioObj.AspNetUsers.NomeCompleto,
                    Ponto = UsuarioObj.AspNetUsers.Ponto,
                    Ramal = UsuarioObj.AspNetUsers.Ramal,
                    PhoneNumber = UsuarioObj.AspNetUsers.PhoneNumber,
                    DetentorCargaPatrimonial = UsuarioObj.AspNetUsers.DetentorCargaPatrimonial,
                    Status = UsuarioObj.AspNetUsers.Status,
                    Foto = fotoBytes
                };

                var result = await _userManager.CreateAsync(user, "visual");

                if (result.Succeeded)
                {
                    var objRecursos = _unitOfWork.Recurso.GetAll();

                    foreach (var recurso in objRecursos)
                    {
                        var objAcesso = new ControleAcesso
                        {
                            UsuarioId = user.Id,
                            RecursoId = recurso.RecursoId,
                            Acesso = false,
                        };

                        _unitOfWork.ControleAcesso.Add(objAcesso);
                        _unitOfWork.Save();
                    }

                    _notyf.Success("Usuario inserido com sucesso!", 3);
                }
                else
                {
                    UsuarioObj.AspNetUsers.Id = Guid.NewGuid().ToString();
                    UsuarioObj.AspNetUsers.PasswordHash = user.PasswordHash;
                    UsuarioObj.AspNetUsers.SecurityStamp = user.SecurityStamp;
                    UsuarioObj.AspNetUsers.ConcurrencyStamp = user.ConcurrencyStamp;
                    UsuarioObj.AspNetUsers.Discriminator = "Usuario";
                    UsuarioObj.AspNetUsers.Foto = fotoBytes;

                    _unitOfWork.AspNetUsers.Add(UsuarioObj.AspNetUsers);
                    _unitOfWork.Save();

                    _notyf.Success("Usuario inserido com sucesso!", 3);
                }

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "OnPostSubmit", error);
                return RedirectToPage("./Index");
            }
        }

        public async Task<IActionResult> OnPostEdit(string id)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    SetViewModel();
                    UsuarioObj.AspNetUsers.Id = id;
                    return Page();
                }

                // Busca usuário existente para manter a foto se não foi alterada
                var usuarioExistente = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == id);

                UsuarioObj.AspNetUsers.Id = id;
                UsuarioObj.AspNetUsers.Discriminator = "Usuario";

                // Processa foto se foi enviada
                if (FotoUpload != null && FotoUpload.Length > 0)
                {
                    using (var memoryStream = new MemoryStream())
                    {
                        await FotoUpload.CopyToAsync(memoryStream);
                        UsuarioObj.AspNetUsers.Foto = memoryStream.ToArray();
                    }
                }
                else if (usuarioExistente != null)
                {
                    // Mantém a foto existente
                    UsuarioObj.AspNetUsers.Foto = usuarioExistente.Foto;
                }

                _unitOfWork.AspNetUsers.Update(UsuarioObj.AspNetUsers);
                _unitOfWork.Save();

                _notyf.Success("Usuario atualizado com sucesso!", 3);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "OnPostEdit", error);
                return RedirectToPage("./Index");
            }
        }

        private bool ChecaDuplicado(string? id)
        {
            try
            {
                return false;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "ChecaDuplicado", error);
                return false;
            }
        }
    }
}
