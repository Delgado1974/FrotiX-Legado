using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Controllers
{
    public partial class SetorSolicitanteController : Controller
    {
        [Route("GetAll")]
        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                var todosSetores = _unitOfWork.SetorSolicitante.GetAll()
                    .OrderBy(s => s.Nome)
                    .ToList();

                // Monta estrutura hierárquica
                var raizes = todosSetores
                    .Where(s => !s.SetorPaiId.HasValue || s.SetorPaiId == Guid.Empty)
                    .Select(s => MontarHierarquia(s, todosSetores))
                    .ToList();

                return Json(raizes);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("SetorSolicitanteController.cs", "GetAll", error);
                return Json(new { success = false, message = "Erro ao listar setores solicitantes" });
            }
        }

        private object MontarHierarquia(SetorSolicitante setor, List<SetorSolicitante> todosSetores)
        {
            var filhos = todosSetores
                .Where(s => s.SetorPaiId == setor.SetorSolicitanteId)
                .Select(s => MontarHierarquia(s, todosSetores))
                .ToList();

            return new
            {
                setorSolicitanteId = setor.SetorSolicitanteId.ToString(),
                setorPaiId = setor.SetorPaiId.HasValue && setor.SetorPaiId.Value != Guid.Empty
                    ? setor.SetorPaiId.Value.ToString()
                    : (string)null,
                nome = setor.Nome ?? "",
                sigla = setor.Sigla ?? "",
                ramal = setor.Ramal.HasValue ? setor.Ramal.Value : 0,
                status = setor.Status ? 1 : 0,
                children = filhos.Count > 0 ? filhos : null
            };
        }

        [Route("GetById")]
        [HttpGet]
        public IActionResult GetById(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id) || !Guid.TryParse(id, out Guid guidId))
                {
                    return Json(new { success = false, message = "ID inválido" });
                }

                var setor = _unitOfWork.SetorSolicitante.GetFirstOrDefault(s => s.SetorSolicitanteId == guidId);
                if (setor == null)
                {
                    return Json(new { success = false, message = "Setor não encontrado" });
                }

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        setorSolicitanteId = setor.SetorSolicitanteId.ToString(),
                        setorPaiId = setor.SetorPaiId.HasValue && setor.SetorPaiId.Value != Guid.Empty
                            ? setor.SetorPaiId.Value.ToString()
                            : "",
                        nome = setor.Nome ?? "",
                        sigla = setor.Sigla ?? "",
                        ramal = setor.Ramal ?? 0,
                        status = setor.Status
                    }
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("SetorSolicitanteController.cs", "GetById", error);
                return Json(new { success = false, message = "Erro ao buscar setor solicitante" });
            }
        }

        [Route("Upsert")]
        [HttpPost]
        public IActionResult Upsert([FromBody] SetorSolicitanteUpsertModel model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.Nome))
                {
                    return Json(new { success = false, message = "Nome é obrigatório" });
                }

                SetorSolicitante setor;
                bool isNew = string.IsNullOrEmpty(model.SetorSolicitanteId) || model.SetorSolicitanteId == Guid.Empty.ToString();

                if (isNew)
                {
                    // Novo setor
                    setor = new SetorSolicitante
                    {
                        SetorSolicitanteId = Guid.NewGuid(),
                        Nome = model.Nome,
                        Sigla = model.Sigla,
                        Ramal = model.Ramal,
                        Status = model.Status,
                        SetorPaiId = !string.IsNullOrEmpty(model.SetorPaiId) && Guid.TryParse(model.SetorPaiId, out Guid paiId) && paiId != Guid.Empty
                            ? paiId
                            : (Guid?)null,
                        DataAlteracao = DateTime.Now
                    };
                    _unitOfWork.SetorSolicitante.Add(setor);
                }
                else
                {
                    // Editar setor existente
                    var id = Guid.Parse(model.SetorSolicitanteId);
                    setor = _unitOfWork.SetorSolicitante.GetFirstOrDefault(s => s.SetorSolicitanteId == id);
                    
                    if (setor == null)
                    {
                        return Json(new { success = false, message = "Setor não encontrado" });
                    }

                    setor.Nome = model.Nome;
                    setor.Sigla = model.Sigla;
                    setor.Ramal = model.Ramal;
                    setor.Status = model.Status;
                    setor.SetorPaiId = !string.IsNullOrEmpty(model.SetorPaiId) && Guid.TryParse(model.SetorPaiId, out Guid paiId) && paiId != Guid.Empty
                        ? paiId
                        : (Guid?)null;
                    setor.DataAlteracao = DateTime.Now;

                    _unitOfWork.SetorSolicitante.Update(setor);
                }

                _unitOfWork.Save();

                return Json(new
                {
                    success = true,
                    message = isNew ? "Setor criado com sucesso" : "Setor atualizado com sucesso"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("SetorSolicitanteController.cs", "Upsert", error);
                return Json(new { success = false, message = "Erro ao salvar setor solicitante" });
            }
        }

        [Route("GetSetoresPai")]
        [HttpGet]
        public IActionResult GetSetoresPai(string excludeId = null)
        {
            try
            {
                var setores = _unitOfWork.SetorSolicitante.GetAll()
                    .Where(s => s.Status)
                    .OrderBy(s => s.Nome)
                    .ToList()
                    .Select(s => new
                    {
                        id = s.SetorSolicitanteId.ToString(),
                        nome = s.Nome ?? ""
                    })
                    .ToList();

                // Remove o próprio setor da lista (não pode ser pai de si mesmo)
                if (!string.IsNullOrEmpty(excludeId))
                {
                    setores = setores.Where(s => s.id != excludeId).ToList();
                }

                return Json(setores);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("SetorSolicitanteController.cs", "GetSetoresPai", error);
                return Json(new List<object>());
            }
        }
    }

    public class SetorSolicitanteUpsertModel
    {
        public string SetorSolicitanteId { get; set; }
        public string SetorPaiId { get; set; }
        public string Nome { get; set; }
        public string Sigla { get; set; }
        public int? Ramal { get; set; }
        public bool Status { get; set; }
    }
}
