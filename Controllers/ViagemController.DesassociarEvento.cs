using Microsoft.AspNetCore.Mvc;
using System;

namespace FrotiX.Controllers
{
    /// <summary>
    /// ViagemController - Partial Class para API DesassociarViagemEvento
    /// </summary>
    public partial class ViagemController
    {
        /// <summary>
        /// Desassocia uma viagem de um evento, alterando sua finalidade
        /// Rota: /api/viagem/DesassociarViagemEvento
        /// </summary>
        [Route("DesassociarViagemEvento")]
        [HttpPost]
        public IActionResult DesassociarViagemEvento([FromBody] DesassociarViagemRequest request)
        {
            try
            {
                if (request == null || request.ViagemId == Guid.Empty)
                {
                    return Json(new
                    {
                        success = false,
                        message = "ID da viagem não informado"
                    });
                }

                if (string.IsNullOrWhiteSpace(request.NovaFinalidade))
                {
                    return Json(new
                    {
                        success = false,
                        message = "Nova finalidade não informada"
                    });
                }

                var viagem = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ViagemId == request.ViagemId);

                if (viagem == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Viagem não encontrada"
                    });
                }

                // Guarda o evento antigo para invalidar cache
                var eventoAntigoId = viagem.EventoId;

                // Remove a associação com o evento
                viagem.EventoId = null;
                viagem.NomeEvento = null;

                // Altera a finalidade
                viagem.Finalidade = request.NovaFinalidade;

                // Atualiza a viagem
                _unitOfWork.Viagem.Update(viagem);
                _unitOfWork.Save();

                // Invalida cache do evento (se existir)
                if (eventoAntigoId.HasValue && _cache != null)
                {
                    _cache.Remove($"viagens_evento_{eventoAntigoId.Value}_1_50");
                    _cache.Remove($"viagens_evento_{eventoAntigoId.Value}_1_100");
                }

                return Json(new
                {
                    success = true,
                    message = "Viagem desassociada com sucesso!"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemController.cs", "DesassociarViagemEvento", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao desassociar viagem do evento"
                });
            }
        }
    }

    /// <summary>
    /// Request para desassociar viagem de evento
    /// </summary>
    public class DesassociarViagemRequest
    {
        public Guid ViagemId { get; set; }
        public string NovaFinalidade { get; set; }
    }
}
