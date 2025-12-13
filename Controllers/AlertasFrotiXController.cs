using FrotiX.Hubs;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public class AlertasFrotiXController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAlertasFrotiXRepository _alertasRepo;
        private readonly IHubContext<AlertasHub> _hubContext;

        public AlertasFrotiXController(
            IUnitOfWork unitOfWork ,
            IAlertasFrotiXRepository alertasRepo ,
            IHubContext<AlertasHub> hubContext)
        {
            try
            {
                _unitOfWork = unitOfWork;
                _alertasRepo = alertasRepo;
                _hubContext = hubContext;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AlertasFrotiXController.cs" ,
                    "AlertasFrotiXController" ,
                    error
                );
            }
        }

        [HttpGet("GetDetalhesAlerta/{id}")]
        public async Task<IActionResult> GetDetalhesAlerta(Guid id)
        {
            try
            {
                var alerta = await _unitOfWork.AlertasFrotiX.GetFirstOrDefaultAsync(
                    a => a.AlertasFrotiXId == id ,
                    includeProperties: "AlertasUsuarios,Viagem,Manutencao,Veiculo,Motorista"
                );

                if (alerta == null)
                {
                    return NotFound(new
                    {
                        success = false ,
                        message = "Alerta não encontrado"
                    });
                }

                var debugInfo = new
                {
                    alertasUsuariosCount = alerta.AlertasUsuarios?.Count ?? 0 ,
                    alertasUsuariosIsNull = alerta.AlertasUsuarios == null ,
                    totalLidosNoBanco = alerta.AlertasUsuarios?.Count(au => au.Lido) ?? 0
                };

                var usuariosDetalhes = new List<object>();

                foreach (var au in alerta.AlertasUsuarios)
                {
                    var usuario = await _unitOfWork.AspNetUsers.GetFirstOrDefaultAsync(
                        u => u.Id == au.UsuarioId
                    );

                    usuariosDetalhes.Add(new
                    {
                        usuarioId = au.UsuarioId ,
                        nomeUsuario = usuario?.UserName ?? "Usuário removido" ,
                        email = usuario?.Email ,
                        lido = au.Lido ,
                        dataLeitura = au.DataLeitura ,
                        dataNotificacao = au.DataNotificacao ,
                        notificado = au.Notificado ,
                        apagado = au.Apagado ,
                        dataApagado = au.DataApagado
                    });
                }

                var totalDestinatarios = alerta.AlertasUsuarios.Count;
                var totalNotificados = alerta.AlertasUsuarios.Count(au => au.Notificado);
                var aguardandoNotificacao = alerta.AlertasUsuarios.Count(au => !au.Notificado);
                var usuariosLeram = alerta.AlertasUsuarios.Count(au => au.Lido);
                var usuariosNaoLeram = alerta.AlertasUsuarios.Count(au => au.Notificado && !au.Lido && !au.Apagado);
                var usuariosApagaram = alerta.AlertasUsuarios.Count(au => au.Apagado);
                var percentualLeitura = totalNotificados > 0
                    ? Math.Round((double)usuariosLeram / totalNotificados * 100 , 1)
                    : 0;

                var dataInicio = alerta.DataExibicao ?? alerta.DataInsercao;
                var dataFim = alerta.DataExpiracao ?? DateTime.Now;
                var tempoNoAr = dataFim - dataInicio;

                string tempoNoArFormatado = "N/A";

                if (tempoNoAr.HasValue && tempoNoAr.Value.TotalSeconds > 0)
                {
                    var tempo = tempoNoAr.Value;

                    if (tempo.TotalMinutes < 1)
                    {
                        tempoNoArFormatado = "Menos de 1 min";
                    }
                    else if (tempo.TotalMinutes < 60)
                    {
                        tempoNoArFormatado = $"{(int)tempo.TotalMinutes} min";
                    }
                    else if (tempo.TotalHours < 24)
                    {
                        int horas = (int)tempo.TotalHours;
                        int minutos = tempo.Minutes;
                        tempoNoArFormatado = $"{horas}h {minutos}min";
                    }
                    else
                    {
                        int dias = (int)tempo.TotalDays;
                        int horas = tempo.Hours;
                        int minutos = tempo.Minutes;
                        tempoNoArFormatado = $"{dias}d {horas}h {minutos}min";
                    }
                }

                string nomeCriador = "Sistema";

                if (!string.IsNullOrEmpty(alerta.UsuarioCriadorId) &&
                    alerta.UsuarioCriadorId.ToLower() != "system" &&
                    alerta.UsuarioCriadorId.ToLower() != "sistema")
                {
                    var criador = await _unitOfWork.AspNetUsers.GetFirstOrDefaultAsync(
                        u => u.Id == alerta.UsuarioCriadorId
                    );

                    if (criador != null)
                    {
                        if (!string.IsNullOrWhiteSpace(criador.NomeCompleto))
                        {
                            nomeCriador = criador.NomeCompleto;
                        }
                        else if (!string.IsNullOrWhiteSpace(criador.Email))
                        {
                            nomeCriador = criador.Email.Split('@')[0];
                        }
                        else
                        {
                            nomeCriador = criador.UserName;
                        }
                    }
                    else
                    {
                        nomeCriador = alerta.UsuarioCriadorId;
                    }
                }

                var tipoInfo = ObterInfoTipo(alerta.TipoAlerta);
                var prioridadeInfo = ObterInfoPrioridade(alerta.Prioridade);

                bool expirado = alerta.DataExpiracao.HasValue && alerta.DataExpiracao.Value < DateTime.Now;

                return Ok(new
                {
                    success = true ,
                    debug = debugInfo ,
                    data = new
                    {
                        alertaId = alerta.AlertasFrotiXId ,
                        titulo = alerta.Titulo ,
                        descricao = alerta.Descricao ,
                        tipoAlerta = tipoInfo.Nome ,
                        tipo = tipoInfo.Nome ,
                        prioridade = prioridadeInfo.Nome ,
                        iconeCss = tipoInfo.Icone ,
                        corBadge = tipoInfo.Cor ,
                        dataCriacao = alerta.DataInsercao ,
                        dataInsercao = alerta.DataInsercao ,
                        dataExibicao = alerta.DataExibicao ,
                        dataExpiracao = alerta.DataExpiracao ,
                        ativo = alerta.Ativo ,
                        expirado = expirado ,
                        tempoNoAr = tempoNoArFormatado ,
                        nomeCriador = nomeCriador ,
                        usuarioCriadorId = alerta.UsuarioCriadorId ,
                        totalDestinatarios = totalDestinatarios ,
                        totalNotificados = totalNotificados ,
                        aguardandoNotificacao = aguardandoNotificacao ,
                        leram = usuariosLeram ,
                        naoLeram = usuariosNaoLeram ,
                        apagaram = usuariosApagaram ,
                        percentualLeitura = percentualLeitura ,
                        usuarios = usuariosDetalhes ,
                        viagemId = alerta.ViagemId ,
                        manutencaoId = alerta.ManutencaoId ,
                        motoristaId = alerta.MotoristaId ,
                        veiculoId = alerta.VeiculoId
                    }
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AlertasFrotiXController.cs" ,
                    "GetDetalhesAlerta" ,
                    error
                );
                return StatusCode(500 , new
                {
                    success = false ,
                    message = "Erro ao buscar detalhes do alerta" ,
                    erro = error.Message
                });
            }
        }

        private (string Nome, string Icone, string Cor) ObterInfoTipo(TipoAlerta tipo)
        {
            return tipo switch
            {
                TipoAlerta.Agendamento => ("Agendamento", "fa-duotone fa-calendar-check", "#0ea5e9"),
                TipoAlerta.Manutencao => ("Manutenção", "fa-duotone fa-wrench", "#f59e0b"),
                TipoAlerta.Motorista => ("Motorista", "fa-duotone fa-user-tie", "#14b8a6"),
                TipoAlerta.Veiculo => ("Veículo", "fa-duotone fa-car", "#7c3aed"),
                TipoAlerta.Anuncio => ("Anúncio", "fa-duotone fa-bullhorn", "#dc2626"),
                TipoAlerta.Diversos => ("Diversos", "fa-duotone fa-circle-info", "#6b7280"),
                _ => ("Geral", "fa-duotone fa-bell", "#6b7280")
            };
        }

        private (string Nome, string Cor) ObterInfoPrioridade(PrioridadeAlerta prioridade)
        {
            return prioridade switch
            {
                PrioridadeAlerta.Baixa => ("Baixa", "#0ea5e9"),
                PrioridadeAlerta.Media => ("Média", "#f59e0b"),
                PrioridadeAlerta.Alta => ("Alta", "#dc2626"),
                _ => ("Normal", "#6b7280")
            };
        }

        private (string Nome, string Icone, string Cor) ObterInfoTipo(int tipo)
        {
            return tipo switch
            {
                1 => ("Agendamento", "fa-duotone fa-calendar-check", "#0ea5e9"),
                2 => ("Manutenção", "fa-duotone fa-wrench", "#f59e0b"),
                3 => ("Motorista", "fa-duotone fa-user-tie", "#14b8a6"),
                4 => ("Veículo", "fa-duotone fa-car", "#7c3aed"),
                5 => ("Anúncio", "fa-duotone fa-bullhorn", "#dc2626"),
                6 => ("Diversos", "fa-duotone fa-circle-info", "#6b7280"),
                _ => ("Geral", "fa-duotone fa-bell", "#6b7280")
            };
        }

        private (string Nome, string Cor) ObterInfoPrioridade(int prioridade)
        {
            return prioridade switch
            {
                1 => ("Baixa", "#0ea5e9"),
                2 => ("Média", "#f59e0b"),
                3 => ("Alta", "#dc2626"),
                4 => ("Crítica", "#991b1b"),
                _ => ("Normal", "#6b7280")
            };
        }

        [HttpGet("GetAlertasAtivos")]
        public async Task<IActionResult> GetAlertasAtivos()
        {
            try
            {
                var usuarioId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                                ?? User.FindFirst("sub")?.Value
                                ?? User.Identity?.Name;

                if (string.IsNullOrEmpty(usuarioId))
                {
                    return Ok(new List<object>());
                }

                var alertas = await _alertasRepo.GetTodosAlertasAtivosAsync();

                if (alertas == null || !alertas.Any())
                {
                    return Ok(new List<object>());
                }

                var alertasDoUsuario = alertas
                    .Where(a => a.AlertasUsuarios != null &&
                                a.AlertasUsuarios.Any(au =>
                                    au.UsuarioId == usuarioId &&
                                    !au.Lido &&
                                    !au.Apagado))
                    .ToList();

                var alertasParaNotificar = alertasDoUsuario
                    .Where(a => a.AlertasUsuarios.Any(au =>
                        au.UsuarioId == usuarioId &&
                        !au.Notificado))
                    .ToList();

                if (alertasParaNotificar.Any())
                {
                    foreach (var alerta in alertasParaNotificar)
                    {
                        var alertaUsuario = alerta.AlertasUsuarios
                            .First(au => au.UsuarioId == usuarioId);

                        alertaUsuario.Notificado = true;
                        alertaUsuario.DataNotificacao = DateTime.Now;

                        _unitOfWork.AlertasUsuario.Update(alertaUsuario);
                    }

                    await _unitOfWork.SaveAsync();
                }

                var resultado = alertasDoUsuario.Select(a => new
                {
                    alertaId = a.AlertasFrotiXId ,
                    titulo = a.Titulo ,
                    descricao = a.Descricao ,
                    mensagem = a.Descricao ,
                    tipo = (int)a.TipoAlerta ,
                    prioridade = (int)a.Prioridade ,
                    dataInsercao = a.DataInsercao ,
                    usuarioCriadorId = a.UsuarioCriadorId ,
                    iconeCss = Alerta.GetIconePrioridade(a.Prioridade) ,
                    corBadge = Alerta.GetCorHexPrioridade(a.Prioridade) ,
                    textoBadge = a.Prioridade.ToString() ,
                    severidade = a.Prioridade.ToString()
                }).ToList();

                return Ok(resultado);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXController.cs" , "GetAlertasAtivos" , error);
                return StatusCode(500 , new
                {
                    success = false ,
                    message = "Erro ao buscar alertas ativos" ,
                    erro = error.Message
                });
            }
        }

        [HttpGet("GetQuantidadeNaoLidos")]
        public async Task<IActionResult> GetQuantidadeNaoLidos()
        {
            try
            {
                var usuarioId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                                ?? User.FindFirst("sub")?.Value
                                ?? User.Identity?.Name;

                if (string.IsNullOrEmpty(usuarioId))
                {
                    return Ok(new
                    {
                        quantidade = 0
                    });
                }

                var quantidade = await _alertasRepo.GetQuantidadeAlertasNaoLidosAsync(usuarioId);
                return Ok(new
                {
                    quantidade
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXController.cs" , "GetQuantidadeNaoLidos" , error);
                return Ok(new
                {
                    quantidade = 0
                });
            }
        }

        [HttpPost("MarcarComoLido/{alertaId}")]
        public async Task<IActionResult> MarcarComoLido(Guid alertaId)
        {
            try
            {
                var usuarioId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                ?? User.FindFirstValue("sub")
                                ?? User.FindFirstValue(ClaimTypes.Name)
                                ?? User.Identity?.Name;

                Console.WriteLine($"🔍 AlertaId: {alertaId}");
                Console.WriteLine($"🔍 UsuarioId: {usuarioId ?? "NULL"}");

                if (string.IsNullOrEmpty(usuarioId))
                {
                    return Unauthorized(new
                    {
                        success = false ,
                        message = "Usuário não autenticado"
                    });
                }

                var alertaUsuario = await _unitOfWork.AlertasUsuario.GetFirstOrDefaultAsync(
                    au => au.AlertasFrotiXId == alertaId && au.UsuarioId == usuarioId
                );

                if (alertaUsuario == null)
                {
                    Console.WriteLine($"❌ AlertaUsuario NÃO ENCONTRADO!");
                    Console.WriteLine($"   Buscando por AlertasFrotiXId={alertaId} e UsuarioId={usuarioId}");

                    var existeAlerta = await _unitOfWork.AlertasUsuario.GetFirstOrDefaultAsync(
                        au => au.AlertasFrotiXId == alertaId
                    );

                    if (existeAlerta != null)
                    {
                        Console.WriteLine($"⚠️ Alerta existe, mas não para este usuário!");
                        Console.WriteLine($"⚠️ UsuarioId no banco: {existeAlerta.UsuarioId}");
                    }
                    else
                    {
                        Console.WriteLine($"⚠️ Alerta não existe no sistema!");
                    }

                    return NotFound(new
                    {
                        success = false ,
                        message = "Alerta não encontrado para este usuário" ,
                        alertaId = alertaId ,
                        usuarioId = usuarioId
                    });
                }

                Console.WriteLine($"✅ AlertaUsuario ENCONTRADO!");
                Console.WriteLine($"✅ Lido antes: {alertaUsuario.Lido}");

                alertaUsuario.Lido = true;
                alertaUsuario.DataLeitura = DateTime.Now;

                _unitOfWork.AlertasUsuario.Update(alertaUsuario);

                Console.WriteLine($"✅ Chamando SaveAsync...");
                await _unitOfWork.SaveAsync();
                Console.WriteLine($"✅ SaveAsync concluído!");

                return Ok(new
                {
                    success = true ,
                    message = "Alerta marcado como lido"
                });
            }
            catch (Exception error)
            {
                Console.WriteLine($"❌ ERRO: {error.Message}");
                Console.WriteLine($"❌ Stack: {error.StackTrace}");

                Alerta.TratamentoErroComLinha(
                    "AlertasFrotiXController.cs" ,
                    "MarcarComoLido" ,
                    error
                );
                return StatusCode(500 , new
                {
                    success = false ,
                    message = error.Message ,
                    innerException = error.InnerException?.Message
                });
            }
        }

        [HttpPost("Salvar")]
        [Route("Salvar")]
        public async Task<IActionResult> Salvar([FromBody] AlertaDto dto)
        {
            try
            {
                var usuarioId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                                ?? User.FindFirst("sub")?.Value
                                ?? User.Identity?.Name;

                if (string.IsNullOrEmpty(usuarioId))
                {
                    return Unauthorized(new
                    {
                        success = false ,
                        message = "Usuário não identificado"
                    });
                }

                if (string.IsNullOrWhiteSpace(dto.Titulo))
                {
                    return BadRequest(new
                    {
                        success = false ,
                        message = "O título é obrigatório"
                    });
                }

                if (string.IsNullOrWhiteSpace(dto.Descricao))
                {
                    return BadRequest(new
                    {
                        success = false ,
                        message = "A descrição é obrigatória"
                    });
                }

                // ============================================================
                // TIPO 8: DIAS VARIADOS - Criar um alerta para cada data
                // ============================================================
                if (dto.TipoExibicao == 8 && !string.IsNullOrWhiteSpace(dto.DatasSelecionadas))
                {
                    var datasStr = dto.DatasSelecionadas.Split(',' , StringSplitOptions.RemoveEmptyEntries);
                    var alertasCriados = new List<Guid>();

                    foreach (var dataStr in datasStr)
                    {
                        if (DateTime.TryParse(dataStr.Trim() , out DateTime dataExibicao))
                        {
                            var alerta = new AlertasFrotiX
                            {
                                AlertasFrotiXId = Guid.NewGuid() ,
                                Titulo = dto.Titulo ,
                                Descricao = dto.Descricao ,
                                TipoAlerta = (TipoAlerta)dto.TipoAlerta ,
                                Prioridade = (PrioridadeAlerta)dto.Prioridade ,
                                TipoExibicao = (TipoExibicaoAlerta)dto.TipoExibicao ,
                                DataExibicao = dataExibicao ,
                                HorarioExibicao = dto.HorarioExibicao ,
                                DataInsercao = DateTime.Now ,
                                UsuarioCriadorId = usuarioId ,
                                Ativo = true ,
                                ViagemId = dto.ViagemId ,
                                ManutencaoId = dto.ManutencaoId ,
                                MotoristaId = dto.MotoristaId ,
                                VeiculoId = dto.VeiculoId
                            };

                            var usuariosParaNotificar = dto.UsuariosIds ?? new List<string>();
                            await _alertasRepo.CriarAlertaAsync(alerta , usuariosParaNotificar);

                            alertasCriados.Add(alerta.AlertasFrotiXId);

                            // Notificar usuários para cada alerta criado
                            await NotificarUsuariosNovoAlerta(alerta , dto.UsuariosIds);
                        }
                    }

                    return Ok(new
                    {
                        success = true ,
                        message = $"{alertasCriados.Count} alertas criados com sucesso (um para cada data selecionada)" ,
                        alertasIds = alertasCriados ,
                        quantidadeAlertas = alertasCriados.Count
                    });
                }

                // ============================================================
                // OUTROS TIPOS: Criar um único alerta (comportamento normal)
                // ============================================================
                AlertasFrotiX alertaUnico;
                bool isEdicao = dto.AlertasFrotiXId != Guid.Empty;

                if (isEdicao)
                {
                    alertaUnico = await _unitOfWork.AlertasFrotiX.GetFirstOrDefaultAsync(
                        a => a.AlertasFrotiXId == dto.AlertasFrotiXId ,
                        includeProperties: "AlertasUsuarios"
                    );

                    if (alertaUnico == null)
                    {
                        return NotFound(new
                        {
                            success = false ,
                            message = "Alerta não encontrado"
                        });
                    }

                    alertaUnico.Titulo = dto.Titulo;
                    alertaUnico.Descricao = dto.Descricao;
                    alertaUnico.TipoAlerta = (TipoAlerta)dto.TipoAlerta;
                    alertaUnico.Prioridade = (PrioridadeAlerta)dto.Prioridade;
                    alertaUnico.TipoExibicao = (TipoExibicaoAlerta)dto.TipoExibicao;
                    alertaUnico.DataExibicao = dto.DataExibicao;
                    alertaUnico.HorarioExibicao = dto.HorarioExibicao;
                    alertaUnico.DataExpiracao = dto.DataExpiracao;
                    alertaUnico.DiasSemana = dto.DiasSemana;
                    alertaUnico.DiaMesRecorrencia = dto.DiaMesRecorrencia;
                    alertaUnico.ViagemId = dto.ViagemId;
                    alertaUnico.ManutencaoId = dto.ManutencaoId;
                    alertaUnico.MotoristaId = dto.MotoristaId;
                    alertaUnico.VeiculoId = dto.VeiculoId;

                    _unitOfWork.AlertasFrotiX.Update(alertaUnico);

                    // Remover associações antigas
                    var associacoesAntigas = await _unitOfWork.AlertasUsuario.GetAllAsync(
                        filter: au => au.AlertasFrotiXId == alertaUnico.AlertasFrotiXId
                    );

                    foreach (var assoc in associacoesAntigas)
                    {
                        _unitOfWork.AlertasUsuario.Remove(assoc);
                    }

                    // Criar novas associações
                    var usuariosParaNotificar = dto.UsuariosIds ?? new List<string>();
                    if (usuariosParaNotificar.Count > 0)
                    {
                        foreach (var uid in usuariosParaNotificar)
                        {
                            var alertaUsuario = new AlertasUsuario
                            {
                                AlertasFrotiXId = alertaUnico.AlertasFrotiXId ,
                                UsuarioId = uid ,
                                Lido = false ,
                                Notificado = false
                            };
                            _unitOfWork.AlertasUsuario.Add(alertaUsuario);
                        }
                    }

                    await _unitOfWork.SaveAsync();
                }
                else
                {
                    alertaUnico = new AlertasFrotiX
                    {
                        AlertasFrotiXId = Guid.NewGuid() ,
                        Titulo = dto.Titulo ,
                        Descricao = dto.Descricao ,
                        TipoAlerta = (TipoAlerta)dto.TipoAlerta ,
                        Prioridade = (PrioridadeAlerta)dto.Prioridade ,
                        TipoExibicao = (TipoExibicaoAlerta)dto.TipoExibicao ,
                        DataExibicao = dto.DataExibicao ,
                        HorarioExibicao = dto.HorarioExibicao ,
                        DataExpiracao = dto.DataExpiracao ,
                        DiasSemana = dto.DiasSemana ,
                        DiaMesRecorrencia = dto.DiaMesRecorrencia ,
                        DataInsercao = DateTime.Now ,
                        UsuarioCriadorId = usuarioId ,
                        Ativo = true ,
                        ViagemId = dto.ViagemId ,
                        ManutencaoId = dto.ManutencaoId ,
                        MotoristaId = dto.MotoristaId ,
                        VeiculoId = dto.VeiculoId
                    };

                    var usuariosParaNotificar = dto.UsuariosIds ?? new List<string>();
                    await _alertasRepo.CriarAlertaAsync(alertaUnico , usuariosParaNotificar);
                }

                await NotificarUsuariosNovoAlerta(alertaUnico , dto.UsuariosIds);

                return Ok(new
                {
                    success = true ,
                    message = isEdicao ? "Alerta atualizado com sucesso" : "Alerta criado com sucesso" ,
                    alertaId = alertaUnico.AlertasFrotiXId
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXController.cs" , "Salvar" , error);
                return StatusCode(500 , new
                {
                    success = false ,
                    message = "Erro ao salvar alerta: " + error.Message
                });
            }
        }

        public class AlertaDto
        {
            public Guid AlertasFrotiXId { get; set; }
            public string Titulo { get; set; }
            public string Descricao { get; set; }
            public int TipoAlerta { get; set; }
            public int Prioridade { get; set; }
            public int TipoExibicao { get; set; }

            // Campos de Data/Hora
            public DateTime? DataExibicao { get; set; }

            public TimeSpan? HorarioExibicao { get; set; }
            public DateTime? DataExpiracao { get; set; }

            // Campos de Recorrência
            public string DiasSemana { get; set; }           // Ex: "1,2,3,4,5" (seg-sex)

            public int? DiaMesRecorrencia { get; set; }      // Ex: 15 (dia 15 do mês)
            public string DatasSelecionadas { get; set; }    // Ex: "2025-11-20,2025-11-25,2025-12-01"

            // Vínculos
            public Guid? ViagemId { get; set; }

            public Guid? ManutencaoId { get; set; }
            public Guid? MotoristaId { get; set; }
            public Guid? VeiculoId { get; set; }

            // Usuários
            public List<string> UsuariosIds { get; set; }
        }

        private async Task NotificarUsuariosNovoAlerta(AlertasFrotiX alerta , List<string> usuariosIds)
        {
            try
            {
                var alertaPayload = new
                {
                    alertaId = alerta.AlertasFrotiXId ,
                    titulo = alerta.Titulo ,
                    descricao = alerta.Descricao ,
                    tipo = alerta.TipoAlerta ,
                    prioridade = alerta.Prioridade ,
                    iconeCss = ObterIconePorTipo(alerta.TipoAlerta) ,
                    corBadge = ObterCorPorTipo(alerta.TipoAlerta) ,
                    textoBadge = ObterTextoPorTipo(alerta.TipoAlerta) ,
                    dataInsercao = alerta.DataInsercao
                };

                if (usuariosIds == null || usuariosIds.Count == 0)
                {
                    await _hubContext.Clients.All.SendAsync("NovoAlerta" , alertaPayload);
                }
                else
                {
                    foreach (var usuarioId in usuariosIds)
                    {
                        await _hubContext.Clients.User(usuarioId).SendAsync("NovoAlerta" , alertaPayload);
                    }
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXController.cs" , "NotificarUsuariosNovoAlerta" , error);
            }
        }

        [HttpGet("GetHistoricoAlertas")]
        public async Task<IActionResult> GetHistoricoAlertas()
        {
            try
            {
                var alertas = await _alertasRepo.GetTodosAlertasComLeituraAsync();

                var resultado = alertas.Select(a =>
                {
                    var ultimaLeitura = a.AlertasUsuarios
                        .Where(au => au.Lido && au.DataLeitura.HasValue)
                        .OrderByDescending(au => au.DataLeitura)
                        .FirstOrDefault();

                    return new
                    {
                        alertaId = a.AlertasFrotiXId ,
                        titulo = a.Titulo ,
                        descricao = a.Descricao ,
                        tipo = ObterTextoPorTipo(a.TipoAlerta) ,
                        prioridade = a.Prioridade.ToString() ,
                        dataInsercao = a.DataInsercao.HasValue ? a.DataInsercao.Value.ToString("dd/MM/yyyy HH:mm") : "-" ,
                        dataLeitura = ultimaLeitura?.DataLeitura?.ToString("dd/MM/yyyy HH:mm") ?? "" ,
                        icone = ObterIconePorTipo(a.TipoAlerta) ,
                        totalLeituras = a.AlertasUsuarios.Count(au => au.Lido) ,
                        totalUsuarios = a.AlertasUsuarios.Count
                    };
                }).ToList();

                return Ok(new
                {
                    data = resultado
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXController.cs" , "GetHistoricoAlertas" , error);
                return Ok(new
                {
                    data = new List<object>()
                });
            }
        }

        private string ObterIconePorTipo(TipoAlerta tipo)
        {
            return tipo switch
            {
                TipoAlerta.Agendamento => "fa-duotone fa-calendar-check",
                TipoAlerta.Manutencao => "fa-duotone fa-screwdriver-wrench",
                TipoAlerta.Motorista => "fa-duotone fa-id-card-clip",
                TipoAlerta.Veiculo => "fa-duotone fa-car-bus",
                TipoAlerta.Anuncio => "fa-duotone fa-bullhorn",
                _ => "fa-duotone fa-circle-info"
            };
        }

        [HttpGet("GetAlertasFinalizados")]
        public async Task<IActionResult> GetAlertasFinalizados(
            [FromQuery] int? dias = 30 ,
            [FromQuery] int pagina = 1 ,
            [FromQuery] int tamanhoPagina = 20)
        {
            try
            {
                var dataLimite = DateTime.Now.AddDays(-(dias ?? 30));

                var todosAlertas = await _unitOfWork.AlertasFrotiX.GetAllAsync(
                    filter: a => !a.Ativo &&
                                 a.DataDesativacao.HasValue &&
                                 a.DataDesativacao.Value >= dataLimite
                );

                var alertasOrdenados = todosAlertas
                    .OrderByDescending(a => a.DataDesativacao)
                    .ToList();

                var total = alertasOrdenados.Count;

                var alertasPaginados = alertasOrdenados
                    .Skip((pagina - 1) * tamanhoPagina)
                    .Take(tamanhoPagina)
                    .Select(a => new
                    {
                        alertaId = a.AlertasFrotiXId ,
                        titulo = a.Titulo ,
                        descricao = a.Descricao ,
                        tipo = ObterTextoPorTipo(a.TipoAlerta) ,
                        prioridade = a.Prioridade.ToString() ,
                        dataInsercao = a.DataInsercao ,
                        dataFinalizacao = a.DataDesativacao ,
                        finalizadoPor = a.DesativadoPor ,
                        motivo = a.MotivoDesativacao
                    })
                    .ToList();

                return Ok(new
                {
                    success = true ,
                    total = total ,
                    pagina = pagina ,
                    tamanhoPagina = tamanhoPagina ,
                    totalPaginas = (int)Math.Ceiling((double)total / tamanhoPagina) ,
                    dados = alertasPaginados
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXController.cs" , "GetAlertasFinalizados" , error);
                return StatusCode(500 , new
                {
                    success = false ,
                    mensagem = "Erro ao buscar histórico" ,
                    erro = error.Message
                });
            }
        }

        [HttpPost("DarBaixaAlerta/{alertaId}")]
        public async Task<IActionResult> DarBaixaAlerta(Guid alertaId)
        {
            try
            {
                var alerta = await _unitOfWork.AlertasFrotiX.GetFirstOrDefaultAsync(
                    a => a.AlertasFrotiXId == alertaId
                );

                if (alerta == null)
                {
                    return NotFound(new
                    {
                        success = false ,
                        mensagem = "Alerta não encontrado"
                    });
                }

                if (!alerta.Ativo)
                {
                    return BadRequest(new
                    {
                        success = false ,
                        mensagem = "Este alerta já foi finalizado anteriormente"
                    });
                }

                var usuarioAtual = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                                  ?? User.FindFirst("sub")?.Value
                                  ?? User.Identity?.Name
                                  ?? "Sistema";

                alerta.Ativo = false;
                alerta.DataDesativacao = DateTime.Now;
                alerta.DesativadoPor = usuarioAtual;
                alerta.MotivoDesativacao = "Baixa realizada pelo usuário";

                _unitOfWork.AlertasFrotiX.Update(alerta);
                await _unitOfWork.SaveAsync();

                return Ok(new
                {
                    success = true ,
                    mensagem = "Baixa do alerta realizada com sucesso" ,
                    alertaId = alertaId ,
                    dataFinalizacao = DateTime.Now ,
                    finalizadoPor = usuarioAtual
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXController.cs" , "DarBaixaAlerta" , error);
                return StatusCode(500 , new
                {
                    success = false ,
                    mensagem = "Erro interno ao processar a baixa do alerta" ,
                    erro = error.Message
                });
            }
        }

        [HttpGet("GetMeusAlertas")]
        public async Task<IActionResult> GetMeusAlertas()
        {
            try
            {
                var usuarioId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                                ?? User.FindFirst("sub")?.Value
                                ?? User.FindFirst(ClaimTypes.Name)?.Value
                                ?? User.Identity?.Name;

                Console.WriteLine($"GetMeusAlertas - UsuarioId: {usuarioId ?? "NULL"}");

                if (string.IsNullOrEmpty(usuarioId))
                {
                    Console.WriteLine("UsuarioId está NULL - retornando lista vazia");
                    return Ok(new
                    {
                        data = new List<object>()
                    });
                }

                var alertasUsuario = await _unitOfWork.AlertasUsuario.GetAllAsync(
                    filter: au => au.UsuarioId == usuarioId ,
                    includeProperties: "AlertasFrotiX"
                );

                Console.WriteLine($"Total de alertas encontrados: {alertasUsuario.Count()}");

                var resultado = alertasUsuario
                    .Where(au => au.AlertasFrotiX != null)
                    .OrderByDescending(au => au.AlertasFrotiX.DataInsercao)
                    .Select(au => new
                    {
                        alertaId = au.AlertasFrotiXId ,
                        titulo = au.AlertasFrotiX.Titulo ,
                        descricao = au.AlertasFrotiX.Descricao ,
                        tipo = ObterTextoPorTipo(au.AlertasFrotiX.TipoAlerta) ,
                        icone = ObterIconePorTipo(au.AlertasFrotiX.TipoAlerta) ,
                        notificado = au.Notificado ,
                        notificadoTexto = au.Notificado ? "Sim" : "Não" ,
                        dataNotificacao = au.DataNotificacao?.ToString("dd/MM/yyyy HH:mm") ?? "-" ,
                        lido = au.Lido ,
                        lidoTexto = au.Lido ? "Sim" : "Não" ,
                        dataLeitura = au.DataLeitura?.ToString("dd/MM/yyyy HH:mm") ?? "-" ,
                        prioridade = au.AlertasFrotiX.Prioridade.ToString() ,
                        dataCriacao = au.AlertasFrotiX.DataInsercao
                    })
                    .ToList();

                Console.WriteLine($"Total de resultados processados: {resultado.Count}");

                return Ok(new
                {
                    data = resultado
                });
            }
            catch (Exception error)
            {
                Console.WriteLine($"ERRO em GetMeusAlertas: {error.Message}");
                Console.WriteLine($"Stack: {error.StackTrace}");

                Alerta.TratamentoErroComLinha("AlertasFrotiXController.cs" , "GetMeusAlertas" , error);
                return StatusCode(500 , new
                {
                    success = false ,
                    message = "Erro ao buscar meus alertas: " + error.Message ,
                    data = new List<object>()
                });
            }
        }

        [HttpGet("GetAlertasInativos")]
        public async Task<IActionResult> GetAlertasInativos()
        {
            try
            {
                var alertasInativos = await _unitOfWork.AlertasFrotiX.GetAllAsync(
                    filter: a => !a.Ativo ,
                    includeProperties: "AlertasUsuarios"
                );

                var resultado = alertasInativos
                    .OrderByDescending(a => a.DataDesativacao ?? a.DataInsercao)
                    .Select(a =>
                    {
                        var totalUsuarios = a.AlertasUsuarios.Count();
                        var totalNotificados = a.AlertasUsuarios.Count(au => au.Notificado);
                        var totalLeram = a.AlertasUsuarios.Count(au => au.Lido);

                        var percentualLeitura = totalNotificados > 0
                            ? (double)totalLeram / totalNotificados * 100
                            : 0;

                        return new
                        {
                            alertaId = a.AlertasFrotiXId ,
                            titulo = a.Titulo ,
                            descricao = a.Descricao ,
                            tipo = ObterTextoPorTipo(a.TipoAlerta) ,
                            prioridade = a.Prioridade.ToString() ,
                            dataInsercao = a.DataInsercao?.ToString("dd/MM/yyyy HH:mm") ,
                            dataDesativacao = a.DataDesativacao?.ToString("dd/MM/yyyy HH:mm") ?? "-" ,
                            icone = ObterIconePorTipo(a.TipoAlerta) ,
                            percentualLeitura = percentualLeitura ,
                            totalUsuarios = totalUsuarios ,
                            totalNotificados = totalNotificados ,
                            totalLeram = totalLeram
                        };
                    })
                    .ToList();

                return Ok(new
                {
                    data = resultado
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXController.cs" , "GetAlertasInativos" , error);
                return Ok(new
                {
                    data = new List<object>()
                });
            }
        }

        [HttpGet("GetTodosAlertasAtivosGestao")]
        public async Task<IActionResult> GetTodosAlertasAtivosGestao()
        {
            try
            {
                var alertasAtivos = await _unitOfWork.AlertasFrotiX.GetAllAsync(
                    filter: a => a.Ativo ,
                    includeProperties: "AlertasUsuarios"
                );

                if (alertasAtivos == null || !alertasAtivos.Any())
                {
                    return Ok(new List<object>());
                }

                var resultado = alertasAtivos.Select(a =>
                {
                    var totalUsuarios = a.AlertasUsuarios?.Count ?? 0;
                    var usuariosLeram = a.AlertasUsuarios?.Count(au => au.Lido) ?? 0;

                    return new
                    {
                        alertaId = a.AlertasFrotiXId ,
                        titulo = a.Titulo ,
                        descricao = a.Descricao ,
                        mensagem = a.Descricao ,
                        tipo = (int)a.TipoAlerta ,
                        prioridade = (int)a.Prioridade ,
                        dataInsercao = a.DataInsercao ,
                        usuarioCriadorId = a.UsuarioCriadorId ,
                        totalUsuarios = totalUsuarios ,
                        usuariosLeram = usuariosLeram ,
                        iconeCss = Alerta.GetIconePrioridade(a.Prioridade) ,
                        corBadge = Alerta.GetCorHexPrioridade(a.Prioridade) ,
                        textoBadge = a.Prioridade.ToString() ,
                        severidade = a.Prioridade.ToString()
                    };
                }).ToList();

                return Ok(resultado);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXController.cs" , "GetTodosAlertasAtivosGestao" , error);
                return StatusCode(500 , new
                {
                    success = false ,
                    message = "Erro ao buscar alertas ativos para gestío" ,
                    erro = error.Message
                });
            }
        }

        [HttpGet("VerificarPermissaoBaixa/{alertaId}")]
        public async Task<IActionResult> VerificarPermissaoBaixa(Guid alertaId)
        {
            try
            {
                var alerta = await _unitOfWork.AlertasFrotiX.GetFirstOrDefaultAsync(
                    a => a.AlertasFrotiXId == alertaId
                );

                var usuarioAtual = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                                  ?? User.FindFirst("sub")?.Value
                                  ?? User.Identity?.Name;

                var ehCriador = alerta.UsuarioCriadorId == usuarioAtual;
                var ehAdmin = User.IsInRole("Admin") || User.IsInRole("Administrador");

                var podeDarBaixa = ehCriador || ehAdmin;

                return Ok(new
                {
                    podeDarBaixa = podeDarBaixa
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AlertasFrotiXController.cs" ,
                    "VerificarPermissaoBaixa" ,
                    error
                );
                return StatusCode(500);
            }
        }

        private string ObterCorPorTipo(TipoAlerta tipo)
        {
            return tipo switch
            {
                TipoAlerta.Agendamento => "#0ea5e9",
                TipoAlerta.Manutencao => "#f59e0b",
                TipoAlerta.Motorista => "#14b8a6",
                TipoAlerta.Veiculo => "#7c3aed",
                TipoAlerta.Anuncio => "#dc2626",
                _ => "#6c757d"
            };
        }

        private string ObterTextoPorTipo(TipoAlerta tipo)
        {
            return tipo switch
            {
                TipoAlerta.Agendamento => "Agendamento",
                TipoAlerta.Manutencao => "Manutenção",
                TipoAlerta.Motorista => "Motorista",
                TipoAlerta.Veiculo => "Veículo",
                TipoAlerta.Anuncio => "Anúncio",
                _ => "Diversos"
            };
        }
    }
}

public class ExportarDetalhesDto
{
    public Guid AlertaId
    {
        get; set;
    }

    public string Titulo
    {
        get; set;
    }

    public List<UsuarioExportDto> Usuarios
    {
        get; set;
    }
}

public class UsuarioExportDto
{
    public string NomeUsuario
    {
        get; set;
    }

    public string Email
    {
        get; set;
    }

    public bool Lido
    {
        get; set;
    }

    public bool Apagado
    {
        get; set;
    }

    public DateTime? DataNotificacao
    {
        get; set;
    }

    public DateTime? DataLeitura
    {
        get; set;
    }
}
