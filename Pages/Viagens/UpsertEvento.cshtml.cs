using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using static FrotiX.Models.Evento;

namespace FrotiX.Pages.Viagens
{
    public class UpsertEventoModel : PageModel
    {
        private static Guid eventoId;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;

        public UpsertEventoModel(
            IUnitOfWork unitOfWork ,
            ILogger<IndexModel> logger
        )
        {
            try
            {
                _unitOfWork = unitOfWork;
                _logger = logger;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UpsertEvento.cshtml.cs" , "UpsertEventoModel" , error);
            }
        }

        [BindProperty]
        public EventoViewModel EventoObj
        {
            get; set;
        }

        public class SetorListItem
        {
            public Guid SetorSolicitanteId
            {
                get; set;
            }

            public string NomeFormatado
            {
                get; set;
            }

            public int Nivel
            {
                get; set;
            }
        }

        private void SetViewModel()
        {
            try
            {
                EventoObj = new EventoViewModel { Evento = new Models.Evento() };
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UpsertEvento.cshtml.cs" , "SetViewModel" , error);
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
                    EventoObj.Evento = _unitOfWork.Evento.GetFirstOrDefault(u => u.EventoId == id);
                    if (EventoObj == null)
                    {
                        return NotFound();
                    }
                }

                PreencheListaSetores();

                PreencheListaRequisitantes();

                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UpsertEvento.cshtml.cs" , "OnGet" , error);
                return Page();
            }
        }

        public IActionResult OnPostSubmit()
        {
            try
            {
                eventoId = EventoObj.EventoId;

                //Valida o ModelState menos o campo VeiculoId
                if (!ModelState.IsValid)
                {
                    PreencheListaSetores();
                    PreencheListaRequisitantes();
                    return Page();
                }

                //Verifica Duplicado
                var existeEvento = _unitOfWork.Evento.GetFirstOrDefault(e =>
                    e.Nome.ToUpper() == EventoObj.Evento.Nome.ToUpper()
                );

                if (EventoObj.Evento.EventoId != Guid.Empty && existeEvento != null)
                {
                    if (EventoObj.Evento.EventoId != existeEvento.EventoId)
                    {
                        AppToast.show("Vermelho" , "Já existe este evento cadastrado!" , 3000);
                        PreencheListaSetores();
                        PreencheListaRequisitantes();
                        return Page();
                    }
                }
                else if (existeEvento != null)
                {
                    AppToast.show("Vermelho" , "Já existe este evento cadastrado!" , 3000);
                    PreencheListaSetores();
                    PreencheListaRequisitantes();
                    return Page();
                }

                if (EventoObj.Evento.EventoId == Guid.Empty)
                {
                    _unitOfWork.Evento.Add(EventoObj.Evento);
                    AppToast.show("Verde" , "Evento cadastrado com sucesso!" , 3000);
                }
                else
                {
                    _unitOfWork.Evento.Update(EventoObj.Evento);
                    AppToast.show("Verde" , "Evento atualizado com sucesso!" , 3000);
                }
                _unitOfWork.Save();

                return RedirectToPage("./ListaEventos");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UpsertEvento.cshtml.cs" , "OnPostSubmit" , error);
                return RedirectToPage("./ListaEventos");
            }
        }

        public class TreeData
        {
            public Guid SetorSolicitanteId
            {
                get; set;
            }

            public Guid? SetorPaiId
            {
                get; set;
            }  // Nullable!

            public string Nome
            {
                get; set;
            }

            public bool HasChild
            {
                get; set;
            }
        }

        public JsonResult OnGetPegaSetor(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return new JsonResult(new
                    {
                        success = false ,
                        message = "ID inválido"
                    });
                }

                // Busca o requisitante com seu setor usando LINQ
                var dados = (from r in _unitOfWork.Requisitante.GetAll()
                             join s in _unitOfWork.SetorSolicitante.GetAll()
                                 on r.SetorSolicitanteId equals s.SetorSolicitanteId
                             where r.RequisitanteId == id
                             select new
                             {
                                 SetorId = s.SetorSolicitanteId ,
                                 SetorNome = s.Nome ,
                                 SetorPaiId = s.SetorPaiId
                             }).FirstOrDefault();

