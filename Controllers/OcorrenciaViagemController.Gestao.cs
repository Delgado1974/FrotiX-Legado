using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.TextNormalization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    /// <summary>
    /// Métodos para a página de Gestão de Ocorrências
    /// </summary>
    public partial class OcorrenciaViagemController
    {
        #region LISTAR PARA GESTÃO

        /// <summary>
        /// Lista todas as ocorrências para a página de gestão com filtros
        /// </summary>
        [HttpGet]
        [Route("ListarGestao")]
        public IActionResult ListarGestao(
            string veiculoId = null ,
            string motoristaId = null ,
            string statusId = null ,
            string data = null ,
            string dataInicial = null ,
            string dataFinal = null)
        {
            try
            {
                Guid? veiculoGuid = null, motoristaGuid = null;
                if (!string.IsNullOrWhiteSpace(veiculoId) && Guid.TryParse(veiculoId , out var vg))
                    veiculoGuid = vg;
                if (!string.IsNullOrWhiteSpace(motoristaId) && Guid.TryParse(motoristaId , out var mg))
                    motoristaGuid = mg;

                var formats = new[]
                {
                    "dd/MM/yyyy",
                    "dd/MM/yyyy HH:mm",
                    "dd/MM/yyyy HH:mm:ss",
                    "yyyy-MM-dd",
                    "yyyy-MM-ddTHH:mm",
                    "yyyy-MM-ddTHH:mm:ss",
                };
                var br = new CultureInfo("pt-BR");
                var inv = CultureInfo.InvariantCulture;

                bool TryParseDt(string s , out DateTime dt) =>
                    DateTime.TryParseExact(s?.Trim() ?? "" , formats , br , DateTimeStyles.None , out dt)
                    || DateTime.TryParseExact(s?.Trim() ?? "" , formats , inv , DateTimeStyles.None , out dt);

                DateTime? dataUnica = null, dtIni = null, dtFim = null;
                if (!string.IsNullOrWhiteSpace(data) && TryParseDt(data , out var d))
                    dataUnica = d;
                if (!string.IsNullOrWhiteSpace(dataInicial) && TryParseDt(dataInicial , out var di))
                    dtIni = di;
                if (!string.IsNullOrWhiteSpace(dataFinal) && TryParseDt(dataFinal , out var df))
                    dtFim = df;

                if (dtIni.HasValue && dtFim.HasValue)
                    dataUnica = null;

                if (dtIni.HasValue && dtFim.HasValue && dtIni > dtFim)
                {
                    var t = dtIni;
                    dtIni = dtFim;
                    dtFim = t;
                }

                bool temFiltro = veiculoGuid.HasValue || motoristaGuid.HasValue || dataUnica.HasValue || (dtIni.HasValue && dtFim.HasValue);
                if (string.IsNullOrWhiteSpace(statusId) && temFiltro)
                    statusId = "Todas";

                var ocorrenciasQuery = _unitOfWork.OcorrenciaViagem.GetAll().AsQueryable();

                if (veiculoGuid.HasValue)
                    ocorrenciasQuery = ocorrenciasQuery.Where(x => x.VeiculoId == veiculoGuid);

                if (motoristaGuid.HasValue)
                    ocorrenciasQuery = ocorrenciasQuery.Where(x => x.MotoristaId == motoristaGuid);

                // CORREÇÃO: Tratar StatusOcorrencia NULL como "Aberta"
                // No banco: NULL ou true = Aberta, false = Baixada
                // Em SQL: NULL != false retorna NULL, não true. Precisamos ser explícitos.
                if (!string.IsNullOrWhiteSpace(statusId) && statusId != "Todas")
                {
                    if (statusId == "Aberta")
                    {
                        // Aberta = StatusOcorrencia é NULL ou true, OU Status == "Aberta"
                        // Exclui Pendente e items em Manutenção
                        ocorrenciasQuery = ocorrenciasQuery.Where(x =>
                            ((x.StatusOcorrencia == null || x.StatusOcorrencia == true || x.Status == "Aberta")
                            && x.Status != "Pendente"
                            && x.ItemManutencaoId == null));
                    }
                    else if (statusId == "Baixada")
                    {
                        // Baixada = StatusOcorrencia == false OU Status == "Baixada"
                        ocorrenciasQuery = ocorrenciasQuery.Where(x =>
                            x.StatusOcorrencia == false ||
                            x.Status == "Baixada");
                    }
                    else if (statusId == "Pendente")
                    {
                        // Pendente = Status == "Pendente"
                        ocorrenciasQuery = ocorrenciasQuery.Where(x => x.Status == "Pendente");
                    }
                    else if (statusId == "Manutenção")
                    {
                        // Manutenção = tem ItemManutencaoId preenchido e não está Baixada
                        ocorrenciasQuery = ocorrenciasQuery.Where(x => 
                            x.ItemManutencaoId != null && 
                            x.StatusOcorrencia != false &&
                            x.Status != "Baixada" &&
                            x.Status != "Pendente");
                    }
                    else
                    {
                        ocorrenciasQuery = ocorrenciasQuery.Where(x => x.Status == statusId);
                    }
                }

                if (dataUnica.HasValue)
                {
                    var dia = dataUnica.Value.Date;
                    ocorrenciasQuery = ocorrenciasQuery.Where(x => x.DataCriacao.Date == dia);
                }
                else if (dtIni.HasValue && dtFim.HasValue)
                {
                    var ini = dtIni.Value.Date;
                    var fim = dtFim.Value.Date;
                    ocorrenciasQuery = ocorrenciasQuery.Where(x => x.DataCriacao.Date >= ini && x.DataCriacao.Date <= fim);
                }

                ocorrenciasQuery = ocorrenciasQuery.OrderByDescending(x => x.DataCriacao);

                var ocorrenciasFiltradas = ocorrenciasQuery.Take(500).ToList();

                if (!ocorrenciasFiltradas.Any())
                {
                    return new JsonResult(new { data = new List<object>() });
                }

                var viagemIds = ocorrenciasFiltradas
                    .Where(o => o.ViagemId != Guid.Empty)
                    .Select(o => o.ViagemId)
                    .Distinct()
                    .ToList();

                var veiculoIds = ocorrenciasFiltradas
                    .Where(o => o.VeiculoId != Guid.Empty)
                    .Select(o => o.VeiculoId)
                    .Distinct()
                    .ToList();

                var motoristaIds = ocorrenciasFiltradas
                    .Where(o => o.MotoristaId.HasValue && o.MotoristaId != Guid.Empty)
                    .Select(o => o.MotoristaId.Value)
                    .Distinct()
                    .ToList();

                var viagens = viagemIds.Any()
                    ? _unitOfWork.Viagem.GetAll(v => viagemIds.Contains(v.ViagemId))
                        .ToDictionary(v => v.ViagemId)
                    : new Dictionary<Guid , Viagem>();

                var veiculos = veiculoIds.Any()
                    ? _unitOfWork.ViewVeiculos.GetAll(v => veiculoIds.Contains(v.VeiculoId))
                        .ToDictionary(v => v.VeiculoId)
                    : new Dictionary<Guid , ViewVeiculos>();

                var motoristas = motoristaIds.Any()
                    ? _unitOfWork.ViewMotoristas.GetAll(m => motoristaIds.Contains(m.MotoristaId))
                        .ToDictionary(m => m.MotoristaId)
                    : new Dictionary<Guid , ViewMotoristas>();

                var result = ocorrenciasFiltradas.Select(oc =>
                {
                    viagens.TryGetValue(oc.ViagemId , out var viagem);
                    veiculos.TryGetValue(oc.VeiculoId , out var veiculo);
                    ViewMotoristas motorista = null;
                    if (oc.MotoristaId.HasValue)
                        motoristas.TryGetValue(oc.MotoristaId.Value , out motorista);

                    // CORREÇÃO: Determinar status corretamente
                    // Prioridade: campo Status se for "Pendente" ou "Manutenção"
                    // Senão: StatusOcorrencia (false = Baixada, NULL ou true = Aberta)
                    string statusFinal;
                    if (!string.IsNullOrEmpty(oc.Status) && (oc.Status == "Pendente" || oc.Status == "Manutenção"))
                    {
                        statusFinal = oc.Status;
                    }
                    else if (oc.StatusOcorrencia == false || oc.Status == "Baixada")
                    {
                        statusFinal = "Baixada";
                    }
                    else
                    {
                        statusFinal = "Aberta";
                    }

                    return new
                    {
                        ocorrenciaViagemId = oc.OcorrenciaViagemId ,
                        viagemId = oc.ViagemId ,
                        noFichaVistoria = viagem?.NoFichaVistoria ,
                        data = oc.DataCriacao.ToString("dd/MM/yyyy") ,
                        nomeMotorista = motorista?.Nome ?? "" ,
                        descricaoVeiculo = veiculo?.VeiculoCompleto ?? "" ,
                        resumoOcorrencia = oc.Resumo ?? "" ,
                        descricaoOcorrencia = oc.Descricao ?? "" ,
                        descricaoSolucaoOcorrencia = oc.Observacoes ?? "" ,
                        statusOcorrencia = statusFinal ,
                        imagemOcorrencia = oc.ImagemOcorrencia ?? "" ,
                        motoristaId = oc.MotoristaId ,
                        veiculoId = oc.VeiculoId ,
                        dataBaixa = oc.DataBaixa.HasValue ? oc.DataBaixa.Value.ToString("dd/MM/yyyy") : "" ,
                        usuarioCriacao = oc.UsuarioCriacao ?? "" ,
                        usuarioBaixa = oc.UsuarioBaixa ?? ""
                    };
                }).ToList();

                return new JsonResult(new { data = result });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OcorrenciaViagemController.cs" , "ListarGestao" , error);
                return new JsonResult(new { data = new List<object>() });
            }
        }

        #endregion LISTAR PARA GESTÃO

        #region EDITAR OCORRÊNCIA

        /// <summary>
        /// Edita uma ocorrência existente (chamado pelo modal de edição)
        /// Suporta alteração da ImagemOcorrencia
        /// </summary>
        [HttpPost]
        [Route("EditarOcorrencia")]
        public async Task<IActionResult> EditarOcorrencia([FromBody] EditarOcorrenciaDTO dto)
        {
            try
            {
                if (dto == null || dto.OcorrenciaViagemId == Guid.Empty)
                {
                    return new JsonResult(new
                    {
                        success = false ,
                        message = "ID da ocorrência não informado"
                    });
                }

                var ocorrencia = _unitOfWork.OcorrenciaViagem
                    .GetFirstOrDefault(o => o.OcorrenciaViagemId == dto.OcorrenciaViagemId);

                if (ocorrencia == null)
                {
                    return new JsonResult(new
                    {
                        success = false ,
                        message = "Ocorrência não encontrada"
                    });
                }

                ocorrencia.Resumo = await TextNormalizationHelper.NormalizeAsync(dto.ResumoOcorrencia ?? ocorrencia.Resumo);
                ocorrencia.Descricao = await TextNormalizationHelper.NormalizeAsync(dto.DescricaoOcorrencia ?? ocorrencia.Descricao);
                ocorrencia.Observacoes = await TextNormalizationHelper.NormalizeAsync(dto.SolucaoOcorrencia ?? ocorrencia.Observacoes);

                if (dto.ImagemOcorrencia != null)
                {
                    ocorrencia.ImagemOcorrencia = dto.ImagemOcorrencia;
                }

                if (!string.IsNullOrWhiteSpace(dto.StatusOcorrencia))
                {
                    var novoStatus = dto.StatusOcorrencia.Trim();
                    // NULL ou true = Aberta, false = Baixada
                    var statusAtualAberta = ocorrencia.StatusOcorrencia != false;

                    if (novoStatus == "Baixada" && statusAtualAberta)
                    {
                        ocorrencia.Status = "Baixada";
                        ocorrencia.StatusOcorrencia = false;
                        ocorrencia.DataBaixa = DateTime.Now;
                        ocorrencia.UsuarioBaixa = HttpContext.User.Identity?.Name ?? "Sistema";
                    }
                    else if (novoStatus == "Aberta" && !statusAtualAberta)
                    {
                        ocorrencia.Status = "Aberta";
                        ocorrencia.StatusOcorrencia = true;
                        ocorrencia.DataBaixa = null;
                        ocorrencia.UsuarioBaixa = "";
                    }
                }

                _unitOfWork.OcorrenciaViagem.Update(ocorrencia);
                _unitOfWork.Save();

                return new JsonResult(new
                {
                    success = true ,
                    message = "Ocorrência atualizada com sucesso"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OcorrenciaViagemController.cs" , "EditarOcorrencia" , error);
                return new JsonResult(new
                {
                    success = false ,
                    message = "Erro ao editar ocorrência: " + error.Message
                });
            }
        }

        #endregion EDITAR OCORRÊNCIA

        #region BAIXAR OCORRÊNCIA

        /// <summary>
        /// Dá baixa em uma ocorrência (botão finalizar na grid ou no modal)
        /// </summary>
        [HttpPost]
        [Route("BaixarOcorrenciaGestao")]
        public IActionResult BaixarOcorrenciaGestao([FromBody] BaixarOcorrenciaDTO dto)
        {
            try
            {
                if (dto == null || dto.OcorrenciaViagemId == Guid.Empty)
                {
                    return new JsonResult(new
                    {
                        success = false ,
                        message = "ID da ocorrência não informado"
                    });
                }

                var ocorrencia = _unitOfWork.OcorrenciaViagem
                    .GetFirstOrDefault(o => o.OcorrenciaViagemId == dto.OcorrenciaViagemId);

                if (ocorrencia == null)
                {
                    return new JsonResult(new
                    {
                        success = false ,
                        message = "Ocorrência não encontrada"
                    });
                }

                // CORREÇÃO: Verificar status considerando NULL como Aberta
                // NULL ou true = Aberta, false = Baixada
                var jaEstaBaixada = ocorrencia.StatusOcorrencia == false;
                if (jaEstaBaixada)
                {
                    return new JsonResult(new
                    {
                        success = false ,
                        message = "Esta ocorrência já está baixada"
                    });
                }

                ocorrencia.Status = "Baixada";
                ocorrencia.StatusOcorrencia = false;
                ocorrencia.DataBaixa = DateTime.Now;
                ocorrencia.UsuarioBaixa = HttpContext.User.Identity?.Name ?? "Sistema";

                _unitOfWork.OcorrenciaViagem.Update(ocorrencia);
                _unitOfWork.Save();

                return new JsonResult(new
                {
                    success = true ,
                    message = "Ocorrência baixada com sucesso"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OcorrenciaViagemController.cs" , "BaixarOcorrenciaGestao" , error);
                return new JsonResult(new
                {
                    success = false ,
                    message = "Erro ao baixar ocorrência: " + error.Message
                });
            }
        }

        #endregion BAIXAR OCORRÊNCIA

        #region BAIXAR COM SOLUÇÃO

        /// <summary>
        /// Dá baixa em uma ocorrência com solução (modal de baixa rápida)
        /// </summary>
        [HttpPost]
        [Route("BaixarOcorrenciaComSolucao")]
        public async Task<IActionResult> BaixarOcorrenciaComSolucao([FromBody] BaixarComSolucaoDTO dto)
        {
            try
            {
                if (dto == null || dto.OcorrenciaViagemId == Guid.Empty)
                {
                    return new JsonResult(new
                    {
                        success = false ,
                        message = "ID da ocorrência não informado"
                    });
                }

                var ocorrencia = _unitOfWork.OcorrenciaViagem
                    .GetFirstOrDefault(o => o.OcorrenciaViagemId == dto.OcorrenciaViagemId);

                if (ocorrencia == null)
                {
                    return new JsonResult(new
                    {
                        success = false ,
                        message = "Ocorrência não encontrada"
                    });
                }

                // Verificar se já está baixada
                var jaEstaBaixada = ocorrencia.StatusOcorrencia == false;
                if (jaEstaBaixada)
                {
                    return new JsonResult(new
                    {
                        success = false ,
                        message = "Esta ocorrência já está baixada"
                    });
                }

                // Atualiza status
                ocorrencia.Status = "Baixada";
                ocorrencia.StatusOcorrencia = false;
                ocorrencia.DataBaixa = DateTime.Now;
                ocorrencia.UsuarioBaixa = HttpContext.User.Identity?.Name ?? "Sistema";

                // Atualiza solução se informada
                if (!string.IsNullOrWhiteSpace(dto.SolucaoOcorrencia))
                {
                    ocorrencia.Observacoes = await TextNormalizationHelper.NormalizeAsync(dto.SolucaoOcorrencia);
                }

                _unitOfWork.OcorrenciaViagem.Update(ocorrencia);
                _unitOfWork.Save();

                return new JsonResult(new
                {
                    success = true ,
                    message = "Ocorrência baixada com sucesso"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OcorrenciaViagemController.cs" , "BaixarOcorrenciaComSolucao" , error);
                return new JsonResult(new
                {
                    success = false ,
                    message = "Erro ao baixar ocorrência: " + error.Message
                });
            }
        }

        #endregion BAIXAR COM SOLUÇÃO

        /// <summary>
        /// Retorna contagem de ocorrências para debug
        /// </summary>
        [HttpGet]
        [Route("ContarOcorrencias")]
        public IActionResult ContarOcorrencias()
        {
            try
            {
                var total = _unitOfWork.OcorrenciaViagem.GetAll().Count();
                // NULL ou true = Aberta, false = Baixada
                var abertas = _unitOfWork.OcorrenciaViagem
                    .GetAll(x => x.StatusOcorrencia == null || x.StatusOcorrencia == true)
                    .Count();
                var baixadas = _unitOfWork.OcorrenciaViagem
                    .GetAll(x => x.StatusOcorrencia == false)
                    .Count();

                return new JsonResult(new
                {
                    success = true ,
                    total = total ,
                    abertas = abertas ,
                    baixadas = baixadas
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("OcorrenciaViagemController.cs" , "ContarOcorrencias" , error);
                return new JsonResult(new
                {
                    success = false ,
                    message = error.Message
                });
            }
        }
    }

    #region DTOs

    /// <summary>
    /// DTO para edição de ocorrência
    /// </summary>
    public class EditarOcorrenciaDTO
    {
        public Guid OcorrenciaViagemId { get; set; }
        public string? ResumoOcorrencia { get; set; }
        public string? DescricaoOcorrencia { get; set; }
        public string? SolucaoOcorrencia { get; set; }
        public string? StatusOcorrencia { get; set; }
        public string? ImagemOcorrencia { get; set; }
    }

    /// <summary>
    /// DTO para baixa de ocorrência
    /// </summary>
    public class BaixarOcorrenciaDTO
    {
        public Guid OcorrenciaViagemId { get; set; }
    }

    /// <summary>
    /// DTO para baixa de ocorrência com solução
    /// </summary>
    public class BaixarComSolucaoDTO
    {
        public Guid OcorrenciaViagemId { get; set; }
        public string? SolucaoOcorrencia { get; set; }
    }

    #endregion DTOs
}
