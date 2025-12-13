using FrotiX.Data;
using FrotiX.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    [Authorize]
    public partial class DashboardEventosController : Controller
    {
        private readonly FrotiXDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;

        public DashboardEventosController(FrotiXDbContext context , UserManager<IdentityUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        #region Página Principal

        [HttpGet]
        [Route("DashboardEventos")]
        public IActionResult Index()
        {
            return View("/Pages/Eventos/DashboardEventos.cshtml");
        }

        #endregion Página Principal

        #region Estatísticas Gerais

        [HttpGet]
        [Route("api/DashboardEventos/ObterEstatisticasGerais")]
        public async Task<IActionResult> ObterEstatisticasGerais(DateTime? DataInicial , DateTime? dataFim)
        {
            try
            {
                // Define período padrão (últimos 30 dias)
                if (!DataInicial.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    DataInicial = dataFim.Value.AddDays(-30);
                }

                // ===== PERÍODO ATUAL =====
                var eventos = await _context.Evento
                    .Include(e => e.SetorSolicitante)
                    .Include(e => e.Requisitante)
                    .Where(e => e.DataInicial >= DataInicial && e.DataInicial <= dataFim)
                    .ToListAsync();

                var totalEventos = eventos.Count;
                var eventosAtivos = eventos.Count(e => e.Status == "Ativo" || e.Status == "Em Andamento");
                var eventosConcluidos = eventos.Count(e => e.Status == "Concluído" || e.Status == "Finalizado");
                var eventosCancelados = eventos.Count(e => e.Status == "Cancelado");
                var eventosAgendados = eventos.Count(e => e.Status == "Agendado");

                var totalParticipantes = eventos.Sum(e => e.QtdParticipantes ?? 0);
                var mediaParticipantesPorEvento = totalEventos > 0 ? (double)totalParticipantes / totalEventos : 0;

                // ===== PERÍODO ANTERIOR (mesmo intervalo de dias) =====
                var diasPeriodo = (dataFim.Value - DataInicial.Value).Days;
                var DataInicialAnterior = DataInicial.Value.AddDays(-(diasPeriodo + 1));
                var dataFimAnterior = DataInicial.Value.AddSeconds(-1);

                var eventosAnteriores = await _context.Evento
                    .Where(e => e.DataInicial >= DataInicialAnterior && e.DataInicial <= dataFimAnterior)
                    .ToListAsync();

                var totalEventosAnteriores = eventosAnteriores.Count;
                var totalParticipantesAnteriores = eventosAnteriores.Sum(e => e.QtdParticipantes ?? 0);

                return Json(new
                {
                    success = true ,
                    // Estatísticas do período atual
                    totalEventos ,
                    eventosAtivos ,
                    eventosConcluidos ,
                    eventosCancelados ,
                    eventosAgendados ,
                    totalParticipantes ,
                    mediaParticipantesPorEvento = Math.Round(mediaParticipantesPorEvento , 1) ,
                    // Estatísticas do período anterior
                    periodoAnterior = new
                    {
                        totalEventos = totalEventosAnteriores ,
                        totalParticipantes = totalParticipantesAnteriores
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Estatísticas Gerais

        #region Eventos Por Status

        [HttpGet]
        [Route("api/DashboardEventos/ObterEventosPorStatus")]
        public async Task<IActionResult> ObterEventosPorStatus(DateTime? DataInicial , DateTime? dataFim)
        {
            try
            {
                // Define período padrão (últimos 30 dias)
                if (!DataInicial.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    DataInicial = dataFim.Value.AddDays(-30);
                }

                var eventos = await _context.Evento
                    .Where(e => e.DataInicial >= DataInicial && e.DataInicial <= dataFim)
                    .GroupBy(e => e.Status)
                    .Select(g => new
                    {
                        status = g.Key ?? "Sem Status" ,
                        quantidade = g.Count() ,
                        participantes = g.Sum(e => e.QtdParticipantes ?? 0)
                    })
                    .OrderByDescending(x => x.quantidade)
                    .ToListAsync();

                return Json(new { success = true , dados = eventos });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Eventos Por Status

        #region Eventos Por Setor

        [HttpGet]
        [Route("api/DashboardEventos/ObterEventosPorSetor")]
        public async Task<IActionResult> ObterEventosPorSetor(DateTime? DataInicial , DateTime? dataFim)
        {
            try
            {
                // Define período padrão (últimos 30 dias)
                if (!DataInicial.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    DataInicial = dataFim.Value.AddDays(-30);
                }

                var eventos = await _context.Evento
                    .Include(e => e.SetorSolicitante)
                    .Where(e => e.DataInicial >= DataInicial && e.DataInicial <= dataFim)
                    .ToListAsync();

                var eventosPorSetor = eventos
                    .GroupBy(e => e.SetorSolicitante != null ? e.SetorSolicitante.Nome : "Sem Setor")
                    .Select(g => new
                    {
                        setor = g.Key ,
                        quantidade = g.Count() ,
                        participantes = g.Sum(e => e.QtdParticipantes ?? 0) ,
                        concluidos = g.Count(e => e.Status == "Concluído" || e.Status == "Finalizado") ,
                        taxaConclusao = g.Count() > 0 ? Math.Round((double)g.Count(e => e.Status == "Concluído" || e.Status == "Finalizado") / g.Count() * 100 , 1) : 0
                    })
                    .OrderByDescending(x => x.quantidade)
                    .Take(10)
                    .ToList();

                return Json(new { success = true , dados = eventosPorSetor });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Eventos Por Setor

        #region Eventos Por Requisitante

        [HttpGet]
        [Route("api/DashboardEventos/ObterEventosPorRequisitante")]
        public async Task<IActionResult> ObterEventosPorRequisitante(DateTime? DataInicial , DateTime? dataFim)
        {
            try
            {
                // Define período padrão (últimos 30 dias)
                if (!DataInicial.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    DataInicial = dataFim.Value.AddDays(-30);
                }

                var eventos = await _context.Evento
                    .Include(e => e.Requisitante)
                    .Where(e => e.DataInicial >= DataInicial && e.DataInicial <= dataFim)
                    .ToListAsync();

                var eventosPorRequisitante = eventos
                    .GroupBy(e => e.Requisitante != null ? e.Requisitante.Nome : "Sem Requisitante")
                    .Select(g => new
                    {
                        requisitante = g.Key ,
                        quantidade = g.Count() ,
                        participantes = g.Sum(e => e.QtdParticipantes ?? 0)
                    })
                    .OrderByDescending(x => x.quantidade)
                    .Take(10)
                    .ToList();

                return Json(new { success = true , dados = eventosPorRequisitante });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Eventos Por Requisitante

        #region Eventos Por Mês

        [HttpGet]
        [Route("api/DashboardEventos/ObterEventosPorMes")]
        public async Task<IActionResult> ObterEventosPorMes(DateTime? DataInicial , DateTime? dataFim)
        {
            try
            {
                // Define período padrão (últimos 12 meses)
                if (!DataInicial.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    DataInicial = dataFim.Value.AddMonths(-12);
                }

                var eventos = await _context.Evento
                    .Where(e => e.DataInicial >= DataInicial && e.DataInicial <= dataFim)
                    .ToListAsync();

                var eventosPorMes = eventos
                    .Where(e => e.DataInicial.HasValue)
                    .GroupBy(e => new { Ano = e.DataInicial.Value.Year , Mes = e.DataInicial.Value.Month })
                    .Select(g => new
                    {
                        mes = $"{g.Key.Ano}-{g.Key.Mes:D2}" ,
                        mesNome = new DateTime(g.Key.Ano , g.Key.Mes , 1).ToString("MM/yyyy") ,
                        quantidade = g.Count() ,
                        participantes = g.Sum(e => e.QtdParticipantes ?? 0)
                    })
                    .OrderBy(x => x.mes)
                    .ToList();

                return Json(new { success = true , dados = eventosPorMes });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Eventos Por Mês

        #region Eventos Por Tipo

        //[HttpGet]
        //[Route("api/DashboardEventos/ObterEventosPorTipo")]
        //public async Task<IActionResult> ObterEventosPorTipo(DateTime? DataInicial, DateTime? dataFim)
        //{
        //    try
        //    {
        //        // Define período padrão (últimos 30 dias)
        //        if (!DataInicial.HasValue || !dataFim.HasValue)
        //        {
        //            dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
        //            DataInicial = dataFim.Value.AddDays(-30);
        //        }

        //        var eventos = await _context.Evento
        //            .Where(e => e.DataInicial >= DataInicial && e.DataInicial <= dataFim)
        //            .GroupBy(e => e.TipoEvento ?? "Sem Tipo")
        //            .Select(g => new
        //            {
        //                tipo = g.Key,
        //                quantidade = g.Count(),
        //                participantes = g.Sum(e => e.QtdParticipantes ?? 0)
        //            })
        //            .OrderByDescending(x => x.quantidade)
        //            .ToListAsync();

        //        return Json(new { success = true, dados = eventos });
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new { success = false, message = ex.Message });
        //    }
        //}

        #endregion Eventos Por Tipo

        #region Top 10 Eventos Maiores

        [HttpGet]
        [Route("api/DashboardEventos/ObterTop10EventosMaiores")]
        public async Task<IActionResult> ObterTop10EventosMaiores(DateTime? DataInicial , DateTime? dataFim)
        {
            try
            {
                // Define período padrão (últimos 30 dias)
                if (!DataInicial.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    DataInicial = dataFim.Value.AddDays(-30);
                }

                var eventos = await _context.Evento
                    .Include(e => e.SetorSolicitante)
                    .Include(e => e.Requisitante)
                    .Where(e => e.DataInicial >= DataInicial && e.DataInicial <= dataFim)
                    .OrderByDescending(e => e.QtdParticipantes)
                    .Take(10)
                    .Select(e => new
                    {
                        e.EventoId ,
                        e.Nome ,
                        DataInicial = e.DataInicial.HasValue ? e.DataInicial.Value.ToString("dd/MM/yyyy HH:mm") : "Não definido" ,
                        dataFim = e.DataFinal.HasValue ? e.DataFinal.Value.ToString("dd/MM/yyyy HH:mm") : "Não definido" ,
                        participantes = e.QtdParticipantes ?? 0 ,
                        setor = e.SetorSolicitante != null ? e.SetorSolicitante.Nome : "Sem Setor" ,
                        requisitante = e.Requisitante != null ? e.Requisitante.Nome : "Sem Requisitante" ,
                        e.Status
                    })
                    .ToListAsync();

                return Json(new { success = true , dados = eventos });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Top 10 Eventos Maiores

        #region Estatísticas Por Dia

        [HttpGet]
        [Route("api/DashboardEventos/ObterEventosPorDia")]
        public async Task<IActionResult> ObterEventosPorDia(DateTime? DataInicial , DateTime? dataFim)
        {
            try
            {
                // Define período padrão (últimos 30 dias)
                if (!DataInicial.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    DataInicial = dataFim.Value.AddDays(-30);
                }

                var eventos = await _context.Evento
                    .Where(e => e.DataInicial >= DataInicial && e.DataInicial <= dataFim)
                    .ToListAsync();

                var eventosPorDia = eventos
                    .GroupBy(e => e.DataInicial)
                    .Select(g => new
                    {
                        data = g.Key.HasValue ? g.Key.Value.Date.ToString("dd/MM/yyyy") : "" ,
                        quantidade = g.Count() ,
                        participantes = g.Sum(e => e.QtdParticipantes ?? 0)
                    })
                    .OrderBy(x => x.data)
                    .ToList();

                return Json(new { success = true , dados = eventosPorDia });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Estatísticas Por Dia
    }
}
