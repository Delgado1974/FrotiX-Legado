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

namespace FrotiX.Pages.Operador
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly INotyfService _notyf;

        public static Guid operadorId;
        public static byte[] FotoOperador;

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
        public OperadorViewModel OperadorObj
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
                OperadorObj = new OperadorViewModel
                {
                    ContratoList = _unitOfWork.Contrato.GetDropDown("Terceirização") ,
                    Operador = new Models.Operador()
                    {
                        Status = true  // ← Marca como ativo por padrío
                    } ,
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

                operadorId = id;

                //Pega o usuário corrente
                //=======================
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                OperadorObj.Operador.UsuarioIdAlteracao = currentUserID;
                var usuarios = _unitOfWork.AspNetUsers.GetAspNetUsersListForDropDown();
                foreach (var usuario in usuarios)
                {
                    if (usuario.Value == currentUserID)
                    {
                        OperadorObj.NomeUsuarioAlteracao = usuario.Text;
                    }
                }

                if (id != Guid.Empty)
                {
                    OperadorObj.Operador = _unitOfWork.Operador.GetFirstOrDefault(u =>
                        u.OperadorId == id
                    );
                    if (OperadorObj == null)
                    {
                        return NotFound();
                    }
                    if (OperadorObj.Operador.Foto != null)
                    {
                        FotoOperador = OperadorObj.Operador.Foto;
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
                //Pega o usuário corrente
                //=======================
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                OperadorObj.Operador.UsuarioIdAlteracao = currentUserID;

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

                OperadorObj.Operador.DataAlteracao = DateTime.Now;

                //Põe os pontos com "p_" na frente
                //================================
                if (OperadorObj.Operador.Ponto.Substring(0 , 2).ToUpper() != "P_")
                {
                    OperadorObj.Operador.Ponto = "p_" + OperadorObj.Operador.Ponto;
                }
                else
                {
                    OperadorObj.Operador.Ponto =
                        "p_"
                        + OperadorObj.Operador.Ponto.Substring(
                            2 ,
                            OperadorObj.Operador.Ponto.Length - 2
                        );
                }

                //Adiciona a Foto
                //===============
                if (FotoUpload != null)
                {
                    var file = FotoUpload.FileName;

                    using (var ms = new MemoryStream())
                    {
                        FotoUpload.CopyTo(ms);
                        OperadorObj.Operador.Foto = ms.ToArray();
                    }
                }
                else
                {
                    var wwwroot = _hostingEnvironment.WebRootPath;
                    var barbudo = wwwroot + "\\Images\\barbudo.jpg";
                    byte[] imgdata = System.IO.File.ReadAllBytes(barbudo);
                    OperadorObj.Operador.Foto = imgdata.ToArray();
                }

                //Adiciona o motorista
                //====================
                if (OperadorObj.Operador.OperadorId == Guid.Empty)
                {
                    _unitOfWork.Operador.Add(OperadorObj.Operador);

                    //Adiciona o motorista ao contrato, caso selecionado
                    if (OperadorObj.Operador.ContratoId != Guid.Empty)
                    {
                        OperadorContrato operadorContrato = new OperadorContrato
                        {
                            ContratoId = (Guid)OperadorObj.Operador.ContratoId ,
                            OperadorId = OperadorObj.Operador.OperadorId ,
                        };
                        _unitOfWork.OperadorContrato.Add(operadorContrato);
                    }
                }
                _unitOfWork.Save();

                AppToast.show("Verde" , "Operador criado com sucesso!" , 3000);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostSubmit" , error);
                AppToast.show("Vermelho" , "Erro ao criar operador. Tente novamente." , 3000);
                return RedirectToPage("./Index");
            }
        }

        public IActionResult OnPostEdit(Guid id)
        {
            try
            {
                //Pega o usuário corrente
                //=======================
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                OperadorObj.Operador.UsuarioIdAlteracao = currentUserID;

                if (FotoUpload != null)
                {
                    var file = FotoUpload.FileName;

                    using (var ms = new MemoryStream())
                    {
                        FotoUpload.CopyTo(ms);
                        OperadorObj.Operador.Foto = ms.ToArray();
                    }
                }
                else if (FotoOperador != null)
                {
                    OperadorObj.Operador.Foto = FotoOperador;
                }
                else
                {
                    var wwwroot = _hostingEnvironment.WebRootPath;
                    var barbudo = wwwroot + "\\Images\\barbudo.jpg";
                    byte[] imgdata = System.IO.File.ReadAllBytes(barbudo);
                    OperadorObj.Operador.Foto = imgdata.ToArray();
                }

                if (!ModelState.IsValid)
                {
                    SetViewModel();
                    OperadorObj.Operador.OperadorId = id;
                    return Page();
                }

                OperadorObj.Operador.OperadorId = id;

                if (ChecaDuplicado(OperadorObj.Operador.OperadorId))
                {
                    SetViewModel();
                    OperadorObj.Operador.OperadorId = id;
                    return Page();
                }

                // Atualiza Contrato do Motorista, se selecionado
                //=============================================
                var existeOperadorContrato = _unitOfWork.OperadorContrato.GetFirstOrDefault(u =>
                    (u.OperadorId == OperadorObj.Operador.OperadorId)
                    && (u.ContratoId == OperadorObj.Operador.ContratoId)
                );
                if (existeOperadorContrato == null && OperadorObj.Operador.ContratoId != Guid.Empty)
                {
                    OperadorContrato operadorContrato = new OperadorContrato
                    {
                        ContratoId = (Guid)OperadorObj.Operador.ContratoId ,
                        OperadorId = OperadorObj.Operador.OperadorId ,
                    };
                    _unitOfWork.OperadorContrato.Add(operadorContrato);
                }

                OperadorObj.Operador.DataAlteracao = DateTime.Now;

                //Põe os pontos com "p_" na frente
                //================================
                if (OperadorObj.Operador.Ponto.Substring(0 , 2).ToUpper() != "P_")
                {
                    OperadorObj.Operador.Ponto = "p_" + OperadorObj.Operador.Ponto;
                }
                else
                {
                    OperadorObj.Operador.Ponto =
                        "p_"
                        + OperadorObj.Operador.Ponto.Substring(
                            2 ,
                            OperadorObj.Operador.Ponto.Length - 2
                        );
                }

                _unitOfWork.Operador.Update(OperadorObj.Operador);
                _unitOfWork.Save();

                AppToast.show("Verde" , "Operador atualizado com sucesso!" , 3000);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostEdit" , error);
                AppToast.show("Vermelho" , "Erro ao atualizar operador. Tente novamente." , 3000);
                return RedirectToPage("./Index");
            }
        }

        private bool ChecaDuplicado(Guid id)
        {
            try
            {
                // Verifica Duplicidades
                var existeNome = _unitOfWork.Operador.GetFirstOrDefault(u =>
                    u.Nome.ToUpper() == OperadorObj.Operador.Nome.ToUpper()
                );
                if (id == Guid.Empty && existeNome != null)
                {
                    AppToast.show("Vermelho" , "Já existe um operador com esse nome!" , 3000);
                    return true;
                }
                if (existeNome != null && existeNome.OperadorId != id)
                {
                    AppToast.show("Vermelho" , "Já existe um operador com esse nome!" , 3000);
                    return true;
                }

                var existeCPF = _unitOfWork.Operador.GetFirstOrDefault(u =>
                    u.CPF == OperadorObj.Operador.CPF
                );
                if (id == Guid.Empty && existeCPF != null)
                {
                    AppToast.show("Vermelho" , "Já existe um operador com esse CPF!" , 3000);
                    return true;
                }
                if (existeCPF != null && existeCPF.OperadorId != id)
                {
                    AppToast.show("Vermelho" , "Já existe um operador com esse CPF!" , 3000);
                    return true;
                }
                return false;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "ChecaDuplicado" , error);
                return false;
            }
        }
    }
}
