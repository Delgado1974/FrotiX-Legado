using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlacaBronzeController :Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public PlacaBronzeController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "PlacaBronzeController.cs" ,
                    "PlacaBronzeController" ,
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
                    from p in _unitOfWork.PlacaBronze.GetAll()
                    join v in _unitOfWork.Veiculo.GetAll()
                        on p.PlacaBronzeId equals v.PlacaBronzeId
                        into pb
                    from pbResult in pb.DefaultIfEmpty()
                    select new
                    {
                        p.PlacaBronzeId ,
                        p.DescricaoPlaca ,
                        p.Status ,
                        PlacaVeiculo = pbResult != null ? pbResult.Placa : "" ,
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PlacaBronzeController.cs" , "Get" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao carregar dados"
                });
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(PlacaBronzeViewModel model)
        {
            try
            {
                if (model != null && model.PlacaBronzeId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.PlacaBronze.GetFirstOrDefault(u =>
                        u.PlacaBronzeId == model.PlacaBronzeId
                    );
                    if (objFromDb != null)
                    {
                        var modelo = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                            u.PlacaBronzeId == model.PlacaBronzeId
                        );
                        if (modelo != null)
                        {
                            return Json(
                                new
                                {
                                    success = false ,
                                    message = "Existem veículos associados a essa placa" ,
                                }
                            );
                        }
                        _unitOfWork.PlacaBronze.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true ,
                                message = "Placa de Bronze removida com sucesso"
                            }
                        );
                    }
                }
                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar placa de bronze"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PlacaBronzeController.cs" , "Delete" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao deletar placa de bronze"
                });
            }
        }

        [Route("UpdateStatusPlacaBronze")]
        public JsonResult UpdateStatusPlacaBronze(Guid Id)
        {
            try
            {
                if (Id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.PlacaBronze.GetFirstOrDefault(u =>
                        u.PlacaBronzeId == Id
                    );
                    string Description = "";
                    int type = 0;

                    if (objFromDb != null)
                    {
                        if (objFromDb.Status == true)
                        {
                            objFromDb.Status = false;
                            Description = string.Format(
                                "Atualizado Status da Placa [Nome: {0}] (Inativo)" ,
                                objFromDb.DescricaoPlaca
                            );
                            type = 1;
                        }
                        else
                        {
                            objFromDb.Status = true;
                            Description = string.Format(
                                "Atualizado Status da Marca  [Nome: {0}] (Ativo)" ,
                                objFromDb.DescricaoPlaca
                            );
                            type = 0;
                        }
                        _unitOfWork.PlacaBronze.Update(objFromDb);
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
                    "PlacaBronzeController.cs" ,
                    "UpdateStatusPlacaBronze" ,
                    error
                );
                return new JsonResult(new
                {
                    success = false
                });
            }
        }

        [Route("Desvincula")]
        [HttpPost]
        public IActionResult Desvincula(PlacaBronzeViewModel model)
        {
            try
            {
                if (model.PlacaBronzeId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                        u.PlacaBronzeId == model.PlacaBronzeId
                    );
                    string Description = "";
                    int type = 0;

                    if (objFromDb != null)
                    {
                        objFromDb.PlacaBronzeId = Guid.Empty;
                        Description = string.Format(
                            "Placa de Bronze desassociada com sucesso!" ,
                            objFromDb.Placa
                        );
                        type = 1;
                        _unitOfWork.Veiculo.Update(objFromDb);
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
                Alerta.TratamentoErroComLinha("PlacaBronzeController.cs" , "Desvincula" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao desvincular placa"
                });
            }
        }
    }
}