                if (dados == null)
                {
                    return new JsonResult(new
                    {
                        success = false ,
                        message = "Requisitante ou Setor não encontrado"
                    });
                }

                return new JsonResult(new
                {
                    success = true ,
                    data = dados.SetorId ,
                    setorNome = dados.SetorNome ,
                    setorPaiId = dados.SetorPaiId
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "UpsertEvento.cshtml.cs" ,
                    "OnGetPegaSetor" ,
                    error
                );
                return new JsonResult(new
                {
                    success = false ,
                    message = "Erro ao buscar setor do requisitante"
                });
            }
        }

        public void PreencheListaSetores()
        {
            try
            {
                var listaSetores = _unitOfWork.ViewSetores.GetAll().ToList();
                var setoresFormatados = new List<SetorListItem>();

                // Função recursiva para construir hierarquia
                void AdicionarSetorComFilhos(Guid? setorPaiId , int nivel)
                {
                    var setoresDoNivel = listaSetores
                        .Where(s => s.SetorPaiId == setorPaiId)
                        .OrderBy(s => s.Nome)
                        .ToList();

                    foreach (var setor in setoresDoNivel)
                    {
                        // Cria indentação visual baseada no nível
                        string indentacao = new string('–' , nivel * 2); // ou use '  ' para espaços
                        string nomeFormatado = nivel > 0
                            ? $"{indentacao} {setor.Nome}"
                            : setor.Nome;

                        setoresFormatados.Add(new SetorListItem
                        {
                            SetorSolicitanteId = setor.SetorSolicitanteId ,
                            NomeFormatado = nomeFormatado ,
                            Nivel = nivel
                        });

                        // Recursivamente adiciona os filhos
                        AdicionarSetorComFilhos(setor.SetorSolicitanteId , nivel + 1);
                    }
                }

                // Começa pelos setores raiz (sem pai)
                AdicionarSetorComFilhos(null , 0);
                AdicionarSetorComFilhos(Guid.Empty , 0); // Para os que tem Guid.Empty como pai

                ViewData["dataSetor"] = setoresFormatados;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UpsertEvento.cshtml.cs" , "PreencheListaSetores" , error);
            }
        }

        private class RequisitanteData
        {
            public Guid RequisitanteId
            {
                get; set;
            }

            public string Requisitante
            {
                get; set;
            }
        }

        public void PreencheListaRequisitantes()
        {
            try
            {
                //Preenche Treeview de Requisitantes
                //==================================
                //var ListaRequisitantes = _unitOfWork.ViewRequisitantes.GetAll();

                var listaRequisitantes = _unitOfWork
                    .ViewRequisitantes.GetAllReduced(
                        orderBy: r => r.OrderBy(r => r.Requisitante) ,
                        selector: vr => new { vr.Requisitante , vr.RequisitanteId }
                    )
                    .ToList();

                var requisitanteDataSource = new List<RequisitanteData>();

                //string requisitante = "8852C87D-90D8-4A16-8D13-08D97F8B08A4";
                //RequisitanteDataSource.Add(new RequisitanteData
                //{
                //    RequisitanteId = Guid.Parse(requisitante),
                //    Requisitante = "Alexandre Delgado",
                //});

                foreach (var requisitante in listaRequisitantes)
                {
                    requisitanteDataSource.Add(
                        new RequisitanteData
                        {
                            RequisitanteId = (Guid)requisitante.RequisitanteId ,
                            Requisitante = requisitante.Requisitante ,
                        }
                    );
                }

                ViewData["dataRequisitante"] = requisitanteDataSource;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "UpsertEvento.cshtml.cs" ,
                    "PreencheListaRequisitantes" ,
                    error
                );
                return;
            }
        }
    }
}
