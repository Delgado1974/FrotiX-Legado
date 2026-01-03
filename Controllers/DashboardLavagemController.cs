using FrotiX.Data;
using FrotiX.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    [Authorize]
    public class DashboardLavagemController : Controller
    {
        private readonly FrotiXDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;

        public DashboardLavagemController(FrotiXDbContext context, UserManager<IdentityUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        #region Estatísticas Gerais

        [HttpGet]
        [Route("api/DashboardLavagem/EstatisticasGerais")]
        public async Task<IActionResult> EstatisticasGerais(DateTime? dataInicio, DateTime? dataFim)
        {
            try
            {
                // Define período padrão (últimos 30 dias)
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                // Lavagens no período
                var lavagens = await _context.Lavagem
                    .Include(l => l.Veiculo)
                    .Include(l => l.Motorista)
                    .Where(l => l.Data >= dataInicio && l.Data <= dataFim)
                    .ToListAsync();

                var lavadoresLavagem = await _context.LavadoresLavagem
                    .Include(ll => ll.Lavador)
                    .ThenInclude(lav => lav.Contrato)
                    .Where(ll => lavagens.Select(l => l.LavagemId).Contains(ll.LavagemId))
                    .ToListAsync();

                var totalLavagens = lavagens.Count;
                var veiculosLavados = lavagens.Select(l => l.VeiculoId).Distinct().Count();
                var lavadoresAtivos = lavadoresLavagem.Select(ll => ll.LavadorId).Distinct().Count();

                // Cálculo de dias no período
                var diasPeriodo = (dataFim.Value - dataInicio.Value).Days;
                diasPeriodo = diasPeriodo > 0 ? diasPeriodo : 1;

                var mediaDiaria = Math.Round((double)totalLavagens / diasPeriodo, 1);
                var mediaPorVeiculo = veiculosLavados > 0 ? Math.Round((double)totalLavagens / veiculosLavados, 1) : 0;

                // Lavador destaque (que mais lavou)
                var lavadorDestaque = lavadoresLavagem
                    .GroupBy(ll => new { ll.LavadorId, ll.Lavador?.Nome })
                    .Select(g => new { Nome = g.Key.Nome ?? "N/A", Quantidade = g.Count() })
                    .OrderByDescending(x => x.Quantidade)
                    .FirstOrDefault();

                // Veículo mais lavado (com indicador PM)
                var veiculoMaisLavado = lavagens
                    .GroupBy(l => new {
                        l.VeiculoId,
                        Placa = l.Veiculo?.Placa,
                        IsPM = l.Veiculo?.PlacaBronzeId != null
                    })
                    .Select(g => new {
                        Placa = g.Key.IsPM ? $"{g.Key.Placa} (PM)" : g.Key.Placa ?? "N/A",
                        Quantidade = g.Count()
                    })
                    .OrderByDescending(x => x.Quantidade)
                    .FirstOrDefault();

                // Dia mais movimentado
                var diasSemana = new[] { "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado" };
                var diaMaisMovimentado = lavagens
                    .Where(l => l.Data.HasValue)
                    .GroupBy(l => l.Data.Value.DayOfWeek)
                    .Select(g => new { Dia = diasSemana[(int)g.Key], Quantidade = g.Count() })
                    .OrderByDescending(x => x.Quantidade)
                    .FirstOrDefault();

                // Horário de pico
                var horarioPico = lavagens
                    .Where(l => l.HorarioInicio.HasValue)
                    .GroupBy(l => l.HorarioInicio.Value.Hour)
                    .Select(g => new { Hora = $"{g.Key:D2}:00", Quantidade = g.Count() })
                    .OrderByDescending(x => x.Quantidade)
                    .FirstOrDefault();

                // Período anterior para comparação
                var dataInicioAnterior = dataInicio.Value.AddDays(-(diasPeriodo + 1));
                var dataFimAnterior = dataInicio.Value.AddSeconds(-1);

                var lavagensAnteriores = await _context.Lavagem
                    .Where(l => l.Data >= dataInicioAnterior && l.Data <= dataFimAnterior)
                    .CountAsync();

                return Json(new
                {
                    success = true,
                    totalLavagens,
                    veiculosLavados,
                    lavadoresAtivos,
                    mediaDiaria,
                    mediaPorVeiculo,
                    lavadorDestaque = lavadorDestaque ?? new { Nome = "N/A", Quantidade = 0 },
                    veiculoMaisLavado = veiculoMaisLavado ?? new { Placa = "N/A", Quantidade = 0 },
                    diaMaisMovimentado = diaMaisMovimentado?.Dia ?? "N/A",
                    horarioPico = horarioPico?.Hora ?? "N/A",
                    periodoAnterior = new
                    {
                        totalLavagens = lavagensAnteriores
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Gráficos

        [HttpGet]
        [Route("api/DashboardLavagem/LavagensPorDiaSemana")]
        public async Task<IActionResult> LavagensPorDiaSemana(DateTime? dataInicio, DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var lavagens = await _context.Lavagem
                    .Where(l => l.Data >= dataInicio && l.Data <= dataFim && l.Data.HasValue)
                    .ToListAsync();

                var diasSemana = new[] { "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb" };
                var resultado = Enumerable.Range(0, 7)
                    .Select(i => new
                    {
                        dia = diasSemana[i],
                        quantidade = lavagens.Count(l => (int)l.Data.Value.DayOfWeek == i)
                    })
                    .ToList();

                return Json(new { success = true, data = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("api/DashboardLavagem/LavagensPorHorario")]
        public async Task<IActionResult> LavagensPorHorario(DateTime? dataInicio, DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var lavagens = await _context.Lavagem
                    .Where(l => l.Data >= dataInicio && l.Data <= dataFim && l.HorarioInicio.HasValue)
                    .ToListAsync();

                var resultado = Enumerable.Range(0, 24)
                    .Select(h => new
                    {
                        hora = $"{h:D2}:00",
                        quantidade = lavagens.Count(l => l.HorarioInicio.Value.Hour == h)
                    })
                    .ToList();

                return Json(new { success = true, data = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("api/DashboardLavagem/EvolucaoMensal")]
        public async Task<IActionResult> EvolucaoMensal(int meses = 12)
        {
            try
            {
                var dataInicio = DateTime.Now.AddMonths(-meses).Date;
                dataInicio = new DateTime(dataInicio.Year, dataInicio.Month, 1);

                var lavagens = await _context.Lavagem
                    .Where(l => l.Data >= dataInicio && l.Data.HasValue)
                    .ToListAsync();

                var resultado = lavagens
                    .GroupBy(l => new { l.Data.Value.Year, l.Data.Value.Month })
                    .Select(g => new
                    {
                        mes = $"{g.Key.Month:D2}/{g.Key.Year}",
                        ano = g.Key.Year,
                        mesNum = g.Key.Month,
                        quantidade = g.Count()
                    })
                    .OrderBy(x => x.ano)
                    .ThenBy(x => x.mesNum)
                    .ToList();

                return Json(new { success = true, data = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("api/DashboardLavagem/TopLavadores")]
        public async Task<IActionResult> TopLavadores(DateTime? dataInicio, DateTime? dataFim, int top = 10)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var lavagensIds = await _context.Lavagem
                    .Where(l => l.Data >= dataInicio && l.Data <= dataFim)
                    .Select(l => l.LavagemId)
                    .ToListAsync();

                var lavadoresLavagem = await _context.LavadoresLavagem
                    .Include(ll => ll.Lavador)
                    .Where(ll => lavagensIds.Contains(ll.LavagemId))
                    .ToListAsync();

                var resultado = lavadoresLavagem
                    .GroupBy(ll => new { ll.LavadorId, ll.Lavador?.Nome })
                    .Select(g => new
                    {
                        nome = g.Key.Nome ?? "N/A",
                        quantidade = g.Count()
                    })
                    .OrderByDescending(x => x.quantidade)
                    .Take(top)
                    .ToList();

                return Json(new { success = true, data = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("api/DashboardLavagem/TopVeiculos")]
        public async Task<IActionResult> TopVeiculos(DateTime? dataInicio, DateTime? dataFim, int top = 10)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var lavagens = await _context.Lavagem
                    .Include(l => l.Veiculo)
                    .ThenInclude(v => v.ModeloVeiculo)
                    .Where(l => l.Data >= dataInicio && l.Data <= dataFim)
                    .ToListAsync();

                var resultado = lavagens
                    .GroupBy(l => new {
                        l.VeiculoId,
                        l.Veiculo?.Placa,
                        Modelo = l.Veiculo?.ModeloVeiculo?.DescricaoModelo,
                        IsPM = l.Veiculo?.PlacaBronzeId != null
                    })
                    .Select(g => new
                    {
                        placa = g.Key.IsPM ? $"{g.Key.Placa} (PM)" : g.Key.Placa ?? "N/A",
                        modelo = g.Key.Modelo ?? "",
                        descricao = g.Key.IsPM
                            ? $"({g.Key.Placa}) PM - {g.Key.Modelo ?? ""}"
                            : $"({g.Key.Placa}) - {g.Key.Modelo ?? ""}",
                        quantidade = g.Count()
                    })
                    .OrderByDescending(x => x.quantidade)
                    .Take(top)
                    .ToList();

                return Json(new { success = true, data = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("api/DashboardLavagem/TopMotoristas")]
        public async Task<IActionResult> TopMotoristas(DateTime? dataInicio, DateTime? dataFim, int top = 10)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var lavagens = await _context.Lavagem
                    .Include(l => l.Motorista)
                    .Where(l => l.Data >= dataInicio && l.Data <= dataFim)
                    .ToListAsync();

                var resultado = lavagens
                    .GroupBy(l => new { l.MotoristaId, l.Motorista?.Nome })
                    .Select(g => new
                    {
                        nome = g.Key.Nome ?? "N/A",
                        quantidade = g.Count()
                    })
                    .OrderByDescending(x => x.quantidade)
                    .Take(top)
                    .ToList();

                return Json(new { success = true, data = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("api/DashboardLavagem/HeatmapDiaHora")]
        public async Task<IActionResult> HeatmapDiaHora(DateTime? dataInicio, DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var lavagens = await _context.Lavagem
                    .Where(l => l.Data >= dataInicio && l.Data <= dataFim && l.Data.HasValue && l.HorarioInicio.HasValue)
                    .ToListAsync();

                var resultado = lavagens
                    .GroupBy(l => new { Dia = (int)l.Data.Value.DayOfWeek, Hora = l.HorarioInicio.Value.Hour })
                    .Select(g => new
                    {
                        dia = g.Key.Dia,
                        hora = g.Key.Hora,
                        quantidade = g.Count()
                    })
                    .ToList();

                return Json(new { success = true, data = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("api/DashboardLavagem/LavagensPorContrato")]
        public async Task<IActionResult> LavagensPorContrato(DateTime? dataInicio, DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var lavagensIds = await _context.Lavagem
                    .Where(l => l.Data >= dataInicio && l.Data <= dataFim)
                    .Select(l => l.LavagemId)
                    .ToListAsync();

                var lavadoresLavagem = await _context.LavadoresLavagem
                    .Include(ll => ll.Lavador)
                    .ThenInclude(lav => lav.Contrato)
                    .ThenInclude(c => c.Fornecedor)
                    .Where(ll => lavagensIds.Contains(ll.LavagemId))
                    .ToListAsync();

                var resultado = lavadoresLavagem
                    .GroupBy(ll => ll.Lavador?.Contrato?.Fornecedor?.DescricaoFornecedor ?? "Sem Contrato")
                    .Select(g => new
                    {
                        contrato = g.Key,
                        quantidade = g.Select(x => x.LavagemId).Distinct().Count()
                    })
                    .OrderByDescending(x => x.quantidade)
                    .ToList();

                return Json(new { success = true, data = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("api/DashboardLavagem/DuracaoLavagens")]
        public async Task<IActionResult> DuracaoLavagens(DateTime? dataInicio, DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var lavagens = await _context.Lavagem
                    .Include(l => l.Veiculo)
                    .Where(l => l.Data >= dataInicio && l.Data <= dataFim
                        && l.HorarioInicio.HasValue && l.HorarioFim.HasValue)
                    .ToListAsync();

                // Calcular duração de cada lavagem
                var lavagensDuracao = lavagens
                    .Select(l => new
                    {
                        l.LavagemId,
                        Categoria = l.Veiculo?.PlacaBronzeId != null ? "PM" : (l.Veiculo?.Categoria ?? "Outros"),
                        DuracaoMinutos = (l.HorarioFim.Value - l.HorarioInicio.Value).TotalMinutes
                    })
                    .Where(l => l.DuracaoMinutos > 0 && l.DuracaoMinutos < 480) // Filtrar valores válidos (até 8h)
                    .ToList();

                // Distribuição por faixas de duração
                var distribuicao = new[]
                {
                    new { faixa = "0-15 min", min = 0, max = 15 },
                    new { faixa = "15-30 min", min = 15, max = 30 },
                    new { faixa = "30-45 min", min = 30, max = 45 },
                    new { faixa = "45-60 min", min = 45, max = 60 },
                    new { faixa = "60+ min", min = 60, max = 999 }
                }
                .Select(f => new
                {
                    faixa = f.faixa,
                    quantidade = lavagensDuracao.Count(l => l.DuracaoMinutos >= f.min && l.DuracaoMinutos < f.max)
                })
                .ToList();

                // Duração média por categoria
                var duracaoPorCategoria = lavagensDuracao
                    .GroupBy(l => l.Categoria)
                    .Select(g => new
                    {
                        categoria = g.Key,
                        mediaMinutos = Math.Round(g.Average(l => l.DuracaoMinutos), 1),
                        quantidade = g.Count()
                    })
                    .OrderByDescending(x => x.quantidade)
                    .ToList();

                // Estatísticas gerais
                var duracaoMedia = lavagensDuracao.Any()
                    ? Math.Round(lavagensDuracao.Average(l => l.DuracaoMinutos), 1)
                    : 0;
                var duracaoMinima = lavagensDuracao.Any()
                    ? Math.Round(lavagensDuracao.Min(l => l.DuracaoMinutos), 1)
                    : 0;
                var duracaoMaxima = lavagensDuracao.Any()
                    ? Math.Round(lavagensDuracao.Max(l => l.DuracaoMinutos), 1)
                    : 0;

                return Json(new
                {
                    success = true,
                    estatisticas = new
                    {
                        totalComDuracao = lavagensDuracao.Count,
                        duracaoMedia,
                        duracaoMinima,
                        duracaoMaxima
                    },
                    distribuicao,
                    duracaoPorCategoria
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("api/DashboardLavagem/LavagensPorCategoria")]
        public async Task<IActionResult> LavagensPorCategoria(DateTime? dataInicio, DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var lavagens = await _context.Lavagem
                    .Include(l => l.Veiculo)
                    .Where(l => l.Data >= dataInicio && l.Data <= dataFim)
                    .ToListAsync();

                // Separa veículos PM (que têm PlacaBronzeId) dos demais
                var resultado = lavagens
                    .GroupBy(l =>
                    {
                        if (l.Veiculo?.PlacaBronzeId != null)
                            return "PM";
                        return l.Veiculo?.Categoria ?? "Não Informado";
                    })
                    .Select(g => new
                    {
                        categoria = g.Key,
                        quantidade = g.Count()
                    })
                    .OrderByDescending(x => x.quantidade)
                    .ToList();

                return Json(new { success = true, data = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Tabelas

        [HttpGet]
        [Route("api/DashboardLavagem/EstatisticasPorLavador")]
        public async Task<IActionResult> EstatisticasPorLavador(DateTime? dataInicio, DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var diasPeriodo = (dataFim.Value - dataInicio.Value).Days;
                diasPeriodo = diasPeriodo > 0 ? diasPeriodo : 1;

                var lavagensIds = await _context.Lavagem
                    .Where(l => l.Data >= dataInicio && l.Data <= dataFim)
                    .Select(l => l.LavagemId)
                    .ToListAsync();

                var totalLavagens = lavagensIds.Count;

                var lavadoresLavagem = await _context.LavadoresLavagem
                    .Include(ll => ll.Lavador)
                    .Where(ll => lavagensIds.Contains(ll.LavagemId))
                    .ToListAsync();

                var resultado = lavadoresLavagem
                    .GroupBy(ll => new { ll.LavadorId, ll.Lavador?.Nome })
                    .Select(g => new
                    {
                        nome = g.Key.Nome ?? "N/A",
                        lavagens = g.Count(),
                        percentual = totalLavagens > 0 ? Math.Round((double)g.Count() / totalLavagens * 100, 1) : 0,
                        mediaDia = Math.Round((double)g.Count() / diasPeriodo, 2)
                    })
                    .OrderByDescending(x => x.lavagens)
                    .ToList();

                return Json(new { success = true, data = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("api/DashboardLavagem/EstatisticasPorVeiculo")]
        public async Task<IActionResult> EstatisticasPorVeiculo(DateTime? dataInicio, DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var lavagens = await _context.Lavagem
                    .Include(l => l.Veiculo)
                    .ThenInclude(v => v.ModeloVeiculo)
                    .Where(l => l.Data >= dataInicio && l.Data <= dataFim)
                    .ToListAsync();

                var hoje = DateTime.Now.Date;

                var resultado = lavagens
                    .GroupBy(l => new {
                        l.VeiculoId,
                        l.Veiculo?.Placa,
                        Modelo = l.Veiculo?.ModeloVeiculo?.DescricaoModelo,
                        IsPM = l.Veiculo?.PlacaBronzeId != null
                    })
                    .Select(g => new
                    {
                        placa = g.Key.IsPM ? $"{g.Key.Placa} (PM)" : g.Key.Placa ?? "N/A",
                        modelo = g.Key.Modelo ?? "",
                        lavagens = g.Count(),
                        ultimaLavagem = g.Max(l => l.Data)?.ToString("dd/MM/yyyy") ?? "N/A",
                        diasSemLavar = g.Max(l => l.Data).HasValue
                            ? (hoje - g.Max(l => l.Data).Value.Date).Days
                            : -1
                    })
                    .OrderByDescending(x => x.lavagens)
                    .ToList();

                return Json(new { success = true, data = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion
    }
}
