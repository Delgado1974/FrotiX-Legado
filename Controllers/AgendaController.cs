using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Models.DTO;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AgendaController : ControllerBase
    {
        private readonly FrotiXDbContext _context;
        private readonly ILogger<AbastecimentoController> _logger;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly ViagemEstatisticaService _viagemEstatisticaService;

        public AgendaController(
            ILogger<AbastecimentoController> logger ,
            IWebHostEnvironment hostingEnvironment ,
            IUnitOfWork unitOfWork ,
            FrotiXDbContext context ,
            IViagemEstatisticaRepository viagemEstatisticaRepository
        )
        {
            try
            {
                _logger = logger;
                _hostingEnvironment = hostingEnvironment;
                _unitOfWork = unitOfWork;
                _context = context;
                _viagemEstatisticaService = new ViagemEstatisticaService(context , viagemEstatisticaRepository , unitOfWork);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AgendaController.cs" , "AgendaController" , error);
            }
        }

        // ====================================================================
        // MÉTODO DE TESTE/DEBUG PARA AgendaController.cs
        // Adicione temporariamente para verificar se está retornando dados
        // ====================================================================

        [HttpGet("TestarBuscarViagensRecorrencia")]
        public async Task<IActionResult> TestarBuscarViagensRecorrencia(Guid id)
        {
            try
            {
                // Log detalhado para debug
                var resultado = new
                {
                    idBuscado = id ,
                    timestamp = DateTime.Now
                };

                // Buscar usando o método do repositório
                var viagens = await _unitOfWork.Viagem.BuscarViagensRecorrenciaAsync(id);

                // Informações de debug
                var debug = new
                {
                    idBuscado = id ,
                    totalViagensEncontradas = viagens.Count ,
                    viagens = viagens.Select(v => new
                    {
                        viagemId = v.ViagemId ,
                        recorrenciaViagemId = v.RecorrenciaViagemId ,
                        dataInicial = v.DataInicial ,
                        horaInicio = v.HoraInicio ,
                        origem = v.Origem ,
                        destino = v.Destino ,
                        status = v.Status ,
                        intervalo = v.Intervalo ,
                        recorrente = v.Recorrente
                    }).ToList() ,
                    mensagemDebug = viagens.Count == 0
                        ? "NENHUMA VIAGEM ENCONTRADA - Verifique se o RecorrenciaViagemId está correto no banco"
                        : $"Encontradas {viagens.Count} viagens"
                };

                return Ok(debug);
            }
            catch (Exception error)
            {
                return StatusCode(500 , new
                {
                    sucesso = false ,
                    mensagem = "Erro no teste" ,
                    erro = error.Message ,
                    stack = error.StackTrace
                });
            }
        }

        [HttpGet("BuscarViagensRecorrencia")]
        public async Task<IActionResult> BuscarViagensRecorrencia(Guid? id)
        {
            try
            {
                if (!id.HasValue || id == Guid.Empty)
                {
                    return BadRequest("ID inválido");
                }

                // OTIMIZAÇÃO 1: Usar AsNoTracking para consultas read-only
                // OTIMIZAÇÃO 2: Projetar apenas campos necessários
                // OTIMIZAÇÃO 3: Limitar quantidade de registros

                var viagens = await _unitOfWork.Viagem.GetAllReducedIQueryable(
                    // Projetar APENAS os campos necessários (não a entidade inteira)
                    selector: v => new
                    {
                        v.ViagemId ,
                        v.DataInicial ,
                        v.RecorrenciaViagemId ,
                        v.Status // Se necessário
                    } ,
                    // Filtro otimizado com índice
                    filter: v =>
                        (v.RecorrenciaViagemId == id || v.ViagemId == id) &&
                        v.Status != "Cancelada" , // Evitar trazer canceladas
                                                  // Ordenar por data
                    orderBy: q => q.OrderBy(v => v.DataInicial) ,
                    // Sem includes desnecessários
                    includeProperties: null ,
                    // IMPORTANTE: AsNoTracking para performance
                    asNoTracking: true
                )
                .Take(100) // Limitar para evitar sobrecarga
                .ToListAsync();

                return Ok(viagens);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex , "Erro ao buscar viagens recorrentes");
                return StatusCode(500 , "Erro interno");
            }
        }

        /// <summary>
        /// DTO leve para retornar apenas dados necessários
        /// </summary>
        public class ViagemRecorrenciaDto
        {
            public Guid ViagemId
            {
                get; set;
            }

            public DateTime DataInicial
            {
                get; set;
            }

            public Guid? RecorrenciaViagemId
            {
                get; set;
            }

            public string Status
            {
                get; set;
            }
        }

        [HttpPost("Agendamento")]
        public async Task<IActionResult> AgendamentoAsync([FromBody] AgendamentoViagem viagem)
        {
            try
            {
                ClaimsPrincipal currentUser = this.User;
                if (currentUser == null || currentUser.FindFirst(ClaimTypes.NameIdentifier) == null)
                {
                    return Unauthorized();
                }
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;

                // Normalizar campos de dias da semana - converter null para false
                viagem.Monday = viagem.Monday ?? false;
                viagem.Tuesday = viagem.Tuesday ?? false;
                viagem.Wednesday = viagem.Wednesday ?? false;
                viagem.Thursday = viagem.Thursday ?? false;
                viagem.Friday = viagem.Friday ?? false;
                viagem.Saturday = viagem.Saturday ?? false;
                viagem.Sunday = viagem.Sunday ?? false;

                // Define campos de finalização e criação baseado no Status
                // SOMENTE se ainda não foram preenchidos
                if (viagem.Status == "Realizada")
                {
                    if (string.IsNullOrEmpty(viagem.UsuarioIdFinalizacao))
                    {
                        viagem.UsuarioIdFinalizacao = currentUserID;
                        viagem.DataFinalizacao = DateTime.Now;
                    }

                    if (viagem.CriarViagemFechada == true)
                    {
                        if (string.IsNullOrEmpty(viagem.UsuarioIdCriacao))
                        {
                            viagem.UsuarioIdCriacao = currentUserID;
                            viagem.DataCriacao = DateTime.Now;
                        }
                    }
                }
                else if (viagem.Status == "Aberta")
                {
                    if (string.IsNullOrEmpty(viagem.UsuarioIdCriacao))
                    {
                        viagem.UsuarioIdCriacao = currentUserID;
                        viagem.DataCriacao = DateTime.Now;
                    }
                }
                // Se Status == "Agendada" ou null, NÃO define UsuarioIdCriacao/DataCriacao

                bool isNew = viagem.ViagemId == Guid.Empty;

                // ============================================================================
                // SEÇÃO 1: AGENDAMENTOS RECORRENTES NOVOS
                // ============================================================================
                if (isNew == true && viagem.Recorrente == "S")
                {
                    if (viagem.DatasSelecionadas == null)
                    {
                        viagem.DatasSelecionadas = new List<DateTime>
                        {
                            viagem.DataInicial ?? DateTime.Now,
                        };
                    }

                    if (viagem.DatasSelecionadas.Count == 0)
                    {
                        viagem.DatasSelecionadas = new List<DateTime>
                        {
                            viagem.DataInicial ?? DateTime.Now,
                        };
                    }

                    Viagem novaViagem = new Viagem();
                    var DatasSelecionadasAdicao = viagem.DatasSelecionadas;
                    viagem.DatasSelecionadas = null;

                    if (viagem.StatusAgendamento == null)
                    {
                        viagem.StatusAgendamento = true;
                        viagem.FoiAgendamento = true;
                    }

                    if (viagem.StatusAgendamento == true)
                    {
                        viagem.FoiAgendamento = true;
                    }

                    var primeiraDataSelecionada = DatasSelecionadasAdicao.FirstOrDefault();
                    if (primeiraDataSelecionada != null)
                    {
                        var DataInicial = primeiraDataSelecionada.ToString("dd/MM/yyyy");
                        var HoraInicio = viagem.HoraInicio?.ToString("HH:mm");

                        DateTime DataInicialCompleta;
                        DateTime.TryParseExact(
                            (DataInicial + " " + HoraInicio) ,
                            new string[] { "dd/MM/yyyy HH:mm" } ,
                            System.Globalization.CultureInfo.InvariantCulture ,
                            System.Globalization.DateTimeStyles.None ,
                            out DataInicialCompleta
                        );

                        AtualizarDadosAgendamento(novaViagem , viagem);
                        novaViagem.DataInicial = primeiraDataSelecionada;
                        novaViagem.HoraInicio = new DateTime(
                            DataInicialCompleta.Year ,
                            DataInicialCompleta.Month ,
                            DataInicialCompleta.Day ,
                            DataInicialCompleta.Hour ,
                            DataInicialCompleta.Minute ,
                            DataInicialCompleta.Second
                        );

                        // Gravar UsuarioIdAgendamento e DataAgendamento na primeira viagem recorrente
                        novaViagem.UsuarioIdAgendamento = currentUserID;
                        novaViagem.DataAgendamento = DateTime.Now;

                        _unitOfWork.Viagem.Add(novaViagem);

                        if (viagem.KmFinal != null && viagem.KmFinal != 0)
                        {
                            var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v =>
                                v.VeiculoId == viagem.VeiculoId
                            );
                            if (veiculo.Quilometragem < viagem.KmFinal)
                            {
                                veiculo.Quilometragem = viagem.KmFinal;
                                _unitOfWork.Veiculo.Update(veiculo);
                            }
                        }

                        _unitOfWork.Save();

                        var viagemIdRecorrente = novaViagem.ViagemId;

                        // Loop para datas selecionadas adicionais (dias variados)
                        foreach (var dataSelecionada in DatasSelecionadasAdicao.Skip(1))
                        {
                            try
                            {
                                Viagem novaViagemRecorrente = new Viagem();

                                DataInicial = dataSelecionada.ToString("dd/MM/yyyy");
                                DateTime.TryParseExact(
                                    (DataInicial + " " + HoraInicio) ,
                                    new string[] { "dd/MM/yyyy HH:mm" } ,
                                    System.Globalization.CultureInfo.InvariantCulture ,
                                    System.Globalization.DateTimeStyles.None ,
                                    out DataInicialCompleta
                                );

                                AtualizarDadosAgendamento(novaViagemRecorrente , viagem);
                                novaViagemRecorrente.DataInicial = dataSelecionada;
                                novaViagemRecorrente.HoraInicio = new DateTime(
                                    DataInicialCompleta.Year ,
                                    DataInicialCompleta.Month ,
                                    DataInicialCompleta.Day ,
                                    DataInicialCompleta.Hour ,
                                    DataInicialCompleta.Minute ,
                                    DataInicialCompleta.Second
                                );
                                novaViagemRecorrente.RecorrenciaViagemId = viagemIdRecorrente;

                                // Gravar UsuarioIdAgendamento e DataAgendamento
                                novaViagemRecorrente.UsuarioIdAgendamento = currentUserID;
                                novaViagemRecorrente.DataAgendamento = DateTime.Now;

                                // Gravar campos de criação/finalização baseado no Status
                                // SOMENTE se ainda não foram preenchidos
                                if (viagem.Status == "Realizada")
                                {
                                    if (string.IsNullOrEmpty(novaViagemRecorrente.UsuarioIdFinalizacao))
                                    {
                                        novaViagemRecorrente.UsuarioIdFinalizacao = currentUserID;
                                        novaViagemRecorrente.DataFinalizacao = DateTime.Now;
                                    }

                                    if (viagem.CriarViagemFechada == true)
                                    {
                                        if (string.IsNullOrEmpty(novaViagemRecorrente.UsuarioIdCriacao))
                                        {
                                            novaViagemRecorrente.UsuarioIdCriacao = currentUserID;
                                            novaViagemRecorrente.DataCriacao = DateTime.Now;
                                        }
                                    }
                                }
                                else if (viagem.Status == "Aberta")
                                {
                                    if (string.IsNullOrEmpty(novaViagemRecorrente.UsuarioIdCriacao))
                                    {
                                        novaViagemRecorrente.UsuarioIdCriacao = currentUserID;
                                        novaViagemRecorrente.DataCriacao = DateTime.Now;
                                    }
                                }
                                // Se Status == "Agendada", NÃO grava UsuarioIdCriacao/DataCriacao

                                _unitOfWork.Viagem.Add(novaViagemRecorrente);
                                _unitOfWork.Save();
                            }
                            catch (Exception error)
                            {
                                Alerta.TratamentoErroComLinha(
                                    "AgendaController.cs" ,
                                    "Agendamento.foreach" ,
                                    error
                                );
                            }
                        }

                        // Loop para intervalos (D, S, Q, M)
                        if (
                            viagem.Intervalo == "D"
                            || viagem.Intervalo == "S"
                            || viagem.Intervalo == "Q"
                            || viagem.Intervalo == "M"
                        )
                        {
                            try
                            {
                                DateTime proximaData = primeiraDataSelecionada;
                                int incremento = 0;

                                switch (viagem.Intervalo)
                                {
                                    case "D":
                                        incremento = 1;
                                        break;

                                    case "S":
                                        incremento = 7;
                                        break;

                                    case "Q":
                                        incremento = 15;
                                        break;

                                    case "M":
                                        incremento = 30;
                                        break;
                                }

                                for (int i = 1 ; i < DatasSelecionadasAdicao.Count() ; i++)
                                {
                                    try
                                    {
                                        proximaData = proximaData.AddDays(incremento);

                                        Viagem novaViagemPeriodo = new Viagem();
                                        AtualizarDadosAgendamento(novaViagemPeriodo , viagem);
                                        novaViagemPeriodo.DataInicial = proximaData;
                                        novaViagemPeriodo.HoraInicio = new DateTime(
                                            proximaData.Year ,
                                            proximaData.Month ,
                                            proximaData.Day ,
                                            DataInicialCompleta.Hour ,
                                            DataInicialCompleta.Minute ,
                                            DataInicialCompleta.Second
                                        );
                                        novaViagemPeriodo.RecorrenciaViagemId = viagemIdRecorrente;

                                        // Gravar UsuarioIdAgendamento e DataAgendamento
                                        novaViagemPeriodo.UsuarioIdAgendamento = currentUserID;
                                        novaViagemPeriodo.DataAgendamento = DateTime.Now;

                                        // Gravar campos de criação/finalização baseado no Status
                                        // SOMENTE se ainda não foram preenchidos
                                        if (viagem.Status == "Realizada")
                                        {
                                            if (string.IsNullOrEmpty(novaViagemPeriodo.UsuarioIdFinalizacao))
                                            {
                                                novaViagemPeriodo.UsuarioIdFinalizacao = currentUserID;
                                                novaViagemPeriodo.DataFinalizacao = DateTime.Now;
                                            }

                                            if (viagem.CriarViagemFechada == true)
                                            {
                                                if (string.IsNullOrEmpty(novaViagemPeriodo.UsuarioIdCriacao))
                                                {
                                                    novaViagemPeriodo.UsuarioIdCriacao = currentUserID;
                                                    novaViagemPeriodo.DataCriacao = DateTime.Now;
                                                }
                                            }
                                        }
                                        else if (viagem.Status == "Aberta")
                                        {
                                            if (string.IsNullOrEmpty(novaViagemPeriodo.UsuarioIdCriacao))
                                            {
                                                novaViagemPeriodo.UsuarioIdCriacao = currentUserID;
                                                novaViagemPeriodo.DataCriacao = DateTime.Now;
                                            }
                                        }
                                        // Se Status == "Agendada", NÃO grava UsuarioIdCriacao/DataCriacao

                                        _unitOfWork.Viagem.Add(novaViagemPeriodo);
                                        _unitOfWork.Save();
                                    }
                                    catch (Exception error)
                                    {
                                        Alerta.TratamentoErroComLinha(
                                            "AgendaController.cs" ,
                                            "Agendamento.intervalo.for" ,
                                            error
                                        );
                                    }
                                }
                            }
                            catch (Exception error)
                            {
                                Alerta.TratamentoErroComLinha(
                                    "AgendaController.cs" ,
                                    "Agendamento.intervalo" ,
                                    error
                                );
                            }
                        }
                    }

                    novaViagem.OperacaoBemSucedida = true;
                    return Ok(new
                    {
                        novaViagem ,
                        success = true
                    });
                }

                // ============================================================================
                // SEÇÃO 2: UPDATE (EDIÇÃO OU TRANSFORMAÇÃO EM VIAGEM)
                // ============================================================================
                if (isNew == false)
                {
                    var agendamentoAtual = _unitOfWork.Viagem.GetFirstOrDefault(vg =>
                        vg.ViagemId == viagem.ViagemId
                    );
                    if (agendamentoAtual == null)
                    {
                        return NotFound(
                            new
                            {
                                success = false ,
                                message = "Agendamento não encontrado"
                            }
                        );
                    }

                    var dataOriginal = agendamentoAtual.DataInicial;
                    var horaOriginal = agendamentoAtual.HoraInicio;
                    var dataFinalKeep = agendamentoAtual.DataFinal;
                    var horaFimKeep = agendamentoAtual.HoraFim;

                    agendamentoAtual.AtualizarDados(viagem);
                    agendamentoAtual.DataInicial = dataOriginal;

                    if (viagem.Status == "Agendada")
                    {
                        agendamentoAtual.DataInicial = viagem.DataInicial;
                    }

                    if (viagem.HoraInicio.HasValue && dataOriginal.HasValue)
                    {
                        agendamentoAtual.HoraInicio = CombineHourKeepingDate(
                            dataOriginal ,
                            viagem.HoraInicio
                        );
                    }
                    else
                    {
                        agendamentoAtual.HoraInicio = horaOriginal;
                    }

                    agendamentoAtual.DataFinal = viagem.DataFinal ?? dataFinalKeep;
                    agendamentoAtual.HoraFim = viagem.HoraFim ?? horaFimKeep;

                    // Verifica se tem campos de finalização preenchidos e Status é Realizada
                    // SOMENTE grava se ainda não tiver UsuarioIdFinalizacao
                    bool temCamposFinalizacao = viagem.DataFinal.HasValue &&
                                                viagem.HoraFim.HasValue;

                    if (temCamposFinalizacao && viagem.Status == "Realizada")
                    {
                        if (string.IsNullOrEmpty(agendamentoAtual.UsuarioIdFinalizacao))
                        {
                            agendamentoAtual.UsuarioIdFinalizacao = currentUserID;
                            agendamentoAtual.DataFinalizacao = DateTime.Now;
                        }
                    }

                    // Verifica se é uma transformação de agendamento para viagem
                    // SOMENTE grava se ainda não tiver UsuarioIdCriacao
                    bool isTransformacaoParaViagem = viagem.FoiAgendamento == true &&
                                                      (viagem.Status == "Aberta" || viagem.Status == "Realizada");

                    if (isTransformacaoParaViagem)
                    {
                        // Se veio do frontend com os dados já preenchidos (linhas 12-30)
                        if (!string.IsNullOrEmpty(viagem.UsuarioIdCriacao))
                        {
                            // Só sobrescreve se o campo atual estiver vazio
                            if (string.IsNullOrEmpty(agendamentoAtual.UsuarioIdCriacao))
                            {
                                agendamentoAtual.UsuarioIdCriacao = viagem.UsuarioIdCriacao;
                                agendamentoAtual.DataCriacao = viagem.DataCriacao;
                            }
                        }
                        // Se ainda não tem UsuarioIdCriacao (primeira vez sendo transformado)
                        else if (string.IsNullOrEmpty(agendamentoAtual.UsuarioIdCriacao))
                        {
                            agendamentoAtual.UsuarioIdCriacao = currentUserID;
                            agendamentoAtual.DataCriacao = DateTime.Now;
                        }
                    }

                    if (viagem.KmFinal != null && viagem.KmFinal != 0)
                    {
                        var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(vcl =>
                            vcl.VeiculoId == viagem.VeiculoId
                        );
                        if (veiculo != null && veiculo.Quilometragem < viagem.KmFinal)
                        {
                            veiculo.Quilometragem = viagem.KmFinal.Value;
                            _unitOfWork.Veiculo.Update(veiculo);
                        }
                    }

                    //if (agendamentoAtual.Status == "Realizada")
                    //{
                    //    agendamentoAtual.CustoCombustivel = Servicos.CalculaCustoCombustivel(
                    //    agendamentoAtual ,
                    //    _unitOfWork
                    //    );

                    //    int minutos = -1;
                    //    agendamentoAtual.CustoMotorista = Servicos.CalculaCustoMotorista(
                    //    agendamentoAtual ,
                    //    _unitOfWork ,
                    //    ref minutos
                    //    );
                    //    agendamentoAtual.Minutos = minutos;

                    //    agendamentoAtual.CustoOperador = Servicos.CalculaCustoOperador(
                    //    agendamentoAtual ,
                    //    _unitOfWork
                    //    );

                    //    agendamentoAtual.CustoLavador = Servicos.CalculaCustoLavador(
                    //    agendamentoAtual ,
                    //    _unitOfWork
                    //    );

                    //    agendamentoAtual.CustoVeiculo = Servicos.CalculaCustoVeiculo(
                    //    agendamentoAtual ,
                    //    _unitOfWork
                    //    );
                    //}

                    _unitOfWork.Viagem.Update(agendamentoAtual);
                    _unitOfWork.Save();

                    if (agendamentoAtual.Status == "Realizada")
                    {
                        await _viagemEstatisticaService.AtualizarEstatisticasDiaAsync(viagem.DataInicial.Value);
                    }

                    return Ok(
                        new
                        {
                            success = true ,
                            message = "Agendamento Atualizado com Sucesso" ,
                            viagemId = agendamentoAtual.ViagemId ,
                            objViagem = agendamentoAtual ,
                        }
                    );
                }

                // ============================================================================
                // SEÇÃO 3: NOVO AGENDAMENTO SIMPLES (NÃO RECORRENTE)
                // ============================================================================
                if ((viagem.ViagemId == Guid.Empty))
                {
                    Viagem objViagem = new Viagem();
                    AtualizarDadosAgendamento(objViagem , viagem);

                    // Sempre gravar UsuarioIdAgendamento e DataAgendamento em novos agendamentos
                    objViagem.UsuarioIdAgendamento = currentUserID;
                    objViagem.DataAgendamento = DateTime.Now;

                    _unitOfWork.Viagem.Add(objViagem);
                    _unitOfWork.Save();

                    if (viagem.KmFinal != null && viagem.KmFinal != 0)
                    {
                        var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v =>
                            v.VeiculoId == viagem.VeiculoId
                        );
                        if (veiculo.Quilometragem < viagem.KmFinal)
                        {
                            veiculo.Quilometragem = viagem.KmFinal;
                            _unitOfWork.Veiculo.Update(veiculo);
                        }
                    }

                    objViagem.OperacaoBemSucedida = true;
                    return Ok(
                        new
                        {
                            success = true ,
                            message = "Agendamento inserido com sucesso" ,
                            viagemId = objViagem.ViagemId ,
                            objViagem ,
                        }
                    );
                }

                return Ok(
                    new
                    {
                        success = true ,
                        message = "Operação realizada com sucesso" ,
                        viagemId = viagem.ViagemId ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AgendaController.cs" , "Agendamento" , error);
                return BadRequest(new
                {
                    success = false ,
                    mensagem = error.Message
                });
            }
        }

        [HttpPost("ApagaAgendamento")]
        public IActionResult ApagaAgendamento(AgendamentoViagem viagem)
        {
            try
            {
                var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                    v.ViagemId == viagem.ViagemId
                );
                if (objFromDb == null)
                {
                    return NotFound(
                        new
                        {
                            success = false ,
                            message = "Agendamento não encontrado"
                        }
                    );
                }

                _unitOfWork.Viagem.Remove(objFromDb);
                _unitOfWork.Save();
                return Ok(new
                {
                    success = true ,
                    message = "Agendamento apagado com sucesso"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AgendaController.cs" , "ApagaAgendamento" , error);
                return StatusCode(500 , new
                {
                    success = false ,
                    error = "Erro interno do servidor"
                });
            }
        }

        [HttpPost("CancelaAgendamento")]
        public IActionResult CancelaAgendamento(AgendamentoViagem viagem)
        {
            try
            {
                var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                    v.ViagemId == viagem.ViagemId
                );
                if (objFromDb == null)
                {
                    return NotFound(
                        new
                        {
                            success = false ,
                            message = "Agendamento não encontrado"
                        }
                    );
                }

                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                objFromDb.UsuarioIdCancelamento = currentUserID;
                objFromDb.DataCancelamento = DateTime.Now;
                objFromDb.Status = "Cancelada";
                objFromDb.Descricao = viagem.Descricao;

                // Normalizar campos de dias da semana - converter null para false
                objFromDb.Monday = viagem.Monday ?? false;
                objFromDb.Tuesday = viagem.Tuesday ?? false;
                objFromDb.Wednesday = viagem.Wednesday ?? false;
                objFromDb.Thursday = viagem.Thursday ?? false;
                objFromDb.Friday = viagem.Friday ?? false;
                objFromDb.Saturday = viagem.Saturday ?? false;
                objFromDb.Sunday = viagem.Sunday ?? false;

                _unitOfWork.Viagem.Update(objFromDb);
                _unitOfWork.Save();
                return Ok(new
                {
                    success = true ,
                    message = "Agendamento cancelado com sucesso"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AgendaController.cs" , "CancelaAgendamento" , error);
                return StatusCode(500 , new
                {
                    success = false ,
                    error = "Erro interno do servidor"
                });
            }
        }

        [HttpGet("CarregaViagens")]
        public ActionResult CarregaViagens(DateTime start , DateTime end)
        {
            try
            {
                DateTime startMenos3 = start.AddHours(-3);
                DateTime endMenos3 = end.AddHours(-3);

                Expression<Func<ViewViagensAgenda , bool>> filtro = v =>
                    v.DataInicial >= startMenos3 && v.DataInicial < endMenos3;

                Expression<Func<ViewViagensAgenda , ViagemCalendarDTO>> seletor =
                    v => new ViagemCalendarDTO
                    {
                        id = v.ViagemId ,
                        title = v.Titulo ,
                        dataInicial = v.DataInicial.Value ,
                        horaInicio = v.HoraInicio.Value ,
                        dataFinal = v.DataFinal ,
                        horaFim = v.HoraFim ,
                        backgroundColor = v.CorEvento ,
                        textColor = v.CorTexto ,
                        descricao = v.DescricaoEvento ?? v.DescricaoMontada ,
                    };

                var viagensBrutas = _unitOfWork
                    .ViewViagensAgenda.GetAllReducedIQueryable(seletor , filtro)
                    .ToList();

                var viagens = viagensBrutas
                    .Select(x =>
                    {
                        var inicio = x.dataInicial.HasValue
                            ? x
                                .dataInicial.Value.AddDays(-1)
                                .Date.AddHours(x.horaInicio?.Hour ?? 0)
                                .AddMinutes(x.horaInicio?.Minute ?? 0)
                                .AddSeconds(x.horaInicio?.Second ?? 0)
                            : DateTime.MinValue;

                        var fim = inicio.AddHours(1);

                        return new
                        {
                            id = x.id ,
                            title = x.title ,
                            start = inicio.ToString("yyyy-MM-ddTHH:mm:ss") ,
                            end = fim.ToString("yyyy-MM-ddTHH:mm:ss") ,
                            backgroundColor = x.backgroundColor ,
                            textColor = x.textColor ,
                            descricao = x.descricao ,
                        };
                    })
                    .ToList();

                return Ok(new
                {
                    data = viagens
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AgendaController.cs" , "CarregaViagens" , error);
                return StatusCode(500 , new
                {
                    success = false ,
                    error = "Erro interno do servidor"
                });
            }
        }

        [HttpGet("GetDatasViagem")]
        public IActionResult GetDatasViagem(
            Guid viagemId ,
            Guid recorrenciaViagemId = default(Guid) ,
            bool editarProximos = false
        )
        {
            try
            {
                var objViagens = _unitOfWork.Viagem.GetAllReduced(selector: v => new
                {
                    v.DataInicial ,
                    v.RecorrenciaViagemId ,
                    v.ViagemId ,
                });

                List<DateTime> datasOrdenadas;

                if (recorrenciaViagemId == null || recorrenciaViagemId == Guid.Empty)
                {
                    datasOrdenadas = objViagens
                        .Where(v => v.ViagemId == viagemId || v.RecorrenciaViagemId == viagemId)
                        .Select(v => v.DataInicial)
                        .Where(d => d.HasValue)
                        .Select(d => d.Value)
                        .OrderBy(d => d)
                        .ToList();
                }
                else if (editarProximos)
                {
                    var dataAtual = objViagens
                        .FirstOrDefault(v => v.ViagemId == viagemId)
                        ?.DataInicial;

                    if (dataAtual.HasValue)
                    {
                        datasOrdenadas = objViagens
                            .Where(v =>
                                v.RecorrenciaViagemId == recorrenciaViagemId
                                && v.DataInicial >= dataAtual
                            )
                            .Select(v => v.DataInicial)
                            .Where(d => d.HasValue)
                            .Select(d => d.Value)
                            .OrderBy(d => d)
                            .ToList();
                    }
                    else
                    {
                        return BadRequest(
                            new
                            {
                                sucesso = false ,
                                mensagem = "Registro de viagem não encontrado."
                            }
                        );
                    }
                }
                else
                {
                    datasOrdenadas = objViagens
                        .Where(v =>
                            v.RecorrenciaViagemId == recorrenciaViagemId
                            || v.ViagemId == viagemId
                            || v.ViagemId == recorrenciaViagemId
                        )
                        .Select(v => v.DataInicial)
                        .Where(d => d.HasValue)
                        .Select(d => d.Value)
                        .OrderBy(d => d)
                        .ToList();
                }

                return Ok(datasOrdenadas);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AgendaController.cs" , "GetDatasViagem" , error);
                return BadRequest(new
                {
                    sucesso = false ,
                    mensagem = error.Message
                });
            }
        }

        [HttpGet("ObterAgendamento")]
        public async Task<IActionResult> ObterAgendamento(Guid viagemId)
        {
            try
            {
                // ✅ CORREÇÃO: Agora usa o parâmetro viagemId corretamente!
                var objViagem = _unitOfWork
                    .Viagem.GetAll()
                    .Where(v => v.ViagemId == viagemId)  // USAR O PARÂMETRO!
                    .FirstOrDefault();

                if (objViagem == null)
                {
                    return NotFound(new
                    {
                        mensagem = "Agendamento não encontrado"
                    });
                }

                return Ok(objViagem);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AgendaController.cs" , "ObterAgendamento" , error);
                return StatusCode(
                    500 ,
                    new
                    {
                        mensagem = "Erro interno ao obter o agendamento" ,
                        erro = error.Message
                    }
                );
            }
        }

        [HttpGet("ObterAgendamentoEdicao")]
        public ActionResult ObterAgendamentoEdicao(Guid viagemId)
        {
            try
            {
                var agendamentoEdicao = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                    v.ViagemId == viagemId
                );
                if (agendamentoEdicao != null)
                {
                    return Ok(agendamentoEdicao);
                }
                return NotFound(
                    new
                    {
                        sucesso = false ,
                        mensagem = "Registro de viagem não encontrado."
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AgendaController.cs" ,
                    "ObterAgendamentoEdicao" ,
                    error
                );
                return StatusCode(500 , new
                {
                    sucesso = false ,
                    error = "Erro interno do servidor"
                });
            }
        }

        [HttpGet("ObterAgendamentoEdicaoInicial")]
        public ActionResult ObterAgendamentoEdicaoInicial(Guid viagemId)
        {
            try
            {
                var agendamentoEdicao = _unitOfWork.Viagem.GetAll(v => v.ViagemId == viagemId);
                if (agendamentoEdicao != null)
                {
                    return Ok(agendamentoEdicao);
                }
                return NotFound(
                    new
                    {
                        sucesso = false ,
                        mensagem = "Registro de viagem não encontrado."
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AgendaController.cs" ,
                    "ObterAgendamentoEdicaoInicial" ,
                    error
                );
                return StatusCode(500 , new
                {
                    sucesso = false ,
                    error = "Erro interno do servidor"
                });
            }
        }

        [HttpGet("ObterAgendamentoExclusao")]
        public ActionResult ObterAgendamentoExclusao(Guid recorrenciaViagemId)
        {
            try
            {
                var objExclusao = _unitOfWork.Viagem.GetAll(v =>
                    v.RecorrenciaViagemId == recorrenciaViagemId
                );
                if (objExclusao != null)
                {
                    return Ok(objExclusao);
                }
                return NotFound(
                    new
                    {
                        sucesso = false ,
                        mensagem = "Registro de viagem não encontrado."
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AgendaController.cs" ,
                    "ObterAgendamentoExclusao" ,
                    error
                );
                return StatusCode(500 , new
                {
                    sucesso = false ,
                    error = "Erro interno do servidor"
                });
            }
        }

        [HttpGet("ObterAgendamentosRecorrentes")]
        public async Task<IActionResult> ObterAgendamentosRecorrentes(
            string RecorrenciaViagemId ,
            string DataInicialRecorrencia
        )
        {
            try
            {
                var objViagens = _unitOfWork
                    .Viagem.GetAll()
                    .Where(v => v.RecorrenciaViagemId == Guid.Parse(RecorrenciaViagemId));

                if (objViagens == null || !objViagens.Any())
                {
                    return NotFound(new
                    {
                        mensagem = "Agendamentos recorrentes não encontrados"
                    });
                }
                return Ok(objViagens);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AgendaController.cs" ,
                    "ObterAgendamentosRecorrentes" ,
                    error
                );
                return StatusCode(
                    500 ,
                    new
                    {
                        mensagem = "Erro interno ao obter os agendamentos recorrentes" ,
                        erro = error.Message ,
                    }
                );
            }
        }

        [HttpGet("RecuperaUsuario")]
        public IActionResult RecuperaUsuario(string Id)
        {
            try
            {
                var objUsuario = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == Id);

                if (objUsuario == null)
                {
                    return Ok(new
                    {
                        data = ""
                    });
                }
                else
                {
                    return Ok(new
                    {
                        data = objUsuario.NomeCompleto
                    });
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AgendaController.cs" , "RecuperaUsuario" , error);
                return StatusCode(500 , new
                {
                    success = false ,
                    error = "Erro interno do servidor"
                });
            }
        }

        [HttpGet("RecuperaViagem")]
        public ActionResult RecuperaViagem(Guid Id)
        {
            try
            {
                var viagemObj = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ViagemId == Id);
                return Ok(new
                {
                    data = viagemObj
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AgendaController.cs" , "RecuperaViagem" , error);
                return StatusCode(
                    500 ,
                    new
                    {
                        success = false ,
                        error = error.Message ,
                        stackTrace = error.StackTrace ,
                        innerException = error.InnerException?.Message ,
                    }
                );
            }
        }

        [HttpGet("VerificarAgendamento")]
        public IActionResult VerificarAgendamento(
            string data ,
            Guid viagemIdRecorrente = default ,
            string horaInicio = null
        )
        {
            try
            {
                if (string.IsNullOrEmpty(data))
                {
                    return BadRequest(
                        new
                        {
                            sucesso = false ,
                            mensagem = "A data é obrigatória para verificar o agendamento." ,
                        }
                    );
                }

                if (!DateTime.TryParse(data , out DateTime dataAgendamento))
                {
                    return BadRequest(new
                    {
                        sucesso = false ,
                        mensagem = "Data inválida."
                    });
                }

                TimeSpan? horaAgendamento = null;
                if (
                    !string.IsNullOrEmpty(horaInicio)
                    && TimeSpan.TryParse(horaInicio , out TimeSpan parsedHora)
                )
                {
                    horaAgendamento = parsedHora;
                }

                var objViagens = _unitOfWork.Viagem.GetAllReduced(selector: v => new
                {
                    v.DataInicial ,
                    v.HoraInicio ,
                    v.RecorrenciaViagemId ,
                    v.ViagemId ,
                });

                var existeAgendamento = objViagens.Any(v =>
                    v.DataInicial.HasValue
                    && v.DataInicial.Value.Date == dataAgendamento.Date
                    && (
                        !horaAgendamento.HasValue || v.HoraInicio.Value.TimeOfDay == horaAgendamento
                    )
                    && (
                        viagemIdRecorrente == Guid.Empty
                        || v.RecorrenciaViagemId == viagemIdRecorrente
                    )
                );

                return Ok(new
                {
                    existe = existeAgendamento
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AgendaController.cs" , "VerificarAgendamento" , error);
                return BadRequest(new
                {
                    sucesso = false ,
                    mensagem = error.Message
                });
            }
        }

        private void AtualizarDadosAgendamento(Viagem objViagem , AgendamentoViagem viagem)
        {
            try
            {
                objViagem.DataInicial = viagem.DataInicial;
                objViagem.HoraInicio = viagem.HoraInicio;
                objViagem.Finalidade = viagem.Finalidade;
                objViagem.Origem = viagem.Origem;
                objViagem.Destino = viagem.Destino;
                objViagem.MotoristaId = viagem.MotoristaId;
                objViagem.VeiculoId = viagem.VeiculoId;
                objViagem.RequisitanteId = viagem.RequisitanteId;
                objViagem.RamalRequisitante = viagem.RamalRequisitante;
                objViagem.SetorSolicitanteId = viagem.SetorSolicitanteId ?? Guid.Empty;
                objViagem.Descricao = viagem.Descricao;
                objViagem.StatusAgendamento = viagem.StatusAgendamento;
                objViagem.FoiAgendamento = viagem.FoiAgendamento;
                objViagem.Status = viagem.Status;
                objViagem.DataFinal = viagem.DataFinal;
                objViagem.HoraFim = viagem.HoraFim;
                objViagem.NoFichaVistoria = viagem.NoFichaVistoria;
                objViagem.EventoId = viagem.EventoId;
                objViagem.KmAtual = viagem.KmAtual ?? 0;
                objViagem.KmInicial = viagem.KmInicial ?? 0;
                objViagem.KmFinal = viagem.KmFinal ?? 0;
                objViagem.CombustivelInicial = viagem.CombustivelInicial;
                objViagem.CombustivelFinal = viagem.CombustivelFinal;
                objViagem.UsuarioIdAgendamento = viagem.UsuarioIdAgendamento;
                objViagem.DataAgendamento = viagem.DataAgendamento;
                objViagem.UsuarioIdCriacao = viagem.UsuarioIdCriacao;
                objViagem.DataCriacao = viagem.DataCriacao;
                objViagem.UsuarioIdFinalizacao = viagem.UsuarioIdFinalizacao;
                objViagem.DataFinalizacao = viagem.DataFinalizacao;
                objViagem.Recorrente = viagem.Recorrente;
                objViagem.RecorrenciaViagemId = viagem.RecorrenciaViagemId;
                objViagem.Intervalo = viagem.Intervalo;
                objViagem.DataFinalRecorrencia = viagem.DataFinalRecorrencia;
                objViagem.Monday = viagem.Monday;
                objViagem.Tuesday = viagem.Tuesday;
                objViagem.Wednesday = viagem.Wednesday;
                objViagem.Thursday = viagem.Thursday;
                objViagem.Friday = viagem.Friday;
                objViagem.Saturday = viagem.Saturday;
                objViagem.Sunday = viagem.Sunday;
                objViagem.DiaMesRecorrencia = viagem.DiaMesRecorrencia;

                string descricao = objViagem.Descricao;
                if (objViagem.Descricao != null)
                    descricao = Servicos.ConvertHtml(descricao);
                objViagem.DescricaoSemFormato = descricao;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AgendaController.cs" ,
                    "AtualizarDadosAgendamento" ,
                    error
                );
                return;
            }
        }

        private static DateTime? CombineHourKeepingDate(DateTime? baseDate , DateTime? newTime)
        {
            try
            {
                if (!baseDate.HasValue || !newTime.HasValue)
                    return null;

                var d = baseDate.Value.Date;
                var t = newTime.Value;

                return new DateTime(
                    d.Year ,
                    d.Month ,
                    d.Day ,
                    t.Hour ,
                    t.Minute ,
                    0 ,
                    DateTimeKind.Unspecified
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AgendaController.cs" ,
                    "CombineHourKeepingDate" ,
                    error
                );
                return default(DateTime?);
            }
        }
    }
}
