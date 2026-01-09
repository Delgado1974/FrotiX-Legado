/*
    ═══════════════════════════════════════════════════════════════════════════════
    📄 DOCUMENTAÇÃO COMPLETA DISPONÍVEL
    ═══════════════════════════════════════════════════════════════════════════════
    
    📍 Localização: Documentacao/Pages/Combustivel - Index.md
    📅 Última Atualização: 08/01/2026
    📋 Versão: 2.0 (Padrão FrotiX Simplificado)
    
    Este arquivo contém os endpoints API REST para gerenciamento de Tipos de Combustível.
    Para entender completamente a funcionalidade, consulte a documentação acima.
    ═══════════════════════════════════════════════════════════════════════════════
*/

using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CombustivelController :Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public CombustivelController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "CombustivelController.cs" ,
                    "CombustivelController" ,
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
                    data = _unitOfWork.Combustivel.GetAll()
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("CombustivelController.cs" , "Get" , error);
                return StatusCode(500);
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(CombustivelViewModel model)
        {
            try
            {
                if (model != null && model.CombustivelId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Combustivel.GetFirstOrDefault(u =>
                        u.CombustivelId == model.CombustivelId
                    );
                    if (objFromDb != null)
                    {
                        var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                            u.CombustivelId == model.CombustivelId
                        );
                        if (veiculo != null)
                        {
                            return Json(
                                new
                                {
                                    success = false ,
                                    message = "Existem veículos associados a essa combustível" ,
                                }
                            );
                        }
                        _unitOfWork.Combustivel.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true ,
                                message = "Tipo de Combustível removido com sucesso" ,
                            }
                        );
                    }
                }
                return Json(
                    new
                    {
                        success = false ,
                        message = "Erro ao apagar Tipo de Combustível"
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("CombustivelController.cs" , "Delete" , error);
                return StatusCode(500);
            }
        }

        [Route("UpdateStatusCombustivel")]
        public JsonResult UpdateStatusCombustivel(Guid Id)
        {
            try
            {
                if (Id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Combustivel.GetFirstOrDefault(u =>
                        u.CombustivelId == Id
                    );
                    string Description = "";
                    int type = 0;

                    if (objFromDb != null)
                    {
                        if (objFromDb.Status == true)
                        {
                            objFromDb.Status = false;
                            Description = string.Format(
                                "Atualizado Status do Tipo de Combustível [Nome: {0}] (Inativo)" ,
                                objFromDb.Descricao
                            );
                            type = 1;
                        }
                        else
                        {
                            objFromDb.Status = true;
                            Description = string.Format(
                                "Atualizado Status do Tipo de Combustível  [Nome: {0}] (Ativo)" ,
                                objFromDb.Descricao
                            );
                            type = 0;
                        }
                        _unitOfWork.Combustivel.Update(objFromDb);
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
                    "CombustivelController.cs" ,
                    "UpdateStatusCombustivel" ,
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
