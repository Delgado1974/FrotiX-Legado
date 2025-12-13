/*
 * REFATORAÇÕES APLICADAS:
 * - Removido try-catch duplicado no método Get()
 * - Mantida toda estrutura e lógica original
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
    public class LavadorController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public LavadorController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("LavadorController.cs" , "LavadorController" , error);
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                var result = (
                    from l in _unitOfWork.Lavador.GetAll()

                    join ct in _unitOfWork.Contrato.GetAll()
                        on l.ContratoId equals ct.ContratoId
                        into ctr
                    from ctrResult in ctr.DefaultIfEmpty() // <= Left Join

                    join f in _unitOfWork.Fornecedor.GetAll()
                        on ctrResult == null
                            ? Guid.Empty
                            : ctrResult.FornecedorId equals f.FornecedorId
                        into frd
                    from frdResult in frd.DefaultIfEmpty() // <= Left Join

                    join us in _unitOfWork.AspNetUsers.GetAll()
                        on l.UsuarioIdAlteracao equals us.Id

                    select new
                    {
                        l.LavadorId ,
                        l.Nome ,
                        l.Ponto ,
                        l.Celular01 ,

                        ContratoLavador = ctrResult != null
                            ? (
                                ctrResult.AnoContrato
                                + "/"
                                + ctrResult.NumeroContrato
                                + " - "
                                + frdResult.DescricaoFornecedor
                            )
                            : "<b>(Sem Contrato)</b>" ,

                        l.Status ,
                        l.Foto ,

                        DatadeAlteracao = l.DataAlteracao.HasValue ? l.DataAlteracao.Value.ToString("dd/MM/yy") : string.Empty ,

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
                Alerta.TratamentoErroComLinha("LavadorController.cs" , "Get" , error);
                return View(); // padronizado
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(LavadorViewModel model)
        {
            try
            {
                if (model != null && model.LavadorId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Lavador.GetFirstOrDefault(u =>
                        u.LavadorId == model.LavadorId
                    );
                    if (objFromDb != null)
                    {
                        //Verifica se pode apagar o operador
                        var lavadorContrato = _unitOfWork.LavadorContrato.GetFirstOrDefault(u =>
                            u.LavadorId == model.LavadorId
                        );
                        if (lavadorContrato != null)
                        {
                            return Json(
                                new
                                {
                                    success = false ,
                                    message = "Não foi possível remover o lavador. Ele está associado a um ou mais contratos!" ,
                                }
                            );
                        }

                        _unitOfWork.Lavador.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true ,
                                message = "Lavador removido com sucesso"
                            }
                        );
                    }
                }
                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar lavador"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("LavadorController.cs" , "Delete" , error);
                return View(); // padronizado
            }
        }

        [Route("UpdateStatusLavador")]
        public JsonResult UpdateStatusLavador(Guid Id)
        {
            try
            {
                if (Id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Lavador.GetFirstOrDefault(u => u.LavadorId == Id);
                    string Description = "";
                    int type = 0;

                    if (objFromDb != null)
                    {
                        if (objFromDb.Status == true)
                        {
                            //res["success"] = 0;
                            objFromDb.Status = false;
                            Description = string.Format(
                                "Atualizado Status do Lavador [Nome: {0}] (Inativo)" ,
                                objFromDb.Nome
                            );
                            type = 1;
                        }
                        else
                        {
                            //res["success"] = 1;
                            objFromDb.Status = true;
                            Description = string.Format(
                                "Atualizado Status do Lavador  [Nome: {0}] (Ativo)" ,
                                objFromDb.Nome
                            );
                            type = 0;
                        }
                        //_unitOfWork.Save();
                        _unitOfWork.Lavador.Update(objFromDb);
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
                Alerta.TratamentoErroComLinha("LavadorController.cs" , "UpdateStatusLavador" , error);
                return new JsonResult(new
                {
                    sucesso = false
                }); // padronizado
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
                    var objFromDb = _unitOfWork.Lavador.GetFirstOrDefault(u =>
                        u.LavadorId == id
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
                Alerta.TratamentoErroComLinha("LavadorController.cs" , "PegaFoto" , error);
                return new JsonResult(new
                {
                    sucesso = false
                }); // padronizado
            }
        }

        [HttpGet]
        [Route("PegaFotoModal")]
        public JsonResult PegaFotoModal(Guid id)
        {
            try
            {
                var objFromDb = _unitOfWork.Lavador.GetFirstOrDefault(u => u.LavadorId == id);
                if (objFromDb.Foto != null)
                {
                    objFromDb.Foto = this.GetImage(Convert.ToBase64String(objFromDb.Foto));
                    return Json(objFromDb.Foto);
                }
                return Json(false);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("LavadorController.cs" , "PegaFotoModal" , error);
                return new JsonResult(new
                {
                    sucesso = false
                }); // padronizado
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
                Alerta.TratamentoErroComLinha("LavadorController.cs" , "GetImage" , error);
                return default(byte[]); // padronizado
            }
        }

        [HttpGet]
        [Route("LavadorContratos")]
        public IActionResult LavadorContratos(Guid Id)
        {
            try
            {
                var result = (
                    from m in _unitOfWork.Lavador.GetAll()

                    join lc in _unitOfWork.LavadorContrato.GetAll()
                        on m.LavadorId equals lc.LavadorId

                    where lc.ContratoId == Id

                    select new
                    {
                        m.LavadorId ,
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
                Alerta.TratamentoErroComLinha("LavadorController.cs" , "LavadorContratos" , error);
                return View(); // padronizado
            }
        }

        [Route("DeleteContrato")]
        [HttpPost]
        public IActionResult DeleteContrato(LavadorViewModel model)
        {
            try
            {
                if (model != null && model.LavadorId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Lavador.GetFirstOrDefault(u =>
                        u.LavadorId == model.LavadorId
                    );
                    if (objFromDb != null)
                    {
                        //Verifica se pode apagar o Lavador
                        var lavadorContrato = _unitOfWork.LavadorContrato.GetFirstOrDefault(u =>
                            u.LavadorId == model.LavadorId && u.ContratoId == model.ContratoId
                        );
                        if (lavadorContrato != null)
                        {
                            if (objFromDb.ContratoId == model.ContratoId)
                            {
                                objFromDb.ContratoId = Guid.Empty;
                                _unitOfWork.Lavador.Update(objFromDb);
                            }
                            _unitOfWork.LavadorContrato.Remove(lavadorContrato);
                            _unitOfWork.Save();
                            return Json(
                                new
                                {
                                    success = true ,
                                    message = "Lavador removido com sucesso"
                                }
                            );
                        }
                        return Json(new
                        {
                            success = false ,
                            message = "Erro ao remover lavador"
                        });
                    }
                    return Json(new
                    {
                        success = false ,
                        message = "Erro ao remover lavador"
                    });
                }
                return Json(new
                {
                    success = false ,
                    message = "Erro ao remover lavador"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("LavadorController.cs" , "DeleteContrato" , error);
                return View(); // padronizado
            }
        }
    }
}
