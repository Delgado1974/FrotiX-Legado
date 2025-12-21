using System;
using System.Collections.Generic;
using System.Linq;
using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using FrotiX.Services.Pdf;
using Microsoft.AspNetCore.Mvc;

namespace FrotiX.Controllers;

/// <summary>
/// Controller para exportação de PDFs do Dashboard Economildo
/// Endpoint: /api/Relatorios/ExportarEconomildo?tipo=XXX
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class RelatoriosController : Controller
{
    private readonly FrotiXDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly RelatorioEconomildoPdfService _pdfService;

    public RelatoriosController(FrotiXDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _pdfService = new RelatorioEconomildoPdfService();
    }

    [HttpGet]
    [Route("ExportarEconomildo")]
    public IActionResult ExportarEconomildo(
        TipoRelatorioEconomildo tipo,
        string? mob = null,
        int? mes = null,
        int? ano = null)
    {
        try
        {
            var filtro = new FiltroEconomildoDto { Mob = mob, Mes = mes, Ano = ano };

            byte[] pdfBytes = tipo switch
            {
                TipoRelatorioEconomildo.HeatmapViagens => GerarHeatmapViagens(filtro),
                TipoRelatorioEconomildo.HeatmapPassageiros => GerarHeatmapPassageiros(filtro),
                TipoRelatorioEconomildo.UsuariosMes => GerarUsuariosMes(filtro),
                TipoRelatorioEconomildo.UsuariosTurno => GerarUsuariosTurno(filtro),
                TipoRelatorioEconomildo.ComparativoMob => GerarComparativoMob(filtro),
                TipoRelatorioEconomildo.UsuariosDiaSemana => GerarUsuariosDiaSemana(filtro),
                TipoRelatorioEconomildo.DistribuicaoHorario => GerarDistribuicaoHorario(filtro),
                TipoRelatorioEconomildo.TopVeiculos => GerarTopVeiculos(filtro),
                _ => throw new ArgumentException($"Tipo de relatório não suportado: {tipo}")
            };

            var nomeArquivo = $"Economildo_{tipo}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
            return File(pdfBytes, "application/pdf", nomeArquivo);
        }
        catch (Exception ex)
        {
            Alerta.TratamentoErroComLinha("RelatoriosController.cs", "ExportarEconomildo", ex);
            return BadRequest($"Erro ao gerar PDF: {ex.Message}");
        }
    }

    #region ==================== BUSCAR VIAGENS ====================

    private List<ViagensEconomildo> BuscarViagensEconomildo(FiltroEconomildoDto filtro, bool ignorarMob = false)
    {
        var query = _context.ViagensEconomildo.AsQueryable();

        if (!ignorarMob && !string.IsNullOrEmpty(filtro.Mob))
        {
            query = query.Where(v => v.MOB == filtro.Mob);
        }

        if (filtro.Mes.HasValue && filtro.Mes.Value > 0)
        {
            query = query.Where(v => v.Data.HasValue && v.Data.Value.Month == filtro.Mes.Value);
        }

        if (filtro.Ano.HasValue && filtro.Ano.Value > 0)
        {
            query = query.Where(v => v.Data.HasValue && v.Data.Value.Year == filtro.Ano.Value);
        }

        return query.ToList();
    }

    #endregion

    #region ==================== HEATMAP VIAGENS ====================

    private byte[] GerarHeatmapViagens(FiltroEconomildoDto filtro)
    {
        var dados = MontarDadosHeatmap(filtro, usarPassageiros: false);
        dados.Titulo = "Mapa de Calor - Distribuição de Viagens";
        dados.Subtitulo = $"{filtro.NomeVeiculo} | Análise por Dia da Semana e Horário";
        dados.UnidadeLegenda = "viagens";
        return _pdfService.GerarHeatmapViagens(dados);
    }

    #endregion

    #region ==================== HEATMAP PASSAGEIROS ====================

    private byte[] GerarHeatmapPassageiros(FiltroEconomildoDto filtro)
    {
        var dados = MontarDadosHeatmap(filtro, usarPassageiros: true);
        dados.Titulo = "Mapa de Calor - Distribuição de Passageiros";
        dados.Subtitulo = $"{filtro.NomeVeiculo} | Análise por Dia da Semana e Horário";
        dados.UnidadeLegenda = "passageiros";
        return _pdfService.GerarHeatmapPassageiros(dados);
    }

    private HeatmapDto MontarDadosHeatmap(FiltroEconomildoDto filtro, bool usarPassageiros)
    {
        var viagens = BuscarViagensEconomildo(filtro);

        var valores = new int[7, 24];
        int valorMaximo = 0;
        string diaPico = "";
        int horaPico = 0;
        var totaisPorDia = new int[7];

        foreach (var viagem in viagens)
        {
            if (!viagem.Data.HasValue) continue;

            var diaSemana = (int)viagem.Data.Value.DayOfWeek;
            diaSemana = diaSemana == 0 ? 6 : diaSemana - 1; // Seg=0, Dom=6

            var hora = ExtrairHora(viagem.HoraInicio);
            if (hora < 0) continue;

            var quantidade = usarPassageiros ? (viagem.QtdPassageiros ?? 1) : 1;

            valores[diaSemana, hora] += quantidade;
            totaisPorDia[diaSemana] += quantidade;

            if (valores[diaSemana, hora] > valorMaximo)
            {
                valorMaximo = valores[diaSemana, hora];
                diaPico = ObterNomeDiaAbreviado(diaSemana);
                horaPico = hora;
            }
        }

        var diasNomes = new[] { "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo" };
        var indiceDiaMaisMovimentado = Array.IndexOf(totaisPorDia, totaisPorDia.Max());

        // Horário pico manhã
        int maxManha = 0, horaInicioManha = 10;
        for (int h = 6; h <= 12; h++)
        {
            int totalHora = 0;
            for (int d = 0; d < 7; d++) totalHora += valores[d, h];
            if (totalHora > maxManha) { maxManha = totalHora; horaInicioManha = h; }
        }

        // Período operação
        int primeiraHora = 23, ultimaHora = 0;
        for (int h = 0; h < 24; h++)
            for (int d = 0; d < 7; d++)
                if (valores[d, h] > 0)
                {
                    if (h < primeiraHora) primeiraHora = h;
                    if (h > ultimaHora) ultimaHora = h;
                }

        return new HeatmapDto
        {
            Valores = valores,
            ValorMaximo = valorMaximo,
            DiaPico = diaPico,
            HoraPico = horaPico,
            HorarioPicoManha = $"{horaInicioManha}h - {Math.Min(horaInicioManha + 2, 12)}h",
            DiaMaisMovimentado = diasNomes[indiceDiaMaisMovimentado],
            PeriodoOperacao = primeiraHora <= ultimaHora ? $"{primeiraHora:00}h - {ultimaHora:00}h" : "—",
            Filtro = filtro
        };
    }

    #endregion

    #region ==================== USUÁRIOS POR MÊS ====================

    private byte[] GerarUsuariosMes(FiltroEconomildoDto filtro)
    {
        var viagens = BuscarViagensEconomildo(filtro);

        var usuariosPorMes = viagens
            .Where(v => v.Data.HasValue)
            .GroupBy(v => v.Data!.Value.Month)
            .Select(g => new ItemGraficoDto
            {
                Label = ObterNomeMes(g.Key),
                Valor = g.Sum(v => v.QtdPassageiros ?? 0)
            })
            .OrderBy(x => ObterNumeroMes(x.Label))
            .ToList();

        var total = usuariosPorMes.Sum(d => d.Valor);
        foreach (var item in usuariosPorMes)
            item.Percentual = total > 0 ? (double)item.Valor / total * 100 : 0;

        var dados = new GraficoBarrasDto
        {
            Titulo = "Usuários por Mês",
            Subtitulo = filtro.NomeVeiculo,
            EixoX = "Mês",
            EixoY = "Usuários",
            Dados = usuariosPorMes,
            Filtro = filtro
        };

        return _pdfService.GerarUsuariosMes(dados);
    }

    #endregion

    #region ==================== USUÁRIOS POR TURNO ====================

    private byte[] GerarUsuariosTurno(FiltroEconomildoDto filtro)
    {
        var viagens = BuscarViagensEconomildo(filtro);

        var manha = viagens.Where(v => ClassificarTurno(v.HoraInicio) == "Manhã").Sum(v => v.QtdPassageiros ?? 0);
        var tarde = viagens.Where(v => ClassificarTurno(v.HoraInicio) == "Tarde").Sum(v => v.QtdPassageiros ?? 0);
        var noite = viagens.Where(v => ClassificarTurno(v.HoraInicio) == "Noite").Sum(v => v.QtdPassageiros ?? 0);

        var total = manha + tarde + noite;

        var dados = new GraficoPizzaDto
        {
            Titulo = "Usuários por Turno",
            Subtitulo = filtro.NomeVeiculo,
            Dados = new List<ItemGraficoDto>
            {
                new() { Label = "Manhã", Valor = manha, Percentual = total > 0 ? (double)manha / total * 100 : 0 },
                new() { Label = "Tarde", Valor = tarde, Percentual = total > 0 ? (double)tarde / total * 100 : 0 },
                new() { Label = "Noite", Valor = noite, Percentual = total > 0 ? (double)noite / total * 100 : 0 }
            },
            Filtro = filtro
        };

        return _pdfService.GerarUsuariosTurno(dados);
    }

    #endregion

    #region ==================== COMPARATIVO MOB ====================

    private byte[] GerarComparativoMob(FiltroEconomildoDto filtro)
    {
        var viagensTodos = BuscarViagensEconomildo(filtro, ignorarMob: true);

        var comparativoMob = viagensTodos
            .Where(v => v.Data.HasValue)
            .GroupBy(v => v.Data!.Value.Month)
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

        var labels = comparativoMob.Select(x => x.mes).ToList();

        var series = new List<SerieGraficoDto>
        {
            new() { Nome = "PGR", Cor = "#3b82f6", Valores = comparativoMob.Select(x => x.pgr).ToList() },
            new() { Nome = "Rodoviária", Cor = "#f97316", Valores = comparativoMob.Select(x => x.rodoviaria).ToList() },
            new() { Nome = "Cefor", Cor = "#8b5cf6", Valores = comparativoMob.Select(x => x.cefor).ToList() }
        };

        var dados = new GraficoComparativoDto
        {
            Titulo = "Comparativo Mensal por MOB",
            Subtitulo = $"Ano: {filtro.Ano ?? DateTime.Now.Year}",
            Labels = labels,
            Series = series,
            Filtro = filtro
        };

        return _pdfService.GerarComparativoMob(dados);
    }

    #endregion

    #region ==================== USUÁRIOS DIA SEMANA ====================

    private byte[] GerarUsuariosDiaSemana(FiltroEconomildoDto filtro)
    {
        var viagens = BuscarViagensEconomildo(filtro);

        var usuariosPorDiaSemana = viagens
            .Where(v => v.Data.HasValue)
            .GroupBy(v => v.Data!.Value.DayOfWeek)
            .Where(g => g.Key != DayOfWeek.Saturday && g.Key != DayOfWeek.Sunday)
            .Select(g => new ItemGraficoDto
            {
                Label = ObterNomeDiaSemana(g.Key),
                Valor = g.Sum(v => v.QtdPassageiros ?? 0)
            })
            .OrderBy(x => OrdemDiaSemana(x.Label))
            .ToList();

        var total = usuariosPorDiaSemana.Sum(d => d.Valor);
        foreach (var item in usuariosPorDiaSemana)
            item.Percentual = total > 0 ? (double)item.Valor / total * 100 : 0;

        var dados = new GraficoBarrasDto
        {
            Titulo = "Usuários por Dia da Semana",
            Subtitulo = filtro.NomeVeiculo,
            EixoX = "Dia",
            EixoY = "Usuários",
            Dados = usuariosPorDiaSemana,
            Filtro = filtro
        };

        return _pdfService.GerarUsuariosDiaSemana(dados);
    }

    #endregion

    #region ==================== DISTRIBUIÇÃO HORÁRIO ====================

    private byte[] GerarDistribuicaoHorario(FiltroEconomildoDto filtro)
    {
        var viagens = BuscarViagensEconomildo(filtro);

        var usuariosPorHora = viagens
            .Where(v => !string.IsNullOrEmpty(v.HoraInicio))
            .GroupBy(v => ExtrairHora(v.HoraInicio))
            .Where(g => g.Key >= 0)
            .Select(g => new ItemGraficoDto
            {
                Label = g.Key.ToString("00") + ":00",
                Valor = g.Sum(v => v.QtdPassageiros ?? 0)
            })
            .OrderBy(x => int.Parse(x.Label.Substring(0, 2)))
            .ToList();

        var total = usuariosPorHora.Sum(d => d.Valor);
        foreach (var item in usuariosPorHora)
            item.Percentual = total > 0 ? (double)item.Valor / total * 100 : 0;

        var dados = new GraficoBarrasDto
        {
            Titulo = "Distribuição por Horário",
            Subtitulo = filtro.NomeVeiculo,
            EixoX = "Horário",
            EixoY = "Usuários",
            Dados = usuariosPorHora,
            Filtro = filtro
        };

        return _pdfService.GerarDistribuicaoHorario(dados);
    }

    #endregion

    #region ==================== TOP VEÍCULOS ====================

    private byte[] GerarTopVeiculos(FiltroEconomildoDto filtro)
    {
        var viagens = BuscarViagensEconomildo(filtro);

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

        var veiculoIds = topVeiculos.Select(v => v.veiculoId).ToList();
        var veiculos = _unitOfWork.ViewVeiculos
            .GetAll(v => veiculoIds.Contains(v.VeiculoId))
            .ToDictionary(v => v.VeiculoId, v => v.Placa ?? "S/N");

        var dadosVeiculos = topVeiculos
            .Select(v => new ItemGraficoDto
            {
                Label = veiculos.ContainsKey(v.veiculoId) ? veiculos[v.veiculoId] : "S/N",
                Valor = v.total
            })
            .ToList();

        var total = dadosVeiculos.Sum(d => d.Valor);
        foreach (var item in dadosVeiculos)
            item.Percentual = total > 0 ? (double)item.Valor / total * 100 : 0;

        var dados = new GraficoBarrasDto
        {
            Titulo = "Top 10 Veículos",
            Subtitulo = filtro.NomeVeiculo,
            EixoX = "Veículo",
            EixoY = "Viagens",
            Dados = dadosVeiculos,
            Filtro = filtro
        };

        return _pdfService.GerarTopVeiculos(dados);
    }

    #endregion

    #region ==================== MÉTODOS AUXILIARES ====================

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

    private string ObterNomeDiaAbreviado(int diaSemana) => diaSemana switch
    {
        0 => "Seg", 1 => "Ter", 2 => "Qua", 3 => "Qui", 4 => "Sex", 5 => "Sáb", 6 => "Dom", _ => ""
    };

    private string ObterNomeMes(int mes)
    {
        var nomes = new[] { "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" };
        return mes >= 1 && mes <= 12 ? nomes[mes] : "";
    }

    private int ObterNumeroMes(string nomeMes) => nomeMes switch
    {
        "Jan" => 1, "Fev" => 2, "Mar" => 3, "Abr" => 4, "Mai" => 5, "Jun" => 6,
        "Jul" => 7, "Ago" => 8, "Set" => 9, "Out" => 10, "Nov" => 11, "Dez" => 12, _ => 0
    };

    private string ObterNomeDiaSemana(DayOfWeek dia) => dia switch
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

    private int OrdemDiaSemana(string dia) => dia switch
    {
        "Seg" => 1, "Ter" => 2, "Qua" => 3, "Qui" => 4, "Sex" => 5, "Sáb" => 6, "Dom" => 7, _ => 0
    };

    #endregion
}
