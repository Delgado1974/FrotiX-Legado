using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace FrotiX.Controllers
{
    public partial class OcorrenciaViagemController
    {
        /// <summary>
        /// Lista todas as ocorrências de uma viagem específica para o modal
        /// </summary>
        [HttpGet]
        [Route("ListarOcorrenciasModal")]
        public IActionResult ListarOcorrenciasModal(Guid viagemId)
        {
            try
            {
                if (viagemId == Guid.Empty)
                {
                    return new JsonResult(new
                    {
                        success = false,
                        message = "ID da viagem não informado"
                    });
                }

                var ocorrencias = _unitOfWork.OcorrenciaViagem
                    .GetAll(o => o.ViagemId == viagemId)
                    .OrderBy(o => o.DataCriacao)
                    .Select(o => new
                    {
                        o.OcorrenciaViagemId,
                        o.ViagemId,
                        o.Resumo,
                        o.Descricao,
                        o.ImagemOcorrencia,
                        o.DataCriacao,
                        o.Status,
                        o.StatusOcorrencia
                    })
                    .ToList();

                return new JsonResult(new
                {
                    success = true,
                    data = ocorrencias,
                    total = ocorrencias.Count
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OcorrenciaViagemController.cs", "ListarOcorrenciasModal", error);
                return new JsonResult(new
                {
                    success = false,
                    message = "Erro ao listar ocorrências: " + error.Message
                });
            }
        }

        /// <summary>
        /// Lista ocorrências em aberto de um veículo específico
        /// </summary>
        [HttpGet]
        [Route("ListarOcorrenciasVeiculo")]
        public IActionResult ListarOcorrenciasVeiculo(Guid veiculoId)
        {
            try
            {
                if (veiculoId == Guid.Empty)
                {
                    return new JsonResult(new
                    {
                        success = false,
                        message = "ID do veículo não informado"
                    });
                }

                var ocorrencias = _unitOfWork.OcorrenciaViagem
                    .GetAll(o => o.VeiculoId == veiculoId 
                              && o.StatusOcorrencia == true
                              && (o.Status == "Aberta" || o.Status == "Pendente"))
                    .OrderByDescending(o => o.DataCriacao)
                    .Select(o => new
                    {
                        o.OcorrenciaViagemId,
                        o.ViagemId,
                        o.VeiculoId,
                        o.Resumo,
                        o.Descricao,
                        o.ImagemOcorrencia,
                        o.DataCriacao,
                        o.Status,
                        o.StatusOcorrencia
                    })
                    .ToList();

                return new JsonResult(new
                {
                    success = true,
                    data = ocorrencias,
                    total = ocorrencias.Count,
                    temOcorrencias = ocorrencias.Count > 0
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OcorrenciaViagemController.cs", "ListarOcorrenciasVeiculo", error);
                return new JsonResult(new
                {
                    success = false,
                    message = "Erro ao listar ocorrências: " + error.Message
                });
            }
        }

        /// <summary>
        /// Verifica se um veículo possui ocorrências em aberto
        /// </summary>
        [HttpGet]
        [Route("VerificarOcorrenciasVeiculo")]
        public IActionResult VerificarOcorrenciasVeiculo(Guid veiculoId)
        {
            try
            {
                if (veiculoId == Guid.Empty)
                {
                    return new JsonResult(new
                    {
                        success = false,
                        message = "ID do veículo não informado"
                    });
                }

                var quantidade = _unitOfWork.OcorrenciaViagem
                    .GetAll(o => o.VeiculoId == veiculoId 
                              && (o.Status == "Aberta" || o.Status == "Pendente"))
                    .Count();

                return new JsonResult(new
                {
                    success = true,
                    quantidade = quantidade,
                    temOcorrencias = quantidade > 0
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OcorrenciaViagemController.cs", "VerificarOcorrenciasVeiculo", error);
                return new JsonResult(new
                {
                    success = false,
                    message = "Erro ao verificar ocorrências: " + error.Message
                });
            }
        }

        /// <summary>
        /// Exclui uma ocorrência específica
        /// </summary>
        [HttpPost]
        [Route("ExcluirOcorrencia")]
        public IActionResult ExcluirOcorrencia([FromBody] ExcluirOcorrenciaDTO dto)
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

                var ocorrencia = _unitOfWork.OcorrenciaViagem
                    .GetFirstOrDefault(o => o.OcorrenciaViagemId == dto.OcorrenciaViagemId);

                if (ocorrencia == null)
                {
                    return new JsonResult(new
                    {
                        success = false,
                        message = "Ocorrência não encontrada"
                    });
                }

                _unitOfWork.OcorrenciaViagem.Remove(ocorrencia);
                _unitOfWork.Save();

                return new JsonResult(new
                {
                    success = true,
                    message = "Ocorrência excluída com sucesso"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OcorrenciaViagemController.cs", "ExcluirOcorrencia", error);
                return new JsonResult(new
                {
                    success = false,
                    message = "Erro ao excluir ocorrência: " + error.Message
                });
            }
        }
    }

    /// <summary>
    /// DTO para exclusão de ocorrência
    /// </summary>
    public class ExcluirOcorrenciaDTO
    {
        public Guid OcorrenciaViagemId { get; set; }
    }
}

