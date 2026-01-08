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

namespace FrotiX.Pages.Encarregado
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly INotyfService _notyf;

        public static Guid encarregadoId;
        public static byte[] FotoEncarregado;

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
        public EncarregadoViewModel EncarregadoObj
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
                EncarregadoObj = new EncarregadoViewModel
                {
                    ContratoList = _unitOfWork.Contrato.GetDropDown("Terceirização"),
                    Encarregado = new Models.Encarregado()
                    {
                        Status = true  // ← Marca como ativo por padrão
                    },
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

                encarregadoId = id;

                // Pega o usuário corrente
                // =======================
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                EncarregadoObj.Encarregado.UsuarioIdAlteracao = currentUserID;
                var usuarios = _unitOfWork.AspNetUsers.GetAspNetUsersListForDropDown();
                foreach (var usuario in usuarios)
                {
                    if (usuario.Value == currentUserID)
                    {
                        EncarregadoObj.NomeUsuarioAlteracao = usuario.Text;
                    }
                }

                if (id != Guid.Empty)
                {
                    EncarregadoObj.Encarregado = _unitOfWork.Encarregado.GetFirstOrDefault(u =>
                        u.EncarregadoId == id
                    );
                    if (EncarregadoObj == null)
                    {
                        return NotFound();
                    }
                    if (EncarregadoObj.Encarregado.Foto != null)
                    {
                        FotoEncarregado = EncarregadoObj.Encarregado.Foto;
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

        public IActionResult OnPostSubmit()
        {
            try
            {
                // Pega o usuário corrente
                // =======================
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                EncarregadoObj.Encarregado.UsuarioIdAlteracao = currentUserID;

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

                EncarregadoObj.Encarregado.DataAlteracao = DateTime.Now;

                // Põe os pontos com "p_" na frente (sempre minúsculo)
                // ===================================================
                var pontoLimpo = EncarregadoObj.Encarregado.Ponto.Trim();
                if (pontoLimpo.ToUpper().StartsWith("P_"))
                {
                    pontoLimpo = pontoLimpo.Substring(2);
                }
                else if (pontoLimpo.ToUpper().StartsWith("P") && pontoLimpo.Length > 1 && char.IsDigit(pontoLimpo[1]))
                {
                    pontoLimpo = pontoLimpo.Substring(1);
                }
                EncarregadoObj.Encarregado.Ponto = "p_" + pontoLimpo;

                // Adiciona a Foto
                // ===============
                if (FotoUpload != null)
                {
                    var file = FotoUpload.FileName;

                    using (var ms = new MemoryStream())
                    {
                        FotoUpload.CopyTo(ms);
                        EncarregadoObj.Encarregado.Foto = ms.ToArray();
                    }
                }
                else
                {
                    var wwwroot = _hostingEnvironment.WebRootPath;
                    var barbudo = wwwroot + "\\Images\\barbudo.jpg";
                    byte[] imgdata = System.IO.File.ReadAllBytes(barbudo);
                    EncarregadoObj.Encarregado.Foto = imgdata.ToArray();
                }

                // Adiciona o encarregado
                // ======================
                if (EncarregadoObj.Encarregado.EncarregadoId == Guid.Empty)
                {
                    _unitOfWork.Encarregado.Add(EncarregadoObj.Encarregado);

                    // Adiciona o encarregado ao contrato, caso selecionado
                    if (EncarregadoObj.Encarregado.ContratoId != Guid.Empty)
                    {
                        EncarregadoContrato encarregadoContrato = new EncarregadoContrato
                        {
                            ContratoId = (Guid)EncarregadoObj.Encarregado.ContratoId,
                            EncarregadoId = EncarregadoObj.Encarregado.EncarregadoId,
                        };
                        _unitOfWork.EncarregadoContrato.Add(encarregadoContrato);
                    }
                }
                _unitOfWork.Save();

                AppToast.show("Verde", "Encarregado criado com sucesso!", 3000);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "OnPostSubmit", error);
                AppToast.show("Vermelho", "Erro ao criar encarregado. Tente novamente.", 3000);
                return RedirectToPage("./Index");
            }
        }

        public IActionResult OnPostEdit(Guid id)
        {
            try
            {
                // Pega o usuário corrente
                // =======================
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                EncarregadoObj.Encarregado.UsuarioIdAlteracao = currentUserID;

                if (FotoUpload != null)
                {
                    var file = FotoUpload.FileName;

                    using (var ms = new MemoryStream())
                    {
                        FotoUpload.CopyTo(ms);
                        EncarregadoObj.Encarregado.Foto = ms.ToArray();
                    }
                }
                else if (FotoEncarregado != null)
                {
                    EncarregadoObj.Encarregado.Foto = FotoEncarregado;
                }
                else
                {
                    var wwwroot = _hostingEnvironment.WebRootPath;
                    var barbudo = wwwroot + "\\Images\\barbudo.jpg";
                    byte[] imgdata = System.IO.File.ReadAllBytes(barbudo);
                    EncarregadoObj.Encarregado.Foto = imgdata.ToArray();
                }

                if (!ModelState.IsValid)
                {
                    SetViewModel();
                    EncarregadoObj.Encarregado.EncarregadoId = id;
                    return Page();
                }

                EncarregadoObj.Encarregado.EncarregadoId = id;

                if (ChecaDuplicado(EncarregadoObj.Encarregado.EncarregadoId))
                {
                    SetViewModel();
                    EncarregadoObj.Encarregado.EncarregadoId = id;
                    return Page();
                }

                // Atualiza Contrato do Encarregado, se selecionado
                // ================================================
                var existeEncarregadoContrato = _unitOfWork.EncarregadoContrato.GetFirstOrDefault(u =>
                    (u.EncarregadoId == EncarregadoObj.Encarregado.EncarregadoId)
                    && (u.ContratoId == EncarregadoObj.Encarregado.ContratoId)
                );
                if (existeEncarregadoContrato == null && EncarregadoObj.Encarregado.ContratoId != Guid.Empty)
                {
                    EncarregadoContrato encarregadoContrato = new EncarregadoContrato
                    {
                        ContratoId = (Guid)EncarregadoObj.Encarregado.ContratoId,
                        EncarregadoId = EncarregadoObj.Encarregado.EncarregadoId,
                    };
                    _unitOfWork.EncarregadoContrato.Add(encarregadoContrato);
                }

                EncarregadoObj.Encarregado.DataAlteracao = DateTime.Now;

                // Põe os pontos com "p_" na frente (sempre minúsculo)
                // ===================================================
                var pontoLimpoEdit = EncarregadoObj.Encarregado.Ponto.Trim();
                if (pontoLimpoEdit.ToUpper().StartsWith("P_"))
                {
                    pontoLimpoEdit = pontoLimpoEdit.Substring(2);
                }
                else if (pontoLimpoEdit.ToUpper().StartsWith("P") && pontoLimpoEdit.Length > 1 && char.IsDigit(pontoLimpoEdit[1]))
                {
                    pontoLimpoEdit = pontoLimpoEdit.Substring(1);
                }
                EncarregadoObj.Encarregado.Ponto = "p_" + pontoLimpoEdit;

                _unitOfWork.Encarregado.Update(EncarregadoObj.Encarregado);
                _unitOfWork.Save();

                AppToast.show("Verde", "Encarregado atualizado com sucesso!", 3000);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "OnPostEdit", error);
                AppToast.show("Vermelho", "Erro ao atualizar encarregado. Tente novamente.", 3000);
                return RedirectToPage("./Index");
            }
        }

        private bool ChecaDuplicado(Guid id)
        {
            try
            {
                // Verifica se CPF é válido
                if (!ValidaCPF(EncarregadoObj.Encarregado.CPF))
                {
                    AppToast.show("Vermelho", "CPF inválido!", 3000);
                    return true;
                }

                // Verifica Duplicidades - NOME
                var existeNome = _unitOfWork.Encarregado.GetFirstOrDefault(u =>
                    u.Nome.ToUpper() == EncarregadoObj.Encarregado.Nome.ToUpper()
                );
                if (id == Guid.Empty && existeNome != null)
                {
                    AppToast.show("Vermelho", "Já existe um encarregado com esse nome!", 3000);
                    return true;
                }
                if (existeNome != null && existeNome.EncarregadoId != id)
                {
                    AppToast.show("Vermelho", "Já existe um encarregado com esse nome!", 3000);
                    return true;
                }

                // Verifica Duplicidades - CPF
                var existeCPF = _unitOfWork.Encarregado.GetFirstOrDefault(u =>
                    u.CPF == EncarregadoObj.Encarregado.CPF
                );
                if (id == Guid.Empty && existeCPF != null)
                {
                    AppToast.show("Vermelho", "Já existe um encarregado com esse CPF!", 3000);
                    return true;
                }
                if (existeCPF != null && existeCPF.EncarregadoId != id)
                {
                    AppToast.show("Vermelho", "Já existe um encarregado com esse CPF!", 3000);
                    return true;
                }

                // Verifica Duplicidades - CELULAR
                if (!string.IsNullOrWhiteSpace(EncarregadoObj.Encarregado.Celular01))
                {
                    var existeCelular = _unitOfWork.Encarregado.GetFirstOrDefault(u =>
                        u.Celular01 == EncarregadoObj.Encarregado.Celular01
                    );
                    if (id == Guid.Empty && existeCelular != null)
                    {
                        AppToast.show("Vermelho", "Já existe um encarregado com esse celular!", 3000);
                        return true;
                    }
                    if (existeCelular != null && existeCelular.EncarregadoId != id)
                    {
                        AppToast.show("Vermelho", "Já existe um encarregado com esse celular!", 3000);
                        return true;
                    }
                }

                // Verifica Duplicidades - PONTO
                if (!string.IsNullOrWhiteSpace(EncarregadoObj.Encarregado.Ponto))
                {
                    // Normaliza o ponto para comparação (adiciona p_ se não tiver)
                    var pontoNormalizado = EncarregadoObj.Encarregado.Ponto.ToUpper();
                    if (!pontoNormalizado.StartsWith("P_"))
                    {
                        pontoNormalizado = "P_" + pontoNormalizado;
                    }

                    var existePonto = _unitOfWork.Encarregado.GetFirstOrDefault(u =>
                        u.Ponto.ToUpper() == pontoNormalizado
                    );
                    if (id == Guid.Empty && existePonto != null)
                    {
                        AppToast.show("Vermelho", "Já existe um encarregado com esse ponto!", 3000);
                        return true;
                    }
                    if (existePonto != null && existePonto.EncarregadoId != id)
                    {
                        AppToast.show("Vermelho", "Já existe um encarregado com esse ponto!", 3000);
                        return true;
                    }
                }

                return false;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "ChecaDuplicado", error);
                return false;
            }
        }

        private bool ValidaCPF(string cpf)
        {
            try
            {
                // Remove caracteres não numéricos
                cpf = new string(cpf.Where(char.IsDigit).ToArray());

                // Verifica se tem 11 dígitos
                if (cpf.Length != 11)
                    return false;

                // Verifica se todos os dígitos são iguais
                if (cpf.Distinct().Count() == 1)
                    return false;

                // Validação do primeiro dígito verificador
                int soma = 0;
                for (int i = 0; i < 9; i++)
                    soma += int.Parse(cpf[i].ToString()) * (10 - i);

                int resto = (soma * 10) % 11;
                if (resto == 10 || resto == 11) resto = 0;
                if (resto != int.Parse(cpf[9].ToString()))
                    return false;

                // Validação do segundo dígito verificador
                soma = 0;
                for (int i = 0; i < 10; i++)
                    soma += int.Parse(cpf[i].ToString()) * (11 - i);

                resto = (soma * 10) % 11;
                if (resto == 10 || resto == 11) resto = 0;
                if (resto != int.Parse(cpf[10].ToString()))
                    return false;

                return true;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "ValidaCPF", error);
                return false;
            }
        }
    }
}
