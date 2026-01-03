using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Controllers
{
    /// <summary>
    /// Partial class para endpoint ListaEventos otimizado
    /// Arquivo: ViagemController_ListaEventos.cs
    /// Destino: /Controllers/ViagemController_ListaEventos.cs
    /// </summary>
    public partial class ViagemController : Controller
    {
        /// <summary>
        /// Lista todos os eventos com custos agregados - OTIMIZADO
        /// Rota: /api/viagem/listaeventos
        /// 
        /// ANTES: 20+ segundos (subquery correlacionada, 53k viagens na memória)
        /// DEPOIS: < 1 segundo (agregação SQL, apenas eventos na memória)
        /// </summary>
        [HttpGet]
        [Route("ListaEventos")]
        public IActionResult ListaEventos()
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();

            try
            {
                // ============================================================
                // PASSO 1: Agregar custos no SQL (NÃO traz 53k viagens!)
                // ============================================================
                var custosDict = new Dictionary<Guid, double>();

                var sqlCustos = @"
                    SELECT 
                        EventoId,
                        ROUND(SUM(
                            ISNULL(CustoCombustivel, 0) + 
                            ISNULL(CustoMotorista, 0) + 
                            ISNULL(CustoVeiculo, 0) + 
                            ISNULL(CustoOperador, 0) + 
                            ISNULL(CustoLavador, 0)
                        ), 2) AS CustoTotal
                    FROM Viagem
                    WHERE EventoId IS NOT NULL
                    GROUP BY EventoId";

                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = sqlCustos;
                    command.CommandTimeout = 30;

                    _context.Database.OpenConnection();

                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            if (!reader.IsDBNull(0))
                            {
                                var eventoId = reader.GetGuid(0);
                                var custo = reader.IsDBNull(1) ? 0 : Convert.ToDouble(reader.GetValue(1));
                                custosDict[eventoId] = custo;
                            }
                        }
                    }
                }

                Console.WriteLine($"[ListaEventos] Custos SQL: {sw.ElapsedMilliseconds}ms ({custosDict.Count} eventos)");

                // ============================================================
                // PASSO 2: Buscar eventos com Include (1 query)
                // ============================================================
                var eventos = _context.Evento
                    .Include(e => e.SetorSolicitante)
                    .Include(e => e.Requisitante)
                    .AsNoTracking()
                    .ToList();

                Console.WriteLine($"[ListaEventos] Eventos: {sw.ElapsedMilliseconds}ms ({eventos.Count})");

                // ============================================================
                // PASSO 3: Montar resultado (em memória)
                // ============================================================
                var resultado = eventos.Select(e =>
                {
                    string nomeSetor = "";
                    if (e.SetorSolicitante != null)
                    {
                        nomeSetor = !string.IsNullOrEmpty(e.SetorSolicitante.Sigla)
                            ? $"{e.SetorSolicitante.Nome} ({e.SetorSolicitante.Sigla})"
                            : e.SetorSolicitante.Nome ?? "";
                    }

                    custosDict.TryGetValue(e.EventoId, out double custoViagem);

                    return new
                    {
                        eventoId = e.EventoId,
                        nome = e.Nome ?? "",
                        descricao = e.Descricao ?? "",
                        dataInicial = e.DataInicial,
                        dataFinal = e.DataFinal,
                        qtdParticipantes = e.QtdParticipantes,
                        status = e.Status == "1" ? 1 : 0,
                        nomeSetor = nomeSetor,
                        nomeRequisitante = e.Requisitante?.Nome ?? "",
                        nomeRequisitanteHTML = e.Requisitante?.Nome ?? "",
                        custoViagem = custoViagem
                    };
                })
                .OrderBy(e => e.nome)
                .ToList();

                sw.Stop();
                Console.WriteLine($"[ListaEventos] ✅ TOTAL: {sw.ElapsedMilliseconds}ms - {resultado.Count} eventos");

                return Json(new { data = resultado });
            }
            catch (Exception error)
            {
                sw.Stop();
                Console.WriteLine($"[ListaEventos] ❌ ERRO após {sw.ElapsedMilliseconds}ms: {error.Message}");
                Alerta.TratamentoErroComLinha("ViagemController.cs", "ListaEventos", error);
                
                return Json(new
                {
                    success = false,
                    message = "Erro ao listar eventos",
                    data = new List<object>()
                });
            }
        }
    }
}
