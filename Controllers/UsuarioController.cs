using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public partial class UsuarioController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public UsuarioController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UsuarioController.cs" , "UsuarioController" , error);
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                var result = (
                    from u in _unitOfWork.AspNetUsers.GetAll()
                    select new
                    {
                        UsuarioId = u.Id ,
                        u.NomeCompleto ,
                        u.Ponto ,
                        u.DetentorCargaPatrimonial ,
                        u.Status ,
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UsuarioController.cs" , "Get" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao carregar dados"
                });
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(AspNetUsers users)
        {
            try
            {
                var objFromDb = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == users.Id);
                if (objFromDb != null)
                {
                    var objControleAcesso = _unitOfWork.ControleAcesso.GetFirstOrDefault(ca =>
                        ca.UsuarioId == users.Id
                    );
                    if (objControleAcesso != null)
                    {
                        return Json(
                            new
                            {
                                success = false ,
                                message = "Não foi possível remover o Usuário. Ele está associado a um ou mais recursos!" ,
                            }
                        );
                    }

                    _unitOfWork.AspNetUsers.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new
                    {
                        success = true ,
                        message = "Usuário removido com sucesso"
                    });
                }

                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar Usuário"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UsuarioController.cs" , "Delete" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao deletar usuário"
                });
            }
        }

        [Route("UpdateStatusUsuario")]
        public JsonResult UpdateStatusUsuario(String Id)
        {
            try
            {
                if (Id != "")
                {
                    var objFromDb = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == Id);
                    string Description = "";
                    int type = 0;

                    if (objFromDb != null)
                    {
                        if (objFromDb.Status == true)
                        {
                            objFromDb.Status = false;
                            Description = string.Format(
                                "Atualizado Status do Usuário [Nome: {0}] (Inativo)" ,
                                objFromDb.NomeCompleto
                            );
                            type = 1;
                        }
                        else
                        {
                            objFromDb.Status = true;
                            Description = string.Format(
                                "Atualizado Status do Usuário  [Nome: {0}] (Ativo)" ,
                                objFromDb.NomeCompleto
                            );
                            type = 0;
                        }
                        _unitOfWork.AspNetUsers.Update(objFromDb);
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
                Alerta.TratamentoErroComLinha("UsuarioController.cs" , "UpdateStatusUsuario" , error);
                return new JsonResult(new
                {
                    success = false
                });
            }
        }

        [Route("UpdateCargaPatrimonial")]
        public JsonResult UpdateCargaPatrimonial(String Id)
        {
            try
            {
                if (Id != "")
                {
                    var objFromDb = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == Id);
                    string Description = "";
                    int type = 0;

                    if (objFromDb != null)
                    {
                        if (objFromDb.DetentorCargaPatrimonial == true)
                        {
                            objFromDb.DetentorCargaPatrimonial = false;
                            Description = string.Format(
                                "Atualizado Carga Patrimonial do Usuário [Nome: {0}] (Não)" ,
                                objFromDb.NomeCompleto
                            );
                            type = 1;
                        }
                        else
                        {
                            objFromDb.DetentorCargaPatrimonial = true;
                            Description = string.Format(
                                "Atualizado Carga Patrimonial do Usuário  [Nome: {0}] (Ativo)" ,
                                objFromDb.NomeCompleto
                            );
                            type = 0;
                        }
                        _unitOfWork.AspNetUsers.Update(objFromDb);
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
                    "UsuarioController.cs" ,
                    "UpdateCargaPatrimonial" ,
                    error
                );
                return new JsonResult(new
                {
                    success = false
                });
            }
        }

        [Route("UpdateStatusAcesso")]
        public JsonResult UpdateStatusAcesso(String IDS)
        {
            try
            {
                string inputString = IDS;
                char separator = '|';

                string[] parts = inputString.Split(separator);

                string usuarioId = parts[0];
                string recursoId = parts[1];

                var objFromDb = _unitOfWork.ControleAcesso.GetFirstOrDefault(ca =>
                    ca.UsuarioId == usuarioId && ca.RecursoId == Guid.Parse(recursoId)
                );
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Acesso == true)
                    {
                        objFromDb.Acesso = false;
                        Description = string.Format(
                            "Atualizado Acesso do Usuário ao Recurso (Sem Acesso)"
                        );
                        type = 1;
                    }
                    else
                    {
                        objFromDb.Acesso = true;
                        Description = string.Format(
                            "Atualizado Acesso do Usuário ao Recurso (Com Acesso)"
                        );
                        type = 0;
                    }
                    _unitOfWork.Save();
                    _unitOfWork.ControleAcesso.Update(objFromDb);
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
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UsuarioController.cs" , "UpdateStatusAcesso" , error);
                return new JsonResult(new
                {
                    success = false
                });
            }
        }

        [Route("PegaRecursosUsuario")]
        [HttpGet]
        public IActionResult PegaRecursosUsuario(String UsuarioId)
        {
            try
            {
                var objRecursos = _unitOfWork.ViewControleAcesso.GetAll(vca =>
                    vca.UsuarioId == UsuarioId
                );

                return Json(new
                {
                    data = objRecursos
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UsuarioController.cs" , "PegaRecursosUsuario" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao carregar recursos"
                });
            }
        }

        [Route("PegaUsuariosRecurso")]
        [HttpGet]
        public IActionResult PegaUsuariosRecurso(String RecursoId)
        {
            try
            {
                var objRecursos = _unitOfWork
                    .ViewControleAcesso.GetAll(vca => vca.RecursoId == Guid.Parse(RecursoId))
                    .OrderBy(vca => vca.NomeCompleto);

                return Json(new
                {
                    data = objRecursos
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UsuarioController.cs" , "PegaUsuariosRecurso" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao carregar usuários"
                });
            }
        }

        [Route("InsereRecursosUsuario")]
        [HttpPost]
        public IActionResult InsereRecursosUsuario()
        {
            try
            {
                var objUsuarios = (
                    from u in _unitOfWork.AspNetUsers.GetAll()
                    select new
                    {
                        UsuarioId = u.Id ,
                        u.NomeCompleto ,
                        u.Ponto ,
                        u.Ramal ,
                        u.Status ,
                    }
                ).ToList();

                var objRecursos = _unitOfWork.Recurso.GetAll();

                foreach (var usuario in objUsuarios)
                {
                    foreach (var recurso in objRecursos)
                    {
                        var objAcesso = new ControleAcesso();

                        objAcesso.UsuarioId = usuario.UsuarioId;
                        objAcesso.RecursoId = recurso.RecursoId;
                        objAcesso.Acesso = true;

                        _unitOfWork.ControleAcesso.Add(objAcesso);
                        _unitOfWork.Save();
                    }
                }

                return Json(new
                {
                    data = true
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "UsuarioController.cs" ,
                    "InsereRecursosUsuario" ,
                    error
                );
                return Json(new
                {
                    success = false ,
                    message = "Erro ao inserir recursos"
                });
            }
        }

        [HttpGet]
        [Route("listaUsuariosDetentores")]
        public IActionResult listaUsuariosDetentores()
        {
            try
            {
                var result = (
                    from u in _unitOfWork.AspNetUsers.GetAll(u =>
                        u.DetentorCargaPatrimonial == true && u.Status == true
                    )
                    select new
                    {
                        UsuarioId = u.Id ,
                        u.NomeCompleto
                    }
                ).ToList();

                return Json(new
                {
                    success = true ,
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "UsuarioController.cs" ,
                    "listaUsuariosDetentores" ,
                    error
                );
                return Json(new
                {
                    success = false ,
                    message = "Erro ao listar usuários"
                });
            }
        }

        [Route("DeleteRecurso")]
        [HttpPost]
        public IActionResult DeleteRecurso([FromBody] string RecursoId)
        {
            try
            {
                var objRecursos = _unitOfWork.Recurso.GetFirstOrDefault(r =>
                    r.RecursoId == Guid.Parse(RecursoId)
                );
                if (objRecursos != null)
                {
                    var objControleAcesso = _unitOfWork.ControleAcesso.GetFirstOrDefault(ca =>
                        ca.RecursoId == objRecursos.RecursoId
                    );
                    if (objControleAcesso != null)
                    {
                        return Json(
                            new
                            {
                                success = false ,
                                message = "Não foi possível remover o Recursos. Ele está associado a um ou mais Usuários!" ,
                            }
                        );
                    }

                    _unitOfWork.Recurso.Remove(objRecursos);
                    _unitOfWork.Save();
                    return Json(new
                    {
                        success = true ,
                        message = "Recurso removido com sucesso"
                    });
                }

                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar Usuário"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UsuarioController.cs" , "DeleteRecurso" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao deletar recurso"
                });
            }
        }
    }
}
