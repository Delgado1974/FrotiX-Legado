using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FornecedorController :Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public FornecedorController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "FornecedorController.cs" ,
                    "FornecedorController" ,
                    error
                );
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                return Json(new
                {
                    data = _unitOfWork.Fornecedor.GetAll()
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("FornecedorController.cs" , "Get" , error);
                return StatusCode(500);
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(FornecedorViewModel model)
        {
            try
            {
                if (model != null && model.FornecedorId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Fornecedor.GetFirstOrDefault(u =>
                        u.FornecedorId == model.FornecedorId
                    );
                    if (objFromDb != null)
                    {
                        var contrato = _unitOfWork.Contrato.GetFirstOrDefault(u =>
                            u.FornecedorId == model.FornecedorId
                        );
                        if (contrato != null)
                        {
                            return Json(
                                new
                                {
                                    success = false ,
                                    message = "Existem contratos associados a esse fornecedor" ,
                                }
                            );
                        }
                        _unitOfWork.Fornecedor.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true ,
                                message = "Fornecedor removido com sucesso"
                            }
                        );
                    }
                }
                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar Fornecedor"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("FornecedorController.cs" , "Delete" , error);
                return StatusCode(500);
            }
        }

        [Route("UpdateStatusFornecedor")]
        public JsonResult UpdateStatusFornecedor(Guid Id)
        {
            try
            {
                if (Id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Fornecedor.GetFirstOrDefault(u =>
                        u.FornecedorId == Id
                    );
                    string Description = "";
                    int type = 0;

                    if (objFromDb != null)
                    {
                        if (objFromDb.Status == true)
                        {
                            objFromDb.Status = false;
                            Description = string.Format(
                                "Atualizado Status do Fornecedor [Nome: {0}] (Inativo)" ,
                                objFromDb.DescricaoFornecedor
                            );
                            type = 1;
                        }
                        else
                        {
                            objFromDb.Status = true;
                            Description = string.Format(
                                "Atualizado Status do Fornecedor  [Nome: {0}] (Ativo)" ,
                                objFromDb.DescricaoFornecedor
                            );
                            type = 0;
                        }
                        _unitOfWork.Fornecedor.Update(objFromDb);
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
                    "FornecedorController.cs" ,
                    "UpdateStatusFornecedor" ,
                    error
                );
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }
    }
}
