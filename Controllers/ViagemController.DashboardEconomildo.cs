using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace FrotiX.Controllers
{
    public partial class ViagemController
    {
        [HttpGet]
        [Route("DashboardEconomildo")]
        public IActionResult DashboardEconomildo(string? mob, int? mes, int? ano)
        {
            try
            {
                // Query base
                var query = _context.ViagensEconomildo.AsQueryable();

                // Aplicar filtros
                if (!string.IsNullOrEmpty(mob))
                {
                    query = query.Where(v => v.MOB == mob);
                }

                if (mes.HasValue && mes.Value > 0)
                {
                    query = query.Where(v => v.Data.HasValue && v.Data.Value.Month == mes.Value);
                }

                if (ano.HasValue && ano.Value > 0)
                {
                    query = query.Where(v => v.Data.HasValue && v.Data.Value.Year == ano.Value);
                }

                var viagens = query.ToList();

                // Total de usuários (soma de passageiros)
                var totalUsuarios = viagens.Sum(v => v.QtdPassageiros ?? 0);
                var totalViagens = viagens.Count;

                // Calcular meses distintos para média
                var mesesDistintos = viagens
                    .Where(v => v.Data.HasValue)
                    .Select(v => new { v.Data.Value.Year, v.Data.Value.Month })
                    .Distinct()
                    .Count();

                var mediaMensal = mesesDistintos > 0 ? (double)totalUsuarios / mesesDistintos : 0;

                // Calcular dias distintos para média diária
                var diasDistintos = viagens
                    .Where(v => v.Data.HasValue)
                    .Select(v => v.Data.Value.Date)
                    .Distinct()
                    .Count();

                var mediaDiaria = diasDistintos > 0 ? (double)totalUsuarios / diasDistintos : 0;

                // Totais por MOB (sem filtro de MOB para mostrar todos)
                var queryTodos = _context.ViagensEconomildo.AsQueryable();

                if (mes.HasValue && mes.Value > 0)
                {
                    queryTodos = queryTodos.Where(v => v.Data.HasValue && v.Data.Value.Month == mes.Value);
                }

                if (ano.HasValue && ano.Value > 0)
                {
                    queryTodos = queryTodos.Where(v => v.Data.HasValue && v.Data.Value.Year == ano.Value);
                }

                var viagensTodos = queryTodos.ToList();

                var viagensPGR = viagensTodos.Where(v => v.MOB == "PGR").ToList();
                var viagensRodoviaria = viagensTodos.Where(v => v.MOB == "Rodoviaria").ToList();
                var viagensCefor = viagensTodos.Where(v => v.MOB == "Cefor").ToList();

                var totalPGR = viagensPGR.Sum(v => v.QtdPassageiros ?? 0);
                var totalRodoviaria = viagensRodoviaria.Sum(v => v.QtdPassageiros ?? 0);
                var totalCefor = viagensCefor.Sum(v => v.QtdPassageiros ?? 0);

                // Médias mensais por MOB
                var mesesPGR = viagensPGR.Where(v => v.Data.HasValue).Select(v => new { v.Data.Value.Year, v.Data.Value.Month }).Distinct().Count();
                var mesesRodoviaria = viagensRodoviaria.Where(v => v.Data.HasValue).Select(v => new { v.Data.Value.Year, v.Data.Value.Month }).Distinct().Count();
                var mesesCefor = viagensCefor.Where(v => v.Data.HasValue).Select(v => new { v.Data.Value.Year, v.Data.Value.Month }).Distinct().Count();

                var mediaMensalPGR = mesesPGR > 0 ? (double)totalPGR / mesesPGR : 0;
                var mediaMensalRodoviaria = mesesRodoviaria > 0 ? (double)totalRodoviaria / mesesRodoviaria : 0;
                var mediaMensalCefor = mesesCefor > 0 ? (double)totalCefor / mesesCefor : 0;

                // Tempo médio de ida e volta (calculado entre viagens consecutivas)
                var temposCalculados = CalcularTemposMedios(viagens);
                var tempoMedioIda = temposCalculados.tempoIda;
                var tempoMedioVolta = temposCalculados.tempoVolta;

                // Usuários por Mês
                var usuariosPorMes = viagens
                    .Where(v => v.Data.HasValue)
                    .GroupBy(v => v.Data.Value.Month)
                    .Select(g => new
                    {
                        mesNum = g.Key,
                        mes = ObterNomeMes(g.Key),
                        total = g.Sum(v => v.QtdPassageiros ?? 0)
                    })
                    .OrderBy(x => x.mesNum)
                    .ToList();

                // Usuários por Turno
                var usuariosPorTurno = new
                {
                    manha = viagens.Where(v => ClassificarTurno(v.HoraInicio) == "Manhã").Sum(v => v.QtdPassageiros ?? 0),
                    tarde = viagens.Where(v => ClassificarTurno(v.HoraInicio) == "Tarde").Sum(v => v.QtdPassageiros ?? 0),
                    noite = viagens.Where(v => ClassificarTurno(v.HoraInicio) == "Noite").Sum(v => v.QtdPassageiros ?? 0)
                };

                // Comparativo Mensal por MOB
                var comparativoMob = viagensTodos
                    .Where(v => v.Data.HasValue)
                    .GroupBy(v => v.Data.Value.Month)
                    .Select(g => new
                    {
                        mesNum = g.Key,
                        mes = ObterNomeMes(g.Key),
                        rodoviaria = g.Where(v => v.MOB == "Rodoviaria").Sum(v => v.QtdPassageiros ?? 0),
                        pgr = g.Where(v => v.MOB == "PGR").Sum(v => v.QtdPassageiros ?? 0),
                        cefor = g.Where(v => v.MOB == "Cefor").Sum(v => v.QtdPassageiros ?? 0)
                    })
                    .OrderBy(x => x.mesNum)
                    .ToList();

                // Usuários por Dia da Semana
                var usuariosPorDiaSemana = viagens
                    .Where(v => v.Data.HasValue)
                    .GroupBy(v => v.Data.Value.DayOfWeek)
                    .Where(g => g.Key != DayOfWeek.Saturday && g.Key != DayOfWeek.Sunday)
                    .Select(g => new
                    {
                        diaNum = (int)g.Key,
                        dia = ObterNomeDiaSemana(g.Key),
                        total = g.Sum(v => v.QtdPassageiros ?? 0)
                    })
                    .OrderBy(x => x.diaNum == 0 ? 7 : x.diaNum)
                    .ToList();

                // Usuários por Hora
                var usuariosPorHora = viagens
                    .Where(v => !string.IsNullOrEmpty(v.HoraInicio))
                    .GroupBy(v => ExtrairHora(v.HoraInicio))
                    .Where(g => g.Key >= 0)
                    .Select(g => new
                    {
                        horaNum = g.Key,
                        hora = g.Key.ToString("00") + ":00",
                        total = g.Sum(v => v.QtdPassageiros ?? 0)
                    })
                    .OrderBy(x => x.horaNum)
                    .ToList();

                // Top 10 Veículos
                var topVeiculos = viagens
                    .Where(v => v.VeiculoId != Guid.Empty)
                    .GroupBy(v => v.VeiculoId)
                    .Select(g => new
                    {
                        veiculoId = g.Key,
                        total = g.Count()
                    })
                    .OrderByDescending(x => x.total)
                    .Take(10)
                    .ToList();

                // Buscar placas dos veículos
                var veiculoIds = topVeiculos.Select(v => v.veiculoId).ToList();
                var veiculos = _unitOfWork.ViewVeiculos
                    .GetAll(v => veiculoIds.Contains(v.VeiculoId))
                    .ToDictionary(v => v.VeiculoId, v => v.Placa ?? "S/N");

                var topVeiculosComPlaca = topVeiculos
                    .Select(v => new
                    {
                        placa = veiculos.ContainsKey(v.veiculoId) ? veiculos[v.veiculoId] : "S/N",
                        total = v.total
                    })
                    .ToList();

                return Json(new
                {
                    success = true,
                    totalUsuarios,
                    totalViagens,
                    mediaMensal,
                    mediaDiaria,
                    totalPGR,
                    totalRodoviaria,
                    totalCefor,
                    mediaMensalPGR,
                    mediaMensalRodoviaria,
                    mediaMensalCefor,
                    tempoMedioIda,
                    tempoMedioVolta,
                    usuariosPorMes,
                    usuariosPorTurno,
                    comparativoMob,
                    usuariosPorDiaSemana,
                    usuariosPorHora,
                    topVeiculos = topVeiculosComPlaca
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemController.cs", "DashboardEconomildo", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar dashboard: " + error.Message
                });
            }
        }

        private (string tempoIda, string tempoVolta) CalcularTemposMedios(List<ViagensEconomildo> viagens)
        {
            try
            {
                if (!viagens.Any()) return ("00:00", "00:00");

                // Ordenar viagens por Data e HoraInicio
                var viagensOrdenadas = viagens
                    .Where(v => v.Data.HasValue && !string.IsNullOrEmpty(v.HoraInicio) && !string.IsNullOrEmpty(v.IdaVolta))
                    .OrderBy(v => v.Data.Value)
                    .ThenBy(v => v.HoraInicio)
                    .ToList();

                if (viagensOrdenadas.Count < 2) return ("00:00", "00:00");

                var duracoesIda = new List<double>();
                var duracoesVolta = new List<double>();

                for (int i = 0; i < viagensOrdenadas.Count - 1; i++)
                {
                    var atual = viagensOrdenadas[i];
                    var proxima = viagensOrdenadas[i + 1];

                    // Verificar se são do mesmo dia
                    if (atual.Data.Value.Date != proxima.Data.Value.Date) continue;

                    // Parse das horas
                    if (!TimeSpan.TryParse(atual.HoraInicio, out var horaAtual)) continue;
                    if (!TimeSpan.TryParse(proxima.HoraInicio, out var horaProxima)) continue;

                    var tipoAtual = NormalizarTipoViagem(atual.IdaVolta);
                    var tipoProxima = NormalizarTipoViagem(proxima.IdaVolta);

                    // Duração da IDA: IDA seguida de VOLTA
                    if (tipoAtual == "I" && tipoProxima == "V")
                    {
                        var duracao = horaProxima - horaAtual;
                        if (duracao.TotalMinutes > 0 && duracao.TotalMinutes < 120) // Limite de 2 horas
                        {
                            duracoesIda.Add(duracao.TotalMinutes);
                        }
                    }
                    // Duração da VOLTA: VOLTA seguida de IDA
                    else if (tipoAtual == "V" && tipoProxima == "I")
                    {
                        var duracao = horaProxima - horaAtual;
                        if (duracao.TotalMinutes > 0 && duracao.TotalMinutes < 120) // Limite de 2 horas
                        {
                            duracoesVolta.Add(duracao.TotalMinutes);
                        }
                    }
                }

                var tempoIda = "00:00";
                var tempoVolta = "00:00";

                if (duracoesIda.Any())
                {
                    var mediaIda = TimeSpan.FromMinutes(duracoesIda.Average());
                    tempoIda = mediaIda.ToString(@"mm\:ss");
                }

                if (duracoesVolta.Any())
                {
                    var mediaVolta = TimeSpan.FromMinutes(duracoesVolta.Average());
                    tempoVolta = mediaVolta.ToString(@"mm\:ss");
                }

                return (tempoIda, tempoVolta);
            }
            catch
            {
                return ("00:00", "00:00");
            }
        }

        private string NormalizarTipoViagem(string? idaVolta)
        {
            if (string.IsNullOrEmpty(idaVolta)) return "";
            var tipo = idaVolta.Trim().ToUpper();
            if (tipo == "IDA" || tipo == "I") return "I";
            if (tipo == "VOLTA" || tipo == "V") return "V";
            return "";
        }

        private string ClassificarTurno(string? horaInicio)
        {
            try
            {
                if (string.IsNullOrEmpty(horaInicio)) return "Manhã";

                if (TimeSpan.TryParse(horaInicio, out var hora))
                {
                    if (hora.Hours >= 6 && hora.Hours < 12) return "Manhã";
                    if (hora.Hours >= 12 && hora.Hours < 18) return "Tarde";
                    return "Noite";
                }

                return "Manhã";
            }
            catch
            {
                return "Manhã";
            }
        }

        private int ExtrairHora(string? horaStr)
        {
            try
            {
                if (string.IsNullOrEmpty(horaStr)) return -1;

                if (TimeSpan.TryParse(horaStr, out var hora))
                {
                    return hora.Hours;
                }

                return -1;
            }
            catch
            {
                return -1;
            }
        }

        private string ObterNomeMes(int mes)
        {
            var nomes = new[] { "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" };
            return mes >= 1 && mes <= 12 ? nomes[mes] : "";
        }

        private string ObterNomeDiaSemana(DayOfWeek dia)
        {
            return dia switch
            {
                DayOfWeek.Monday => "Seg",
                DayOfWeek.Tuesday => "Ter",
                DayOfWeek.Wednesday => "Qua",
                DayOfWeek.Thursday => "Qui",
                DayOfWeek.Friday => "Sex",
                DayOfWeek.Saturday => "Sáb",
                DayOfWeek.Sunday => "Dom",
                _ => ""
            };
        }
    }
}
