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
    public class OperadorController :Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public OperadorController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OperadorController.cs" , "OperadorController" , error);
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                var result = (
                    from o in _unitOfWork.Operador.GetAll()

                    join ct in _unitOfWork.Contrato.GetAll()
                        on o.ContratoId equals ct.ContratoId
                        into ctr
                    from ctrResult in ctr.DefaultIfEmpty()

                    join f in _unitOfWork.Fornecedor.GetAll()
                        on ctrResult == null
                            ? Guid.Empty
                            : ctrResult.FornecedorId equals f.FornecedorId
                        into frd
                    from frdResult in frd.DefaultIfEmpty()

                    join us in _unitOfWork.AspNetUsers.GetAll()
                        on o.UsuarioIdAlteracao equals us.Id

                    select new
                    {
                        o.OperadorId ,
                        o.Nome ,
                        o.Ponto ,
                        o.Celular01 ,

                        ContratoOperador = ctrResult != null
                            ? (
                                ctrResult.AnoContrato
                                + "/"
                                + ctrResult.NumeroContrato
                                + " - "
                                + frdResult.DescricaoFornecedor
                            )
                            : "<b>(Sem Contrato)</b>" ,

                        o.Status ,
                        o.Foto ,

                        DatadeAlteracao = o.DataAlteracao?.ToString("dd/MM/yy") ,

                        us.NomeCompleto ,
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OperadorController.cs" , "Get" , error);
                return Json(new
                {
                    data = new List<object>()
                });
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(OperadorViewModel model)
        {
            try
            {
                if (model != null && model.OperadorId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Operador.GetFirstOrDefault(u =>
                        u.OperadorId == model.OperadorId
                    );
                    if (objFromDb != null)
                    {
                        var operadorContrato = _unitOfWork.OperadorContrato.GetFirstOrDefault(u =>
                            u.OperadorId == model.OperadorId
                        );
                        if (operadorContrato != null)
                        {
                            return Json(
                                new
                                {
                                    success = false ,
                                    message = "Não foi possível remover o operador. Ele está associado a um ou mais contratos!" ,
                                }
                            );
                        }

                        _unitOfWork.Operador.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true ,
                                message = "Operador removido com sucesso"
                            }
                        );
                    }
                }
                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar operador"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OperadorController.cs" , "Delete" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar operador"
                });
            }
        }

        [Route("UpdateStatusOperador")]
        public JsonResult UpdateStatusOperador(Guid Id)
        {
            try
            {
                if (Id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Operador.GetFirstOrDefault(u => u.OperadorId == Id);
                    string Description = "";
                    int type = 0;

                    if (objFromDb != null)
                    {
                        if (objFromDb.Status == true)
                        {
                            objFromDb.Status = false;
                            Description = string.Format(
                                "Atualizado Status do Operador [Nome: {0}] (Inativo)" ,
                                objFromDb.Nome
                            );
                            type = 1;
                        }
                        else
                        {
                            objFromDb.Status = true;
                            Description = string.Format(
                                "Atualizado Status do Operador  [Nome: {0}] (Ativo)" ,
                                objFromDb.Nome
                            );
                            type = 0;
                        }
                        _unitOfWork.Operador.Update(objFromDb);
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
                Alerta.TratamentoErroComLinha("OperadorController.cs" , "UpdateStatusOperador" , error);
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
                    var objFromDb = _unitOfWork.Operador.GetFirstOrDefault(u =>
                        u.OperadorId == id
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
                Alerta.TratamentoErroComLinha("OperadorController.cs" , "PegaFoto" , error);
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
                var objFromDb = _unitOfWork.Operador.GetFirstOrDefault(u => u.OperadorId == id);
                if (objFromDb.Foto != null)
                {
                    objFromDb.Foto = this.GetImage(Convert.ToBase64String(objFromDb.Foto));
                    return Json(objFromDb.Foto);
                }
                return Json(false);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OperadorController.cs" , "PegaFotoModal" , error);
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
                Alerta.TratamentoErroComLinha("OperadorController.cs" , "GetImage" , error);
                return default(byte[]);
            }
        }

        [HttpGet]
        [Route("OperadorContratos")]
        public IActionResult OperadorContratos(Guid Id)
        {
            try
            {
                var result = (
                    from m in _unitOfWork.Operador.GetAll()

                    join oc in _unitOfWork.OperadorContrato.GetAll()
                        on m.OperadorId equals oc.OperadorId

                    where oc.ContratoId == Id

                    select new
                    {
                        m.OperadorId ,
                        m.Nome ,
                        m.Ponto ,
                        m.Celular01 ,
                        m.Status ,
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OperadorController.cs" , "OperadorContratos" , error);
                return Json(new
                {
                    data = new List<object>()
                });
            }
        }

        [Route("DeleteContrato")]
        [HttpPost]
        public IActionResult DeleteContrato(OperadorViewModel model)
        {
            try
            {
                if (model != null && model.OperadorId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Operador.GetFirstOrDefault(u =>
                        u.OperadorId == model.OperadorId
                    );
                    if (objFromDb != null)
                    {
                        var operadorContrato = _unitOfWork.OperadorContrato.GetFirstOrDefault(u =>
                            u.OperadorId == model.OperadorId && u.ContratoId == model.ContratoId
                        );
                        if (operadorContrato != null)
                        {
                            if (objFromDb.ContratoId == model.ContratoId)
                            {
                                objFromDb.ContratoId = Guid.Empty;
                                _unitOfWork.Operador.Update(objFromDb);
                            }
                            _unitOfWork.OperadorContrato.Remove(operadorContrato);
                            _unitOfWork.Save();
                            return Json(
                                new
                                {
                                    success = true ,
                                    message = "Operador removido com sucesso"
                                }
                            );
                        }
                        return Json(new
                        {
                            success = false ,
                            message = "Erro ao remover operador"
                        });
                    }
                    return Json(new
                    {
                        success = false ,
                        message = "Erro ao remover operador"
                    });
                }
                return Json(new
                {
                    success = false ,
                    message = "Erro ao remover operador"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OperadorController.cs" , "DeleteContrato" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao remover operador"
                });
            }
        }
    }
}
