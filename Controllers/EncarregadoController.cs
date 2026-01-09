/*
    ═══════════════════════════════════════════════════════════════════════════════
    📄 DOCUMENTAÇÃO COMPLETA DISPONÍVEL
    ═══════════════════════════════════════════════════════════════════════════════
    
    📍 Localização: Documentacao/Pages/Encarregado - Index.md
    📅 Última Atualização: 08/01/2026
    📋 Versão: 2.0 (Padrão FrotiX Simplificado)
    
    Este arquivo contém os endpoints API REST para gerenciamento de Encarregados.
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
    public class EncarregadoController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public EncarregadoController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EncarregadoController.cs", "EncarregadoController", error);
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                var result = (
                    from e in _unitOfWork.Encarregado.GetAll()

                    join ct in _unitOfWork.Contrato.GetAll()
                        on e.ContratoId equals ct.ContratoId
                        into ctr
                    from ctrResult in ctr.DefaultIfEmpty()

                    join f in _unitOfWork.Fornecedor.GetAll()
                        on ctrResult == null
                            ? Guid.Empty
                            : ctrResult.FornecedorId equals f.FornecedorId
                        into frd
                    from frdResult in frd.DefaultIfEmpty()

                    join us in _unitOfWork.AspNetUsers.GetAll()
                        on e.UsuarioIdAlteracao equals us.Id

                    select new
                    {
                        e.EncarregadoId,
                        e.Nome,
                        e.Ponto,
                        e.Celular01,

                        ContratoEncarregado = ctrResult != null
                            ? (
                                ctrResult.AnoContrato
                                + "/"
                                + ctrResult.NumeroContrato
                                + " - "
                                + frdResult.DescricaoFornecedor
                            )
                            : "<b>(Sem Contrato)</b>",

                        e.Status,
                        e.Foto,

                        DatadeAlteracao = e.DataAlteracao?.ToString("dd/MM/yy"),

                        us.NomeCompleto,
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EncarregadoController.cs", "Get", error);
                return Json(new
                {
                    data = new List<object>()
                });
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(EncarregadoViewModel model)
        {
            try
            {
                if (model != null && model.EncarregadoId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Encarregado.GetFirstOrDefault(u =>
                        u.EncarregadoId == model.EncarregadoId
                    );
                    if (objFromDb != null)
                    {
                        var encarregadoContrato = _unitOfWork.EncarregadoContrato.GetFirstOrDefault(u =>
                            u.EncarregadoId == model.EncarregadoId
                        );
                        if (encarregadoContrato != null)
                        {
                            return Json(
                                new
                                {
                                    success = false,
                                    message = "Não foi possível remover o encarregado. Ele está associado a um ou mais contratos!",
                                }
                            );
                        }

                        _unitOfWork.Encarregado.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true,
                                message = "Encarregado removido com sucesso"
                            }
                        );
                    }
                }
                return Json(new
                {
                    success = false,
                    message = "Erro ao apagar encarregado"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EncarregadoController.cs", "Delete", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao apagar encarregado"
                });
            }
        }

        [Route("UpdateStatusEncarregado")]
        public JsonResult UpdateStatusEncarregado(Guid Id)
        {
            try
            {
                if (Id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Encarregado.GetFirstOrDefault(u => u.EncarregadoId == Id);
                    string Description = "";
                    int type = 0;

                    if (objFromDb != null)
                    {
                        if (objFromDb.Status == true)
                        {
                            objFromDb.Status = false;
                            Description = string.Format(
                                "Atualizado Status do Encarregado [Nome: {0}] (Inativo)",
                                objFromDb.Nome
                            );
                            type = 1;
                        }
                        else
                        {
                            objFromDb.Status = true;
                            Description = string.Format(
                                "Atualizado Status do Encarregado [Nome: {0}] (Ativo)",
                                objFromDb.Nome
                            );
                            type = 0;
                        }
                        _unitOfWork.Encarregado.Update(objFromDb);
                    }
                    return Json(
                        new
                        {
                            success = true,
                            message = Description,
                            type = type,
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
                Alerta.TratamentoErroComLinha("EncarregadoController.cs", "UpdateStatusEncarregado", error);
                return new JsonResult(new
                {
                    success = false
                });
            }
        }

        [HttpGet]
        [Route("PegaFoto")]
        public JsonResult PegaFoto(Guid id)
        {
            try
            {
                if (id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Encarregado.GetFirstOrDefault(u =>
                        u.EncarregadoId == id
                    );
                    if (objFromDb.Foto != null)
                    {
                        objFromDb.Foto = this.GetImage(Convert.ToBase64String(objFromDb.Foto));
                        return Json(objFromDb);
                    }
                    return Json(false);
                }
                else
                {
                    return Json(false);
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EncarregadoController.cs", "PegaFoto", error);
                return new JsonResult(new
                {
                    success = false
                });
            }
        }

        [HttpGet]
        [Route("PegaFotoModal")]
        public JsonResult PegaFotoModal(Guid id)
        {
            try
            {
                var objFromDb = _unitOfWork.Encarregado.GetFirstOrDefault(u => u.EncarregadoId == id);
                if (objFromDb.Foto != null)
                {
                    objFromDb.Foto = this.GetImage(Convert.ToBase64String(objFromDb.Foto));
                    return Json(objFromDb.Foto);
                }
                return Json(false);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EncarregadoController.cs", "PegaFotoModal", error);
                return new JsonResult(new
                {
                    success = false
                });
            }
        }

        public byte[] GetImage(string sBase64String)
        {
            try
            {
                byte[] bytes = null;
                if (!string.IsNullOrEmpty(sBase64String))
                {
                    bytes = Convert.FromBase64String(sBase64String);
                }
                return bytes;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EncarregadoController.cs", "GetImage", error);
                return default(byte[]);
            }
        }

        [HttpGet]
        [Route("EncarregadoContratos")]
        public IActionResult EncarregadoContratos(Guid Id)
        {
            try
            {
                var result = (
                    from e in _unitOfWork.Encarregado.GetAll()

                    join ec in _unitOfWork.EncarregadoContrato.GetAll()
                        on e.EncarregadoId equals ec.EncarregadoId

                    where ec.ContratoId == Id

                    select new
                    {
                        e.EncarregadoId,
                        e.Nome,
                        e.Ponto,
                        e.Celular01,
                        e.Status,
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EncarregadoController.cs", "EncarregadoContratos", error);
                return Json(new
                {
                    data = new List<object>()
                });
            }
        }

        [Route("DeleteContrato")]
        [HttpPost]
        public IActionResult DeleteContrato(EncarregadoViewModel model)
        {
            try
            {
                if (model != null && model.EncarregadoId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Encarregado.GetFirstOrDefault(u =>
                        u.EncarregadoId == model.EncarregadoId
                    );
                    if (objFromDb != null)
                    {
                        var encarregadoContrato = _unitOfWork.EncarregadoContrato.GetFirstOrDefault(u =>
                            u.EncarregadoId == model.EncarregadoId && u.ContratoId == model.ContratoId
                        );
                        if (encarregadoContrato != null)
                        {
                            if (objFromDb.ContratoId == model.ContratoId)
                            {
                                objFromDb.ContratoId = Guid.Empty;
                                _unitOfWork.Encarregado.Update(objFromDb);
                            }
                            _unitOfWork.EncarregadoContrato.Remove(encarregadoContrato);
                            _unitOfWork.Save();
                            return Json(
                                new
                                {
                                    success = true,
                                    message = "Encarregado removido com sucesso"
                                }
                            );
                        }
                        return Json(new
                        {
                            success = false,
                            message = "Erro ao remover encarregado"
                        });
                    }
                    return Json(new
                    {
                        success = false,
                        message = "Erro ao remover encarregado"
                    });
                }
                return Json(new
                {
                    success = false,
                    message = "Erro ao remover encarregado"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EncarregadoController.cs", "DeleteContrato", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao remover encarregado"
                });
            }
        }
    }
}
