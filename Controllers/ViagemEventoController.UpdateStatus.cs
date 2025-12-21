using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;

namespace FrotiX.Controllers
{
    public partial class ViagemEventoController
    {
        /// <summary>
        /// Alterna o status do evento (Ativo/Inativo)
        /// Rota: /api/ViagemEvento/UpdateStatusEvento?Id={guid}
        /// </summary>
        [Route("UpdateStatusEvento")]
        [HttpGet]
        public IActionResult UpdateStatusEvento(Guid Id)
        {
            try
            {
                var evento = _unitOfWork.Evento.GetFirstOrDefault(e => e.EventoId == Id);

                if (evento == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Evento não encontrado"
                    });
                }

                // Alterna o status: "1" (Ativo) -> "0" (Inativo) ou "0" -> "1"
                evento.Status = evento.Status == "1" ? "0" : "1";

                _unitOfWork.Evento.Update(evento);
                _unitOfWork.Save();

                return Json(new
                {
                    success = true,
                    type = int.Parse(evento.Status),  // Retorna o novo status como int para o JS
                    message = evento.Status == "1" ? "Evento ativado com sucesso" : "Evento inativado com sucesso"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "UpdateStatusEvento", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao alterar status do evento"
                });
            }
        }
    }
}
