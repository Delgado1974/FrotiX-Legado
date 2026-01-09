/*
    ═══════════════════════════════════════════════════════════════════════════════
    📄 DOCUMENTAÇÃO COMPLETA DISPONÍVEL
    ═══════════════════════════════════════════════════════════════════════════════
    
    📍 Localização: Documentacao/Pages/Requisitante - Index.md
    📅 Última Atualização: 08/01/2026
    📋 Versão: 2.0 (Padrão FrotiX Simplificado)
    
    Este arquivo contém os endpoints API REST para gerenciamento de Requisitantes.
    Para entender completamente a funcionalidade, consulte a documentação acima.
    ═══════════════════════════════════════════════════════════════════════════════
*/

using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RequisitanteController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public RequisitanteController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "RequisitanteController.cs" ,
                    "RequisitanteController" ,
                    error
                );
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                var result = (
                    from r in _unitOfWork.Requisitante.GetAll()
                    join s in _unitOfWork.SetorSolicitante.GetAll()
                        on r.SetorSolicitanteId equals s.SetorSolicitanteId
                    orderby r.Nome
                    select new
                    {
                        r.Ponto ,
                        r.Nome ,
                        r.Ramal ,
                        NomeSetor = s.Nome ,
                        r.Status ,
                        r.RequisitanteId ,
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("RequisitanteController.cs" , "Get" , error);
                return View();
            }
        }

        [Route("GetAll")]
        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                var result = (
                    from r in _unitOfWork.Requisitante.GetAll()
                    join s in _unitOfWork.SetorSolicitante.GetAll()
                        on r.SetorSolicitanteId equals s.SetorSolicitanteId into setorJoin
                    from s in setorJoin.DefaultIfEmpty()
                    orderby r.Nome
                    select new
                    {
                        requisitanteId = r.RequisitanteId.ToString() ,
                        ponto = r.Ponto ?? "" ,
                        nome = r.Nome ?? "" ,
                        ramal = r.Ramal ?? 0 ,
                        setorSolicitanteId = r.SetorSolicitanteId != Guid.Empty
                            ? r.SetorSolicitanteId.ToString()
                            : "" ,
                        setorNome = s != null ? s.Nome ?? "" : "" ,
                        status = r.Status ? 1 : 0
                    }
                ).ToList();

                return Json(result);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("RequisitanteController.cs" , "GetAll" , error);
                return Json(new { success = false , message = "Erro ao listar requisitantes" });
            }
        }

        [Route("GetById")]
        [HttpGet]
        public IActionResult GetById(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id) || !Guid.TryParse(id , out Guid guidId))
                {
                    return Json(new { success = false , message = "ID inválido" });
                }

                var requisitante = _unitOfWork.Requisitante.GetFirstOrDefault(r => r.RequisitanteId == guidId);
                if (requisitante == null)
                {
                    return Json(new { success = false , message = "Requisitante não encontrado" });
                }

                return Json(new
                {
                    success = true ,
                    data = new
                    {
                        requisitanteId = requisitante.RequisitanteId.ToString() ,
                        ponto = requisitante.Ponto ?? "" ,
                        nome = requisitante.Nome ?? "" ,
                        ramal = requisitante.Ramal ?? 0 ,
                        setorSolicitanteId = requisitante.SetorSolicitanteId != Guid.Empty
                            ? requisitante.SetorSolicitanteId.ToString()
                            : "" ,
                        status = requisitante.Status
                    }
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("RequisitanteController.cs" , "GetById" , error);
                return Json(new { success = false , message = "Erro ao buscar requisitante" });
            }
        }

        [Route("Upsert")]
        [HttpPost]
        public IActionResult Upsert([FromBody] RequisitanteUpsertModel model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.Nome))
                {
                    return Json(new { success = false , message = "Nome é obrigatório" });
                }

                Requisitante requisitante;
                bool isNew = string.IsNullOrEmpty(model.RequisitanteId) || model.RequisitanteId == Guid.Empty.ToString();

                // Parse do SetorSolicitanteId
                Guid setorId = Guid.Empty;
                if (!string.IsNullOrEmpty(model.SetorSolicitanteId))
                {
                    Guid.TryParse(model.SetorSolicitanteId , out setorId);
                }

                // Pega o ID do usuário logado
                var usuarioId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";

                if (isNew)
                {
                    requisitante = new Requisitante
                    {
                        RequisitanteId = Guid.NewGuid() ,
                        Ponto = model.Ponto ?? "" ,
                        Nome = model.Nome ,
                        Ramal = model.Ramal ,
                        Status = model.Status ,
                        SetorSolicitanteId = setorId ,
                        DataAlteracao = DateTime.Now ,
                        UsuarioIdAlteracao = usuarioId
                    };
                    _unitOfWork.Requisitante.Add(requisitante);
                }
                else
                {
                    var id = Guid.Parse(model.RequisitanteId);
                    requisitante = _unitOfWork.Requisitante.GetFirstOrDefault(r => r.RequisitanteId == id);

                    if (requisitante == null)
                    {
                        return Json(new { success = false , message = "Requisitante não encontrado" });
                    }

                    requisitante.Ponto = model.Ponto ?? "";
                    requisitante.Nome = model.Nome;
                    requisitante.Ramal = model.Ramal;
                    requisitante.Status = model.Status;
                    requisitante.SetorSolicitanteId = setorId;
                    requisitante.DataAlteracao = DateTime.Now;
                    requisitante.UsuarioIdAlteracao = usuarioId;

                    _unitOfWork.Requisitante.Update(requisitante);
                }

                _unitOfWork.Save();

                return Json(new
                {
                    success = true ,
                    message = isNew ? "Requisitante criado com sucesso" : "Requisitante atualizado com sucesso"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("RequisitanteController.cs" , "Upsert" , error);
                var innerMsg = error.InnerException != null ? error.InnerException.Message : "";
                return Json(new { success = false , message = $"Erro: {error.Message} | {innerMsg}" });
            }
        }


        [Route("GetSetores")]
        [HttpGet]
        public IActionResult GetSetores()
        {
            try
            {
                var setores = _unitOfWork.SetorSolicitante.GetAll()
                    .Where(s => s.Status)
                    .OrderBy(s => s.Nome)
                    .Select(s => new
                    {
                        id = s.SetorSolicitanteId.ToString() ,
                        nome = s.Nome ?? ""
                    })
                    .ToList();

                return Json(setores);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("RequisitanteController.cs" , "GetSetores" , error);
                return Json(new List<object>());
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(RequisitanteViewModel model)
        {
            try
            {
                if (model != null && model.RequisitanteId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Requisitante.GetFirstOrDefault(u =>
                        u.RequisitanteId == model.RequisitanteId
                    );
                    if (objFromDb != null)
                    {
                        _unitOfWork.Requisitante.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true ,
                                message = "Requisitante removido com sucesso"
                            }
                        );
                    }
                }
                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar Requisitante"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("RequisitanteController.cs" , "Delete" , error);
                return Json(new { success = false , message = "Erro ao deletar requisitante" });
            }
        }

        [Route("GetSetoresHierarquia")]
        [HttpGet]
        public IActionResult GetSetoresHierarquia()
        {
            try
            {
                var todosSetores = _unitOfWork.SetorSolicitante.GetAll()
                    .Where(s => s.Status)
                    .ToList();

                // Busca setores raiz (sem pai)
                var raizes = todosSetores
                    .Where(s => !s.SetorPaiId.HasValue || s.SetorPaiId.Value == Guid.Empty)
                    .OrderBy(s => s.Nome)
                    .Select(s => MontarHierarquiaSetor(s , todosSetores))
                    .ToList();

                return Json(raizes);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("RequisitanteController.cs" , "GetSetoresHierarquia" , error);
                return Json(new List<object>());
            }
        }

        private object MontarHierarquiaSetor(SetorSolicitante setor , List<SetorSolicitante> todosSetores)
        {
            var filhos = todosSetores
                .Where(s => s.SetorPaiId == setor.SetorSolicitanteId)
                .OrderBy(s => s.Nome)
                .Select(s => MontarHierarquiaSetor(s , todosSetores))
                .ToList();

            return new
            {
                id = setor.SetorSolicitanteId.ToString() ,
                nome = setor.Nome ?? "" ,
                hasChild = filhos.Count > 0 ,
                children = filhos.Count > 0 ? filhos : null
            };
        }

        public class AtualizarRequisitanteDto
        {
            public Guid RequisitanteId
            {
                get; set;
            }
            public int? Ramal
            {
                get; set;
            }
            public Guid? SetorSolicitanteId
            {
                get; set;
            }
        }

        [Route("AtualizarRequisitanteRamalSetor")]
        [HttpPost]
        public IActionResult AtualizarRequisitanteRamalSetor([FromBody] AtualizarRequisitanteDto dto)
        {
            try
            {
                if (dto.RequisitanteId == Guid.Empty)
                {
                    return Json(new
                    {
                        success = false ,
                        message = "ID do requisitante inválido"
                    });
                }

                var requisitante = _unitOfWork.Requisitante.GetFirstOrDefault(r =>
                    r.RequisitanteId == dto.RequisitanteId);

                if (requisitante == null)
                {
                    return Json(new
                    {
                        success = false ,
                        message = "Requisitante não encontrado"
                    });
                }

                bool houveMudanca = false;

                if (dto.Ramal.HasValue && requisitante.Ramal != dto.Ramal.Value)
                {
                    requisitante.Ramal = dto.Ramal.Value;
                    houveMudanca = true;
                }

                if (dto.SetorSolicitanteId.HasValue && requisitante.SetorSolicitanteId != dto.SetorSolicitanteId.Value)
                {
                    requisitante.SetorSolicitanteId = dto.SetorSolicitanteId.Value;
                    houveMudanca = true;
                }

                if (houveMudanca)
                {
                    requisitante.DataAlteracao = DateTime.Now;

                    _unitOfWork.Requisitante.Update(requisitante);
                    _unitOfWork.Save();

                    return Json(new
                    {
                        success = true ,
                        message = "Requisitante atualizado com sucesso"
                    });
                }

                return Json(new
                {
                    success = true ,
                    message = "Nenhuma alteração necessária"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("RequisitanteController.cs" , "AtualizarRequisitanteRamalSetor" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao atualizar requisitante"
                });
            }
        }

        [Route("UpdateStatusRequisitante")]
        public JsonResult UpdateStatusRequisitante(Guid Id)
        {
            try
            {
                if (Id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Requisitante.GetFirstOrDefault(u =>
                        u.RequisitanteId == Id
                    );
                    string Description = "";
                    int type = 0;

                    if (objFromDb != null)
                    {
                        if (objFromDb.Status == true)
                        {
                            objFromDb.Status = false;
                            Description = string.Format(
                                "Atualizado Status do Requisitante [Nome: {0}] (Inativo)" ,
                                objFromDb.Nome
                            );
                            type = 1;
                        }
                        else
                        {
                            objFromDb.Status = true;
                            Description = string.Format(
                                "Atualizado Status do Requisitante [Nome: {0}] (Ativo)" ,
                                objFromDb.Nome
                            );
                            type = 0;
                        }
                        _unitOfWork.Requisitante.Update(objFromDb);
                    }
                    return Json(
                        new
                        {
                            success = true ,
                            message = Description ,
                            type = type ,
                        }
                    );
                }
                return Json(new
                {
                    success = false
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "RequisitanteController.cs" ,
                    "UpdateStatusRequisitante" ,
                    error
                );
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }
    }

    public class RequisitanteUpsertModel
    {
        public string RequisitanteId { get; set; }
        public string Ponto { get; set; }
        public string Nome { get; set; }
        public int? Ramal { get; set; }
        public string SetorSolicitanteId { get; set; }
        public bool Status { get; set; }
    }
}
