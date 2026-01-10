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

        public byte[] FotoPadraoBytes { get; set; }

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

        private byte[] CarregarFotoPadrao()
        {
            try
            {
                string caminhoFotoPadrao = Path.Combine(_hostingEnvironment.WebRootPath, "Images", "sucesso_transparente.png");
                
                if (System.IO.File.Exists(caminhoFotoPadrao))
                {
                    return System.IO.File.ReadAllBytes(caminhoFotoPadrao);
                }
                
                return null;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "CarregarFotoPadrao", error);
                return null;
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
                else
                {
                    // Se for criação (novo usuário), inicializa com Status ativo e foto padrão
                    UsuarioObj.AspNetUsers.Status = true;
                    
                    FotoPadraoBytes = CarregarFotoPadrao();
                    if (FotoPadraoBytes != null)
                    {
                        UsuarioObj.AspNetUsers.Foto = FotoPadraoBytes;
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

                // Formata Ponto como p_XXXX (minúsculo seguido de números)
                string valor = UsuarioObj.AspNetUsers.Ponto?.Trim() ?? "";
                
                // Remove qualquer prefixo p_ ou P_ existente
                valor = System.Text.RegularExpressions.Regex.Replace(valor, "^[pP]_", "");
                
                // Remove tudo que não é número
                valor = System.Text.RegularExpressions.Regex.Replace(valor, @"\D", "");
                
                // Formata como p_XXXX
                if (!string.IsNullOrEmpty(valor))
                {
                    valor = "p_" + valor;
                }
                else
                {
                    ModelState.AddModelError("UsuarioObj.AspNetUsers.Ponto", "(O ponto é obrigatório e deve conter números)");
                    SetViewModel();
                    return Page();
                }

                UsuarioObj.AspNetUsers.Ponto = valor;
                UsuarioObj.AspNetUsers.UserName = valor;
                
                // Valida Email termina em @camara.leg.br
                if (!string.IsNullOrEmpty(UsuarioObj.AspNetUsers.Email))
                {
                    string email = UsuarioObj.AspNetUsers.Email.Trim().ToLower();
                    if (!email.EndsWith("@camara.leg.br"))
                    {
                        // Remove @camara.leg.br se existir
                        email = System.Text.RegularExpressions.Regex.Replace(email, "@camara\\.leg\\.br$", "");
                        email = System.Text.RegularExpressions.Regex.Replace(email, "@+$", "");
                        if (!string.IsNullOrEmpty(email))
                        {
                            UsuarioObj.AspNetUsers.Email = email + "@camara.leg.br";
                        }
                        else
                        {
                            ModelState.AddModelError("UsuarioObj.AspNetUsers.Email", "(O email deve terminar em @camara.leg.br)");
                            SetViewModel();
                            return Page();
                        }
                    }
                }
                
                // Valida Celular formato (xx) xxxx-xxxx
                if (!string.IsNullOrEmpty(UsuarioObj.AspNetUsers.PhoneNumber))
                {
                    string celular = UsuarioObj.AspNetUsers.PhoneNumber.Trim();
                    if (!System.Text.RegularExpressions.Regex.IsMatch(celular, @"^\(\d{2}\) \d{4}-\d{4}$"))
                    {
                        ModelState.AddModelError("UsuarioObj.AspNetUsers.PhoneNumber", "(O celular deve estar no formato (xx) xxxx-xxxx)");
                        SetViewModel();
                        return Page();
                    }
                }
                
                // Valida Ramal é numérico
                if (UsuarioObj.AspNetUsers.Ramal.HasValue && (UsuarioObj.AspNetUsers.Ramal.Value < 0 || UsuarioObj.AspNetUsers.Ramal.Value > 99999))
                {
                    ModelState.AddModelError("UsuarioObj.AspNetUsers.Ramal", "(O ramal deve ser um número entre 0 e 99999)");
                    SetViewModel();
                    return Page();
                }

                // Processa foto se foi enviada, caso contrário usa foto padrão
                byte[] fotoBytes = null;
                if (FotoUpload != null && FotoUpload.Length > 0)
                {
                    using (var memoryStream = new MemoryStream())
                    {
                        await FotoUpload.CopyToAsync(memoryStream);
                        fotoBytes = memoryStream.ToArray();
                    }
                }
                else
                {
                    // Se não houver foto enviada, usa a foto padrão
                    fotoBytes = CarregarFotoPadrao();
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
                
                // Formata Ponto como p_XXXX (minúsculo seguido de números)
                if (!string.IsNullOrEmpty(UsuarioObj.AspNetUsers.Ponto))
                {
                    string valor = UsuarioObj.AspNetUsers.Ponto.Trim();
                    
                    // Remove qualquer prefixo p_ ou P_ existente
                    valor = System.Text.RegularExpressions.Regex.Replace(valor, "^[pP]_", "");
                    
                    // Remove tudo que não é número
                    valor = System.Text.RegularExpressions.Regex.Replace(valor, @"\D", "");
                    
                    // Formata como p_XXXX
                    if (!string.IsNullOrEmpty(valor))
                    {
                        valor = "p_" + valor;
                        UsuarioObj.AspNetUsers.Ponto = valor;
                        UsuarioObj.AspNetUsers.UserName = valor;
                    }
                }
                
                // Valida Email termina em @camara.leg.br
                if (!string.IsNullOrEmpty(UsuarioObj.AspNetUsers.Email))
                {
                    string email = UsuarioObj.AspNetUsers.Email.Trim().ToLower();
                    if (!email.EndsWith("@camara.leg.br"))
                    {
                        // Remove @camara.leg.br se existir
                        email = System.Text.RegularExpressions.Regex.Replace(email, "@camara\\.leg\\.br$", "");
                        email = System.Text.RegularExpressions.Regex.Replace(email, "@+$", "");
                        if (!string.IsNullOrEmpty(email))
                        {
                            UsuarioObj.AspNetUsers.Email = email + "@camara.leg.br";
                        }
                    }
                }
                
                // Valida Celular formato (xx) xxxx-xxxx
                if (!string.IsNullOrEmpty(UsuarioObj.AspNetUsers.PhoneNumber))
                {
                    string celular = UsuarioObj.AspNetUsers.PhoneNumber.Trim();
                    if (!System.Text.RegularExpressions.Regex.IsMatch(celular, @"^\(\d{2}\) \d{4}-\d{4}$"))
                    {
                        ModelState.AddModelError("UsuarioObj.AspNetUsers.PhoneNumber", "(O celular deve estar no formato (xx) xxxx-xxxx)");
                        SetViewModel();
                        UsuarioObj.AspNetUsers.Id = id;
                        return Page();
                    }
                }
                
                // Valida Ramal é numérico
                if (UsuarioObj.AspNetUsers.Ramal.HasValue && (UsuarioObj.AspNetUsers.Ramal.Value < 0 || UsuarioObj.AspNetUsers.Ramal.Value > 99999))
                {
                    ModelState.AddModelError("UsuarioObj.AspNetUsers.Ramal", "(O ramal deve ser um número entre 0 e 99999)");
                    SetViewModel();
                    UsuarioObj.AspNetUsers.Id = id;
                    return Page();
                }

                // Processa foto se foi enviada
                if (FotoUpload != null && FotoUpload.Length > 0)
                {
                    using (var memoryStream = new MemoryStream())
                    {
                        await FotoUpload.CopyToAsync(memoryStream);
                        UsuarioObj.AspNetUsers.Foto = memoryStream.ToArray();
                    }
                }
                else if (usuarioExistente != null && usuarioExistente.Foto != null && usuarioExistente.Foto.Length > 0)
                {
                    // Mantém a foto existente se houver
                    UsuarioObj.AspNetUsers.Foto = usuarioExistente.Foto;
                }
                else
                {
                    // Se não houver foto existente nem nova foto, usa a foto padrão
                    UsuarioObj.AspNetUsers.Foto = CarregarFotoPadrao();
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
