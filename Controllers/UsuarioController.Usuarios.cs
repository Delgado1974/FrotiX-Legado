using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace FrotiX.Controllers
{
    public partial class UsuarioController : Controller
    {
        /// <summary>
        /// Retorna todos os usuários com foto em Base64 para exibição na grid
        /// </summary>
        [HttpGet]
        [Route("GetAll")]
        public IActionResult GetAll()
        {
            try
            {
                var result = (
                    from u in _unitOfWork.AspNetUsers.GetAll()
                    select new
                    {
                        UsuarioId = u.Id,
                        u.NomeCompleto,
                        u.Ponto,
                        u.DetentorCargaPatrimonial,
                        u.Status,
                        FotoBase64 = u.Foto != null ? Convert.ToBase64String(u.Foto) : null
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UsuarioController.cs", "GetAll", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar dados dos usuários"
                });
            }
        }

        /// <summary>
        /// Retorna a foto de um usuário específico em Base64
        /// </summary>
        [HttpGet]
        [Route("GetFoto")]
        public IActionResult GetFoto(string usuarioId)
        {
            try
            {
                if (string.IsNullOrEmpty(usuarioId))
                {
                    return Json(new
                    {
                        success = false,
                        message = "ID do usuário não informado"
                    });
                }

                var usuario = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == usuarioId);

                if (usuario == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Usuário não encontrado"
                    });
                }

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        NomeCompleto = usuario.NomeCompleto,
                        FotoBase64 = usuario.Foto != null ? Convert.ToBase64String(usuario.Foto) : null
                    }
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UsuarioController.cs", "GetFoto", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar foto do usuário"
                });
            }
        }
    }
}
