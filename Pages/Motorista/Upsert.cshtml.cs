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
using System.Linq;
using System.Security.Claims;

namespace FrotiX.Pages.Motorista
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly INotyfService _notyf;

        public static Guid motoristaId;
        public static byte[] FotoMotorista;
        public static byte[] CNHMotorista;

        public UpsertModel(
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
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "UpsertModel", error);
            }
        }

        [BindProperty]
        public MotoristaViewModel MotoristaObj
        {
            get; set;
        }

        public IFormFile FotoUpload
        {
            get; set;
        }

        private void SetViewModel()
        {
            try
            {
                MotoristaObj = new MotoristaViewModel
                {
                    UnidadeList = _unitOfWork.Unidade.GetUnidadeListForDropDown(),
                    ContratoList = _unitOfWork.Contrato.GetDropDown("Terceirização"),
                    Motorista = new Models.Motorista()
                };
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "SetViewModel", error);
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
                    motoristaId = (Guid)id;
                }

                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                MotoristaObj.Motorista.UsuarioIdAlteracao = currentUserID;
                var usuarios = _unitOfWork.AspNetUsers.GetAspNetUsersListForDropDown();

                foreach (var usuario in usuarios)
                {
                    if (usuario.Value == currentUserID)
                    {
                        MotoristaObj.NomeUsuarioAlteracao = usuario.Text;
                    }
                }

                if (id != Guid.Empty)
                {
                    MotoristaObj.Motorista = _unitOfWork.Motorista.GetFirstOrDefault(u =>
                        u.MotoristaId == id
                    );

                    if (MotoristaObj == null)
                    {
                        return NotFound();
                    }

                    if (MotoristaObj.Motorista.Foto != null)
                    {
                        FotoMotorista = MotoristaObj.Motorista.Foto;
                    }

                    if (MotoristaObj.Motorista.CNHDigital != null)
                    {
                        CNHMotorista = MotoristaObj.Motorista.CNHDigital;
                    }

                    if (MotoristaObj.Motorista.Status == false )
                    {
                        MotoristaObj.Motorista.Status = true;
                    }
                }
                else
                {
                    // Novo motorista - Status = true por padrão
                    MotoristaObj.Motorista.Status = true;
                }

                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "OnGet", error);
                return Page();
            }
        }

        public IActionResult OnPostSubmit()
        {
            try
            {
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                MotoristaObj.Motorista.UsuarioIdAlteracao = currentUserID;

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

                // Validar duplicados antes de criar
                if (ChecaDuplicado(Guid.Empty))
                {
                    SetViewModel();
                    return Page();
                }

                if (MotoristaObj.Motorista.CategoriaCNH != null)
                {
                    MotoristaObj.Motorista.CategoriaCNH = MotoristaObj.Motorista.CategoriaCNH.ToUpper();
                }
                MotoristaObj.Motorista.DataAlteracao = DateTime.Now;

                if (FotoUpload != null)
                {
                    var file = FotoUpload.FileName;

                    using (var ms = new MemoryStream())
                    {
                        FotoUpload.CopyTo(ms);
                        MotoristaObj.Motorista.Foto = ms.ToArray();
                    }
                }
                else
                {
                    var wwwroot = _hostingEnvironment.WebRootPath;
                    var barbudo = wwwroot + "\\Images\\barbudo.jpg";
                    byte[] imgdata = System.IO.File.ReadAllBytes(barbudo);
                    MotoristaObj.Motorista.Foto = imgdata.ToArray();
                }

                if (MotoristaObj.Motorista.MotoristaId == Guid.Empty)
                {
                    _unitOfWork.Motorista.Add(MotoristaObj.Motorista);

                    if (MotoristaObj.Motorista.ContratoId != null)
                    {
                        MotoristaContrato motoristaContrato = new MotoristaContrato
                        {
                            ContratoId = (Guid)MotoristaObj.Motorista.ContratoId,
                            MotoristaId = MotoristaObj.Motorista.MotoristaId
                        };
                        _unitOfWork.MotoristaContrato.Add(motoristaContrato);
                    }
                }

                _unitOfWork.Save();

                AppToast.show("Verde", "Motorista criado com sucesso!", 3000);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "OnPostSubmit", error);
                return RedirectToPage("./Index");
            }
        }

        public IActionResult OnPostEdit(Guid id)
        {
            try
            {
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                MotoristaObj.Motorista.UsuarioIdAlteracao = currentUserID;

                if (FotoUpload != null)
                {
                    var file = FotoUpload.FileName;

                    using (var ms = new MemoryStream())
                    {
                        FotoUpload.CopyTo(ms);
                        MotoristaObj.Motorista.Foto = ms.ToArray();
                    }
                }
                else if (FotoMotorista != null)
                {
                    MotoristaObj.Motorista.Foto = FotoMotorista;
                }
                else
                {
                    // Motorista sem foto: gravar barbudo.jpg como padrão
                    var wwwroot = _hostingEnvironment.WebRootPath;
                    var barbudo = wwwroot + "\\Images\\barbudo.jpg";
                    byte[] imgdata = System.IO.File.ReadAllBytes(barbudo);
                    MotoristaObj.Motorista.Foto = imgdata.ToArray();
                }

                if (!ModelState.IsValid)
                {
                    SetViewModel();
                    MotoristaObj.Motorista.MotoristaId = id;
                    return Page();
                }

                MotoristaObj.Motorista.MotoristaId = id;

                if (ChecaDuplicado(MotoristaObj.Motorista.MotoristaId))
                {
                    SetViewModel();
                    MotoristaObj.Motorista.MotoristaId = id;
                    return Page();
                }

                var existeMotoristaContrato = _unitOfWork.MotoristaContrato.GetFirstOrDefault(u =>
                    (u.MotoristaId == MotoristaObj.Motorista.MotoristaId) &&
                    (u.ContratoId == MotoristaObj.Motorista.ContratoId)
                );

                if (existeMotoristaContrato == null && MotoristaObj.Motorista.ContratoId != null)
                {
                    MotoristaContrato motoristaContrato = new MotoristaContrato
                    {
                        ContratoId = (Guid)MotoristaObj.Motorista.ContratoId,
                        MotoristaId = MotoristaObj.Motorista.MotoristaId
                    };
                    _unitOfWork.MotoristaContrato.Add(motoristaContrato);
                }

                MotoristaObj.Motorista.CategoriaCNH = MotoristaObj.Motorista.CategoriaCNH.ToUpper();
                MotoristaObj.Motorista.DataAlteracao = DateTime.Now;

                _unitOfWork.Motorista.Update(MotoristaObj.Motorista);
                _unitOfWork.Save();

                AppToast.show("Verde", "Motorista atualizado com sucesso!", 3000);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "OnPostEdit", error);
                return RedirectToPage("./Index");
            }
        }

        private bool ChecaDuplicado(Guid id)
        {
            try
            {
                var existeNome = _unitOfWork.Motorista.GetFirstOrDefault(u =>
                    u.Nome.ToUpper() == MotoristaObj.Motorista.Nome.ToUpper() && u.MotoristaId != id
                );

                if (id == Guid.Empty && existeNome != null)
                {
                    AppToast.show("Vermelho", "Já existe um motorista com esse nome!", 3000);
                    return true;
                }

                if (existeNome != null && existeNome.MotoristaId != id)
                {
                    AppToast.show("Vermelho", "Já existe um motorista com esse nome!", 3000);
                    return true;
                }

                var existeCPF = _unitOfWork.Motorista.GetFirstOrDefault(u =>
                    u.CPF == MotoristaObj.Motorista.CPF
                );

                if (id == Guid.Empty && existeCPF != null)
                {
                    AppToast.show("Vermelho", "Já existe um motorista com esse CPF!", 3000);
                    return true;
                }

                if (existeCPF != null && existeCPF.MotoristaId != id)
                {
                    AppToast.show("Vermelho", "Já existe um motorista com esse CPF!", 3000);
                    return true;
                }

                var existeCNH = _unitOfWork.Motorista.GetFirstOrDefault(u =>
                    u.CNH == MotoristaObj.Motorista.CNH && u.MotoristaId != id
                );

                if (id == Guid.Empty && existeCNH != null)
                {
                    AppToast.show("Vermelho", "Já existe um motorista com essa CNH!", 3000);
                    return true;
                }

                if (existeCNH != null && existeCNH.MotoristaId != id)
                {
                    AppToast.show("Vermelho", "Já existe um motorista com essa CNH!", 3000);
                    return true;
                }

                if (MotoristaObj.Motorista.TipoCondutor == null)
                {
                    AppToast.show("Amarelo", "O Tipo de Condutor deve ser informado!", 3000);
                    return true;
                }

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
