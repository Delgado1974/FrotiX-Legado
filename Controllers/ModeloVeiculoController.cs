using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ModeloVeiculoController :Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public ModeloVeiculoController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ModeloVeiculoController.cs" ,
                    "ModeloVeiculoController" ,
                    error
                );
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                return Json(
                    new
                    {
                        data = _unitOfWork.ModeloVeiculo.GetAll(null , null , "MarcaVeiculo")
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ModeloVeiculoController.cs" , "Get" , error);
                return View(); // padronizado
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(ModeloVeiculoViewModel model)
        {
            try
            {
                if (model != null && model.ModeloId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.ModeloVeiculo.GetFirstOrDefault(u =>
                        u.ModeloId == model.ModeloId
                    );
                    if (objFromDb != null)
                    {
                        // Verifica se existem veículos associados ao modelo
                        //==================================================
                        var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                            u.ModeloId == model.ModeloId
                        );
                        if (veiculo != null)
                        {
                            return Json(
                                new
                                {
                                    success = false ,
                                    message = "Existem veículos associados a esse modelo" ,
                                }
                            );
                        }
                        _unitOfWork.ModeloVeiculo.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true ,
                                message = "Modelo de veículo removido com sucesso" ,
                            }
                        );
                    }
                }
                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar modelo de veículo"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ModeloVeiculoController.cs" , "Delete" , error);
                return View(); // padronizado
            }
        }

        [Route("UpdateStatusModeloVeiculo")]
        public JsonResult UpdateStatusModeloVeiculo(Guid Id)
        {
            try
            {
                if (Id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.ModeloVeiculo.GetFirstOrDefault(u =>
                        u.ModeloId == Id
                    );
                    string Description = "";
                    int type = 0;

                    if (objFromDb != null)
                    {
                        if (objFromDb.Status == true)
                        {
                            //res["success"] = 0;
                            objFromDb.Status = false;
                            Description = string.Format(
                                "Atualizado Status do Modelo [Nome: {0}] (Inativo)" ,
                                objFromDb.DescricaoModelo
                            );
                            type = 1;
                        }
                        else
                        {
                            //res["success"] = 1;
                            objFromDb.Status = true;
                            Description = string.Format(
                                "Atualizado Status do Modelo  [Nome: {0}] (Ativo)" ,
                                objFromDb.DescricaoModelo
                            );
                            type = 0;
                        }
                        //_unitOfWork.Save();
                        _unitOfWork.ModeloVeiculo.Update(objFromDb);
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
                    "ModeloVeiculoController.cs" ,
                    "UpdateStatusModeloVeiculo" ,
                    error
                );
                return new JsonResult(new
                {
                    sucesso = false
                }); // padronizado
            }
        }
    }
}
