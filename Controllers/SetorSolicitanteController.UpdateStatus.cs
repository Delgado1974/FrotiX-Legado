using Microsoft.AspNetCore.Mvc;
using System;

namespace FrotiX.Controllers
{
    public partial class SetorSolicitanteController : Controller
    {
        /// <summary>
        /// Alterna o status do setor (Ativo/Inativo)
        /// </summary>
        [Route("UpdateStatus")]
        [HttpGet]
        public IActionResult UpdateStatus(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id) || !Guid.TryParse(id, out Guid guidId))
                {
                    return Json(new { success = false, message = "ID inválido" });
                }

                var setor = _unitOfWork.SetorSolicitante.GetFirstOrDefault(s => s.SetorSolicitanteId == guidId);
                if (setor == null)
                {
                    return Json(new { success = false, message = "Setor não encontrado" });
                }

                // Alterna o status
                setor.Status = !setor.Status;
                setor.DataAlteracao = DateTime.Now;

                _unitOfWork.SetorSolicitante.Update(setor);
                _unitOfWork.Save();

                return Json(new
                {
                    success = true,
                    message = setor.Status ? "Setor ativado com sucesso" : "Setor desativado com sucesso",
                    novoStatus = setor.Status ? 1 : 0
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("SetorSolicitanteController.cs", "UpdateStatus", error);
                return Json(new { success = false, message = "Erro ao alterar status do setor" });
            }
        }
    }
}
