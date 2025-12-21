using FrotiX.Data;
using FrotiX.Models;
using FrotiX.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Syncfusion.Drawing;
using Syncfusion.Pdf;
using Syncfusion.Pdf.Graphics;
using Syncfusion.Pdf.Grid;
using System.Text.Json;

namespace FrotiX.Controllers
{
    [Authorize]
    public partial class DashboardViagensController : Controller
    {
        private readonly FrotiXDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;

        // Constante para filtro de outliers - viagens com mais de 2000 km são consideradas erro
        private const decimal KM_MAXIMO_POR_VIAGEM = 2000m;

        public DashboardViagensController(FrotiXDbContext context , UserManager<IdentityUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        #region Estatísticas Gerais

        [HttpGet]
        [Route("api/DashboardViagens/ObterEstatisticasGerais")]
        public async Task<IActionResult> ObterEstatisticasGerais(DateTime? dataInicio , DateTime? dataFim)
        {
            try
            {
                // Define período padrão (últimos 30 dias)
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                // ===== PERÍODO ATUAL =====
                var viagens = await _context.Viagem
                    .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                    .ToListAsync();

                var totalViagens = viagens.Count;
                var viagensFinalizadas = viagens.Count(v => v.Status == "Realizada");
                var viagensAgendadas = viagens.Count(v => v.Status == "Agendada");
                var viagensCanceladas = viagens.Count(v => v.Status == "Cancelada");
                var viagensEmAndamento = viagens.Count(v => v.Status == "Aberta");

                // ===== CÁLCULO DE KM COM FILTRO DE OUTLIERS =====
                // Filtra apenas viagens válidas:
                // 1. KmInicial e KmFinal preenchidos
                // 2. KmFinal >= KmInicial (não pode ser negativo)
                // 3. Diferença <= 2000 km (filtra outliers absurdos)
                var viagensComKmValido = viagens
                    .Where(v => v.KmInicial.HasValue && v.KmFinal.HasValue)
                    .Where(v => v.KmFinal.Value >= v.KmInicial.Value)
                    .Where(v => (v.KmFinal.Value - v.KmInicial.Value) <= KM_MAXIMO_POR_VIAGEM)
                    .ToList();

                var kmTotal = viagensComKmValido.Sum(v => (v.KmFinal ?? 0) - (v.KmInicial ?? 0));

                // Conta viagens com km válido para média
                var viagensParaMedia = viagensComKmValido.Count;

                // ===== CUSTOS COM FILTRO DE OUTLIERS =====
                // CustoCombustivel é calculado com base no KM, então viagens com KM outlier
                // também terão CustoCombustivel outlier - usar mesma lista filtrada
                // IMPORTANTE: Custos são calculados APENAS para viagens REALIZADAS
                var viagensRealizadasComKmValido = viagensComKmValido
                    .Where(v => v.Status == "Realizada")
                    .ToList();
                var custoCombustivel = viagensRealizadasComKmValido.Sum(v => v.CustoCombustivel ?? 0);

                // Demais custos não dependem de KM, mas devem considerar apenas viagens Realizadas
                var viagensRealizadas = viagens.Where(v => v.Status == "Realizada").ToList();
                var custoLavador = viagensRealizadas.Sum(v => v.CustoLavador ?? 0);
                var custoMotorista = viagensRealizadas.Sum(v => v.CustoMotorista ?? 0);
                var custoOperador = viagensRealizadas.Sum(v => v.CustoOperador ?? 0);
                var custoVeiculo = viagensRealizadas.Sum(v => v.CustoVeiculo ?? 0);

                var custoTotal = custoCombustivel + custoLavador + custoMotorista + custoOperador + custoVeiculo;

                var custoMedioPorViagem = viagensFinalizadas > 0 ? custoTotal / viagensFinalizadas : 0;
                var kmMedioPorViagem = viagensParaMedia > 0 ? (double)kmTotal / viagensParaMedia : 0;

                // ===== PERÍODO ANTERIOR (mesmo intervalo de dias) =====
                var diasPeriodo = (dataFim.Value - dataInicio.Value).Days;
                var dataInicioAnterior = dataInicio.Value.AddDays(-(diasPeriodo + 1));
                var dataFimAnterior = dataInicio.Value.AddSeconds(-1);

                var viagensAnteriores = await _context.Viagem
                    .Where(v => v.DataInicial >= dataInicioAnterior && v.DataInicial <= dataFimAnterior)
                    .ToListAsync();

                // Contagens por status - período anterior
                var totalViagensAnteriores = viagensAnteriores.Count;
                var viagensFinalizadasAnterior = viagensAnteriores.Count(v => v.Status == "Realizada");
                var viagensAgendadasAnterior = viagensAnteriores.Count(v => v.Status == "Agendada");
                var viagensCanceladasAnterior = viagensAnteriores.Count(v => v.Status == "Cancelada");
                var viagensEmAndamentoAnterior = viagensAnteriores.Count(v => v.Status == "Aberta");

                // KM anterior também com filtro de outliers
                var viagensAnterioresComKmValido = viagensAnteriores
                    .Where(v => v.KmInicial.HasValue && v.KmFinal.HasValue)
                    .Where(v => v.KmFinal.Value >= v.KmInicial.Value)
                    .Where(v => (v.KmFinal.Value - v.KmInicial.Value) <= KM_MAXIMO_POR_VIAGEM)
                    .ToList();

                var kmTotalAnterior = viagensAnterioresComKmValido.Sum(v => (v.KmFinal ?? 0) - (v.KmInicial ?? 0));
                var viagensParaMediaAnterior = viagensAnterioresComKmValido.Count;
                var kmMedioPorViagemAnterior = viagensParaMediaAnterior > 0 ? (double)kmTotalAnterior / viagensParaMediaAnterior : 0;

                // Custos individuais - período anterior (com filtro de outliers para combustível)
                // IMPORTANTE: Custos são calculados APENAS para viagens REALIZADAS
                var viagensAnterioresRealizadasComKmValido = viagensAnterioresComKmValido
                    .Where(v => v.Status == "Realizada")
                    .ToList();
                var custoCombustivelAnterior = viagensAnterioresRealizadasComKmValido.Sum(v => v.CustoCombustivel ?? 0);
                var viagensAnterioresRealizadas = viagensAnteriores.Where(v => v.Status == "Realizada").ToList();
                var custoLavadorAnterior = viagensAnterioresRealizadas.Sum(v => v.CustoLavador ?? 0);
                var custoMotoristaAnterior = viagensAnterioresRealizadas.Sum(v => v.CustoMotorista ?? 0);
                var custoOperadorAnterior = viagensAnterioresRealizadas.Sum(v => v.CustoOperador ?? 0);
                var custoVeiculoAnterior = viagensAnterioresRealizadas.Sum(v => v.CustoVeiculo ?? 0);
                var custoTotalAnterior = custoCombustivelAnterior + custoLavadorAnterior + custoMotoristaAnterior + custoOperadorAnterior + custoVeiculoAnterior;

                var custoMedioPorViagemAnterior = viagensFinalizadasAnterior > 0 ? custoTotalAnterior / viagensFinalizadasAnterior : 0;

                return Json(new
                {
                    success = true ,
                    // Estatísticas do período atual
                    totalViagens ,
                    viagensFinalizadas ,
                    viagensAgendadas ,
                    viagensCanceladas ,
                    viagensEmAndamento ,
                    custoTotal = Math.Round(custoTotal , 2) ,
                    custoCombustivel = Math.Round(custoCombustivel , 2) ,
                    custoLavador = Math.Round(custoLavador , 2) ,
                    custoMotorista = Math.Round(custoMotorista , 2) ,
                    custoOperador = Math.Round(custoOperador , 2) ,
                    custoVeiculo = Math.Round(custoVeiculo , 2) ,
                    kmTotal ,
                    kmMedioPorViagem = Math.Round(kmMedioPorViagem , 2) ,
                    custoMedioPorViagem = Math.Round(custoMedioPorViagem , 2) ,
                    // Info de debug sobre outliers filtrados
                    viagensComKm = viagens.Count(v => v.KmInicial.HasValue && v.KmFinal.HasValue) ,
                    viagensKmValido = viagensParaMedia ,
                    // Dados do período anterior para comparação de variação %
                    periodoAnterior = new
                    {
                        totalViagens = totalViagensAnteriores ,
                        viagensFinalizadas = viagensFinalizadasAnterior ,
                        viagensAgendadas = viagensAgendadasAnterior ,
                        viagensCanceladas = viagensCanceladasAnterior ,
                        viagensEmAndamento = viagensEmAndamentoAnterior ,
                        custoTotal = Math.Round(custoTotalAnterior , 2) ,
                        custoCombustivel = Math.Round(custoCombustivelAnterior , 2) ,
                        custoLavador = Math.Round(custoLavadorAnterior , 2) ,
                        custoMotorista = Math.Round(custoMotoristaAnterior , 2) ,
                        custoOperador = Math.Round(custoOperadorAnterior , 2) ,
                        custoVeiculo = Math.Round(custoVeiculoAnterior , 2) ,
                        custoMedioPorViagem = Math.Round(custoMedioPorViagemAnterior , 2) ,
                        kmTotal = kmTotalAnterior ,
                        kmMedioPorViagem = Math.Round(kmMedioPorViagemAnterior , 2)
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Estatísticas Gerais

        #region Viagens por Dia da Semana

        [HttpGet]
        [Route("api/DashboardViagens/ObterViagensPorDia")]
        public async Task<IActionResult> ObterViagensPorDia(DateTime? dataInicio , DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var viagens = await _context.Viagem
                    .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim && v.DataInicial.HasValue)
                    .ToListAsync();

                // Dicionário para converter DayOfWeek para nome em português
                var diasSemana = new Dictionary<DayOfWeek , (string Nome, int Ordem)>
                {
                    { DayOfWeek.Monday , ("Segunda" , 1) } ,
                    { DayOfWeek.Tuesday , ("Terça" , 2) } ,
                    { DayOfWeek.Wednesday , ("Quarta" , 3) } ,
                    { DayOfWeek.Thursday , ("Quinta" , 4) } ,
                    { DayOfWeek.Friday , ("Sexta" , 5) } ,
                    { DayOfWeek.Saturday , ("Sábado" , 6) } ,
                    { DayOfWeek.Sunday , ("Domingo" , 7) }
                };

                var viagensPorDiaSemana = viagens
                    .GroupBy(v => v.DataInicial.Value.DayOfWeek)
                    .Select(g => new
                    {
                        diaSemana = diasSemana[g.Key].Nome ,
                        ordem = diasSemana[g.Key].Ordem ,
                        total = g.Count() ,
                        finalizadas = g.Count(v => v.Status == "Realizada") ,
                        agendadas = g.Count(v => v.Status == "Agendada") ,
                        canceladas = g.Count(v => v.Status == "Cancelada") ,
                        emAndamento = g.Count(v => v.Status == "Aberta")
                    })
                    .OrderBy(x => x.ordem)
                    .ToList();

                return Json(new { success = true , data = viagensPorDiaSemana });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Viagens por Dia da Semana

        #region Viagens por Status

        [HttpGet]
        [Route("api/DashboardViagens/ObterViagensPorStatus")]
        public async Task<IActionResult> ObterViagensPorStatus(DateTime? dataInicio , DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var viagens = await _context.Viagem
                    .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                    .ToListAsync();

                var viagensPorStatus = viagens
                    .GroupBy(v => v.Status ?? "Não Informado")
                    .Select(g => new
                    {
                        status = g.Key ,
                        total = g.Count()
                    })
                    .OrderByDescending(x => x.total)
                    .ToList();

                return Json(new { success = true , data = viagensPorStatus });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Viagens por Status

        #region Top 10 Motoristas

        [HttpGet]
        [Route("api/DashboardViagens/ObterViagensPorMotorista")]
        public async Task<IActionResult> ObterViagensPorMotorista(DateTime? dataInicio , DateTime? dataFim , int top = 10)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var estatisticas = await _context.ViagemEstatistica
                    .Where(v => v.DataReferencia >= dataInicio.Value.Date && v.DataReferencia <= dataFim.Value.Date)
                    .ToListAsync();

                var motoristaDict = new Dictionary<string , int>();

                foreach (var est in estatisticas)
                {
                    if (!string.IsNullOrEmpty(est.ViagensPorMotoristaJson))
                    {
                        try
                        {
                            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                            var lista = JsonSerializer.Deserialize<List<Dictionary<string , JsonElement>>>(est.ViagensPorMotoristaJson , options);

                            if (lista != null)
                            {
                                foreach (var item in lista)
                                {
                                    string motorista = null;
                                    int totalViagens = 0;

                                    if (item.ContainsKey("motorista"))
                                        motorista = item["motorista"].GetString();

                                    if (item.ContainsKey("totalViagens"))
                                        totalViagens = item["totalViagens"].GetInt32();
                                    else if (item.ContainsKey("quantidade"))
                                        totalViagens = item["quantidade"].GetInt32();

                                    if (motorista != null && totalViagens > 0)
                                    {
                                        if (!motoristaDict.ContainsKey(motorista))
                                            motoristaDict[motorista] = 0;

                                        motoristaDict[motorista] += totalViagens;
                                    }
                                }
                            }
                        }
                        catch
                        {
                            // Ignora erros de parse
                        }
                    }
                }

                var dados = motoristaDict
                    .Select(kv => new { motorista = kv.Key , totalViagens = kv.Value })
                    .OrderByDescending(x => x.totalViagens)
                    .Take(top)
                    .ToList();

                return Json(new { success = true , data = dados });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Top 10 Motoristas

        #region Viagens por Setor

        [HttpGet]
        [Route("api/DashboardViagens/ObterViagensPorSetor")]
        public async Task<IActionResult> ObterViagensPorSetor(DateTime? dataInicio , DateTime? dataFim , int top = 6)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                // Buscar dicionário de Nome -> Sigla da tabela SetorSolicitante
                var setoresDb = await _context.SetorSolicitante
                    .Where(s => s.Status == true && !string.IsNullOrEmpty(s.Nome))
                    .Select(s => new { s.Nome , s.Sigla })
                    .ToListAsync();

                // Usar GroupBy para evitar erro de chave duplicada
                var dictNomeParaSigla = setoresDb
                    .GroupBy(s => s.Nome.Trim().ToUpper())
                    .ToDictionary(
                        g => g.Key ,
                        g => !string.IsNullOrEmpty(g.First().Sigla) ? g.First().Sigla.Trim() : g.First().Nome.Trim()
                    );

                var estatisticas = await _context.ViagemEstatistica
                    .Where(v => v.DataReferencia >= dataInicio.Value.Date && v.DataReferencia <= dataFim.Value.Date)
                    .ToListAsync();

                var setorDict = new Dictionary<string , int>(StringComparer.OrdinalIgnoreCase);

                foreach (var est in estatisticas)
                {
                    if (!string.IsNullOrEmpty(est.ViagensPorSetorJson))
                    {
                        try
                        {
                            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                            var lista = JsonSerializer.Deserialize<List<Dictionary<string , JsonElement>>>(est.ViagensPorSetorJson , options);

                            if (lista != null)
                            {
                                foreach (var item in lista)
                                {
                                    string setor = null;
                                    int totalViagens = 0;

                                    if (item.ContainsKey("setor"))
                                        setor = item["setor"].GetString();

                                    if (item.ContainsKey("totalViagens"))
                                        totalViagens = item["totalViagens"].GetInt32();
                                    else if (item.ContainsKey("quantidade"))
                                        totalViagens = item["quantidade"].GetInt32();

                                    if (!string.IsNullOrEmpty(setor) && totalViagens > 0)
                                    {
                                        // Buscar a Sigla correspondente ao nome do setor
                                        var chaveSetor = setor.Trim().ToUpper();
                                        var siglaOuNome = dictNomeParaSigla.ContainsKey(chaveSetor)
                                            ? dictNomeParaSigla[chaveSetor]
                                            : setor;

                                        if (!setorDict.ContainsKey(siglaOuNome))
                                            setorDict[siglaOuNome] = 0;

                                        setorDict[siglaOuNome] += totalViagens;
                                    }
                                }
                            }
                        }
                        catch { }
                    }
                }

                // Identificar e separar viagens da Coordenação de Transportes (CTRAN)
                var chaveCtran = setorDict.Keys
                    .FirstOrDefault(k => k.ToUpper().Contains("COORDENAÇÃO DE TRANSPORTES") ||
                                        k.ToUpper().Contains("COORDENACAO DE TRANSPORTES") ||
                                        k.ToUpper().Contains("CTRAN"));

                int viagensCtran = 0;
                if (chaveCtran != null)
                {
                    viagensCtran = setorDict[chaveCtran];
                    setorDict.Remove(chaveCtran);
                }

                var dados = setorDict
                    .Select(kv => new { setor = kv.Key , totalViagens = kv.Value })
                    .OrderByDescending(x => x.totalViagens)
                    .Take(top)
                    .ToList();

                return Json(new { success = true , data = dados , viagensCtran = viagensCtran });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Viagens por Setor

        #region Custos por Motorista

        [HttpGet]
        [Route("api/DashboardViagens/ObterCustosPorMotorista")]
        public async Task<IActionResult> ObterCustosPorMotorista(DateTime? dataInicio , DateTime? dataFim , int top = 10)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var estatisticas = await _context.ViagemEstatistica
                    .Where(v => v.DataReferencia >= dataInicio.Value.Date && v.DataReferencia <= dataFim.Value.Date)
                    .ToListAsync();

                var motoristaDict = new Dictionary<string , decimal>();
                var erros = new List<string>();

                foreach (var est in estatisticas)
                {
                    if (!string.IsNullOrEmpty(est.CustosPorMotoristaJson))
                    {
                        try
                        {
                            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                            var lista = JsonSerializer.Deserialize<List<Dictionary<string , JsonElement>>>(est.CustosPorMotoristaJson , options);

                            if (lista != null)
                            {
                                foreach (var item in lista)
                                {
                                    if (item.ContainsKey("motorista") && item.ContainsKey("custoTotal"))
                                    {
                                        var motorista = item["motorista"].GetString();
                                        var custoTotal = item["custoTotal"].GetDecimal();

                                        if (!motoristaDict.ContainsKey(motorista))
                                            motoristaDict[motorista] = 0;

                                        motoristaDict[motorista] += custoTotal;
                                    }
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            erros.Add($"Erro deserializar: {ex.Message}");
                        }
                    }
                }

                var dados = motoristaDict
                    .Select(kv => new
                    {
                        motorista = kv.Key ,
                        custoTotal = Math.Round(kv.Value , 2)
                    })
                    .OrderByDescending(x => x.custoTotal)
                    .Take(top)
                    .ToList();

                return Json(new
                {
                    success = true ,
                    data = dados ,
                    debug = new
                    {
                        totalEstatisticas = estatisticas.Count ,
                        totalMotoristas = motoristaDict.Count ,
                        erros = erros
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Custos por Motorista

        #region Custos por Veículo

        [HttpGet]
        [Route("api/DashboardViagens/ObterCustosPorVeiculo")]
        public async Task<IActionResult> ObterCustosPorVeiculo(DateTime? dataInicio , DateTime? dataFim , int top = 10)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var viagens = await _context.Viagem
                    .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim && v.VeiculoId != null)
                    .Where(v => v.Status == "Realizada")
                    .Include(v => v.Veiculo)
                    .ThenInclude(vei => vei.ModeloVeiculo)
                    .ThenInclude(mod => mod.MarcaVeiculo)
                    .ToListAsync();

                var custosPorVeiculo = viagens
                    .GroupBy(v => new
                    {
                        v.VeiculoId ,
                        v.Veiculo.Placa ,
                        Descricao = v.Veiculo.ModeloVeiculo != null && v.Veiculo.ModeloVeiculo.MarcaVeiculo != null
                            ? $"{v.Veiculo.ModeloVeiculo.MarcaVeiculo.DescricaoMarca} {v.Veiculo.ModeloVeiculo.DescricaoModelo} - {v.Veiculo.Placa}"
                            : v.Veiculo.Placa ?? "Não informado"
                    })
                    .Select(g => new
                    {
                        veiculoId = g.Key.VeiculoId ,
                        veiculo = g.Key.Descricao ?? "Não informado" ,
                        custoTotal = Math.Round(
                            g.Sum(v => v.CustoCombustivel ?? 0) +
                            g.Sum(v => v.CustoLavador ?? 0) +
                            g.Sum(v => v.CustoMotorista ?? 0) +
                            g.Sum(v => v.CustoOperador ?? 0) +
                            g.Sum(v => v.CustoVeiculo ?? 0) , 2)
                    })
                    .OrderByDescending(x => x.custoTotal)
                    .Take(top)
                    .ToList();

                return Json(new { success = true , data = custosPorVeiculo });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Custos por Veículo

        #region Top 10 Viagens Mais Caras

        /// <summary>
        /// Retorna Top 10 viagens mais caras COM TODOS os campos necessários para o modal
        /// CORRIGIDO: Agora retorna status, kmRodado, minutos, finalidade e custos detalhados
        /// </summary>
        [HttpGet]
        [Route("api/DashboardViagens/ObterTop10ViagensMaisCaras")]
        public async Task<IActionResult> ObterTop10ViagensMaisCaras(DateTime? dataInicio, DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                // Buscar viagens realizadas com KM válido
                var viagens = await _context.Viagem
                    .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                    .Where(v => v.Status == "Realizada")
                    .Where(v => v.KmInicial.HasValue && v.KmFinal.HasValue)
                    .Where(v => v.KmFinal.Value >= v.KmInicial.Value)
                    .Where(v => (v.KmFinal.Value - v.KmInicial.Value) <= KM_MAXIMO_POR_VIAGEM)
                    .Include(v => v.Motorista)
                    .Include(v => v.Veiculo)
                        .ThenInclude(vei => vei.ModeloVeiculo)
                            .ThenInclude(mod => mod.MarcaVeiculo)
                    .ToListAsync();

                // Ordenar e pegar top 10
                var top10Viagens = viagens
                    .OrderByDescending(v => (v.CustoCombustivel ?? 0d) + (v.CustoLavador ?? 0d) + (v.CustoMotorista ?? 0d) + (v.CustoOperador ?? 0d) + (v.CustoVeiculo ?? 0d))
                    .Take(10)
                    .ToList();

                // Mapear para o formato de retorno
                var top10 = top10Viagens.Select(v => new
                {
                    viagemId = v.ViagemId.ToString(),
                    noFichaVistoria = v.NoFichaVistoria?.ToString() ?? "N/A",
                    status = v.Status ?? "-",
                    dataInicial = v.DataInicial?.ToString("dd/MM/yyyy") ?? "N/A",
                    dataFinal = v.DataFinal?.ToString("dd/MM/yyyy") ?? "N/A",
                    motorista = v.Motorista != null ? v.Motorista.Nome : "Não informado",
                    veiculo = v.Veiculo != null && v.Veiculo.ModeloVeiculo != null && v.Veiculo.ModeloVeiculo.MarcaVeiculo != null
                        ? "(" + v.Veiculo.Placa + ") - " + v.Veiculo.ModeloVeiculo.MarcaVeiculo.DescricaoMarca + "/" + v.Veiculo.ModeloVeiculo.DescricaoModelo
                        : v.Veiculo != null ? v.Veiculo.Placa : "Não informado",
                    // KM Rodado calculado
                    kmRodado = v.KmInicial.HasValue && v.KmFinal.HasValue
                        ? v.KmFinal.Value - v.KmInicial.Value
                        : 0m,
                    // Minutos/Duração
                    minutos = v.Minutos ?? 0,
                    // Finalidade
                    finalidade = v.Finalidade ?? "-",
                    // Custos detalhados - acessando diretamente da entidade (double?)
                    custoCombustivel = Math.Round(v.CustoCombustivel ?? 0d, 2),
                    custoVeiculo = Math.Round(v.CustoVeiculo ?? 0d, 2),
                    custoMotorista = Math.Round(v.CustoMotorista ?? 0d, 2),
                    custoOperador = Math.Round(v.CustoOperador ?? 0d, 2),
                    custoLavador = Math.Round(v.CustoLavador ?? 0d, 2),
                    // Custo total
                    custoTotal = Math.Round(
                        (v.CustoCombustivel ?? 0d) + 
                        (v.CustoLavador ?? 0d) + 
                        (v.CustoMotorista ?? 0d) + 
                        (v.CustoOperador ?? 0d) + 
                        (v.CustoVeiculo ?? 0d), 2)
                }).ToList();

                return Json(new { success = true, data = top10 });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion Top 10 Viagens Mais Caras

        #region Custos por Dia (Evolução de Custos)

        [HttpGet]
        [Route("api/DashboardViagens/ObterCustosPorDia")]
        public async Task<IActionResult> ObterCustosPorDia(DateTime? dataInicio , DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var estatisticas = await _context.ViagemEstatistica
                    .Where(v => v.DataReferencia >= dataInicio.Value.Date && v.DataReferencia <= dataFim.Value.Date)
                    .OrderBy(v => v.DataReferencia)
                    .ToListAsync();

                var dados = estatisticas.Select(e => new
                {
                    data = e.DataReferencia.ToString("yyyy-MM-dd") ,
                    combustivel = Math.Round(e.CustoCombustivel , 2) ,
                    motorista = Math.Round(e.CustoMotorista , 2) ,
                    operador = Math.Round(e.CustoOperador , 2) ,
                    lavador = Math.Round(e.CustoLavador , 2) ,
                    veiculo = Math.Round(e.CustoVeiculo , 2)
                }).ToList();

                return Json(new { success = true , data = dados });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Custos por Dia (Evolução de Custos)

        #region Custos por Tipo (Distribuição de Custos)

        [HttpGet]
        [Route("api/DashboardViagens/ObterCustosPorTipo")]
        public async Task<IActionResult> ObterCustosPorTipo(DateTime? dataInicio , DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var estatisticas = await _context.ViagemEstatistica
                    .Where(v => v.DataReferencia >= dataInicio.Value.Date && v.DataReferencia <= dataFim.Value.Date)
                    .ToListAsync();

                var totais = new
                {
                    custoCombustivel = Math.Round(estatisticas.Sum(e => e.CustoCombustivel) , 2) ,
                    custoMotorista = Math.Round(estatisticas.Sum(e => e.CustoMotorista) , 2) ,
                    custoOperador = Math.Round(estatisticas.Sum(e => e.CustoOperador) , 2) ,
                    custoLavador = Math.Round(estatisticas.Sum(e => e.CustoLavador) , 2) ,
                    custoVeiculo = Math.Round(estatisticas.Sum(e => e.CustoVeiculo) , 2)
                };

                var dados = new[]
                {
                    new { tipo = "Combustível" , custo = totais.custoCombustivel } ,
                    new { tipo = "Motorista" , custo = totais.custoMotorista } ,
                    new { tipo = "Operador" , custo = totais.custoOperador } ,
                    new { tipo = "Lavador" , custo = totais.custoLavador } ,
                    new { tipo = "Veículo" , custo = totais.custoVeiculo }
                }.Where(x => x.custo > 0).ToList();

                return Json(new { success = true , data = dados });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Custos por Tipo (Distribuição de Custos)

        #region Viagens por Veículo (Top 10 Veículos)

        [HttpGet]
        [Route("api/DashboardViagens/ObterViagensPorVeiculo")]
        public async Task<IActionResult> ObterViagensPorVeiculo(DateTime? dataInicio , DateTime? dataFim , int top = 10)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var estatisticas = await _context.ViagemEstatistica
                    .Where(v => v.DataReferencia >= dataInicio.Value.Date && v.DataReferencia <= dataFim.Value.Date)
                    .ToListAsync();

                var veiculoDict = new Dictionary<string , int>();

                foreach (var est in estatisticas)
                {
                    if (!string.IsNullOrEmpty(est.ViagensPorVeiculoJson))
                    {
                        try
                        {
                            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                            var lista = JsonSerializer.Deserialize<List<Dictionary<string , JsonElement>>>(est.ViagensPorVeiculoJson , options);

                            if (lista != null)
                            {
                                foreach (var item in lista)
                                {
                                    string veiculo = null;
                                    int totalViagens = 0;

                                    if (item.ContainsKey("veiculo"))
                                        veiculo = item["veiculo"].GetString();
                                    else if (item.ContainsKey("placa"))
                                        veiculo = item["placa"].GetString();

                                    if (item.ContainsKey("totalViagens"))
                                        totalViagens = item["totalViagens"].GetInt32();
                                    else if (item.ContainsKey("quantidade"))
                                        totalViagens = item["quantidade"].GetInt32();

                                    if (veiculo != null && totalViagens > 0)
                                    {
                                        if (!veiculoDict.ContainsKey(veiculo))
                                            veiculoDict[veiculo] = 0;

                                        veiculoDict[veiculo] += totalViagens;
                                    }
                                }
                            }
                        }
                        catch { }
                    }
                }

                var dados = veiculoDict
                    .Select(kv => new { veiculo = kv.Key , totalViagens = kv.Value })
                    .OrderByDescending(x => x.totalViagens)
                    .Take(top)
                    .ToList();

                return Json(new { success = true , data = dados });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Viagens por Veículo (Top 10 Veículos)

        #region Viagens por Finalidade

        [HttpGet]
        [Route("api/DashboardViagens/ObterViagensPorFinalidade")]
        public async Task<IActionResult> ObterViagensPorFinalidade(DateTime? dataInicio , DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var estatisticas = await _context.ViagemEstatistica
                    .Where(v => v.DataReferencia >= dataInicio.Value.Date && v.DataReferencia <= dataFim.Value.Date)
                    .ToListAsync();

                var finalidadeDict = new Dictionary<string , int>();

                foreach (var est in estatisticas)
                {
                    if (!string.IsNullOrEmpty(est.ViagensPorFinalidadeJson))
                    {
                        try
                        {
                            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                            var lista = JsonSerializer.Deserialize<List<Dictionary<string , JsonElement>>>(est.ViagensPorFinalidadeJson , options);

                            if (lista != null)
                            {
                                foreach (var item in lista)
                                {
                                    string finalidade = null;
                                    int totalViagens = 0;

                                    if (item.ContainsKey("finalidade"))
                                        finalidade = item["finalidade"].GetString();

                                    if (item.ContainsKey("totalViagens"))
                                        totalViagens = item["totalViagens"].GetInt32();
                                    else if (item.ContainsKey("quantidade"))
                                        totalViagens = item["quantidade"].GetInt32();

                                    if (finalidade != null && totalViagens > 0)
                                    {
                                        if (!finalidadeDict.ContainsKey(finalidade))
                                            finalidadeDict[finalidade] = 0;

                                        finalidadeDict[finalidade] += totalViagens;
                                    }
                                }
                            }
                        }
                        catch { }
                    }
                }

                var dados = finalidadeDict
                    .Select(kv => new { finalidade = kv.Key , total = kv.Value })
                    .OrderByDescending(x => x.total)
                    .Take(15)
                    .ToList();

                return Json(new { success = true , data = dados });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Viagens por Finalidade

        #region KM por Veículo

        [HttpGet]
        [Route("api/DashboardViagens/ObterKmPorVeiculo")]
        public async Task<IActionResult> ObterKmPorVeiculo(DateTime? dataInicio , DateTime? dataFim , int top = 10)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var estatisticas = await _context.ViagemEstatistica
                    .Where(v => v.DataReferencia >= dataInicio.Value.Date && v.DataReferencia <= dataFim.Value.Date)
                    .ToListAsync();

                var kmDict = new Dictionary<string , decimal>();

                foreach (var est in estatisticas)
                {
                    if (!string.IsNullOrEmpty(est.KmPorVeiculoJson))
                    {
                        try
                        {
                            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                            var lista = JsonSerializer.Deserialize<List<Dictionary<string , JsonElement>>>(est.KmPorVeiculoJson , options);

                            if (lista != null)
                            {
                                foreach (var item in lista)
                                {
                                    string veiculo = null;
                                    decimal kmTotal = 0;

                                    if (item.ContainsKey("veiculo"))
                                        veiculo = item["veiculo"].GetString();
                                    else if (item.ContainsKey("placa"))
                                        veiculo = item["placa"].GetString();

                                    if (item.ContainsKey("kmTotal"))
                                        kmTotal = item["kmTotal"].GetDecimal();
                                    else if (item.ContainsKey("km"))
                                        kmTotal = item["km"].GetDecimal();

                                    if (veiculo != null && kmTotal > 0)
                                    {
                                        if (!kmDict.ContainsKey(veiculo))
                                            kmDict[veiculo] = 0;

                                        kmDict[veiculo] += kmTotal;
                                    }
                                }
                            }
                        }
                        catch { }
                    }
                }

                var dados = kmDict
                    .Select(kv => new { veiculo = kv.Key , kmTotal = Math.Round(kv.Value , 0) })
                    .OrderByDescending(x => x.kmTotal)
                    .Take(top)
                    .ToList();

                return Json(new { success = true , data = dados });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion KM por Veículo

        #region Viagens por Requisitante

        [HttpGet]
        [Route("api/DashboardViagens/ObterViagensPorRequisitante")]
        public async Task<IActionResult> ObterViagensPorRequisitante(DateTime? dataInicio , DateTime? dataFim , int top = 6)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                var estatisticas = await _context.ViagemEstatistica
                    .Where(v => v.DataReferencia >= dataInicio.Value.Date && v.DataReferencia <= dataFim.Value.Date)
                    .ToListAsync();

                var requisitanteDict = new Dictionary<string , int>();

                foreach (var est in estatisticas)
                {
                    if (!string.IsNullOrEmpty(est.ViagensPorRequisitanteJson))
                    {
                        try
                        {
                            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                            var lista = JsonSerializer.Deserialize<List<Dictionary<string , JsonElement>>>(est.ViagensPorRequisitanteJson , options);

                            if (lista != null)
                            {
                                foreach (var item in lista)
                                {
                                    string requisitante = null;
                                    int totalViagens = 0;

                                    if (item.ContainsKey("requisitante"))
                                        requisitante = item["requisitante"].GetString();

                                    if (item.ContainsKey("totalViagens"))
                                        totalViagens = item["totalViagens"].GetInt32();
                                    else if (item.ContainsKey("quantidade"))
                                        totalViagens = item["quantidade"].GetInt32();

                                    if (requisitante != null && totalViagens > 0)
                                    {
                                        if (!requisitanteDict.ContainsKey(requisitante))
                                            requisitanteDict[requisitante] = 0;

                                        requisitanteDict[requisitante] += totalViagens;
                                    }
                                }
                            }
                        }
                        catch { }
                    }
                }

                // Identificar e separar viagens da Coordenação de Transportes (CTRAN)
                var chaveCtran = requisitanteDict.Keys
                    .FirstOrDefault(k => k.ToUpper().Contains("COORDENAÇÃO DE TRANSPORTES") ||
                                        k.ToUpper().Contains("COORDENACAO DE TRANSPORTES") ||
                                        k.ToUpper().Contains("CTRAN"));

                int viagensCtran = 0;
                if (chaveCtran != null)
                {
                    viagensCtran = requisitanteDict[chaveCtran];
                    requisitanteDict.Remove(chaveCtran);
                }

                // Função para pegar apenas os dois primeiros nomes
                string PegarDoisPrimeirosNomes(string nomeCompleto)
                {
                    if (string.IsNullOrEmpty(nomeCompleto))
                        return nomeCompleto;

                    // Remove parte entre parênteses e após hífen se houver
                    var partes = nomeCompleto.Split(new[] { '(' , '-' } , StringSplitOptions.RemoveEmptyEntries);
                    var nome = partes[0].Trim();

                    var nomes = nome.Split(new[] { ' ' } , StringSplitOptions.RemoveEmptyEntries);
                    if (nomes.Length <= 2)
                        return nome;

                    return $"{nomes[0]} {nomes[1]}";
                }

                var dados = requisitanteDict
                    .Select(kv => new { requisitante = PegarDoisPrimeirosNomes(kv.Key) , totalViagens = kv.Value })
                    .OrderByDescending(x => x.totalViagens)
                    .Take(top)
                    .ToList();

                return Json(new { success = true , data = dados , viagensCtran = viagensCtran });
            }
            catch (Exception ex)
            {
                return Json(new { success = false , message = ex.Message });
            }
        }

        #endregion Viagens por Requisitante

        #region Heatmap de Viagens (Dia da Semana x Hora)

        /// <summary>
        /// Retorna matriz 7x24 com quantidade de viagens por dia da semana e hora
        /// </summary>
        [HttpGet]
        [Route("api/DashboardViagens/ObterHeatmapViagens")]
        public async Task<IActionResult> ObterHeatmapViagens(DateTime? dataInicio, DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                // Buscar viagens com HoraInicio preenchido
                var viagens = await _context.Viagem
                    .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                    .Where(v => v.HoraInicio.HasValue)
                    .Where(v => v.Status == "Realizada" || v.Status == "Agendada" || v.Status == "Aberta")
                    .Select(v => new
                    {
                        DiaSemana = v.DataInicial.HasValue ? (int)v.DataInicial.Value.DayOfWeek : 0,
                        Hora = v.HoraInicio.HasValue ? v.HoraInicio.Value.Hour : 0
                    })
                    .ToListAsync();

                // Criar matriz 7x24 (dias x horas)
                var heatmap = new int[7, 24];
                int maxValor = 0;

                foreach (var v in viagens)
                {
                    // Converter DayOfWeek para índice (0=Segunda, 6=Domingo)
                    int diaIndex = v.DiaSemana == 0 ? 6 : v.DiaSemana - 1; // Sunday(0) vai para 6
                    int horaIndex = Math.Clamp(v.Hora, 0, 23);

                    heatmap[diaIndex, horaIndex]++;

                    if (heatmap[diaIndex, horaIndex] > maxValor)
                        maxValor = heatmap[diaIndex, horaIndex];
                }

                // Converter para lista de objetos para JSON
                var dados = new List<object>();
                var diasNomes = new[] { "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo" };

                for (int dia = 0; dia < 7; dia++)
                {
                    var horasArray = new int[24];
                    for (int hora = 0; hora < 24; hora++)
                    {
                        horasArray[hora] = heatmap[dia, hora];
                    }

                    dados.Add(new
                    {
                        diaSemana = diasNomes[dia],
                        diaIndex = dia,
                        horas = horasArray
                    });
                }

                return Json(new
                {
                    success = true,
                    data = dados,
                    maxValor = maxValor,
                    totalViagens = viagens.Count
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion Heatmap de Viagens

        #region Top 10 Veículos por KM (com detalhes)

        /// <summary>
        /// Retorna Top 10 veículos que mais rodaram (KM) no período
        /// </summary>
        [HttpGet]
        [Route("api/DashboardViagens/ObterTop10VeiculosPorKm")]
        public async Task<IActionResult> ObterTop10VeiculosPorKm(DateTime? dataInicio, DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                // Buscar viagens realizadas com KM válido
                var viagens = await _context.Viagem
                    .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                    .Where(v => v.Status == "Realizada")
                    .Where(v => v.KmInicial.HasValue && v.KmFinal.HasValue)
                    .Where(v => v.KmFinal.Value >= v.KmInicial.Value)
                    .Where(v => (v.KmFinal.Value - v.KmInicial.Value) <= KM_MAXIMO_POR_VIAGEM)
                    .Where(v => v.VeiculoId.HasValue)
                    .Include(v => v.Veiculo)
                        .ThenInclude(vei => vei.ModeloVeiculo)
                            .ThenInclude(mod => mod.MarcaVeiculo)
                    .ToListAsync();

                var top10 = viagens
                    .GroupBy(v => new
                    {
                        v.VeiculoId,
                        Placa = v.Veiculo?.Placa ?? "N/A",
                        MarcaModelo = v.Veiculo?.ModeloVeiculo != null && v.Veiculo.ModeloVeiculo.MarcaVeiculo != null
                            ? $"{v.Veiculo.ModeloVeiculo.MarcaVeiculo.DescricaoMarca} {v.Veiculo.ModeloVeiculo.DescricaoModelo}"
                            : "N/A"
                    })
                    .Select(g => new
                    {
                        placa = g.Key.Placa,
                        marcaModelo = g.Key.MarcaModelo,
                        totalKm = g.Sum(v => (v.KmFinal ?? 0) - (v.KmInicial ?? 0)),
                        totalViagens = g.Count(),
                        mediaKmPorViagem = g.Count() > 0
                            ? Math.Round((double)g.Sum(v => (v.KmFinal ?? 0) - (v.KmInicial ?? 0)) / g.Count(), 1)
                            : 0
                    })
                    .OrderByDescending(x => x.totalKm)
                    .Take(10)
                    .ToList();

                return Json(new { success = true, data = top10 });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion Top 10 Veículos por KM

        #region Custo Médio por Finalidade

        /// <summary>
        /// Retorna custo médio e total por finalidade de viagem
        /// </summary>
        [HttpGet]
        [Route("api/DashboardViagens/ObterCustoMedioPorFinalidade")]
        public async Task<IActionResult> ObterCustoMedioPorFinalidade(DateTime? dataInicio, DateTime? dataFim, int top = 10)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                // Buscar viagens realizadas com custos
                var viagens = await _context.Viagem
                    .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                    .Where(v => v.Status == "Realizada")
                    .Where(v => !string.IsNullOrEmpty(v.Finalidade))
                    .ToListAsync();

                var custosPorFinalidade = viagens
                    .GroupBy(v => v.Finalidade ?? "Não informado")
                    .Select(g =>
                    {
                        var custoTotal = g.Sum(v =>
                            (v.CustoCombustivel ?? 0) +
                            (v.CustoLavador ?? 0) +
                            (v.CustoMotorista ?? 0));

                        return new
                        {
                            finalidade = g.Key.Length > 30 ? g.Key.Substring(0, 27) + "..." : g.Key,
                            finalidadeCompleta = g.Key,
                            totalViagens = g.Count(),
                            custoTotal = Math.Round(custoTotal, 2),
                            custoMedio = g.Count() > 0 ? Math.Round(custoTotal / g.Count(), 2) : 0
                        };
                    })
                    .Where(x => x.custoTotal > 0)
                    .OrderByDescending(x => x.custoTotal)
                    .Take(top)
                    .ToList();

                return Json(new { success = true, data = custosPorFinalidade });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion Custo Médio por Finalidade
    }
}
