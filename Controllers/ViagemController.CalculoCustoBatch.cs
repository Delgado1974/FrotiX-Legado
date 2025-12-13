using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    public partial class ViagemController : Controller
    {
        // =============================================
        // CLASSE DE CACHE PARA DADOS COMPARTILHADOS
        // =============================================
        private class DadosCalculoCache
        {
            public List<DateTime> TodasDatasViagens { get; set; } = new List<DateTime>();
            public Dictionary<string, double> CacheMediasPorMes { get; set; } = new Dictionary<string, double>();
            public Dictionary<Guid, double> ValoresVeiculos { get; set; } = new Dictionary<Guid, double>();
            public Dictionary<Guid, double> ConsumosVeiculos { get; set; } = new Dictionary<Guid, double>();
            public Dictionary<Guid, Guid?> CombustiveisVeiculos { get; set; } = new Dictionary<Guid, Guid?>();
            public Dictionary<Guid, double> ValoresCombustivel { get; set; } = new Dictionary<Guid, double>();
            public Dictionary<Guid?, double> MediasCombustivel { get; set; } = new Dictionary<Guid?, double>();
            public Dictionary<Guid, MotoristaInfo> InfoMotoristas { get; set; } = new Dictionary<Guid, MotoristaInfo>();
        }

        private class MotoristaInfo
        {
            public bool EhTerceirizado { get; set; }
            public double ValorMotorista { get; set; }
        }

        /// <summary>
        /// Executa cálculo de custos OTIMIZADO em BATCH (C#)
        /// Carrega todos os dados necessários UMA VEZ e processa em lotes
        /// </summary>
        [HttpPost]
        [Route("ExecutarCalculoCustoBatch")]
        public async Task<IActionResult> ExecutarCalculoCustoBatch()
        {
            var stopwatch = Stopwatch.StartNew();
            string chaveProgresso = "CalculoCusto_Progresso";

            Console.WriteLine("==========================================================");
            Console.WriteLine(">>> INICIANDO CÁLCULO DE CUSTOS EM BATCH <<<");
            Console.WriteLine("==========================================================");

            try
            {
                // Limpa progresso anterior
                _cache.Remove(chaveProgresso);

                // STEP 1: Carregar TODOS os dados necessários UMA VEZ
                AtualizarProgresso(chaveProgresso, 0, 0, "Carregando dados em cache...", false, null);
                var cache = await CarregarDadosCalculoCache();

                // STEP 2: Buscar viagens que precisam ser processadas
                AtualizarProgresso(chaveProgresso, 0, 0, "Buscando viagens para processar...", false, null);
                var viagensParaProcessar = _unitOfWork.ViewViagens.GetAll()
                    .Where(v => v.Status == "Realizada"
                        && v.DataInicial != null
                        && v.DataFinal != null
                        && v.HoraInicio != null
                        && v.HoraFim != null
                        && v.KmInicial != null
                        && v.KmFinal != null
                        && v.VeiculoId != null
                        && v.MotoristaId != null)
                    .Select(v => new
                    {
                        v.ViagemId,
                        v.VeiculoId,
                        v.MotoristaId,
                        v.DataInicial,
                        v.DataFinal,
                        v.HoraInicio,
                        v.HoraFim,
                        v.KmInicial,
                        v.KmFinal
                    })
                    .ToList();

                int totalViagens = viagensParaProcessar.Count;
                int processados = 0;

                // STEP 3: Processar em BATCHES de 500 registros
                const int BATCH_SIZE = 500;

                for (int i = 0; i < totalViagens; i += BATCH_SIZE)
                {
                    var batch = viagensParaProcessar.Skip(i).Take(BATCH_SIZE).ToList();
                    var viagemIds = batch.Select(v => v.ViagemId).ToList();

                    // Carrega entidades completas do batch COM TRACKING
                    var viagensEntidades = await _context.Viagem
                        .AsTracking()
                        .Where(v => viagemIds.Contains(v.ViagemId))
                        .ToListAsync();

                    Console.WriteLine($"\n=== BATCH {i / BATCH_SIZE + 1}: Carregadas {viagensEntidades.Count} viagens ===");

                    // Processa cada viagem do batch
                    foreach (var viagem in viagensEntidades)
                    {
                        try
                        {
                            // LOG ANTES do cálculo
                            var valorAntesCombustivel = viagem.CustoCombustivel;
                            var valorAntesVeiculo = viagem.CustoVeiculo;
                            var valorAntesMotorista = viagem.CustoMotorista;
                            var valorAntesOperador = viagem.CustoOperador;
                            var valorAntesLavador = viagem.CustoLavador;

                            // Calcula todos os custos usando o cache
                            CalcularCustosViagem(viagem, cache);

                            // LOG DEPOIS do cálculo (primeiras 5 viagens)
                            if (processados < 5)
                            {
                                Console.WriteLine($"\n>>> Viagem {viagem.ViagemId}:");
                                Console.WriteLine($"    ANTES:  Combustivel={valorAntesCombustivel}, Veiculo={valorAntesVeiculo}, Motorista={valorAntesMotorista}, Operador={valorAntesOperador}, Lavador={valorAntesLavador}");
                                Console.WriteLine($"    DEPOIS: Combustivel={viagem.CustoCombustivel:F2}, Veiculo={viagem.CustoVeiculo:F2}, Motorista={viagem.CustoMotorista:F2}, Operador={viagem.CustoOperador:F2}, Lavador={viagem.CustoLavador:F2}");
                                Console.WriteLine($"    Minutos={viagem.Minutos}, Média mensal={CalcularMediaViagensParaData(viagem.DataInicial.Value, cache):F2}");
                                Console.WriteLine($"    State: {_context.Entry(viagem).State}");
                            }

                            processados++;

                            // LOG A CADA 1000 VIAGENS
                            if (processados % 1000 == 0)
                            {
                                Console.WriteLine($">>> PROGRESSO: {processados:N0} / {totalViagens:N0} viagens processadas ({(processados * 100.0 / totalViagens):F1}%)");
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Erro ao processar viagem {viagem.ViagemId}: {ex.Message}");
                        }
                    }

                    // Salva o batch
                    Console.WriteLine($"\n>>> Salvando batch {i / BATCH_SIZE + 1}...");

                    var entriesTracked = _context.ChangeTracker.Entries<Viagem>()
                        .Where(e => e.State == EntityState.Modified)
                        .Count();
                    Console.WriteLine($"    Entidades Modified: {entriesTracked}");

                    int mudancas = await _context.SaveChangesAsync();
                    Console.WriteLine($"=== SaveChanges: {mudancas} registros atualizados ===");

                    // Atualiza progresso no cache
                    double percentual = (processados * 100.0) / totalViagens;
                    string mensagem = $"Processando {processados:N0} de {totalViagens:N0} viagens...";
                    AtualizarProgresso(chaveProgresso, processados, totalViagens, mensagem, false, null);

                    // Log de progresso a cada 10 batches
                    if (i % (BATCH_SIZE * 10) == 0)
                    {
                        Console.WriteLine($"Progresso: {processados}/{totalViagens} viagens ({percentual:F1}%)");
                    }
                }

                stopwatch.Stop();

                var response = new
                {
                    success = true,
                    message = $"✓ Cálculo concluído! {processados:N0} viagens atualizadas em {FormatarTempo(stopwatch.Elapsed)}",
                    totalViagens = processados,
                    tempoSegundos = stopwatch.Elapsed.TotalSeconds,
                    tempoFormatado = FormatarTempo(stopwatch.Elapsed)
                };

                // Marca progresso como concluído
                AtualizarProgresso(chaveProgresso, processados, totalViagens, response.message, true, null);

                return Json(response);
            }
            catch (Exception error)
            {
                stopwatch.Stop();
                string mensagemErro = "Erro ao executar cálculo de custos: " + error.Message;

                // Marca progresso como erro
                AtualizarProgresso(chaveProgresso, 0, 0, mensagemErro, true, mensagemErro);

                Alerta.TratamentoErroComLinha("ViagemController.cs", "ExecutarCalculoCustoBatch", error);
                return Json(new
                {
                    success = false,
                    message = mensagemErro,
                    tempoSegundos = stopwatch.Elapsed.TotalSeconds
                });
            }
        }

        /// <summary>
        /// Atualiza o progresso do cálculo no cache
        /// </summary>
        private void AtualizarProgresso(string chave, int processado, int total, string mensagem, bool concluido, string erro)
        {
            try
            {
                var progresso = new
                {
                    processado = processado,
                    total = total,
                    percentual = total > 0 ? (int)((processado * 100.0) / total) : 0,
                    mensagem = mensagem,
                    concluido = concluido,
                    erro = erro
                };

                _cache.Set(chave, progresso, TimeSpan.FromMinutes(30));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao atualizar progresso: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtém o progresso atual do cálculo
        /// </summary>
        [HttpGet]
        [Route("ObterProgressoCalculoCustoBatch")]
        public IActionResult ObterProgressoCalculoCustoBatch()
        {
            try
            {
                string chaveProgresso = "CalculoCusto_Progresso";

                if (_cache.TryGetValue(chaveProgresso, out object progresso))
                {
                    return Json(new
                    {
                        success = true,
                        progresso = progresso
                    });
                }

                return Json(new
                {
                    success = true,
                    progresso = new
                    {
                        processado = 0,
                        total = 0,
                        percentual = 0,
                        mensagem = "Nenhum processamento em andamento",
                        concluido = false,
                        erro = (string)null
                    }
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemController.cs", "ObterProgressoCalculoCustoBatch", error);
                return Json(new
                {
                    success = false,
                    message = error.Message
                });
            }
        }

        /// <summary>
        /// Limpa o progresso do cache
        /// </summary>
        [HttpPost]
        [Route("LimparProgressoCalculoCustoBatch")]
        public IActionResult LimparProgressoCalculoCustoBatch()
        {
            try
            {
                string chaveProgresso = "CalculoCusto_Progresso";
                _cache.Remove(chaveProgresso);

                return Json(new { success = true });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemController.cs", "LimparProgressoCalculoCustoBatch", error);
                return Json(new { success = false, message = error.Message });
            }
        }

        /// <summary>
        /// Carrega TODOS os dados necessários UMA ÚNICA VEZ em memória
        /// </summary>
        private async Task<DadosCalculoCache> CarregarDadosCalculoCache()
        {
            var cache = new DadosCalculoCache();

            // 1. CARREGAR TODAS AS DATAS DE VIAGENS REALIZADAS (para cálculo dinâmico de média)
            cache.TodasDatasViagens = _unitOfWork.ViewViagens.GetAll()
                .Where(v => v.DataInicial != null && v.Status == "Realizada")
                .Select(v => v.DataInicial.Value)
                .ToList();

            cache.TodasDatasViagens.Sort();

            // 2. DADOS DE VEÍCULOS (carregados UMA VEZ)
            await CarregarDadosVeiculosCache(cache);

            // 3. ÚLTIMOS VALORES DE COMBUSTÍVEL POR VEÍCULO (carregados UMA VEZ)
            var valoresCombustivel = await _context.Abastecimento
                .GroupBy(a => a.VeiculoId)
                .Select(g => new
                {
                    VeiculoId = g.Key,
                    Abastecimento = g.OrderByDescending(a => a.DataHora).FirstOrDefault()
                })
                .ToListAsync();

            foreach (var vc in valoresCombustivel)
            {
                if (vc.VeiculoId != Guid.Empty && vc.Abastecimento != null && vc.Abastecimento.ValorUnitario > 0)
                {
                    cache.ValoresCombustivel[vc.VeiculoId] = (double)vc.Abastecimento.ValorUnitario;
                }
            }

            // 4. MÉDIA DE COMBUSTÍVEL POR TIPO (carregada UMA VEZ)
            var mediasCombustivel = await _context.MediaCombustivel
                .GroupBy(mc => mc.CombustivelId)
                .Select(g => new
                {
                    CombustivelId = g.Key,
                    MediaCombustivel = g.OrderByDescending(mc => mc.Ano).ThenByDescending(mc => mc.Mes).FirstOrDefault()
                })
                .ToListAsync();

            foreach (var mc in mediasCombustivel)
            {
                if (mc.MediaCombustivel != null && mc.MediaCombustivel.PrecoMedio > 0)
                {
                    cache.MediasCombustivel[mc.CombustivelId] = (double)mc.MediaCombustivel.PrecoMedio;
                }
            }

            // 5. DADOS DE MOTORISTAS (carregados UMA VEZ)
            await CarregarDadosMotoristasCache(cache);

            return cache;
        }

        /// <summary>
        /// Carrega dados de veículos (valor unitário, consumo, combustível)
        /// </summary>
        private async Task CarregarDadosVeiculosCache(DadosCalculoCache cache)
        {
            // Busca veículos com contratos
            var veiculosContrato = await (
                from v in _context.Veiculo
                where v.ContratoId != null && v.ItemVeiculoId != null
                select new
                {
                    v.VeiculoId,
                    v.ItemVeiculoId,
                    v.CombustivelId
                }
            ).ToListAsync();

            var itemIds = veiculosContrato.Where(v => v.ItemVeiculoId.HasValue).Select(v => v.ItemVeiculoId.Value).ToList();

            var valoresContrato = await (
                from ivc in _context.ItemVeiculoContrato
                join rc in _context.RepactuacaoContrato on ivc.RepactuacaoContratoId equals rc.RepactuacaoContratoId
                where itemIds.Contains(ivc.ItemVeiculoId)
                group new { ivc, rc } by ivc.ItemVeiculoId into g
                select new
                {
                    ItemVeiculoId = g.Key,
                    ItemContrato = g.OrderByDescending(x => x.rc.DataRepactuacao).FirstOrDefault()
                }
            ).ToListAsync();

            var dictValoresContrato = valoresContrato
                .Where(v => v.ItemContrato != null)
                .ToDictionary(v => v.ItemVeiculoId, v => (double)(v.ItemContrato.ivc.ValorUnitario ?? 0));

            foreach (var v in veiculosContrato)
            {
                if (v.ItemVeiculoId.HasValue && dictValoresContrato.ContainsKey(v.ItemVeiculoId.Value))
                {
                    cache.ValoresVeiculos[v.VeiculoId] = dictValoresContrato[v.ItemVeiculoId.Value];
                }
                cache.CombustiveisVeiculos[v.VeiculoId] = v.CombustivelId;
            }

            // Busca veículos com atas
            var veiculosAta = await (
                from v in _context.Veiculo
                where v.AtaId != null && v.ItemVeiculoAtaId != null
                select new
                {
                    v.VeiculoId,
                    v.ItemVeiculoAtaId,
                    v.CombustivelId
                }
            ).ToListAsync();

            var ataItemIds = veiculosAta.Where(v => v.ItemVeiculoAtaId.HasValue).Select(v => v.ItemVeiculoAtaId.Value).ToList();

            var valoresAta = await (
                from iva in _context.ItemVeiculoAta
                join ra in _context.RepactuacaoAta on iva.RepactuacaoAtaId equals ra.RepactuacaoAtaId
                where ataItemIds.Contains(iva.ItemVeiculoAtaId)
                group new { iva, ra } by iva.ItemVeiculoAtaId into g
                select new
                {
                    ItemVeiculoAtaId = g.Key,
                    ItemAta = g.OrderByDescending(x => x.ra.DataRepactuacao).FirstOrDefault()
                }
            ).ToListAsync();

            var dictValoresAta = valoresAta
                .Where(v => v.ItemAta != null)
                .ToDictionary(v => v.ItemVeiculoAtaId, v => (double)(v.ItemAta.iva.ValorUnitario ?? 0));

            foreach (var v in veiculosAta)
            {
                if (v.ItemVeiculoAtaId.HasValue && dictValoresAta.ContainsKey(v.ItemVeiculoAtaId.Value))
                {
                    cache.ValoresVeiculos[v.VeiculoId] = dictValoresAta[v.ItemVeiculoAtaId.Value];
                }
                cache.CombustiveisVeiculos[v.VeiculoId] = v.CombustivelId;
            }

            // Busca veículos próprios (sem contrato/ata)
            var veiculosProprios = await _context.Veiculo
                .Where(v => v.ContratoId == null && v.AtaId == null)
                .Select(v => new { v.VeiculoId, v.CombustivelId })
                .ToListAsync();

            foreach (var v in veiculosProprios)
            {
                if (!cache.ValoresVeiculos.ContainsKey(v.VeiculoId))
                {
                    cache.ValoresVeiculos[v.VeiculoId] = 100; // Veículo próprio
                }
                cache.CombustiveisVeiculos[v.VeiculoId] = v.CombustivelId;
            }

            // Busca consumos de veículos da ViewVeiculos
            var todosVeiculos = _unitOfWork.ViewVeiculos.GetAll().ToList();
            var consumos = todosVeiculos.Select(v => new { v.VeiculoId, v.Consumo }).ToList();

            foreach (var c in consumos)
            {
                double consumo = c.Consumo.HasValue ? Convert.ToDouble(c.Consumo.Value) : 10;
                if (consumo == 0)
                    consumo = 10;
                cache.ConsumosVeiculos[c.VeiculoId] = consumo;
            }
        }

        /// <summary>
        /// Carrega dados de motoristas (se é terceirizado e valor mensal do contrato)
        /// CORRIGIDO: Usa Contrato.CustoMensalMotorista em vez de RepactuacaoTerceirizacao.ValorMotorista
        /// </summary>
        private async Task CarregarDadosMotoristasCache(DadosCalculoCache cache)
        {
            // Busca motoristas com seus contratos e o CustoMensalMotorista
            var motoristasComContrato = await (
                from m in _context.Motorista
                join c in _context.Contrato on m.ContratoId equals c.ContratoId into contratoJoin
                from contrato in contratoJoin.DefaultIfEmpty()
                select new
                {
                    m.MotoristaId,
                    m.ContratoId,
                    CustoMensalMotorista = contrato != null ? contrato.CustoMensalMotorista : null
                }
            ).ToListAsync();

            foreach (var m in motoristasComContrato)
            {
                if (m.ContratoId == null)
                {
                    // Motorista não é terceirizado
                    cache.InfoMotoristas[m.MotoristaId] = new MotoristaInfo
                    {
                        EhTerceirizado = false,
                        ValorMotorista = 0
                    };
                }
                else
                {
                    // Motorista terceirizado - usa CustoMensalMotorista do Contrato
                    cache.InfoMotoristas[m.MotoristaId] = new MotoristaInfo
                    {
                        EhTerceirizado = true,
                        ValorMotorista = (double)(m.CustoMensalMotorista ?? 0)
                    };
                }
            }
        }

        /// <summary>
        /// Calcula TODOS os custos de uma viagem usando dados em cache
        /// </summary>
        private void CalcularCustosViagem(Viagem viagem, DadosCalculoCache cache)
        {
            try
            {
                bool modificou = false;

                // CALCULA MÉDIA DOS ÚLTIMOS 12 MESES PARA ESTA VIAGEM ESPECÍFICA
                double mediaViagens = CalcularMediaViagensParaData(viagem.DataInicial.Value, cache);

                // 1. CUSTO COMBUSTÍVEL
                double custoCombustivel = CalcularCustoCombustivelCache(viagem, cache);
                if (custoCombustivel > 0)
                {
                    viagem.CustoCombustivel = custoCombustivel;
                    modificou = true;
                }

                // 2. CUSTO VEÍCULO
                double custoVeiculo = CalcularCustoVeiculoCache(viagem, cache);
                if (custoVeiculo > 0)
                {
                    viagem.CustoVeiculo = custoVeiculo;
                    modificou = true;
                }

                // 3. CUSTO MOTORISTA (Minutos já calculados pelo trigger no banco)
                double custoMotorista = CalcularCustoMotoristaCache(viagem, cache);
                if (custoMotorista >= 0)
                {
                    viagem.CustoMotorista = custoMotorista;
                    modificou = true;
                }

                // 4. CUSTO OPERADOR (calculado dinamicamente com a média desta viagem)
                double custoOperador = CalcularCustoOperadorDinamico(mediaViagens);
                if (custoOperador > 0)
                {
                    viagem.CustoOperador = custoOperador;
                    modificou = true;
                }

                // 5. CUSTO LAVADOR
                double custoLavador = CalcularCustoLavadorDinamico(mediaViagens);
                if (custoLavador > 0)
                {
                    viagem.CustoLavador = custoLavador;
                    modificou = true;
                }
                else
                {
                    Console.WriteLine($"  [AVISO] Viagem {viagem.ViagemId}: CustoLavador = 0 (média: {mediaViagens:F2})");
                }

                if (!modificou)
                {
                    Console.WriteLine($"  [ERRO] ⚠️ Viagem {viagem.ViagemId}: NENHUM valor foi modificado!");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"  [ERRO] ❌ Viagem {viagem.ViagemId}: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Calcula a média DIÁRIA de viagens realizadas ANTES da data especificada
        /// Usa cache para evitar recálculos
        /// Lógica: totalViagensAnteriores / totalDiasDesdeInicio
        /// </summary>
        private double CalcularMediaViagensParaData(DateTime dataViagem, DadosCalculoCache cache)
        {
            try
            {
                string chaveData = dataViagem.ToString("yyyy-MM-dd");

                if (cache.CacheMediasPorMes.ContainsKey(chaveData))
                {
                    return cache.CacheMediasPorMes[chaveData];
                }

                var viagensAnteriores = cache.TodasDatasViagens
                    .Where(d => d < dataViagem)
                    .ToList();

                int totalViagens = viagensAnteriores.Count;

                if (totalViagens == 0)
                {
                    cache.CacheMediasPorMes[chaveData] = 1.0;
                    return 1.0;
                }

                DateTime primeiraViagem = viagensAnteriores.Min();
                int totalDias = (dataViagem.Date - primeiraViagem.Date).Days;

                if (totalDias <= 0)
                    totalDias = 1;

                double mediaDiaria = (double)totalViagens / (double)totalDias;
                double mediaMensal = mediaDiaria * 30.0;
                mediaMensal = Math.Max(mediaMensal, 0.1);

                cache.CacheMediasPorMes[chaveData] = mediaMensal;

                return mediaMensal;
            }
            catch
            {
                return 1.0;
            }
        }

        /// <summary>
        /// Calcula custo operador dinamicamente com a média específica
        /// </summary>
        private double CalcularCustoOperadorDinamico(double mediaViagens)
        {
            try
            {
                if (mediaViagens == 0)
                    return 0;

                var contratoOperadores = _context.Contrato
                    .Where(c => c.TipoContrato == "Terceirização" && c.ContratoOperadores == true)
                    .OrderByDescending(c => c.DataInicio)
                    .FirstOrDefault();

                if (contratoOperadores == null)
                    return 0;

                var dadosOperador = (
                    from rc in _context.RepactuacaoContrato
                    join rt in _context.RepactuacaoTerceirizacao on rc.RepactuacaoContratoId equals rt.RepactuacaoContratoId
                    where rc.ContratoId == contratoOperadores.ContratoId
                        && rt.QtdOperadores != null
                        && rt.ValorOperador != null
                    orderby rc.DataRepactuacao descending
                    select new { rt.QtdOperadores, rt.ValorOperador }
                ).FirstOrDefault();

                if (dadosOperador == null)
                    return 0;

                double custoMensalOperadores = (double)(dadosOperador.QtdOperadores.Value * dadosOperador.ValorOperador.Value);
                return custoMensalOperadores / mediaViagens;
            }
            catch
            {
                return 0;
            }
        }

        /// <summary>
        /// Calcula custo lavador dinamicamente com a média específica
        /// </summary>
        private double CalcularCustoLavadorDinamico(double mediaViagens)
        {
            try
            {
                if (mediaViagens == 0)
                {
                    Console.WriteLine($"    [LAVADOR] ⚠️ Média = 0, retornando 0");
                    return 0;
                }

                var contratoLavadores = _context.Contrato
                    .Where(c => c.TipoContrato == "Terceirização" && c.ContratoLavadores == true)
                    .OrderByDescending(c => c.DataInicio)
                    .FirstOrDefault();

                if (contratoLavadores == null)
                {
                    Console.WriteLine($"    [LAVADOR] ❌ Nenhum contrato de lavadores encontrado");
                    return 0;
                }

                var dadosLavador = (
                    from rc in _context.RepactuacaoContrato
                    join rt in _context.RepactuacaoTerceirizacao on rc.RepactuacaoContratoId equals rt.RepactuacaoContratoId
                    where rc.ContratoId == contratoLavadores.ContratoId
                        && rt.QtdLavadores != null
                        && rt.ValorLavador != null
                    orderby rc.DataRepactuacao descending
                    select new { rt.QtdLavadores, rt.ValorLavador }
                ).FirstOrDefault();

                if (dadosLavador == null)
                {
                    Console.WriteLine($"    [LAVADOR] ❌ Nenhuma repactuação encontrada para o contrato");
                    return 0;
                }

                double custoMensalLavadores = (double)(dadosLavador.QtdLavadores.Value * dadosLavador.ValorLavador.Value);
                double custoFinal = custoMensalLavadores / mediaViagens;

                return custoFinal;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"    [LAVADOR] ❌ ERRO: {ex.Message}");
                return 0;
            }
        }

        /// <summary>
        /// Calcula custo de combustível usando cache
        /// </summary>
        private double CalcularCustoCombustivelCache(Viagem viagem, DadosCalculoCache cache)
        {
            try
            {
                if (!viagem.VeiculoId.HasValue)
                    return 0;

                double consumo = cache.ConsumosVeiculos.ContainsKey(viagem.VeiculoId.Value)
                    ? cache.ConsumosVeiculos[viagem.VeiculoId.Value]
                    : 10;

                double valorCombustivel = 0;

                if (cache.ValoresCombustivel.ContainsKey(viagem.VeiculoId.Value))
                {
                    valorCombustivel = cache.ValoresCombustivel[viagem.VeiculoId.Value];
                }
                else
                {
                    var combustivelId = cache.CombustiveisVeiculos.ContainsKey(viagem.VeiculoId.Value)
                        ? cache.CombustiveisVeiculos[viagem.VeiculoId.Value]
                        : null;

                    if (combustivelId.HasValue && cache.MediasCombustivel.ContainsKey(combustivelId))
                    {
                        valorCombustivel = cache.MediasCombustivel[combustivelId];
                    }
                }

                var quilometragem = viagem.KmFinal - viagem.KmInicial;
                var custoViagem = (quilometragem / consumo) * valorCombustivel;

                return (double)custoViagem;
            }
            catch
            {
                return 0;
            }
        }

        /// <summary>
        /// Calcula custo de veículo usando cache
        /// Fórmula: (ValorUnitarioItem / 30 / 24 / 60) × Minutos
        /// Com teto mensal (não pode ultrapassar ValorUnitario)
        /// </summary>
        private double CalcularCustoVeiculoCache(Viagem viagem, DadosCalculoCache cache)
        {
            try
            {
                if (!viagem.VeiculoId.HasValue)
                    return 0;

                double valorUnitario = cache.ValoresVeiculos.ContainsKey(viagem.VeiculoId.Value)
                    ? cache.ValoresVeiculos[viagem.VeiculoId.Value]
                    : 100;

                // Usa Minutos da viagem diretamente (calculado pelo trigger)
                int minutos = viagem.Minutos ?? 0;
                if (minutos <= 0)
                    return 0;

                // Fórmula: (ValorUnitarioItem / 30 / 24 / 60) × Minutos
                // = ValorUnitario / 43200 × Minutos
                const double MINUTOS_MES = 43200.0; // 30 dias × 24 horas × 60 minutos

                double custoCalculado = (valorUnitario / MINUTOS_MES) * minutos;

                // Teto: não pode ultrapassar o valor mensal do veículo
                return Math.Min(custoCalculado, valorUnitario);
            }
            catch
            {
                return 0;
            }
        }

        /// <summary>
        /// Calcula custo de motorista usando cache
        /// CORRIGIDO: 
        /// - Usa viagem.Minutos diretamente (calculado pelo trigger)
        /// - Usa fórmula igual à SP: CustoMensalMotorista × (Minutos / 13200)
        /// - Mantém teto mensal (não pode ultrapassar CustoMensalMotorista)
        /// </summary>
        private double CalcularCustoMotoristaCache(Viagem viagem, DadosCalculoCache cache)
        {
            try
            {
                if (!viagem.MotoristaId.HasValue)
                    return 0;

                // Busca info do motorista no cache
                if (!cache.InfoMotoristas.TryGetValue(viagem.MotoristaId.Value, out var infoMotorista))
                    return 0;

                // Se não é terceirizado, custo = 0
                if (!infoMotorista.EhTerceirizado || infoMotorista.ValorMotorista <= 0)
                    return 0;

                // Usa Minutos da viagem diretamente (calculado pelo trigger)
                int minutos = viagem.Minutos ?? 0;
                if (minutos <= 0)
                    return 0;

                double custoMensalMotorista = infoMotorista.ValorMotorista;

                // Fórmula igual à SP: CustoMensalMotorista × (Minutos / 13200)
                // 13200 = 220 horas × 60 minutos (jornada mensal padrão)
                const double MINUTOS_MES = 13200.0;

                double custoCalculado = custoMensalMotorista * (minutos / MINUTOS_MES);

                // Teto: não pode ultrapassar o custo mensal do motorista
                return Math.Min(custoCalculado, custoMensalMotorista);
            }
            catch
            {
                return 0;
            }
        }

        /// <summary>
        /// Formata TimeSpan para exibição amigável
        /// </summary>
        private string FormatarTempo(TimeSpan tempo)
        {
            if (tempo.TotalHours >= 1)
                return $"{(int)tempo.TotalHours}h {tempo.Minutes}min {tempo.Seconds}s";
            else if (tempo.TotalMinutes >= 1)
                return $"{(int)tempo.TotalMinutes}min {tempo.Seconds}s";
            else
                return $"{tempo.Seconds}s";
        }
    }
}
