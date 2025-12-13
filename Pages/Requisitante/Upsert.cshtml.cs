using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.Security.Claims;

namespace FrotiX.Pages.Requisitante
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly INotyfService _notyf;

        public static Guid requisitanteId;

        public UpsertModel(
            IUnitOfWork unitOfWork ,
            IWebHostEnvironment hostingEnvironment ,
            INotyfService notyf
        )
        {
            try
            {
                _unitOfWork = unitOfWork;
                _hostingEnvironment = hostingEnvironment;
                _notyf = notyf;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "UpsertModel" , error);
            }
        }

        [BindProperty]
        public RequisitanteViewModel RequisitanteObj
        {
            get; set;
        }

        private void SetViewModel()
        {
            try
            {
                RequisitanteObj = new RequisitanteViewModel
                {
                    SetorSolicitanteList =
                        _unitOfWork.SetorSolicitante.GetSetorSolicitanteListForDropDown() ,
                    Requisitante = new Models.Requisitante()
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

                if (id != Guid.Empty)
                {
                    RequisitanteObj.Requisitante = _unitOfWork.Requisitante.GetFirstOrDefault(u =>
                        u.RequisitanteId == id
                    );
                    if (RequisitanteObj == null)
                    {
                        return NotFound();
                    }
                }

                PreencheLista();

                // Debug: verifica se ViewData foi preenchido
                var dataSource = ViewData["dataSource"] as List<TreeData>;
                System.Diagnostics.Debug.WriteLine($"📊 ViewData[\"dataSource\"] tem {dataSource?.Count ?? 0} itens");

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
                if (!ModelState.IsValid)
                {
                    SetViewModel();
                    return Page();
                }

                //Põe os pontos com "p_" na frente
                if (RequisitanteObj.Requisitante.Ponto.Substring(0 , 2).ToUpper() != "P_")
                {
                    RequisitanteObj.Requisitante.Ponto = "p_" + RequisitanteObj.Requisitante.Ponto;
                }
                else
                {
                    RequisitanteObj.Requisitante.Ponto =
                        "p_"
                        + RequisitanteObj.Requisitante.Ponto.Substring(
                            2 ,
                            RequisitanteObj.Requisitante.Ponto.Length - 2
                        );
                }

                var existeRequisitante = _unitOfWork.Requisitante.GetFirstOrDefault(u =>
                    (u.Ponto == RequisitanteObj.Requisitante.Ponto)
                    || (u.Nome == RequisitanteObj.Requisitante.Nome)
                );
                if (
                    existeRequisitante != null
                    && existeRequisitante.RequisitanteId
                        != RequisitanteObj.Requisitante.RequisitanteId
                )
                {
                    AppToast.show("Vermelho" , "Já existe um Requisitante com esse Ponto/Nome!" , 3000);
                    SetViewModel();
                    PreencheLista();
                    return Page();
                }

                RequisitanteObj.Requisitante.DataAlteracao = DateTime.Now;

                //Pega o usuário corrente
                //=======================
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                RequisitanteObj.Requisitante.UsuarioIdAlteracao = currentUserID;

                _unitOfWork.Requisitante.Add(RequisitanteObj.Requisitante);

                _unitOfWork.Save();

                AppToast.show("Verde" , "Requisitante criado com sucesso!" , 3000);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostSubmit" , error);
                AppToast.show("Vermelho" , "Erro ao criar requisitante. Tente novamente." , 3000);
                return RedirectToPage("./Index");
            }
        }

        public IActionResult OnPostEdit(Guid id)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    SetViewModel();
                    RequisitanteObj.Requisitante.RequisitanteId = id;
                    PreencheLista();
                    return Page();
                }

                RequisitanteObj.Requisitante.RequisitanteId = id;

                var existeRequisitante = _unitOfWork.Requisitante.GetFirstOrDefault(u =>
                    (u.Ponto == RequisitanteObj.Requisitante.Ponto)
                    || (u.Nome == RequisitanteObj.Requisitante.Nome)
                );
                if (
                    existeRequisitante != null
                    && existeRequisitante.RequisitanteId
                        != RequisitanteObj.Requisitante.RequisitanteId
                )
                {
                    AppToast.show("Vermelho" , "Já existe um Requisitante com esse Ponto/Nome!" , 3000);
                    SetViewModel();
                    PreencheLista();
                    return Page();
                }

                RequisitanteObj.Requisitante.DataAlteracao = DateTime.Now;

                //Pega o usuário corrente
                //=======================
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                RequisitanteObj.Requisitante.UsuarioIdAlteracao = currentUserID;

                _unitOfWork.Requisitante.Update(RequisitanteObj.Requisitante);
                _unitOfWork.Save();

                AppToast.show("Verde" , "Requisitante atualizado com sucesso!" , 3000);

                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostEdit" , error);
                AppToast.show("Vermelho" , "Erro ao atualizar requisitante. Tente novamente." , 3000);
                return RedirectToPage("./Index");
            }
        }

        private class TreeData
        {
            public string SetorSolicitanteId
            {
                get; set;
            }  // ← STRING ao invés de Guid

            public string SetorPaiId
            {
                get; set;
            }          // ← STRING ao invés de Guid

            public bool HasChild
            {
                get; set;
            }

            public string Nome
            {
                get; set;
            }
        }

        public void PreencheLista()
        {
            try
            {
                var ListaSetores = _unitOfWork.ViewSetores.GetAll();
                List<TreeData> TreeDataSource = new List<TreeData>();

                foreach (var setor in ListaSetores)
                {
                    bool temFilho = _unitOfWork.ViewSetores.GetFirstOrDefault(u =>
                        u.SetorPaiId == setor.SetorSolicitanteId
                    ) != null;

                    TreeDataSource.Add(new TreeData
                    {
                        SetorSolicitanteId = setor.SetorSolicitanteId.ToString() ,  // ← ToString()
                        SetorPaiId = setor.SetorPaiId == null || setor.SetorPaiId == Guid.Empty
                            ? null  // ← NULL para itens raiz (importante!)
                            : setor.SetorPaiId.ToString() ,  // ← ToString() para filhos
                        Nome = setor.Nome ,
                        HasChild = temFilho
                    });
                }

                ViewData["dataSource"] = TreeDataSource;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "PreencheLista" , error);
                return;
            }
        }
    }
}
