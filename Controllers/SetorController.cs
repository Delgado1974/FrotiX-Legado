using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SetorController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public SetorController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("SetorController.cs" , "SetorController" , error);
            }
        }

        [HttpGet]
        [Route("ListaSetores")]
        public IActionResult ListaSetores()
        {
            try
            {
                var setores = _unitOfWork
                    .SetorPatrimonial.GetAll()
                    .Join(
                        _unitOfWork.AspNetUsers.GetAll() ,
                        setor => setor.DetentorId ,
                        usuario => usuario.Id ,
                        (setor , usuario) => new
                        {
                            SetorId = setor.SetorId ,
                            NomeSetor = setor.NomeSetor ,
                            NomeCompleto = usuario.NomeCompleto ,
                            Status = setor.Status ,
                            SetorBaixa = setor.SetorBaixa
                        }
                    )
                    .OrderBy(x => x.NomeSetor).ToList();

                return Json(new
                {
                    success = true ,
                    data = setores
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("SetorController.cs" , "ListaSetores" , error);
                return Json(
                    new
                    {
                        success = false ,
                        data = new List<object>() ,
                        message = $"Erro ao carregar setores: {error.Message}" ,
                    }
                );
            }
        }

        [Route("UpdateStatusSetor")]
        public JsonResult UpdateStatusSetor(Guid Id)
        {
            try
            {
                if (Id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.SetorPatrimonial.GetFirstOrDefault(u =>
                        u.SetorId == Id
                    );
                    string Description = "";
                    int type = 0;
                    if (objFromDb != null)
                    {
                        if (objFromDb.Status == true)
                        {
                            objFromDb.Status = false;
                            Description = string.Format(
                                "Atualizado Status do Setor [Nome: {0}] (Inativo)" ,
                                objFromDb.NomeSetor
                            );
                            type = 1;
                        }
                        else
                        {
                            objFromDb.Status = true;
                            Description = string.Format(
                                "Atualizado Status do Setor [Nome: {0}] (Ativo)" ,
                                objFromDb.NomeSetor
                            );
                            type = 0;
                        }
                        _unitOfWork.SetorPatrimonial.Update(objFromDb);
                        _unitOfWork.Save();
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
                    "SetorPatrimonialController.cs" ,
                    "UpdateStatusSetor" ,
                    error
                );
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete([FromBody] Guid id)
        {
            try
            {
                if (id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.SetorPatrimonial.GetFirstOrDefault(u =>
                        u.SetorId == id
                    );
                    if (objFromDb != null)
                    {
                        var secao = _unitOfWork.SecaoPatrimonial.GetFirstOrDefault(u =>
                            u.SetorId == id
                        );
                        if (secao != null)
                        {
                            return Json(
                                new
                                {
                                    success = false ,
                                    message = "Existem seções associadas a esse setor" ,
                                }
                            );
                        }
                        _unitOfWork.SetorPatrimonial.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true ,
                                message = "Setor removido com sucesso"
                            }
                        );
                    }
                }
                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar Setor"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("SetorPatrimonialController.cs" , "Delete" , error);
                return StatusCode(500);
            }
        }

        [HttpGet]
        [Route("ListaSetoresCombo")]
        public IActionResult ListaSetoresCombo()
        {
            try
            {
                var setores = _unitOfWork
                    .SetorPatrimonial.GetAll()
                    .Where(s => s.Status == true)
                    .OrderBy(s => s.NomeSetor)
                    .Select(s => new { text = s.NomeSetor , value = s.SetorId })
                    .ToList();

                return Json(new
                {
                    success = true ,
                    data = setores
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("SetorController.cs" , "ListaSetores" , error);
                return Json(
                    new
                    {
                        success = false ,
                        data = new List<object>() ,
                        message = $"Erro ao carregar setores: {error.Message}" ,
                    }
                );
            }
        }
    }
}
