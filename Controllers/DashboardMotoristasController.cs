using FrotiX.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    [Authorize]
    public class DashboardMotoristasController : Controller
    {
        private readonly FrotiXDbContext _context;

        public DashboardMotoristasController(FrotiXDbContext context)
        {
            _context = context;
        }

        #region Helper - Obter Período a partir de Ano/Mês ou Data

        private (DateTime dataInicio, DateTime dataFim) ObterPeriodo(DateTime? dataInicio, DateTime? dataFim, int? ano, int? mes)
        {
            if (ano.HasValue)
            {
                if (mes.HasValue)
                {
                    var inicio = new DateTime(ano.Value, mes.Value, 1);
                    var fim = inicio.AddMonths(1).AddSeconds(-1);
                    return (inicio, fim);
                }
                else
                {
                    var inicio = new DateTime(ano.Value, 1, 1);
                    var fim = new DateTime(ano.Value, 12, 31, 23, 59, 59);
                    return (inicio, fim);
                }
            }
            else if (dataInicio.HasValue && dataFim.HasValue)
            {
                return (dataInicio.Value, dataFim.Value);
            }
            else
            {
                // Fallback: últimos 30 dias
                var fim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                var inicio = fim.AddDays(-30);
                return (inicio, fim);
            }
        }

        #endregion

        #region Anos e Meses Disponíveis

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterAnosMesesDisponiveis")]
        public async Task<IActionResult> ObterAnosMesesDisponiveis()
        {
            try
            {
                var hoje = DateTime.Now;
                var anoAtual = hoje.Year;
                var mesAtual = hoje.Month;

                // OTIMIZADO: Busca anos/meses das tabelas estatísticas
                var anosViagens = await _context.EstatisticaGeralMensal
                    .AsNoTracking()
                    .Select(e => new { e.Ano, e.Mes })
                    .Distinct()
                    .ToListAsync();

                // Se não houver dados estatísticos, busca da tabela original (fallback)
                if (!anosViagens.Any())
                {
                    anosViagens = await _context.Viagem
                        .Where(v => v.DataInicial.HasValue && v.MotoristaId.HasValue)
                        .Select(v => new { Ano = v.DataInicial.Value.Year, Mes = v.DataInicial.Value.Month })
                        .Distinct()
                        .ToListAsync();
                }

                // Filtra para não passar do ano/mês atual
                var anosFiltrados = anosViagens
                    .Where(x => x.Ano < anoAtual || (x.Ano == anoAtual && x.Mes <= mesAtual))
                    .ToList();

                var anos = anosFiltrados
                    .Select(x => x.Ano)
                    .Distinct()
                    .Where(a => a <= anoAtual)
                    .OrderByDescending(x => x)
                    .ToList();

                var ultimoAno = anos.FirstOrDefault();
                var mesesDoUltimoAno = anosFiltrados
                    .Where(x => x.Ano == ultimoAno)
                    .Select(x => x.Mes)
                    .Where(m => ultimoAno < anoAtual || m <= mesAtual)
                    .Distinct()
                    .OrderByDescending(x => x)
                    .ToList();
                var ultimoMes = mesesDoUltimoAno.FirstOrDefault();

                return Json(new
                {
                    success = true,
                    anos,
                    ultimoAno,
                    ultimoMes,
                    mesesDisponiveis = mesesDoUltimoAno,
                    anoMaximo = anoAtual,
                    mesMaximo = mesAtual
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterMesesPorAno")]
        public async Task<IActionResult> ObterMesesPorAno(int ano)
        {
            try
            {
                var hoje = DateTime.Now;
                var anoAtual = hoje.Year;
                var mesAtual = hoje.Month;

                // OTIMIZADO: Busca meses das tabelas estatísticas
                var meses = await _context.EstatisticaGeralMensal
                    .AsNoTracking()
                    .Where(e => e.Ano == ano)
                    .Select(e => e.Mes)
                    .Distinct()
                    .ToListAsync();

                // Fallback para tabela original se não houver estatísticas
                if (!meses.Any())
                {
                    meses = await _context.Viagem
                        .Where(v => v.DataInicial.HasValue && v.MotoristaId.HasValue)
                        .Where(v => v.DataInicial.Value.Year == ano)
                        .Select(v => v.DataInicial.Value.Month)
                        .Distinct()
                        .ToListAsync();
                }

                if (ano == anoAtual)
                {
                    meses = meses.Where(m => m <= mesAtual).ToList();
                }

                meses = meses.OrderByDescending(x => x).ToList();

                return Json(new { success = true, meses });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Lista de Motoristas para Filtro

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterListaMotoristas")]
        public async Task<IActionResult> ObterListaMotoristas()
        {
            try
            {
                var motoristas = await _context.Motorista
                    .Where(m => m.Status == true)
                    .OrderBy(m => m.Nome)
                    .Select(m => new
                    {
                        motoristaId = m.MotoristaId,
                        nome = m.Nome
                    })
                    .AsNoTracking()
                    .ToListAsync();

                return Json(new { success = true, data = motoristas });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Estatísticas Gerais - OTIMIZADO

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterEstatisticasGerais")]
        public async Task<IActionResult> ObterEstatisticasGerais(DateTime? dataInicio, DateTime? dataFim, int? ano, int? mes)
        {
            try
            {
                // Define período baseado em ano/mês OU datas
                if (ano.HasValue)
                {
                    if (mes.HasValue)
                    {
                        dataInicio = new DateTime(ano.Value, mes.Value, 1);
                        dataFim = dataInicio.Value.AddMonths(1).AddSeconds(-1);
                    }
                    else
                    {
                        dataInicio = new DateTime(ano.Value, 1, 1);
                        dataFim = new DateTime(ano.Value, 12, 31, 23, 59, 59);
                    }
                }
                else if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    // Busca último mês com dados estatísticos
                    var ultimoMes = await _context.EstatisticaGeralMensal
                        .AsNoTracking()
                        .OrderByDescending(e => e.Ano)
                        .ThenByDescending(e => e.Mes)
                        .Select(e => new { e.Ano, e.Mes })
                        .FirstOrDefaultAsync();

                    if (ultimoMes != null)
                    {
                        ano = ultimoMes.Ano;
                        mes = ultimoMes.Mes;
                        dataInicio = new DateTime(ultimoMes.Ano, ultimoMes.Mes, 1);
                        dataFim = dataInicio.Value.AddMonths(1).AddSeconds(-1);
                    }
                    else
                    {
                        dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                        dataInicio = dataFim.Value.AddDays(-30);
                    }
                }

                var hoje = DateTime.Now.Date;

                // OTIMIZADO: Busca dados da tabela estatística
                if (ano.HasValue && mes.HasValue)
                {
                    // Busca estatísticas pré-calculadas
                    var estatGeral = await _context.EstatisticaGeralMensal
                        .AsNoTracking()
                        .Where(e => e.Ano == ano && e.Mes == mes)
                        .FirstOrDefaultAsync();

                    if (estatGeral != null)
                    {
                        // Dados de CNH precisam ser calculados em tempo real (mudam diariamente)
                        var cnhStats = await _context.Motorista
                            .AsNoTracking()
                            .Where(m => m.Status == true && m.DataVencimentoCNH.HasValue)
                            .Select(m => new { m.DataVencimentoCNH })
                            .ToListAsync();

                        var cnhVencidas = cnhStats.Count(m => m.DataVencimentoCNH.Value < hoje);
                        var cnhVencendo = cnhStats.Count(m => m.DataVencimentoCNH.Value >= hoje && m.DataVencimentoCNH.Value <= hoje.AddDays(30));

                        return Json(new
                        {
                            success = true,
                            totalMotoristas = estatGeral.TotalMotoristas,
                            motoristasAtivos = estatGeral.MotoristasAtivos,
                            motoristasInativos = estatGeral.MotoristasInativos,
                            efetivos = estatGeral.Efetivos,
                            feristas = estatGeral.Feristas,
                            cobertura = estatGeral.Cobertura,
                            cnhVencidas,
                            cnhVencendo30Dias = cnhVencendo,
                            totalViagens = estatGeral.TotalViagens,
                            kmTotal = estatGeral.KmTotal,
                            horasTotais = Math.Round((double)estatGeral.HorasTotais, 1),
                            totalMultas = estatGeral.TotalMultas,
                            valorTotalMultas = Math.Round((double)estatGeral.ValorTotalMultas, 2),
                            abastecimentos = estatGeral.TotalAbastecimentos,
                            periodoInicio = dataInicio?.ToString("yyyy-MM-dd"),
                            periodoFim = dataFim?.ToString("yyyy-MM-dd")
                        });
                    }
                }

                // Fallback: Busca direto se não houver estatísticas pré-calculadas
                return await ObterEstatisticasGeraisFallback(dataInicio, dataFim, hoje);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        private async Task<IActionResult> ObterEstatisticasGeraisFallback(DateTime? dataInicio, DateTime? dataFim, DateTime hoje)
        {
            var statsMotoristas = await _context.Motorista
                .AsNoTracking()
                .GroupBy(m => 1)
                .Select(g => new
                {
                    total = g.Count(),
                    ativos = g.Count(m => m.Status == true),
                    inativos = g.Count(m => m.Status == false),
                    efetivos = g.Count(m => m.Status == true && (m.EfetivoFerista == "Efetivo" || m.EfetivoFerista == null || m.EfetivoFerista == "")),
                    feristas = g.Count(m => m.Status == true && m.EfetivoFerista == "Ferista"),
                    cobertura = g.Count(m => m.Status == true && m.EfetivoFerista == "Cobertura"),
                    cnhVencidas = g.Count(m => m.Status == true && m.DataVencimentoCNH.HasValue && m.DataVencimentoCNH.Value < hoje),
                    cnhVencendo = g.Count(m => m.Status == true && m.DataVencimentoCNH.HasValue && m.DataVencimentoCNH.Value >= hoje && m.DataVencimentoCNH.Value <= hoje.AddDays(30))
                })
                .FirstOrDefaultAsync();

            var viagensStats = await _context.Viagem
                .AsNoTracking()
                .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                .Where(v => v.MotoristaId.HasValue)
                .Select(v => new { v.KmInicial, v.KmFinal, v.Minutos })
                .ToListAsync();

            var totalViagens = viagensStats.Count;
            var kmTotal = viagensStats
                .Where(v => v.KmInicial.HasValue && v.KmFinal.HasValue)
                .Where(v => v.KmFinal.Value >= v.KmInicial.Value)
                .Where(v => (v.KmFinal.Value - v.KmInicial.Value) <= 2000m)
                .Sum(v => (v.KmFinal ?? 0) - (v.KmInicial ?? 0));
            var horasTotais = viagensStats.Sum(v => v.Minutos ?? 0) / 60.0;

            var multasStats = await _context.Multa
                .AsNoTracking()
                .Where(m => m.Data >= dataInicio && m.Data <= dataFim)
                .GroupBy(m => 1)
                .Select(g => new { total = g.Count(), valorTotal = g.Sum(m => m.ValorAteVencimento ?? 0) })
                .FirstOrDefaultAsync();

            var abastecimentos = await _context.Abastecimento
                .AsNoTracking()
                .Where(a => a.DataHora >= dataInicio && a.DataHora <= dataFim)
                .Where(a => a.MotoristaId != Guid.Empty)
                .CountAsync();

            return Json(new
            {
                success = true,
                totalMotoristas = statsMotoristas?.total ?? 0,
                motoristasAtivos = statsMotoristas?.ativos ?? 0,
                motoristasInativos = statsMotoristas?.inativos ?? 0,
                efetivos = statsMotoristas?.efetivos ?? 0,
                feristas = statsMotoristas?.feristas ?? 0,
                cobertura = statsMotoristas?.cobertura ?? 0,
                cnhVencidas = statsMotoristas?.cnhVencidas ?? 0,
                cnhVencendo30Dias = statsMotoristas?.cnhVencendo ?? 0,
                totalViagens,
                kmTotal,
                horasTotais = Math.Round(horasTotais, 1),
                totalMultas = multasStats?.total ?? 0,
                valorTotalMultas = Math.Round(multasStats?.valorTotal ?? 0, 2),
                abastecimentos,
                periodoInicio = dataInicio?.ToString("yyyy-MM-dd"),
                periodoFim = dataFim?.ToString("yyyy-MM-dd")
            });
        }

        #endregion

        #region Dados Individuais do Motorista - OTIMIZADO

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterDadosMotorista")]
        public async Task<IActionResult> ObterDadosMotorista(Guid motoristaId, DateTime? dataInicio, DateTime? dataFim, int? ano, int? mes)
        {
            try
            {
                var periodo = ObterPeriodo(dataInicio, dataFim, ano, mes);
                dataInicio = periodo.dataInicio;
                dataFim = periodo.dataFim;

                var hoje = DateTime.Now.Date;

                // Dados do motorista
                var motorista = await _context.Motorista
                    .Where(m => m.MotoristaId == motoristaId)
                    .Select(m => new
                    {
                        m.MotoristaId,
                        m.Nome,
                        m.CPF,
                        m.Ponto,
                        m.CNH,
                        m.CategoriaCNH,
                        m.DataVencimentoCNH,
                        m.DataIngresso,
                        m.EfetivoFerista,
                        m.TipoCondutor,
                        m.Status,
                        TemFoto = m.Foto != null && m.Foto.Length > 0
                    })
                    .FirstOrDefaultAsync();

                if (motorista == null)
                {
                    return Json(new { success = false, message = "Motorista não encontrado" });
                }

                // OTIMIZADO: Busca estatísticas pré-calculadas
                int totalViagens = 0;
                decimal kmTotal = 0;
                int minutosTotais = 0;
                int totalMultas = 0;
                decimal valorMultas = 0;
                int abastecimentos = 0;

                if (ano.HasValue && mes.HasValue)
                {
                    var estatMot = await _context.EstatisticaMotoristasMensal
                        .AsNoTracking()
                        .Where(e => e.MotoristaId == motoristaId && e.Ano == ano && e.Mes == mes)
                        .FirstOrDefaultAsync();

                    if (estatMot != null)
                    {
                        totalViagens = estatMot.TotalViagens;
                        kmTotal = estatMot.KmTotal;
                        minutosTotais = estatMot.MinutosTotais;
                        totalMultas = estatMot.TotalMultas;
                        valorMultas = estatMot.ValorTotalMultas;
                        abastecimentos = estatMot.TotalAbastecimentos;
                    }
                }
                else
                {
                    // Fallback: calcula direto
                    var viagens = await _context.Viagem
                        .Where(v => v.MotoristaId == motoristaId)
                        .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                        .Select(v => new { v.KmInicial, v.KmFinal, v.Minutos })
                        .ToListAsync();

                    totalViagens = viagens.Count;
                    var viagensComKmValido = viagens
                        .Where(v => v.KmInicial.HasValue && v.KmFinal.HasValue)
                        .Where(v => v.KmFinal.Value >= v.KmInicial.Value)
                        .Where(v => (v.KmFinal.Value - v.KmInicial.Value) <= 2000m)
                        .ToList();
                    kmTotal = viagensComKmValido.Sum(v => (v.KmFinal ?? 0) - (v.KmInicial ?? 0));
                    minutosTotais = viagens.Sum(v => v.Minutos ?? 0);

                    var multasMot = await _context.Multa
                        .Where(m => m.MotoristaId == motoristaId)
                        .Where(m => m.Data >= dataInicio && m.Data <= dataFim)
                        .Select(m => m.ValorAteVencimento ?? 0)
                        .ToListAsync();
                    totalMultas = multasMot.Count;
                    valorMultas = (decimal)multasMot.Sum();

                    abastecimentos = await _context.Abastecimento
                        .Where(a => a.MotoristaId == motoristaId)
                        .Where(a => a.DataHora >= dataInicio && a.DataHora <= dataFim)
                        .CountAsync();
                }

                var horasDirigidas = minutosTotais / 60.0;
                var mediaKmPorViagem = totalViagens > 0 ? kmTotal / totalViagens : 0;

                // Cálculos de CNH
                int? diasParaVencerCnh = null;
                string statusCnh = "OK";
                if (motorista.DataVencimentoCNH.HasValue)
                {
                    diasParaVencerCnh = (motorista.DataVencimentoCNH.Value.Date - hoje).Days;
                    if (diasParaVencerCnh < 0)
                        statusCnh = "Vencida";
                    else if (diasParaVencerCnh <= 30)
                        statusCnh = "Vencendo";
                }

                // Tempo na empresa
                string tempoEmpresa = "-";
                if (motorista.DataIngresso.HasValue)
                {
                    var diff = hoje - motorista.DataIngresso.Value.Date;
                    var anos = diff.Days / 365;
                    var meses = (diff.Days % 365) / 30;
                    if (anos > 0)
                        tempoEmpresa = $"{anos} ano{(anos > 1 ? "s" : "")} e {meses} mês{(meses > 1 ? "es" : "")}";
                    else
                        tempoEmpresa = $"{meses} mês{(meses > 1 ? "es" : "")}";
                }

                return Json(new
                {
                    success = true,
                    motorista = new
                    {
                        motorista.MotoristaId,
                        motorista.Nome,
                        motorista.CPF,
                        motorista.Ponto,
                        motorista.CNH,
                        motorista.CategoriaCNH,
                        dataVencimentoCnh = motorista.DataVencimentoCNH?.ToString("dd/MM/yyyy"),
                        dataIngresso = motorista.DataIngresso?.ToString("dd/MM/yyyy"),
                        motorista.EfetivoFerista,
                        motorista.TipoCondutor,
                        motorista.Status,
                        motorista.TemFoto,
                        diasParaVencerCnh,
                        statusCnh,
                        tempoEmpresa
                    },
                    estatisticas = new
                    {
                        totalViagens,
                        kmTotal,
                        mediaKmPorViagem = Math.Round((double)mediaKmPorViagem, 1),
                        horasDirigidas = Math.Round(horasDirigidas, 1),
                        totalMultas,
                        valorMultas = Math.Round((double)valorMultas, 2),
                        abastecimentos
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Top 10 por Viagens - OTIMIZADO

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterTop10PorViagens")]
        public async Task<IActionResult> ObterTop10PorViagens(DateTime? dataInicio, DateTime? dataFim, int? ano, int? mes)
        {
            try
            {
                // OTIMIZADO: Busca do ranking pré-calculado
                if (ano.HasValue && mes.HasValue)
                {
                    var ranking = await _context.RankingMotoristasMensal
                        .AsNoTracking()
                        .Where(r => r.Ano == ano && r.Mes == mes && r.TipoRanking == "VIAGENS")
                        .OrderBy(r => r.Posicao)
                        .Select(r => new
                        {
                            motorista = r.NomeMotorista,
                            totalViagens = (int)r.ValorPrincipal
                        })
                        .ToListAsync();

                    if (ranking.Any())
                    {
                        return Json(new { success = true, data = ranking });
                    }
                }

                // Fallback
                var periodo = ObterPeriodo(dataInicio, dataFim, ano, mes);

                var top10 = await _context.Viagem
                    .AsNoTracking()
                    .Where(v => v.DataInicial >= periodo.dataInicio && v.DataInicial <= periodo.dataFim)
                    .Where(v => v.MotoristaId.HasValue)
                    .GroupBy(v => new { v.MotoristaId, v.Motorista.Nome })
                    .Select(g => new
                    {
                        motorista = g.Key.Nome ?? "Não informado",
                        totalViagens = g.Count()
                    })
                    .OrderByDescending(x => x.totalViagens)
                    .Take(10)
                    .ToListAsync();

                return Json(new { success = true, data = top10 });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Top 10 por KM - OTIMIZADO

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterTop10PorKm")]
        public async Task<IActionResult> ObterTop10PorKm(DateTime? dataInicio, DateTime? dataFim, int? ano, int? mes)
        {
            try
            {
                // OTIMIZADO: Busca do ranking pré-calculado
                if (ano.HasValue && mes.HasValue)
                {
                    var ranking = await _context.RankingMotoristasMensal
                        .AsNoTracking()
                        .Where(r => r.Ano == ano && r.Mes == mes && r.TipoRanking == "KM")
                        .OrderBy(r => r.Posicao)
                        .Select(r => new
                        {
                            motorista = r.NomeMotorista,
                            kmTotal = r.ValorPrincipal
                        })
                        .ToListAsync();

                    if (ranking.Any())
                    {
                        return Json(new { success = true, data = ranking });
                    }
                }

                // Fallback
                var periodo = ObterPeriodo(dataInicio, dataFim, ano, mes);

                var viagens = await _context.Viagem
                    .AsNoTracking()
                    .Where(v => v.DataInicial >= periodo.dataInicio && v.DataInicial <= periodo.dataFim)
                    .Where(v => v.MotoristaId.HasValue)
                    .Where(v => v.KmInicial.HasValue && v.KmFinal.HasValue)
                    .Where(v => v.KmFinal.Value >= v.KmInicial.Value)
                    .Where(v => (v.KmFinal.Value - v.KmInicial.Value) <= 2000m)
                    .Select(v => new { v.MotoristaId, v.Motorista.Nome, v.KmInicial, v.KmFinal })
                    .ToListAsync();

                var top10 = viagens
                    .GroupBy(v => new { v.MotoristaId, v.Nome })
                    .Select(g => new
                    {
                        motorista = g.Key.Nome ?? "Não informado",
                        kmTotal = g.Sum(v => (v.KmFinal ?? 0) - (v.KmInicial ?? 0))
                    })
                    .OrderByDescending(x => x.kmTotal)
                    .Take(10)
                    .ToList();

                return Json(new { success = true, data = top10 });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Distribuição por Tipo

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterDistribuicaoPorTipo")]
        public async Task<IActionResult> ObterDistribuicaoPorTipo()
        {
            try
            {
                var stats = await _context.Motorista
                    .AsNoTracking()
                    .Where(m => m.Status == true)
                    .GroupBy(m => m.EfetivoFerista ?? "Efetivo")
                    .Select(g => new { tipo = g.Key == "" ? "Efetivo" : g.Key, quantidade = g.Count() })
                    .ToListAsync();

                var dados = new List<object>();
                var efetivos = stats.Where(s => s.tipo == "Efetivo" || s.tipo == "").Sum(s => s.quantidade);
                if (efetivos > 0) dados.Add(new { tipo = "Efetivo", quantidade = efetivos });

                var feristas = stats.FirstOrDefault(s => s.tipo == "Ferista")?.quantidade ?? 0;
                if (feristas > 0) dados.Add(new { tipo = "Ferista", quantidade = feristas });

                var cobertura = stats.FirstOrDefault(s => s.tipo == "Cobertura")?.quantidade ?? 0;
                if (cobertura > 0) dados.Add(new { tipo = "Cobertura", quantidade = cobertura });

                return Json(new { success = true, data = dados });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Distribuição por Status

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterDistribuicaoPorStatus")]
        public async Task<IActionResult> ObterDistribuicaoPorStatus()
        {
            try
            {
                var stats = await _context.Motorista
                    .AsNoTracking()
                    .GroupBy(m => m.Status)
                    .Select(g => new { status = g.Key, quantidade = g.Count() })
                    .ToListAsync();

                var dados = new List<object>();
                var ativos = stats.FirstOrDefault(s => s.status == true)?.quantidade ?? 0;
                if (ativos > 0) dados.Add(new { status = "Ativos", quantidade = ativos });

                var inativos = stats.FirstOrDefault(s => s.status == false)?.quantidade ?? 0;
                if (inativos > 0) dados.Add(new { status = "Inativos", quantidade = inativos });

                return Json(new { success = true, data = dados });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Evolução de Viagens - OTIMIZADO

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterEvolucaoViagens")]
        public async Task<IActionResult> ObterEvolucaoViagens(DateTime? dataInicio, DateTime? dataFim, int? ano, int? mes, Guid? motoristaId)
        {
            try
            {
                var periodo = ObterPeriodo(dataInicio, dataFim, ano, mes);

                // OTIMIZADO: Busca da tabela de evolução pré-calculada
                var query = _context.EvolucaoViagensDiaria
                    .AsNoTracking()
                    .Where(e => e.Data >= periodo.dataInicio && e.Data <= periodo.dataFim);

                if (motoristaId.HasValue && motoristaId.Value != Guid.Empty)
                {
                    query = query.Where(e => e.MotoristaId == motoristaId);
                }
                else
                {
                    query = query.Where(e => e.MotoristaId == null);
                }

                var dados = await query
                    .OrderBy(e => e.Data)
                    .Select(e => new
                    {
                        data = e.Data.ToString("yyyy-MM-dd"),
                        totalViagens = e.TotalViagens
                    })
                    .ToListAsync();

                // Fallback se não houver dados pré-calculados
                if (!dados.Any())
                {
                    var viagensQuery = _context.Viagem
                        .AsNoTracking()
                        .Where(v => v.DataInicial >= periodo.dataInicio && v.DataInicial <= periodo.dataFim)
                        .Where(v => v.MotoristaId.HasValue)
                        .Where(v => v.DataInicial.HasValue);

                    if (motoristaId.HasValue && motoristaId.Value != Guid.Empty)
                    {
                        viagensQuery = viagensQuery.Where(v => v.MotoristaId == motoristaId);
                    }

                    dados = await viagensQuery
                        .GroupBy(v => v.DataInicial.Value.Date)
                        .Select(g => new
                        {
                            data = g.Key.ToString("yyyy-MM-dd"),
                            totalViagens = g.Count()
                        })
                        .OrderBy(x => x.data)
                        .ToListAsync();
                }

                return Json(new { success = true, data = dados });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Top 10 por Horas - OTIMIZADO

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterTop10PorHoras")]
        public async Task<IActionResult> ObterTop10PorHoras(DateTime? dataInicio, DateTime? dataFim, int? ano, int? mes)
        {
            try
            {
                // OTIMIZADO: Busca do ranking pré-calculado
                if (ano.HasValue && mes.HasValue)
                {
                    var ranking = await _context.RankingMotoristasMensal
                        .AsNoTracking()
                        .Where(r => r.Ano == ano && r.Mes == mes && r.TipoRanking == "HORAS")
                        .OrderBy(r => r.Posicao)
                        .Select(r => new
                        {
                            motorista = r.NomeMotorista,
                            horasTotais = r.ValorPrincipal
                        })
                        .ToListAsync();

                    if (ranking.Any())
                    {
                        return Json(new { success = true, data = ranking });
                    }
                }

                // Fallback
                var periodo = ObterPeriodo(dataInicio, dataFim, ano, mes);

                var viagens = await _context.Viagem
                    .AsNoTracking()
                    .Where(v => v.DataInicial >= periodo.dataInicio && v.DataInicial <= periodo.dataFim)
                    .Where(v => v.MotoristaId.HasValue)
                    .Where(v => v.Minutos.HasValue && v.Minutos > 0)
                    .Select(v => new { v.MotoristaId, v.Motorista.Nome, v.Minutos })
                    .ToListAsync();

                var top10 = viagens
                    .GroupBy(v => new { v.MotoristaId, v.Nome })
                    .Select(g => new
                    {
                        motorista = g.Key.Nome ?? "Não informado",
                        horasTotais = Math.Round(g.Sum(v => v.Minutos ?? 0) / 60.0, 1)
                    })
                    .OrderByDescending(x => x.horasTotais)
                    .Take(10)
                    .ToList();

                return Json(new { success = true, data = top10 });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Top 10 por Abastecimentos - OTIMIZADO

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterTop10PorAbastecimentos")]
        public async Task<IActionResult> ObterTop10PorAbastecimentos(DateTime? dataInicio, DateTime? dataFim, int? ano, int? mes)
        {
            try
            {
                // OTIMIZADO: Busca do ranking pré-calculado
                if (ano.HasValue && mes.HasValue)
                {
                    var ranking = await _context.RankingMotoristasMensal
                        .AsNoTracking()
                        .Where(r => r.Ano == ano && r.Mes == mes && r.TipoRanking == "ABASTECIMENTOS")
                        .OrderBy(r => r.Posicao)
                        .Select(r => new
                        {
                            motorista = r.NomeMotorista,
                            totalAbastecimentos = (int)r.ValorPrincipal
                        })
                        .ToListAsync();

                    if (ranking.Any())
                    {
                        return Json(new { success = true, data = ranking });
                    }
                }

                // Fallback
                var periodo = ObterPeriodo(dataInicio, dataFim, ano, mes);

                var abastecimentos = await _context.Abastecimento
                    .AsNoTracking()
                    .Where(a => a.DataHora >= periodo.dataInicio && a.DataHora <= periodo.dataFim)
                    .Where(a => a.MotoristaId != Guid.Empty)
                    .Select(a => new { a.MotoristaId, a.Motorista.Nome })
                    .ToListAsync();

                var top10 = abastecimentos
                    .GroupBy(a => new { a.MotoristaId, a.Nome })
                    .Select(g => new
                    {
                        motorista = g.Key.Nome ?? "Não informado",
                        totalAbastecimentos = g.Count()
                    })
                    .OrderByDescending(x => x.totalAbastecimentos)
                    .Take(10)
                    .ToList();

                return Json(new { success = true, data = top10 });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Motoristas com Mais Multas - OTIMIZADO

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterMotoristasComMaisMultas")]
        public async Task<IActionResult> ObterMotoristasComMaisMultas(DateTime? dataInicio, DateTime? dataFim, int? ano, int? mes)
        {
            try
            {
                // OTIMIZADO: Busca do ranking pré-calculado
                if (ano.HasValue && mes.HasValue)
                {
                    var ranking = await _context.RankingMotoristasMensal
                        .AsNoTracking()
                        .Where(r => r.Ano == ano && r.Mes == mes && r.TipoRanking == "MULTAS")
                        .OrderBy(r => r.Posicao)
                        .Select(r => new
                        {
                            motorista = r.NomeMotorista,
                            totalMultas = (int)r.ValorPrincipal,
                            valorTotal = Math.Round((double)r.ValorSecundario, 2)
                        })
                        .ToListAsync();

                    if (ranking.Any())
                    {
                        return Json(new { success = true, data = ranking });
                    }
                }

                // Fallback
                var periodo = ObterPeriodo(dataInicio, dataFim, ano, mes);

                var multas = await _context.Multa
                    .AsNoTracking()
                    .Where(m => m.Data >= periodo.dataInicio && m.Data <= periodo.dataFim)
                    .Where(m => m.MotoristaId.HasValue)
                    .Select(m => new { m.MotoristaId, m.Motorista.Nome, m.ValorAteVencimento })
                    .ToListAsync();

                var dados = multas
                    .GroupBy(m => new { m.MotoristaId, m.Nome })
                    .Select(g => new
                    {
                        motorista = g.Key.Nome ?? "Não informado",
                        totalMultas = g.Count(),
                        valorTotal = Math.Round(g.Sum(m => m.ValorAteVencimento ?? 0), 2)
                    })
                    .OrderByDescending(x => x.totalMultas)
                    .Take(10)
                    .ToList();

                return Json(new { success = true, data = dados });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Distribuição por Tempo de Empresa

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterDistribuicaoPorTempoEmpresa")]
        public async Task<IActionResult> ObterDistribuicaoPorTempoEmpresa()
        {
            try
            {
                var hoje = DateTime.Now.Date;
                var motoristas = await _context.Motorista
                    .AsNoTracking()
                    .Where(m => m.Status == true && m.DataIngresso.HasValue)
                    .Select(m => m.DataIngresso.Value)
                    .ToListAsync();

                var faixas = new Dictionary<string, int>
                {
                    { "Até 1 ano", 0 },
                    { "1-3 anos", 0 },
                    { "3-5 anos", 0 },
                    { "5-10 anos", 0 },
                    { "Mais de 10 anos", 0 }
                };

                foreach (var dataIngresso in motoristas)
                {
                    var anos = (hoje - dataIngresso.Date).Days / 365.0;
                    if (anos <= 1)
                        faixas["Até 1 ano"]++;
                    else if (anos <= 3)
                        faixas["1-3 anos"]++;
                    else if (anos <= 5)
                        faixas["3-5 anos"]++;
                    else if (anos <= 10)
                        faixas["5-10 anos"]++;
                    else
                        faixas["Mais de 10 anos"]++;
                }

                var dados = faixas
                    .Select(kv => new { faixa = kv.Key, quantidade = kv.Value })
                    .Where(x => x.quantidade > 0)
                    .ToList();

                return Json(new { success = true, data = dados });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region CNH Vencidas ou Vencendo

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterMotoristasComCnhProblema")]
        public async Task<IActionResult> ObterMotoristasComCnhProblema()
        {
            try
            {
                var hoje = DateTime.Now.Date;
                var limite30Dias = hoje.AddDays(30);

                var motoristas = await _context.Motorista
                    .AsNoTracking()
                    .Where(m => m.Status == true)
                    .Where(m => m.DataVencimentoCNH.HasValue)
                    .Where(m => m.DataVencimentoCNH.Value.Date <= limite30Dias)
                    .OrderBy(m => m.DataVencimentoCNH)
                    .Select(m => new
                    {
                        m.Nome,
                        m.CNH,
                        m.CategoriaCNH,
                        dataVencimento = m.DataVencimentoCNH,
                        vencida = m.DataVencimentoCNH.Value.Date < hoje,
                        diasParaVencer = (m.DataVencimentoCNH.Value.Date - hoje).Days
                    })
                    .ToListAsync();

                var dados = motoristas.Select(m => new
                {
                    motorista = m.Nome,
                    cnh = m.CNH,
                    categoria = m.CategoriaCNH,
                    dataVencimento = m.dataVencimento?.ToString("dd/MM/yyyy"),
                    status = m.vencida ? "Vencida" : "Vencendo",
                    dias = m.diasParaVencer
                }).ToList();

                return Json(new { success = true, data = dados });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Top 10 Performance - OTIMIZADO

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterTop10Performance")]
        public async Task<IActionResult> ObterTop10Performance(DateTime? dataInicio, DateTime? dataFim, int? ano, int? mes)
        {
            try
            {
                // OTIMIZADO: Busca do ranking pré-calculado
                if (ano.HasValue && mes.HasValue)
                {
                    var ranking = await _context.RankingMotoristasMensal
                        .AsNoTracking()
                        .Where(r => r.Ano == ano && r.Mes == mes && r.TipoRanking == "PERFORMANCE")
                        .OrderBy(r => r.Posicao)
                        .Select(r => new
                        {
                            motorista = r.NomeMotorista,
                            tipo = r.TipoMotorista,
                            totalViagens = (int)r.ValorPrincipal,
                            kmTotal = Math.Round((double)r.ValorSecundario, 0),
                            horasTotais = r.ValorTerciario,
                            totalMultas = r.ValorQuaternario
                        })
                        .ToListAsync();

                    if (ranking.Any())
                    {
                        return Json(new { success = true, data = ranking });
                    }
                }

                // Fallback
                var periodo = ObterPeriodo(dataInicio, dataFim, ano, mes);

                var viagens = await _context.Viagem
                    .AsNoTracking()
                    .Where(v => v.DataInicial >= periodo.dataInicio && v.DataInicial <= periodo.dataFim)
                    .Where(v => v.MotoristaId.HasValue)
                    .Select(v => new { v.MotoristaId, v.Motorista.Nome, v.Motorista.EfetivoFerista, v.KmInicial, v.KmFinal, v.Minutos })
                    .ToListAsync();

                var multas = await _context.Multa
                    .AsNoTracking()
                    .Where(m => m.Data >= periodo.dataInicio && m.Data <= periodo.dataFim)
                    .Where(m => m.MotoristaId.HasValue)
                    .GroupBy(m => m.MotoristaId)
                    .Select(g => new { MotoristaId = g.Key, Total = g.Count() })
                    .ToDictionaryAsync(g => g.MotoristaId, g => g.Total);

                var viagensComKmValido = viagens
                    .Where(v => v.KmInicial.HasValue && v.KmFinal.HasValue)
                    .Where(v => v.KmFinal.Value >= v.KmInicial.Value)
                    .Where(v => (v.KmFinal.Value - v.KmInicial.Value) <= 2000m)
                    .ToList();

                var top10 = viagens
                    .GroupBy(v => new { v.MotoristaId, v.Nome, v.EfetivoFerista })
                    .Select(g =>
                    {
                        var viagensDoMot = viagensComKmValido.Where(v => v.MotoristaId == g.Key.MotoristaId).ToList();
                        var kmTotal = viagensDoMot.Sum(v => (v.KmFinal ?? 0) - (v.KmInicial ?? 0));
                        var horasTotais = g.Sum(v => v.Minutos ?? 0) / 60.0;
                        var totalMultas = multas.ContainsKey(g.Key.MotoristaId) ? multas[g.Key.MotoristaId] : 0;

                        return new
                        {
                            motorista = g.Key.Nome ?? "Não informado",
                            tipo = g.Key.EfetivoFerista ?? "Efetivo",
                            totalViagens = g.Count(),
                            kmTotal = Math.Round((double)kmTotal, 0),
                            horasTotais = Math.Round(horasTotais, 1),
                            totalMultas
                        };
                    })
                    .OrderByDescending(x => x.totalViagens)
                    .Take(10)
                    .ToList();

                return Json(new { success = true, data = top10 });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Heatmap - OTIMIZADO

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterHeatmapViagens")]
        public async Task<IActionResult> ObterHeatmapViagens(DateTime? dataInicio, DateTime? dataFim, int? ano, int? mes, Guid? motoristaId)
        {
            try
            {
                var diasSemana = new[] { "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado" };

                // OTIMIZADO: Busca da tabela de heatmap pré-calculada
                if (ano.HasValue && mes.HasValue)
                {
                    var query = _context.HeatmapViagensMensal
                        .AsNoTracking()
                        .Where(h => h.Ano == ano && h.Mes == mes);

                    if (motoristaId.HasValue && motoristaId.Value != Guid.Empty)
                    {
                        query = query.Where(h => h.MotoristaId == motoristaId);
                    }
                    else
                    {
                        query = query.Where(h => h.MotoristaId == null);
                    }

                    var heatmapData = await query
                        .OrderBy(h => h.DiaSemana)
                        .ThenBy(h => h.Hora)
                        .Select(h => new
                        {
                            x = diasSemana[h.DiaSemana],
                            y = h.Hora.ToString("00") + ":00",
                            value = h.TotalViagens,
                            diaSemanaIndex = h.DiaSemana,
                            hora = h.Hora
                        })
                        .ToListAsync();

                    if (heatmapData.Any())
                    {
                        var valorMaximo = heatmapData.Max(h => h.value);
                        var totalViagens = heatmapData.Sum(h => h.value);

                        return Json(new
                        {
                            success = true,
                            data = heatmapData,
                            valorMaximo,
                            totalViagens,
                            diasSemana
                        });
                    }
                }

                // Fallback
                var periodo = ObterPeriodo(dataInicio, dataFim, ano, mes);

                var viagensQuery = _context.Viagem
                    .AsNoTracking()
                    .Where(v => v.DataInicial >= periodo.dataInicio && v.DataInicial <= periodo.dataFim)
                    .Where(v => v.MotoristaId.HasValue)
                    .Where(v => v.DataInicial.HasValue);

                if (motoristaId.HasValue && motoristaId.Value != Guid.Empty)
                {
                    viagensQuery = viagensQuery.Where(v => v.MotoristaId == motoristaId);
                }

                var viagens = await viagensQuery.ToListAsync();

                var heatmapDataFallback = viagens
                    .Where(v => v.HoraInicio.HasValue) // Filtrar viagens com HoraInicio
                    .GroupBy(v => new
                    {
                        DiaSemana = (int)v.HoraInicio.Value.DayOfWeek,
                        Hora = v.HoraInicio.Value.Hour
                    })
                    .Select(g => new
                    {
                        x = diasSemana[g.Key.DiaSemana],
                        y = g.Key.Hora.ToString("00") + ":00",
                        value = g.Count(),
                        diaSemanaIndex = g.Key.DiaSemana,
                        hora = g.Key.Hora
                    })
                    .OrderBy(x => x.diaSemanaIndex)
                    .ThenBy(x => x.hora)
                    .ToList();

                var valorMaximoFallback = heatmapDataFallback.Any() ? heatmapDataFallback.Max(h => h.value) : 0;

                return Json(new
                {
                    success = true,
                    data = heatmapDataFallback,
                    valorMaximo = valorMaximoFallback,
                    totalViagens = viagens.Count,
                    diasSemana
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Posição do Motorista nos Rankings

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterPosicaoMotorista")]
        public async Task<IActionResult> ObterPosicaoMotorista(Guid motoristaId, DateTime? dataInicio, DateTime? dataFim, int? ano, int? mes)
        {
            try
            {
                // Determina ano/mês para a View
                int anoFiltro, mesFiltro;
                if (ano.HasValue && mes.HasValue)
                {
                    anoFiltro = ano.Value;
                    mesFiltro = mes.Value;
                }
                else if (dataInicio.HasValue)
                {
                    anoFiltro = dataInicio.Value.Year;
                    mesFiltro = dataInicio.Value.Month;
                }
                else
                {
                    anoFiltro = DateTime.Now.Year;
                    mesFiltro = DateTime.Now.Month;
                }

                int? posicaoViagens = null;
                int? posicaoKm = null;
                int totalMotoristas = 0;

                // Usa ADO.NET direto para garantir que funcione
                using (var connection = _context.Database.GetDbConnection())
                {
                    await connection.OpenAsync();

                    // Busca posição do motorista na View
                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = @"
                            SELECT PosicaoViagens, PosicaoKm
                            FROM vw_RankingMotoristasPorPeriodo
                            WHERE Ano = @Ano AND Mes = @Mes AND MotoristaId = @MotoristaId";

                        var paramAno = command.CreateParameter();
                        paramAno.ParameterName = "@Ano";
                        paramAno.Value = anoFiltro;
                        command.Parameters.Add(paramAno);

                        var paramMes = command.CreateParameter();
                        paramMes.ParameterName = "@Mes";
                        paramMes.Value = mesFiltro;
                        command.Parameters.Add(paramMes);

                        var paramMotorista = command.CreateParameter();
                        paramMotorista.ParameterName = "@MotoristaId";
                        paramMotorista.Value = motoristaId;
                        command.Parameters.Add(paramMotorista);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                posicaoViagens = reader.GetInt64(0) > 0 ? (int)reader.GetInt64(0) : (int?)null;
                                posicaoKm = reader.GetInt64(1) > 0 ? (int)reader.GetInt64(1) : (int?)null;
                            }
                        }
                    }

                    // Busca total de motoristas no período
                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = @"
                            SELECT COUNT(*)
                            FROM vw_RankingMotoristasPorPeriodo
                            WHERE Ano = @Ano AND Mes = @Mes";

                        var paramAno = command.CreateParameter();
                        paramAno.ParameterName = "@Ano";
                        paramAno.Value = anoFiltro;
                        command.Parameters.Add(paramAno);

                        var paramMes = command.CreateParameter();
                        paramMes.ParameterName = "@Mes";
                        paramMes.Value = mesFiltro;
                        command.Parameters.Add(paramMes);

                        var result = await command.ExecuteScalarAsync();
                        totalMotoristas = Convert.ToInt32(result);
                    }
                }

                return Json(new
                {
                    success = true,
                    posicaoViagens = posicaoViagens ?? (totalMotoristas + 1),
                    posicaoKm = posicaoKm ?? (totalMotoristas + 1),
                    totalMotoristas = totalMotoristas
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Foto do Motorista

        [HttpGet]
        [Route("api/DashboardMotoristas/ObterFotoMotorista/{motoristaId}")]
        public async Task<IActionResult> ObterFotoMotorista(Guid motoristaId)
        {
            try
            {
                var foto = await _context.Motorista
                    .Where(m => m.MotoristaId == motoristaId)
                    .Select(m => m.Foto)
                    .FirstOrDefaultAsync();

                if (foto == null || foto.Length == 0)
                {
                    return NotFound();
                }

                return File(foto, "image/jpeg");
            }
            catch
            {
                return NotFound();
            }
        }

        #endregion
    }
}
