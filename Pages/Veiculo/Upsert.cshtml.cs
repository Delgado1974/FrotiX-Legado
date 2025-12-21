using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace FrotiX.Pages.Veiculo
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly INotyfService _notyf;

        public static Guid veiculoId;
        public static byte[] CRLVveiculo;

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
        public VeiculoViewModel VeiculoObj
        {
            get; set;
        }

        /// <summary>
        /// Arquivo CRLV para upload direto na página
        /// </summary>
        [BindProperty]
        public IFormFile ArquivoCRLV { get; set; }

        private void SetViewModel()
        {
            try
            {
                VeiculoObj = new VeiculoViewModel
                {
                    MarcaList = _unitOfWork.MarcaVeiculo.GetMarcaVeiculoListForDropDown() ,
                    UnidadeList = _unitOfWork.Unidade.GetUnidadeListForDropDown() ,
                    CombustivelList = _unitOfWork.Combustivel.GetCombustivelListForDropDown() ,
                    ContratoList = _unitOfWork.Contrato.GetDropDown("Locação") ,
                    AtaList = _unitOfWork.AtaRegistroPrecos.GetAtaListForDropDown(1) ,
                    AspNetUsersList = _unitOfWork.AspNetUsers.GetAspNetUsersListForDropDown() ,
                    PlacaBronzeList = _unitOfWork.PlacaBronze.GetPlacaBronzeListForDropDown() ,
                    Veiculo = new Models.Veiculo() ,
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

                // Pega o usuário corrente
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                VeiculoObj.Veiculo.UsuarioIdAlteracao = currentUserID;
                var usuarios = _unitOfWork.AspNetUsers.GetAspNetUsersListForDropDown();

                foreach (var usuario in usuarios)
                {
                    if (usuario.Value == currentUserID)
                    {
                        VeiculoObj.NomeUsuarioAlteracao = usuario.Text;
                    }
                }

                if (id != Guid.Empty)
                {
                    VeiculoObj.Veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.VeiculoId == id);

                    if (VeiculoObj == null)
                    {
                        return NotFound();
                    }
                }
                else
                {
                    VeiculoObj.Veiculo.Status = true;      // TRUE - checkbox marcado
                    VeiculoObj.Veiculo.Reserva = false;    // FALSE - checkbox desmarcado
                    VeiculoObj.Veiculo.Economildo = false;  // FALSE - checkbox desmarcado
                    VeiculoObj.Veiculo.VeiculoProprio = false;
                }

                CRLVveiculo = VeiculoObj.Veiculo.CRLV;

                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnGet" , error);
                return Page();
            }
        }

        // Preenche a lista de modelos baseado no veículo
        public JsonResult OnGetModeloList(Guid id)
        {
            try
            {
                var ModeloList = _unitOfWork.ModeloVeiculo.GetAll().Where(e => e.MarcaId == id);
                return new JsonResult(new
                {
                    data = ModeloList
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnGetModeloList" , error);
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        // Preenche a lista de itens baseado no contrato
        public JsonResult OnGetItemContratual(Guid id)
        {
            try
            {
                var ItemList = (
                    from ivc in _unitOfWork.ItemVeiculoContrato.GetAll()
                    join rc in _unitOfWork.RepactuacaoContrato.GetAll()
                        on ivc.RepactuacaoContratoId equals rc.RepactuacaoContratoId
                    where rc.ContratoId == id
                    orderby rc.DataRepactuacao descending, ivc.NumItem
                    select new
                    {
                        ivc.ItemVeiculoId ,
                        Descricao = "{"
                            + rc.DataRepactuacao?.ToString("dd/MM/yy")
                            + " - "
                            + rc.Descricao
                            + "} - (nº "
                            + ivc.NumItem
                            + ") - "
                            + ivc.Descricao ,
                    }
                ).ToList();

                return new JsonResult(new
                {
                    data = ItemList
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnGetItemContratual" , error);
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        // Preenche a lista de itens baseado a Ata
        public JsonResult OnGetItemAta(Guid id)
        {
            try
            {
                var ItemList = (
                    from iva in _unitOfWork.ItemVeiculoAta.GetAll()
                    join ra in _unitOfWork.RepactuacaoAta.GetAll()
                        on iva.RepactuacaoAtaId equals ra.RepactuacaoAtaId
                    where ra.AtaId == id
                    orderby ra.DataRepactuacao, iva.NumItem
                    select new
                    {
                        iva.ItemVeiculoAtaId ,
                        Descricao = "{"
                            + ra.DataRepactuacao?.ToString("dd/MM/yy")
                            + " - "
                            + ra.Descricao
                            + "} - (nº "
                            + iva.NumItem
                            + ") - "
                            + iva.Descricao ,
                    }
                ).ToList();

                return new JsonResult(new
                {
                    data = ItemList
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnGetItemAta" , error);
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        public IActionResult OnPostSubmit()
        {
            try
            {
                VeiculoObj.Veiculo.Placa = VeiculoObj.Veiculo.Placa.ToUpper();
                VeiculoObj.Veiculo.DataAlteracao = DateTime.Now;

                // Pega o usuário corrente
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                VeiculoObj.Veiculo.UsuarioIdAlteracao = currentUserID;

                if (
                    ModelState
                        .Where(k => (k.Key != "UnidadeId"))
                        .All(v => v.Value.ValidationState == ModelValidationState.Valid)
                )
                {
                    if (!ModelState.IsValid)
                    {
                        SetViewModel();
                        return Page();
                    }
                }

                if (ChecaInconstancias(Guid.Empty))
                {
                    SetViewModel();
                    return Page();
                }

                // Processa o arquivo CRLV se foi enviado
                if (ArquivoCRLV != null && ArquivoCRLV.Length > 0)
                {
                    using (var memoryStream = new MemoryStream())
                    {
                        ArquivoCRLV.CopyTo(memoryStream);
                        VeiculoObj.Veiculo.CRLV = memoryStream.ToArray();
                    }
                }

                // Adiciona o veículo
                if (VeiculoObj.Veiculo.VeiculoId == Guid.Empty)
                {
                    _unitOfWork.Veiculo.Add(VeiculoObj.Veiculo);

                    // Adiciona o veículo ao contrato, caso selecionado
                    if (VeiculoObj.Veiculo.ContratoId != null)
                    {
                        VeiculoContrato veiculoContrato = new VeiculoContrato
                        {
                            ContratoId = (Guid)VeiculoObj.Veiculo.ContratoId ,
                            VeiculoId = VeiculoObj.Veiculo.VeiculoId ,
                        };
                        _unitOfWork.VeiculoContrato.Add(veiculoContrato);
                    }

                    _unitOfWork.Save();

                    AppToast.show("Verde" , "Veículo criado com sucesso!" , 2000);
                }

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostSubmit" , error);
                return RedirectToPage("./Index");
            }
        }

        public IActionResult OnPostEdit(Guid id)
        {
            try
            {
                if (
                    ModelState
                        .Where(k => (k.Key != "UnidadeId"))
                        .All(v => v.Value.ValidationState == ModelValidationState.Valid)
                )
                {
                    if (!ModelState.IsValid)
                    {
                        SetViewModel();
                        VeiculoObj.Veiculo.VeiculoId = id;
                        return Page();
                    }
                }

                VeiculoObj.Veiculo.VeiculoId = id;

                if (ChecaInconstancias(VeiculoObj.Veiculo.VeiculoId))
                {
                    SetViewModel();
                    VeiculoObj.Veiculo.VeiculoId = id;
                    return Page();
                }

                // Atualiza Contrato do Veiculo, se selecionado
                var existeVeiculoContrato = _unitOfWork.VeiculoContrato.GetFirstOrDefault(u =>
                    (u.VeiculoId == VeiculoObj.Veiculo.VeiculoId)
                    && (u.ContratoId == VeiculoObj.Veiculo.ContratoId)
                );

                if (existeVeiculoContrato == null && VeiculoObj.Veiculo.ContratoId != null)
                {
                    VeiculoContrato veiculoContrato = new VeiculoContrato
                    {
                        ContratoId = (Guid)VeiculoObj.Veiculo.ContratoId ,
                        VeiculoId = VeiculoObj.Veiculo.VeiculoId ,
                    };
                    _unitOfWork.VeiculoContrato.Add(veiculoContrato);
                }

                VeiculoObj.Veiculo.DataAlteracao = DateTime.Now;
                VeiculoObj.Veiculo.Placa = VeiculoObj.Veiculo.Placa.ToUpper();

                // Processa o arquivo CRLV se foi enviado
                if (ArquivoCRLV != null && ArquivoCRLV.Length > 0)
                {
                    using (var memoryStream = new MemoryStream())
                    {
                        ArquivoCRLV.CopyTo(memoryStream);
                        VeiculoObj.Veiculo.CRLV = memoryStream.ToArray();
                    }
                }
                else if (CRLVveiculo != null)
                {
                    // Mantém o CRLV existente se não foi enviado novo arquivo
                    VeiculoObj.Veiculo.CRLV = CRLVveiculo;
                }

                _unitOfWork.Veiculo.Update(VeiculoObj.Veiculo);
                _unitOfWork.Save();

                _notyf.Success("Veículo atualizado com sucesso!" , 3);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostEdit" , error);
                return RedirectToPage("./Index");
            }
        }

        private bool ChecaInconstancias(Guid id)
        {
            try
            {
                // === VALIDAÇÕES DE CAMPOS OBRIGATÓRIOS BÁSICOS ===
                
                // Placa
                if (string.IsNullOrWhiteSpace(VeiculoObj.Veiculo.Placa))
                {
                    _notyf.Error("Você precisa informar a placa do veículo!" , 3);
                    return true;
                }

                // Marca e Modelo
                if ((VeiculoObj.Veiculo.MarcaId == null || VeiculoObj.Veiculo.ModeloId == null))
                {
                    _notyf.Error("Você precisa informar a Marca/Modelo do veículo!" , 3);
                    return true;
                }

                // Quilometragem
                if (VeiculoObj.Veiculo.Quilometragem == null)
                {
                    _notyf.Error("Você precisa informar a quilometragem do veículo!" , 3);
                    return true;
                }

                // Unidade Vinculada
                if (VeiculoObj.Veiculo.UnidadeId == null)
                {
                    _notyf.Error("Você precisa informar a Unidade Vinculada do veículo!" , 3);
                    return true;
                }

                // Combustível
                if (VeiculoObj.Veiculo.CombustivelId == null)
                {
                    _notyf.Error("Você precisa informar o combustível!" , 3);
                    return true;
                }

                // Categoria
                if (string.IsNullOrWhiteSpace(VeiculoObj.Veiculo.Categoria))
                {
                    _notyf.Error("Você precisa informar a Categoria do veículo!" , 3);
                    return true;
                }

                // Data de Ingresso na Frota
                if (VeiculoObj.Veiculo.DataIngresso == null)
                {
                    _notyf.Error("Você precisa informar a Data de Ingresso na Frota!" , 3);
                    return true;
                }

                // === VALIDAÇÕES DE DUPLICIDADES ===
                
                // Verifica Placa Duplicada
                var existePlaca = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                    u.Placa.ToUpper() == VeiculoObj.Veiculo.Placa.ToUpper()
                );

                if (id == Guid.Empty && existePlaca != null)
                {
                    _notyf.Error("Já existe um veículo com essa placa!" , 3);
                    return true;
                }

                if (existePlaca != null && existePlaca.VeiculoId != id)
                {
                    _notyf.Error("Já existe um veículo com essa placa!" , 3);
                    return true;
                }

                // Verifica Renavam Duplicado
                var existeRenavam = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                    u.Renavam == VeiculoObj.Veiculo.Renavam
                );

                if (id == Guid.Empty && existeRenavam != null)
                {
                    _notyf.Error("Já existe um veículo com esse Renavam!" , 3);
                    return true;
                }

                if (existeRenavam != null && existeRenavam.VeiculoId != id)
                {
                    _notyf.Error("Já existe um veículo com esse Renavam!" , 3);
                    return true;
                }

                // === VALIDAÇÕES DE VÍNCULO (Contrato/Ata/Próprio) ===
                
                // Deve ter ao menos um: Contrato, Ata ou Veículo Próprio
                if (
                    (
                        VeiculoObj.Veiculo.ContratoId == null
                        && VeiculoObj.Veiculo.AtaId == null
                        && VeiculoObj.Veiculo.VeiculoProprio == false
                    )
                )
                {
                    _notyf.Error(
                        "Você precisa definir se o veículo é próprio ou se pertence a um Contrato ou a uma Ata!" ,
                        3
                    );
                    return true;
                }

                // Se tem Contrato, precisa ter Item Contratual
                if (
                    (
                        VeiculoObj.Veiculo.ContratoId != null
                        && VeiculoObj.Veiculo.ItemVeiculoId == null
                    )
                )
                {
                    _notyf.Error("Você precisa informar o Item Contratual do veículo!" , 3);
                    return true;
                }

                // Se tem Ata, precisa ter Item da Ata
                if (
                    (
                        VeiculoObj.Veiculo.AtaId != null
                        && VeiculoObj.Veiculo.ItemVeiculoAtaId == null
                    )
                )
                {
                    _notyf.Error("Você precisa informar o Item da Ata do veículo!" , 3);
                    return true;
                }

                // Se é Veículo Próprio, precisa ter número de Patrimônio
                if (
                    (
                        VeiculoObj.Veiculo.VeiculoProprio == true
                        && VeiculoObj.Veiculo.Patrimonio == null
                    )
                )
                {
                    _notyf.Error("Você precisa informar o número de patrimônio do veículo!" , 3);
                    return true;
                }

                return false;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "ChecaInconstancias" , error);
                return false;
            }
        }


        // handler is GetSlaveData
        // name is: OnGet[handler]
        public Task<JsonResult> OnGetSlaveData(Guid id)
        {
            try
            {
                var data = _unitOfWork.ModeloVeiculo.GetAll(m => m.MarcaId == id).ToList();

                return Task.FromResult(
                    new JsonResult(new SelectList(data , "ModeloId" , "DescricaoModelo"))
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnGetSlaveData" , error);
                return Task.FromResult(new JsonResult(new
                {
                    sucesso = false
                }));
            }
        }

        // Verifica Placa
        public JsonResult OnGetVerificaPlaca(string id)
        {
            try
            {
                var objPlaca = _unitOfWork.Veiculo.GetFirstOrDefault(v => v.Placa.Contains(id));

                if (objPlaca != null)
                {
                    return new JsonResult(new
                    {
                        data = "Existe Placa"
                    });
                }
                else
                {
                    return new JsonResult(new
                    {
                        data = "Não Existe Placa"
                    });
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnGetVerificaPlaca" , error);
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }
    }
}
