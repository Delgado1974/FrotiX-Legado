using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.TextNormalization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    /// <summary>
    /// Partial class para adicionar métodos de baixa na tela Upsert
    /// </summary>
    public partial class OcorrenciaViagemController
    {
        #region Métodos para Tela Upsert (Nova Viagem)

        /// <summary>
        /// Baixa uma ocorrência a partir da tela de Nova Viagem (Upsert)
        /// Permite baixar com ou sem solução
        /// </summary>
        [Route("BaixarOcorrenciaUpsert")]
        [HttpPost]
        public async Task<IActionResult> BaixarOcorrenciaUpsert([FromBody] BaixarOcorrenciaUpsertDTO dto)
        {
            try
            {
                if (dto == null || dto.OcorrenciaViagemId == Guid.Empty)
                {
                    return new JsonResult(new
                    {
                        success = false,
                        message = "ID da ocorrência não informado"
                    });
                }

                var ocorrencia = _unitOfWork.OcorrenciaViagem.GetFirstOrDefault(
                    o => o.OcorrenciaViagemId == dto.OcorrenciaViagemId
                );

                if (ocorrencia == null)
                {
                    return new JsonResult(new
                    {
                        success = false,
                        message = "Ocorrência não encontrada"
                    });
                }

                // Se já está baixada, retorna erro
                if (ocorrencia.StatusOcorrencia == false)
                {
                    return new JsonResult(new
                    {
                        success = false,
                        message = "Esta ocorrência já foi baixada"
                    });
                }

                // Atualiza o status (string E bool)
                ocorrencia.Status = "Baixada";
                ocorrencia.StatusOcorrencia = false;  // false = Baixada
                ocorrencia.DataBaixa = DateTime.Now;
                ocorrencia.UsuarioBaixa = HttpContext.User?.Identity?.Name ?? "Sistema";

                // Se informou solução, normaliza e grava
                if (!string.IsNullOrWhiteSpace(dto.SolucaoOcorrencia))
                {
                    ocorrencia.Observacoes = await TextNormalizationHelper.NormalizeAsync(dto.SolucaoOcorrencia);
                }

                _unitOfWork.OcorrenciaViagem.Update(ocorrencia);
                _unitOfWork.Save();

                return new JsonResult(new
                {
                    success = true,
                    message = "Ocorrência baixada com sucesso"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OcorrenciaViagemController.cs", "BaixarOcorrenciaUpsert", error);
                return new JsonResult(new
                {
                    success = false,
                    message = "Erro ao baixar ocorrência: " + error.Message
                });
            }
        }

        #endregion
    }

    #region DTOs para Tela Upsert

    /// <summary>
    /// DTO para baixa de ocorrência na tela Upsert
    /// </summary>
    public class BaixarOcorrenciaUpsertDTO
    {
        public Guid OcorrenciaViagemId { get; set; }
        public string? SolucaoOcorrencia { get; set; }
    }

    #endregion
}
