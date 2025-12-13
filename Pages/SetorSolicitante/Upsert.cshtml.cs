using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Security.Claims;

namespace FrotiX.Pages.SetorSolicitante
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly INotyfService _notyf;

        public UpsertModel(IUnitOfWork unitOfWork , ILogger<IndexModel> logger , INotyfService notyf)
        {
            try
            {
                _unitOfWork = unitOfWork;
                _logger = logger;
                _notyf = notyf;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "UpsertModel" , error);
            }
        }

        [BindProperty]
        public Models.SetorSolicitante SetorSolicitanteObj
        {
            get; set;
        }

        public IActionResult OnGet(Guid id)
        {
            try
            {
                SetorSolicitanteObj = new Models.SetorSolicitante();
                if (id != Guid.Empty)
                {
                    SetorSolicitanteObj = _unitOfWork.SetorSolicitante.GetFirstOrDefault(u =>
                        u.SetorSolicitanteId == id
                    );
                    if (SetorSolicitanteObj == null)
                    {
                        return NotFound();
                    }
                }

                PreencheLista();

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
                // Pega o usuário corrente
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                SetorSolicitanteObj.UsuarioIdAlteracao = currentUserID;
                SetorSolicitanteObj.DataAlteracao = DateTime.Now;

                if (!ModelState.IsValid)
                {
                    foreach (var modelState in ModelState.Values)
                    {
                        foreach (var modelError in modelState.Errors)
                        {
                            if (modelError.ErrorMessage != "The UsuarioIdAlteracao field is required.")
                            {
                                var erromodel = modelError.ErrorMessage;
                                PreencheLista();
                                return Page();
                            }
                        }
                    }
                }

                // Verifica Duplicidades
                if (SetorSolicitanteObj.Sigla != null)
                {
                    var existeSigla = _unitOfWork.SetorSolicitante.GetFirstOrDefault(u =>
                        u.Sigla.ToUpper() == SetorSolicitanteObj.Sigla.ToUpper()
                        && u.SetorPaiId == SetorSolicitanteObj.SetorPaiId
                    );
                    if (
                        existeSigla != null
                        && existeSigla.SetorSolicitanteId != SetorSolicitanteObj.SetorSolicitanteId
                        && existeSigla.SetorPaiId == SetorSolicitanteObj.SetorPaiId
                    )
                    {
                        AppToast.show("Vermelho" , "Já existe um Setor com essa sigla!" , 3000);
                        PreencheLista();
                        return Page();
                    }
                }

                var existeSetor = _unitOfWork.SetorSolicitante.GetFirstOrDefault(u =>
                    u.Nome.ToUpper() == SetorSolicitanteObj.Nome.ToUpper()
                    && u.SetorPaiId != SetorSolicitanteObj.SetorPaiId
                );
                if (
                    existeSetor != null
                    && existeSetor.SetorSolicitanteId != SetorSolicitanteObj.SetorSolicitanteId
                )
                {
                    if (existeSetor.SetorPaiId == SetorSolicitanteObj.SetorPaiId)
                    {
                        AppToast.show("Vermelho" , "Já existe um Setor com esse nome!" , 3000);
                        PreencheLista();
                        return Page();
                    }
                }

                if (SetorSolicitanteObj.SetorSolicitanteId == Guid.Empty)
                {
                    AppToast.show("Verde" , "Setor adicionado com sucesso!" , 3000);
                    _unitOfWork.SetorSolicitante.Add(SetorSolicitanteObj);
                }
                else
                {
                    AppToast.show("Verde" , "Setor atualizado com sucesso!" , 3000);
                    _unitOfWork.SetorSolicitante.Update(SetorSolicitanteObj);
                }
                _unitOfWork.Save();
                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostSubmit" , error);
                return RedirectToPage("./Index");
            }
        }

        private class TreeData
        {
            public Guid SetorSolicitanteId
            {
                get; set;
            }

            public Guid SetorPaiId
            {
                get; set;
            }

            public bool HasChild
            {
                get; set;
            }

            public string Sigla
            {
                get; set;
            }

            public bool Expanded
            {
                get; set;
            }

            public bool IsSelected
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
                // Preenche Treeview de Setores
                var ListaSetores = _unitOfWork.ViewSetores.GetAll();
                Guid setorPai = Guid.Empty;
                bool temFilho;
                List<TreeData> TreeDataSource = new List<TreeData>();

                foreach (var setor in ListaSetores)
                {
                    temFilho = false;
                    var objFromDb = _unitOfWork.ViewSetores.GetFirstOrDefault(u =>
                        u.SetorPaiId == setor.SetorSolicitanteId
                    );

                    if (objFromDb != null)
                    {
                        temFilho = true;
                    }
                    if (setor.SetorPaiId != Guid.Empty)
                    {
                        if (temFilho)
                        {
                            if (setor.SetorPaiId != Guid.Empty)
                            {
                                TreeDataSource.Add(
                                    new TreeData
                                    {
                                        SetorSolicitanteId = (Guid)setor.SetorSolicitanteId ,
                                        SetorPaiId = setor.SetorPaiId ?? Guid.Empty ,
                                        Nome = setor.Nome ,
                                        HasChild = true ,
                                    }
                                );
                            }
                            else
                            {
                                TreeDataSource.Add(
                                    new TreeData
                                    {
                                        SetorSolicitanteId = (Guid)setor.SetorSolicitanteId ,
                                        Nome = setor.Nome ,
                                        HasChild = true ,
                                    }
                                );
                            }
                        }
                        else
                        {
                            TreeDataSource.Add(
                                new TreeData
                                {
                                    SetorSolicitanteId = (Guid)setor.SetorSolicitanteId ,
                                    SetorPaiId = setor.SetorPaiId ?? Guid.Empty ,
                                    Nome = setor.Nome ,
                                }
                            );
                        }
                    }
                    else
                    {
                        if (temFilho)
                        {
                            TreeDataSource.Add(
                                new TreeData
                                {
                                    SetorSolicitanteId = (Guid)setor.SetorSolicitanteId ,
                                    Nome = setor.Nome ,
                                    HasChild = true ,
                                }
                            );
                        }
                    }
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
