using FrotiX.Models;
using FrotiX.Models.Estatisticas;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Controllers
{
    /// <summary>
    /// Partial class com endpoints da API para o Dashboard de Abastecimentos
    /// OTIMIZADO: Usa tabelas estatísticas pré-calculadas para melhor performance
    /// </summary>
    public partial class AbastecimentoController
    {
        #region Dashboard - Dados Gerais (OTIMIZADO)

        /// <summary>
        /// Retorna todos os dados agregados para o Dashboard de Abastecimentos
        /// Usa tabelas estatísticas para carregamento rápido
        /// IMPORTANTE: Se nenhum filtro for especificado, busca apenas o último mês com dados
        /// </summary>
        [Route("DashboardDados")]
        [HttpGet]
        public IActionResult DashboardDados(int? ano, int? mes)
        {
            try
            {
                // Anos disponíveis - tabela pré-calculada
                var anosDisponiveis = _context.AnosDisponiveisAbastecimento
                    .OrderByDescending(a => a.Ano)
                    .Select(a => a.Ano)
                    .ToList();

                // Se não há dados estatísticos, faz fallback para consulta original
                if (!anosDisponiveis.Any())
                {
                    return DashboardDadosFallback(ano, mes);
                }

                // FILTRO PADRÃO: Se nenhum filtro foi especificado, buscar último mês com dados
                if ((!ano.HasValue || ano == 0) && (!mes.HasValue || mes == 0))
                {
                    var ultimoMes = _context.EstatisticaAbastecimentoMensal
                        .OrderByDescending(e => e.Ano)
                        .ThenByDescending(e => e.Mes)
                        .FirstOrDefault();

                    if (ultimoMes != null)
                    {
                        ano = ultimoMes.Ano;
                        mes = ultimoMes.Mes;
                    }
                }

                // Resumo por ano - tabela pré-calculada
                var resumoPorAno = _context.EstatisticaAbastecimentoMensal
                    .GroupBy(e => e.Ano)
                    .Select(g => new
                    {
                        ano = g.Key,
                        valor = g.Sum(e => e.ValorTotal),
                        litros = g.Sum(e => e.LitrosTotal)
                    })
                    .OrderBy(r => r.ano)
                    .ToList();

                // Filtrar estatísticas por ano/mês
                var queryEstatMensal = _context.EstatisticaAbastecimentoMensal.AsQueryable();
                var queryEstatComb = _context.EstatisticaAbastecimentoCombustivel.AsQueryable();
                var queryEstatCat = _context.EstatisticaAbastecimentoCategoria.AsQueryable();

                if (ano.HasValue && ano > 0)
                {
                    queryEstatMensal = queryEstatMensal.Where(e => e.Ano == ano.Value);
                    queryEstatComb = queryEstatComb.Where(e => e.Ano == ano.Value);
                    queryEstatCat = queryEstatCat.Where(e => e.Ano == ano.Value);
                }

                if (mes.HasValue && mes > 0)
                {
                    queryEstatMensal = queryEstatMensal.Where(e => e.Mes == mes.Value);
                    queryEstatComb = queryEstatComb.Where(e => e.Mes == mes.Value);
                    queryEstatCat = queryEstatCat.Where(e => e.Mes == mes.Value);
                }

                // Totais gerais do período
                var totaisMensal = queryEstatMensal.ToList();
                var totais = new
                {
                    valorTotal = totaisMensal.Sum(e => e.ValorTotal),
                    litrosTotal = totaisMensal.Sum(e => e.LitrosTotal),
                    qtdAbastecimentos = totaisMensal.Sum(e => e.TotalAbastecimentos)
                };

                // Média do litro por combustível
                var combustivelData = queryEstatComb.ToList();
                var mediaLitro = combustivelData
                    .GroupBy(e => e.TipoCombustivel)
                    .Select(g => new
                    {
                        combustivel = g.Key,
                        media = g.Average(e => e.MediaValorLitro)
                    })
                    .OrderBy(m => m.combustivel)
                    .ToList();

                // Valor por categoria
                var categoriaData = queryEstatCat.ToList();
                var valorPorCategoria = categoriaData
                    .GroupBy(e => e.Categoria)
                    .Select(g => new
                    {
                        categoria = g.Key,
                        valor = g.Sum(e => e.ValorTotal)
                    })
                    .OrderByDescending(v => v.valor)
                    .ToList();

                // Valor do litro por mês
                var valorLitroPorMes = combustivelData
                    .Select(e => new
                    {
                        mes = e.Mes,
                        combustivel = e.TipoCombustivel,
                        media = e.MediaValorLitro
                    })
                    .OrderBy(v => v.mes)
                    .ToList();

                // Litros por mês
                var litrosPorMes = combustivelData
                    .Select(e => new
                    {
                        mes = e.Mes,
                        combustivel = e.TipoCombustivel,
                        litros = e.LitrosTotal
                    })
                    .OrderBy(l => l.mes)
                    .ToList();

                // Consumo por mês
                var consumoPorMes = totaisMensal
                    .GroupBy(e => e.Mes)
                    .Select(g => new
                    {
                        mes = g.Key,
                        valor = g.Sum(e => e.ValorTotal)
                    })
                    .OrderBy(c => c.mes)
                    .ToList();

                var resultado = new
                {
                    anosDisponiveis,
                    resumoPorAno,
                    mediaLitro,
                    valorPorCategoria,
                    valorLitroPorMes,
                    litrosPorMes,
                    consumoPorMes,
                    totais
                };

                return Ok(resultado);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "DashboardDados", error);
                return StatusCode(500, new { message = "Erro ao carregar dados do dashboard" });
            }
        }

        /// <summary>
        /// Retorna dados agregados para o Dashboard filtrados por período personalizado (data início/fim)
        /// IMPORTANTE: Data início e fim são obrigatórias
        /// </summary>
        [Route("DashboardDadosPeriodo")]
        [HttpGet]
        public IActionResult DashboardDadosPeriodo(DateTime? dataInicio, DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    return BadRequest(new { message = "Data início e fim são obrigatórias para busca por período" });
                }

                var query = _unitOfWork.ViewAbastecimentos.GetAll()
                    .Where(a => a.DataHora.HasValue && a.DataHora.Value >= dataInicio.Value && a.DataHora.Value <= dataFim.Value.AddDays(1).AddSeconds(-1));

                var dados = query.ToList();

                var resultado = new
                {
                    // Anos disponíveis: TODOS os anos com dados (sem limitação)
                    anosDisponiveis = _unitOfWork.ViewAbastecimentos.GetAll()
                        .Where(a => a.DataHora.HasValue)
                        .Select(a => a.DataHora.Value.Year)
                        .Distinct()
                        .OrderByDescending(a => a)
                        .ToList(),

                    resumoPorAno = dados
                        .Where(a => a.DataHora.HasValue)
                        .GroupBy(a => a.DataHora.Value.Year)
                        .Select(g => new
                        {
                            ano = g.Key,
                            valor = g.Sum(a => ParseDecimal(a.ValorTotal)),
                            litros = g.Sum(a => ParseDecimal(a.Litros))
                        })
                        .OrderBy(r => r.ano)
                        .ToList(),

                    mediaLitro = dados
                        .Where(a => !string.IsNullOrEmpty(a.TipoCombustivel))
                        .GroupBy(a => a.TipoCombustivel)
                        .Select(g => new
                        {
                            combustivel = g.Key,
                            media = g.Average(a => ParseDecimal(a.ValorUnitario))
                        })
                        .OrderBy(m => m.combustivel)
                        .ToList(),

                    valorPorCategoria = dados
                        .Where(a => !string.IsNullOrEmpty(a.TipoVeiculo))
                        .GroupBy(a => a.TipoVeiculo)
                        .Select(g => new
                        {
                            categoria = g.Key,
                            valor = g.Sum(a => ParseDecimal(a.ValorTotal))
                        })
                        .OrderByDescending(v => v.valor)
                        .ToList(),

                    valorLitroPorMes = dados
                        .Where(a => a.DataHora.HasValue && !string.IsNullOrEmpty(a.TipoCombustivel))
                        .GroupBy(a => new { Mes = a.DataHora.Value.Month, Combustivel = a.TipoCombustivel })
                        .Select(g => new
                        {
                            mes = g.Key.Mes,
                            combustivel = g.Key.Combustivel,
                            media = g.Average(a => ParseDecimal(a.ValorUnitario))
                        })
                        .OrderBy(v => v.mes)
                        .ToList(),

                    litrosPorMes = dados
                        .Where(a => a.DataHora.HasValue)
                        .GroupBy(a => new { Mes = a.DataHora.Value.Month, Combustivel = a.TipoCombustivel ?? "Outros" })
                        .Select(g => new
                        {
                            mes = g.Key.Mes,
                            combustivel = g.Key.Combustivel,
                            litros = g.Sum(a => ParseDecimal(a.Litros))
                        })
                        .OrderBy(l => l.mes)
                        .ToList(),

                    consumoPorMes = dados
                        .Where(a => a.DataHora.HasValue)
                        .GroupBy(a => a.DataHora.Value.Month)
                        .Select(g => new
                        {
                            mes = g.Key,
                            valor = g.Sum(a => ParseDecimal(a.ValorTotal))
                        })
                        .OrderBy(c => c.mes)
                        .ToList(),

                    totais = new
                    {
                        valorTotal = dados.Sum(a => ParseDecimal(a.ValorTotal)),
                        litrosTotal = dados.Sum(a => ParseDecimal(a.Litros)),
                        qtdAbastecimentos = dados.Count
                    }
                };

                return Ok(resultado);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "DashboardDadosPeriodo", error);
                return StatusCode(500, new { message = "Erro ao carregar dados do dashboard por período" });
            }
        }

        /// <summary>
        /// Fallback para quando não há dados estatísticos pré-calculados
        /// IMPORTANTE: Se nenhum filtro for especificado, busca apenas o último mês com dados
        /// </summary>
        private IActionResult DashboardDadosFallback(int? ano, int? mes)
        {
            // FILTRO PADRÃO: Se nenhum filtro foi especificado, buscar último mês com dados
            if ((!ano.HasValue || ano == 0) && (!mes.HasValue || mes == 0))
            {
                var ultimaData = _unitOfWork.ViewAbastecimentos.GetAll()
                    .Where(a => a.DataHora.HasValue)
                    .OrderByDescending(a => a.DataHora)
                    .Select(a => a.DataHora!.Value)
                    .FirstOrDefault();

                if (ultimaData != default)
                {
                    ano = ultimaData.Year;
                    mes = ultimaData.Month;
                }
            }

            var query = _unitOfWork.ViewAbastecimentos.GetAll().AsQueryable();

            if (ano.HasValue && ano > 0)
                query = query.Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano.Value);

            if (mes.HasValue && mes > 0)
                query = query.Where(a => a.DataHora.HasValue && a.DataHora.Value.Month == mes.Value);

            var dados = query.ToList();

            var resultado = new
            {
                // Anos disponíveis: TODOS os anos com dados (sem limitação)
                anosDisponiveis = _unitOfWork.ViewAbastecimentos.GetAll()
                    .Where(a => a.DataHora.HasValue)
                    .Select(a => a.DataHora.Value.Year)
                    .Distinct()
                    .OrderByDescending(a => a)
                    .ToList(),

                // Resumo por ano: Limitado aos últimos 3 anos para performance
                resumoPorAno = (from a in _unitOfWork.ViewAbastecimentos.GetAll()
                               where a.DataHora.HasValue
                               group a by a.DataHora.Value.Year into g
                               orderby g.Key descending
                               select new
                               {
                                   ano = g.Key,
                                   valor = g.Sum(a => ParseDecimal(a.ValorTotal)),
                                   litros = g.Sum(a => ParseDecimal(a.Litros))
                               })
                               .Take(3)
                               .OrderBy(r => r.ano)
                               .ToList(),

                mediaLitro = dados
                    .Where(a => !string.IsNullOrEmpty(a.TipoCombustivel))
                    .GroupBy(a => a.TipoCombustivel)
                    .Select(g => new
                    {
                        combustivel = g.Key,
                        media = g.Average(a => ParseDecimal(a.ValorUnitario))
                    })
                    .OrderBy(m => m.combustivel)
                    .ToList(),

                valorPorCategoria = dados
                    .Where(a => !string.IsNullOrEmpty(a.TipoVeiculo))
                    .GroupBy(a => a.TipoVeiculo)
                    .Select(g => new
                    {
                        categoria = g.Key,
                        valor = g.Sum(a => ParseDecimal(a.ValorTotal))
                    })
                    .OrderByDescending(v => v.valor)
                    .ToList(),

                valorLitroPorMes = dados
                    .Where(a => a.DataHora.HasValue && !string.IsNullOrEmpty(a.TipoCombustivel))
                    .GroupBy(a => new { Mes = a.DataHora.Value.Month, Combustivel = a.TipoCombustivel })
                    .Select(g => new
                    {
                        mes = g.Key.Mes,
                        combustivel = g.Key.Combustivel,
                        media = g.Average(a => ParseDecimal(a.ValorUnitario))
                    })
                    .OrderBy(v => v.mes)
                    .ToList(),

                litrosPorMes = dados
                    .Where(a => a.DataHora.HasValue)
                    .GroupBy(a => new { Mes = a.DataHora.Value.Month, Combustivel = a.TipoCombustivel ?? "Outros" })
                    .Select(g => new
                    {
                        mes = g.Key.Mes,
                        combustivel = g.Key.Combustivel,
                        litros = g.Sum(a => ParseDecimal(a.Litros))
                    })
                    .OrderBy(l => l.mes)
                    .ToList(),

                consumoPorMes = dados
                    .Where(a => a.DataHora.HasValue)
                    .GroupBy(a => a.DataHora.Value.Month)
                    .Select(g => new
                    {
                        mes = g.Key,
                        valor = g.Sum(a => ParseDecimal(a.ValorTotal))
                    })
                    .OrderBy(c => c.mes)
                    .ToList(),

                totais = new
                {
                    valorTotal = dados.Sum(a => ParseDecimal(a.ValorTotal)),
                    litrosTotal = dados.Sum(a => ParseDecimal(a.Litros)),
                    qtdAbastecimentos = dados.Count
                }
            };

            return Ok(resultado);
        }

        #endregion

        #region Dashboard - Consumo Mensal (OTIMIZADO)

        /// <summary>
        /// Retorna dados específicos para a aba Consumo Mensal
        /// Usa tabelas estatísticas para carregamento rápido
        /// </summary>
        [Route("DashboardMensal")]
        [HttpGet]
        public IActionResult DashboardMensal(int ano, int? mes)
        {
            try
            {
                // Verificar se há dados estatísticos
                var temDadosEstatisticos = _context.EstatisticaAbastecimentoMensal
                    .Any(e => e.Ano == ano);

                if (!temDadosEstatisticos)
                {
                    return DashboardMensalFallback(ano, mes);
                }

                // Query base para estatísticas mensais
                var queryMensal = _context.EstatisticaAbastecimentoMensal
                    .Where(e => e.Ano == ano);

                var queryComb = _context.EstatisticaAbastecimentoCombustivel
                    .Where(e => e.Ano == ano);

                var queryCat = _context.EstatisticaAbastecimentoCategoria
                    .Where(e => e.Ano == ano);

                var queryTipo = _context.EstatisticaAbastecimentoTipoVeiculo
                    .Where(e => e.Ano == ano);

                var queryVeiculo = _context.EstatisticaAbastecimentoVeiculo
                    .Where(e => e.Ano == ano);

                if (mes.HasValue && mes > 0)
                {
                    queryMensal = queryMensal.Where(e => e.Mes == mes.Value);
                    queryComb = queryComb.Where(e => e.Mes == mes.Value);
                    queryCat = queryCat.Where(e => e.Mes == mes.Value);
                    queryTipo = queryTipo.Where(e => e.Mes == mes.Value);
                }

                var estatMensal = queryMensal.ToList();
                var estatComb = queryComb.ToList();
                var estatCat = queryCat.ToList();
                var estatTipo = queryTipo.ToList();

                // Totais
                var valorTotal = estatMensal.Sum(e => e.ValorTotal);
                var litrosTotal = estatMensal.Sum(e => e.LitrosTotal);

                // Por combustível
                var porCombustivel = estatComb
                    .GroupBy(e => e.TipoCombustivel)
                    .Select(g => new
                    {
                        combustivel = g.Key,
                        valor = g.Sum(e => e.ValorTotal),
                        litros = g.Sum(e => e.LitrosTotal)
                    })
                    .OrderByDescending(p => p.valor)
                    .ToList();

                // Média do litro
                var mediaLitro = estatComb
                    .GroupBy(e => e.TipoCombustivel)
                    .Select(g => new
                    {
                        combustivel = g.Key,
                        media = g.Average(e => e.MediaValorLitro)
                    })
                    .ToList();

                // Litros por dia - precisa de fallback pois não temos granularidade diária
                // Para litros por dia, ainda usamos a consulta original (menor volume de dados)
                var litrosPorDia = new List<object>();
                if (mes.HasValue && mes > 0)
                {
                    var dadosMes = _unitOfWork.ViewAbastecimentos.GetAll()
                        .Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano && a.DataHora.Value.Month == mes.Value)
                        .ToList();

                    litrosPorDia = dadosMes
                        .GroupBy(a => new { Dia = a.DataHora.Value.Day, Combustivel = a.TipoCombustivel ?? "Outros" })
                        .Select(g => (object)new
                        {
                            dia = g.Key.Dia,
                            combustivel = g.Key.Combustivel,
                            litros = g.Sum(a => ParseDecimal(a.Litros))
                        })
                        .OrderBy(l => ((dynamic)l).dia)
                        .ToList();
                }

                // Valor por tipo de veículo - TOP 15
                var valorPorTipo = estatTipo
                    .GroupBy(e => e.TipoVeiculo)
                    .Select(g => new
                    {
                        tipoVeiculo = g.Key,
                        valor = g.Sum(e => e.ValorTotal)
                    })
                    .OrderByDescending(v => v.valor)
                    .Take(15)
                    .ToList();

                // Valor por placa - TOP 15 (usar tabela de veículos)
                var valorPorPlaca = queryVeiculo
                    .OrderByDescending(v => v.ValorTotal)
                    .Take(15)
                    .Select(v => new
                    {
                        veiculoId = v.VeiculoId,
                        placa = v.Placa ?? "",
                        tipoVeiculo = v.TipoVeiculo ?? "",
                        valor = v.ValorTotal
                    })
                    .ToList();

                // Consumo por categoria
                var consumoPorCategoria = estatCat
                    .GroupBy(e => e.Categoria)
                    .Select(g => new
                    {
                        categoria = g.Key,
                        valor = g.Sum(e => e.ValorTotal)
                    })
                    .OrderByDescending(c => c.valor)
                    .ToList();

                var resultado = new
                {
                    valorTotal,
                    litrosTotal,
                    porCombustivel,
                    mediaLitro,
                    litrosPorDia,
                    valorPorTipo,
                    valorPorPlaca,
                    consumoPorCategoria
                };

                return Ok(resultado);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "DashboardMensal", error);
                return StatusCode(500, new { message = "Erro ao carregar dados mensais" });
            }
        }

        /// <summary>
        /// Fallback para quando não há dados estatísticos
        /// </summary>
        private IActionResult DashboardMensalFallback(int ano, int? mes)
        {
            var query = _unitOfWork.ViewAbastecimentos.GetAll()
                .Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano);

            if (mes.HasValue && mes > 0)
                query = query.Where(a => a.DataHora.Value.Month == mes.Value);

            var dados = query.ToList();

            var todosVeiculos = _unitOfWork.ViewVeiculos.GetAll()
                .Where(v => !string.IsNullOrEmpty(v.Categoria))
                .ToList();

            var veiculosCategorias = todosVeiculos.ToDictionary(
                v => v.VeiculoId,
                v => v.Categoria ?? "Sem Categoria"
            );

            var consumoPorCategoriaReal = dados
                .Where(a => a.VeiculoId != Guid.Empty && veiculosCategorias.ContainsKey(a.VeiculoId))
                .GroupBy(a => veiculosCategorias[a.VeiculoId])
                .Select(g => new
                {
                    categoria = g.Key,
                    valor = g.Sum(a => ParseDecimal(a.ValorTotal))
                })
                .OrderByDescending(c => c.valor)
                .ToList();

            var semCategoria = dados
                .Where(a => a.VeiculoId == Guid.Empty || !veiculosCategorias.ContainsKey(a.VeiculoId))
                .Sum(a => ParseDecimal(a.ValorTotal));

            if (semCategoria > 0)
            {
                var lista = consumoPorCategoriaReal.ToList();
                lista.Add(new { categoria = "Sem Categoria", valor = semCategoria });
                consumoPorCategoriaReal = lista.OrderByDescending(c => c.valor).ToList();
            }

            var resultado = new
            {
                valorTotal = dados.Sum(a => ParseDecimal(a.ValorTotal)),
                litrosTotal = dados.Sum(a => ParseDecimal(a.Litros)),

                porCombustivel = dados
                    .Where(a => !string.IsNullOrEmpty(a.TipoCombustivel))
                    .GroupBy(a => a.TipoCombustivel)
                    .Select(g => new
                    {
                        combustivel = g.Key,
                        valor = g.Sum(a => ParseDecimal(a.ValorTotal)),
                        litros = g.Sum(a => ParseDecimal(a.Litros))
                    })
                    .OrderByDescending(p => p.valor)
                    .ToList(),

                mediaLitro = dados
                    .Where(a => !string.IsNullOrEmpty(a.TipoCombustivel))
                    .GroupBy(a => a.TipoCombustivel)
                    .Select(g => new
                    {
                        combustivel = g.Key,
                        media = g.Average(a => ParseDecimal(a.ValorUnitario))
                    })
                    .ToList(),

                litrosPorDia = dados
                    .Where(a => a.DataHora.HasValue)
                    .GroupBy(a => new { Dia = a.DataHora.Value.Day, Combustivel = a.TipoCombustivel ?? "Outros" })
                    .Select(g => new
                    {
                        dia = g.Key.Dia,
                        combustivel = g.Key.Combustivel,
                        litros = g.Sum(a => ParseDecimal(a.Litros))
                    })
                    .OrderBy(l => l.dia)
                    .ToList(),

                valorPorTipo = dados
                    .Where(a => !string.IsNullOrEmpty(a.TipoVeiculo))
                    .GroupBy(a => a.TipoVeiculo)
                    .Select(g => new
                    {
                        tipoVeiculo = g.Key,
                        valor = g.Sum(a => ParseDecimal(a.ValorTotal))
                    })
                    .OrderByDescending(v => v.valor)
                    .Take(15)
                    .ToList(),

                valorPorPlaca = dados
                    .Where(a => !string.IsNullOrEmpty(a.Placa))
                    .GroupBy(a => new { a.VeiculoId, a.Placa, a.TipoVeiculo })
                    .Select(g => new
                    {
                        veiculoId = g.Key.VeiculoId,
                        placa = g.Key.Placa,
                        tipoVeiculo = g.Key.TipoVeiculo ?? "",
                        valor = g.Sum(a => ParseDecimal(a.ValorTotal))
                    })
                    .OrderByDescending(v => v.valor)
                    .Take(15)
                    .ToList(),

                consumoPorCategoria = consumoPorCategoriaReal
            };

            return Ok(resultado);
        }

        #endregion

        #region Dashboard - Consumo por Veículo (OTIMIZADO)

        /// <summary>
        /// Retorna dados específicos para a aba Consumo por Veículo
        /// Usa tabelas estatísticas para carregamento rápido
        /// </summary>
        [Route("DashboardVeiculo")]
        [HttpGet]
        public IActionResult DashboardVeiculo(int ano, int? mes, Guid? veiculoId, string? tipoVeiculo)
        {
            try
            {
                // Verificar se há dados estatísticos
                var temDadosEstatisticos = _context.EstatisticaAbastecimentoVeiculo
                    .Any(e => e.Ano == ano);

                if (!temDadosEstatisticos)
                {
                    return DashboardVeiculoFallback(ano, mes, veiculoId, tipoVeiculo);
                }

                // Modelos disponíveis - tabela pré-calculada
                var modelosDisponiveis = _context.EstatisticaAbastecimentoTipoVeiculo
                    .Where(e => e.Ano == ano && !string.IsNullOrEmpty(e.TipoVeiculo))
                    .Select(e => e.TipoVeiculo)
                    .Distinct()
                    .OrderBy(m => m)
                    .ToList();

                // Placas disponíveis - tabela pré-calculada
                var placasDisponiveis = _context.EstatisticaAbastecimentoVeiculo
                    .Where(e => e.Ano == ano && !string.IsNullOrEmpty(e.Placa))
                    .Select(e => new { e.VeiculoId, e.Placa })
                    .Distinct()
                    .OrderBy(p => p.Placa)
                    .ToList();

                // Veículos com valor (ranking) - tabela pré-calculada
                var queryVeiculos = _context.EstatisticaAbastecimentoVeiculo
                    .Where(e => e.Ano == ano);

                if (!string.IsNullOrEmpty(tipoVeiculo))
                    queryVeiculos = queryVeiculos.Where(e => e.TipoVeiculo == tipoVeiculo);

                var veiculosComValor = queryVeiculos
                    .OrderByDescending(v => v.ValorTotal)
                    .Select(v => new
                    {
                        veiculoId = v.VeiculoId,
                        placa = v.Placa,
                        tipoVeiculo = v.TipoVeiculo,
                        valor = v.ValorTotal
                    })
                    .ToList();

                // Dados específicos do veículo/tipo selecionado
                decimal valorTotal = 0;
                decimal litrosTotal = 0;
                string descricaoVeiculo = "Todos os veículos";
                string categoriaVeiculo = "-";
                var consumoMensalLitros = new List<object>();
                var valorMensal = new List<object>();

                if (veiculoId.HasValue && veiculoId.Value != Guid.Empty)
                {
                    // Veículo específico
                    var veiculoEstat = _context.EstatisticaAbastecimentoVeiculo
                        .FirstOrDefault(e => e.Ano == ano && e.VeiculoId == veiculoId.Value);

                    if (veiculoEstat != null)
                    {
                        valorTotal = veiculoEstat.ValorTotal;
                        litrosTotal = veiculoEstat.LitrosTotal;
                        descricaoVeiculo = veiculoEstat.Placa + " - " + veiculoEstat.TipoVeiculo;
                        categoriaVeiculo = veiculoEstat.TipoVeiculo ?? "-";
                    }

                    // Consumo mensal do veículo
                    var queryVeiculoMensal = _context.EstatisticaAbastecimentoVeiculoMensal
                        .Where(e => e.Ano == ano && e.VeiculoId == veiculoId.Value);

                    if (mes.HasValue && mes > 0)
                        queryVeiculoMensal = queryVeiculoMensal.Where(e => e.Mes == mes.Value);

                    var veiculoMensalData = queryVeiculoMensal.ToList();

                    // Para consumo mensal por combustível, precisamos da view original
                    var dadosView = _unitOfWork.ViewAbastecimentos.GetAll()
                        .Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano && a.VeiculoId == veiculoId.Value)
                        .ToList();

                    if (mes.HasValue && mes > 0)
                        dadosView = dadosView.Where(a => a.DataHora.Value.Month == mes.Value).ToList();

                    consumoMensalLitros = dadosView
                        .GroupBy(a => new { Mes = a.DataHora.Value.Month, Combustivel = a.TipoCombustivel ?? "Outros" })
                        .Select(g => (object)new
                        {
                            mes = g.Key.Mes,
                            combustivel = g.Key.Combustivel,
                            litros = g.Sum(a => ParseDecimal(a.Litros))
                        })
                        .OrderBy(c => ((dynamic)c).mes)
                        .ToList();

                    valorMensal = veiculoMensalData
                        .Select(e => (object)new
                        {
                            mes = e.Mes,
                            valor = e.ValorTotal
                        })
                        .OrderBy(v => ((dynamic)v).mes)
                        .ToList();
                }
                else if (!string.IsNullOrEmpty(tipoVeiculo))
                {
                    // Tipo de veículo específico
                    descricaoVeiculo = tipoVeiculo;
                    categoriaVeiculo = tipoVeiculo;

                    var tipoQuery = _context.EstatisticaAbastecimentoTipoVeiculo
                        .Where(e => e.Ano == ano && e.TipoVeiculo == tipoVeiculo);

                    if (mes.HasValue && mes > 0)
                        tipoQuery = tipoQuery.Where(e => e.Mes == mes.Value);

                    var tipoData = tipoQuery.ToList();
                    valorTotal = tipoData.Sum(e => e.ValorTotal);
                    litrosTotal = tipoData.Sum(e => e.LitrosTotal);

                    // Consumo mensal do tipo
                    var dadosView = _unitOfWork.ViewAbastecimentos.GetAll()
                        .Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano && a.TipoVeiculo == tipoVeiculo)
                        .ToList();

                    if (mes.HasValue && mes > 0)
                        dadosView = dadosView.Where(a => a.DataHora.Value.Month == mes.Value).ToList();

                    consumoMensalLitros = dadosView
                        .GroupBy(a => new { Mes = a.DataHora.Value.Month, Combustivel = a.TipoCombustivel ?? "Outros" })
                        .Select(g => (object)new
                        {
                            mes = g.Key.Mes,
                            combustivel = g.Key.Combustivel,
                            litros = g.Sum(a => ParseDecimal(a.Litros))
                        })
                        .OrderBy(c => ((dynamic)c).mes)
                        .ToList();

                    valorMensal = tipoData
                        .Select(e => (object)new
                        {
                            mes = e.Mes,
                            valor = e.ValorTotal
                        })
                        .OrderBy(v => ((dynamic)v).mes)
                        .ToList();
                }
                else
                {
                    // Todos os veículos
                    var queryMensal = _context.EstatisticaAbastecimentoMensal
                        .Where(e => e.Ano == ano);

                    if (mes.HasValue && mes > 0)
                        queryMensal = queryMensal.Where(e => e.Mes == mes.Value);

                    var mensalData = queryMensal.ToList();
                    valorTotal = mensalData.Sum(e => e.ValorTotal);
                    litrosTotal = mensalData.Sum(e => e.LitrosTotal);

                    // Consumo mensal geral
                    var queryComb = _context.EstatisticaAbastecimentoCombustivel
                        .Where(e => e.Ano == ano);

                    if (mes.HasValue && mes > 0)
                        queryComb = queryComb.Where(e => e.Mes == mes.Value);

                    var combData = queryComb.ToList();

                    consumoMensalLitros = combData
                        .Select(e => (object)new
                        {
                            mes = e.Mes,
                            combustivel = e.TipoCombustivel,
                            litros = e.LitrosTotal
                        })
                        .OrderBy(c => ((dynamic)c).mes)
                        .ToList();

                    valorMensal = mensalData
                        .Select(e => (object)new
                        {
                            mes = e.Mes,
                            valor = e.ValorTotal
                        })
                        .OrderBy(v => ((dynamic)v).mes)
                        .ToList();
                }

                var resultado = new
                {
                    valorTotal,
                    litrosTotal,
                    descricaoVeiculo,
                    categoriaVeiculo,
                    consumoMensalLitros,
                    valorMensal,
                    veiculosComValor,
                    modelosDisponiveis,
                    placasDisponiveis
                };

                return Ok(resultado);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "DashboardVeiculo", error);
                return StatusCode(500, new { message = "Erro ao carregar dados por veículo" });
            }
        }

        /// <summary>
        /// Endpoint para dados de veículo filtrados por período personalizado
        /// </summary>
        [Route("DashboardDadosVeiculoPeriodo")]
        [HttpGet]
        public IActionResult DashboardDadosVeiculoPeriodo(DateTime? dataInicio, DateTime? dataFim)
        {
            try
            {
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    return BadRequest(new { message = "Data de início e fim são obrigatórias" });
                }

                var query = _unitOfWork.ViewAbastecimentos.GetAll()
                    .Where(a => a.DataHora.HasValue &&
                           a.DataHora.Value.Date >= dataInicio.Value.Date &&
                           a.DataHora.Value.Date <= dataFim.Value.Date);

                var dados = query.ToList();

                // Modelos disponíveis
                var modelosDisponiveis = dados
                    .Where(a => !string.IsNullOrEmpty(a.TipoVeiculo))
                    .Select(a => a.TipoVeiculo)
                    .Distinct()
                    .OrderBy(m => m)
                    .ToList();

                // Placas disponíveis
                var placasDisponiveis = dados
                    .Where(a => !string.IsNullOrEmpty(a.Placa))
                    .Select(a => new { a.VeiculoId, a.Placa })
                    .Distinct()
                    .OrderBy(p => p.Placa)
                    .ToList();

                // Veículos com valor (ranking)
                var veiculosComValor = dados
                    .GroupBy(a => new { a.VeiculoId, a.Placa, a.TipoVeiculo })
                    .Select(g => new
                    {
                        veiculoId = g.Key.VeiculoId,
                        placa = g.Key.Placa,
                        tipoVeiculo = g.Key.TipoVeiculo,
                        valor = g.Sum(a => ParseDecimal(a.ValorTotal))
                    })
                    .OrderByDescending(v => v.valor)
                    .ToList();

                // Totais gerais
                decimal valorTotal = dados.Sum(a => ParseDecimal(a.ValorTotal));
                decimal litrosTotal = dados.Sum(a => ParseDecimal(a.Litros));

                // Consumo mensal por combustível
                var consumoMensalLitros = dados
                    .GroupBy(a => new { Mes = a.DataHora!.Value.Month, Combustivel = a.TipoCombustivel ?? "Outros" })
                    .Select(g => (object)new
                    {
                        mes = g.Key.Mes,
                        combustivel = g.Key.Combustivel,
                        litros = g.Sum(a => ParseDecimal(a.Litros))
                    })
                    .OrderBy(c => ((dynamic)c).mes)
                    .ToList();

                // Valor mensal
                var valorMensal = dados
                    .GroupBy(a => a.DataHora!.Value.Month)
                    .Select(g => (object)new
                    {
                        mes = g.Key,
                        valor = g.Sum(a => ParseDecimal(a.ValorTotal))
                    })
                    .OrderBy(v => ((dynamic)v).mes)
                    .ToList();

                var resultado = new
                {
                    valorTotal,
                    litrosTotal,
                    descricaoVeiculo = "Todos os veículos",
                    categoriaVeiculo = "-",
                    consumoMensalLitros,
                    valorMensal,
                    veiculosComValor,
                    modelosDisponiveis,
                    placasDisponiveis
                };

                return Ok(resultado);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "DashboardDadosVeiculoPeriodo", error);
                return StatusCode(500, new { message = "Erro ao carregar dados por veículo por período" });
            }
        }

        /// <summary>
        /// Fallback para quando não há dados estatísticos
        /// </summary>
        private IActionResult DashboardVeiculoFallback(int ano, int? mes, Guid? veiculoId, string? tipoVeiculo)
        {
            var query = _unitOfWork.ViewAbastecimentos.GetAll()
                .Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano);

            if (mes.HasValue && mes > 0)
                query = query.Where(a => a.DataHora.Value.Month == mes.Value);

            if (veiculoId.HasValue && veiculoId.Value != Guid.Empty)
                query = query.Where(a => a.VeiculoId == veiculoId.Value);

            if (!string.IsNullOrEmpty(tipoVeiculo))
                query = query.Where(a => a.TipoVeiculo == tipoVeiculo);

            var dados = query.ToList();

            string descricaoVeiculo = "Todos os veículos";
            string categoriaVeiculo = "-";

            if (veiculoId.HasValue && veiculoId.Value != Guid.Empty)
            {
                var veiculoInfo = dados.FirstOrDefault();
                if (veiculoInfo != null)
                {
                    descricaoVeiculo = veiculoInfo.Placa + " - " + veiculoInfo.TipoVeiculo;
                    categoriaVeiculo = veiculoInfo.TipoVeiculo ?? "-";
                }
            }
            else if (!string.IsNullOrEmpty(tipoVeiculo))
            {
                descricaoVeiculo = tipoVeiculo;
                categoriaVeiculo = tipoVeiculo;
            }

            var resultado = new
            {
                valorTotal = dados.Sum(a => ParseDecimal(a.ValorTotal)),
                litrosTotal = dados.Sum(a => ParseDecimal(a.Litros)),
                descricaoVeiculo,
                categoriaVeiculo,

                consumoMensalLitros = dados
                    .Where(a => a.DataHora.HasValue)
                    .GroupBy(a => new { Mes = a.DataHora.Value.Month, Combustivel = a.TipoCombustivel ?? "Outros" })
                    .Select(g => new
                    {
                        mes = g.Key.Mes,
                        combustivel = g.Key.Combustivel,
                        litros = g.Sum(a => ParseDecimal(a.Litros))
                    })
                    .OrderBy(c => c.mes)
                    .ToList(),

                valorMensal = dados
                    .Where(a => a.DataHora.HasValue)
                    .GroupBy(a => a.DataHora.Value.Month)
                    .Select(g => new
                    {
                        mes = g.Key,
                        valor = g.Sum(a => ParseDecimal(a.ValorTotal))
                    })
                    .OrderBy(v => v.mes)
                    .ToList(),

                veiculosComValor = _unitOfWork.ViewAbastecimentos.GetAll()
                    .Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano)
                    .Where(a => !mes.HasValue || mes <= 0 || a.DataHora.Value.Month == mes.Value)
                    .Where(a => !string.IsNullOrEmpty(a.Placa))
                    .GroupBy(a => new { a.VeiculoId, a.Placa, a.TipoVeiculo })
                    .Select(g => new
                    {
                        veiculoId = g.Key.VeiculoId,
                        placa = g.Key.Placa,
                        tipoVeiculo = g.Key.TipoVeiculo,
                        valor = g.Sum(a => ParseDecimal(a.ValorTotal))
                    })
                    .OrderByDescending(v => v.valor)
                    .ToList(),

                modelosDisponiveis = _unitOfWork.ViewAbastecimentos.GetAll()
                    .Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano)
                    .Where(a => !string.IsNullOrEmpty(a.TipoVeiculo))
                    .Select(a => a.TipoVeiculo)
                    .Distinct()
                    .OrderBy(m => m)
                    .ToList(),

                placasDisponiveis = _unitOfWork.ViewAbastecimentos.GetAll()
                    .Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano)
                    .Where(a => !string.IsNullOrEmpty(a.Placa))
                    .Select(a => new { a.VeiculoId, a.Placa })
                    .Distinct()
                    .OrderBy(p => p.Placa)
                    .ToList()
            };

            return Ok(resultado);
        }

        #endregion

        #region Dashboard - Detalhes dos Abastecimentos

        /// <summary>
        /// Retorna lista detalhada de abastecimentos para exibir no modal ao clicar em gráficos
        /// Este endpoint sempre usa a view original (dados detalhados não são pré-calculados)
        /// </summary>
        [Route("DashboardDetalhes")]
        [HttpGet]
        public IActionResult DashboardDetalhes(int? ano, int? mes, string? categoria, string? tipoVeiculo, string? placa, int? diaSemana, int? hora)
        {
            try
            {
                var query = _unitOfWork.ViewAbastecimentos.GetAll()
                    .Where(a => a.DataHora.HasValue);

                if (ano.HasValue && ano > 0)
                    query = query.Where(a => a.DataHora.Value.Year == ano.Value);

                if (mes.HasValue && mes > 0)
                    query = query.Where(a => a.DataHora.Value.Month == mes.Value);

                if (!string.IsNullOrEmpty(tipoVeiculo))
                    query = query.Where(a => a.TipoVeiculo == tipoVeiculo);

                if (!string.IsNullOrEmpty(placa))
                    query = query.Where(a => a.Placa == placa);

                if (diaSemana.HasValue)
                    query = query.Where(a => (int)a.DataHora.Value.DayOfWeek == diaSemana.Value);

                if (hora.HasValue)
                    query = query.Where(a => a.DataHora.Value.Hour == hora.Value);

                var dados = query.OrderByDescending(a => a.DataHora).Take(100).ToList();

                // Filtro por categoria real do veículo (requer join com ViewVeiculos)
                if (!string.IsNullOrEmpty(categoria))
                {
                    var veiculosCategorias = _unitOfWork.ViewVeiculos.GetAll()
                        .Where(v => v.Categoria == categoria)
                        .Select(v => v.VeiculoId)
                        .ToHashSet();

                    dados = dados.Where(a => veiculosCategorias.Contains(a.VeiculoId)).ToList();
                }

                var resultado = new
                {
                    registros = dados.Select(a => new
                    {
                        data = a.DataHora?.ToString("dd/MM/yyyy HH:mm") ?? "-",
                        placa = a.Placa ?? "-",
                        tipoVeiculo = a.TipoVeiculo ?? "-",
                        litros = ParseDecimal(a.Litros),
                        valorUnitario = ParseDecimal(a.ValorUnitario),
                        valorTotal = ParseDecimal(a.ValorTotal)
                    }).ToList(),
                    totais = new
                    {
                        quantidade = dados.Count,
                        litros = dados.Sum(a => ParseDecimal(a.Litros)),
                        valor = dados.Sum(a => ParseDecimal(a.ValorTotal))
                    }
                };

                return Ok(resultado);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "DashboardDetalhes", error);
                return StatusCode(500, new { message = "Erro ao carregar detalhes" });
            }
        }

        #endregion

        #region Dashboard - Mapas de Calor (OTIMIZADO)

        /// <summary>
        /// Retorna dados para o Mapa de Calor: Dia da Semana x Hora
        /// Usa tabela HeatmapAbastecimentoMensal quando disponível
        /// </summary>
        [Route("DashboardHeatmapHora")]
        [HttpGet]
        public IActionResult DashboardHeatmapHora(int? ano, int? mes)
        {
            try
            {
                // Verificar se há dados estatísticos
                var queryHeatmap = _context.HeatmapAbastecimentoMensal
                    .Where(h => h.VeiculoId == null && h.TipoVeiculo == null);

                if (ano.HasValue && ano > 0)
                    queryHeatmap = queryHeatmap.Where(h => h.Ano == ano.Value);

                if (mes.HasValue && mes > 0)
                    queryHeatmap = queryHeatmap.Where(h => h.Mes == mes.Value);

                var heatmapData = queryHeatmap.ToList();

                if (heatmapData.Any())
                {
                    // Usar dados pré-calculados
                    var diasSemana = new[] { "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb" };

                    // Agrupar por dia/hora (pode haver múltiplos meses)
                    var agrupado = heatmapData
                        .GroupBy(h => new { h.DiaSemana, h.Hora })
                        .Select(g => new
                        {
                            diaSemana = g.Key.DiaSemana,
                            hora = g.Key.Hora,
                            valor = g.Sum(h => h.ValorTotal)
                        })
                        .ToList();

                    var matriz = new decimal[7, 24];
                    foreach (var item in agrupado)
                    {
                        matriz[item.diaSemana, item.hora] = item.valor;
                    }

                    var data = new List<object>();
                    for (int dia = 0; dia < 7; dia++)
                    {
                        for (int hora = 0; hora < 24; hora++)
                        {
                            data.Add(new { x = diasSemana[dia], y = hora.ToString("00") + "h", value = matriz[dia, hora] });
                        }
                    }

                    return Ok(new
                    {
                        xLabels = diasSemana,
                        yLabels = Enumerable.Range(0, 24).Select(h => h.ToString("00") + "h").ToArray(),
                        data
                    });
                }

                // Fallback para consulta original
                return DashboardHeatmapHoraFallback(ano, mes);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "DashboardHeatmapHora", error);
                return StatusCode(500, new { message = "Erro ao carregar mapa de calor" });
            }
        }

        private IActionResult DashboardHeatmapHoraFallback(int? ano, int? mes)
        {
            var query = _unitOfWork.ViewAbastecimentos.GetAll()
                .Where(a => a.DataHora.HasValue);

            if (ano.HasValue && ano > 0)
                query = query.Where(a => a.DataHora.Value.Year == ano.Value);

            if (mes.HasValue && mes > 0)
                query = query.Where(a => a.DataHora.Value.Month == mes.Value);

            var dados = query.ToList();

            var agrupado = dados
                .GroupBy(a => new { DiaSemana = (int)a.DataHora.Value.DayOfWeek, Hora = a.DataHora.Value.Hour })
                .Select(g => new
                {
                    diaSemana = g.Key.DiaSemana,
                    hora = g.Key.Hora,
                    valor = g.Sum(a => ParseDecimal(a.ValorTotal)),
                    quantidade = g.Count()
                })
                .ToList();

            var diasSemana = new[] { "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb" };

            var matriz = new decimal[7, 24];
            foreach (var item in agrupado)
            {
                matriz[item.diaSemana, item.hora] = item.valor;
            }

            var heatmapData = new List<object>();
            for (int dia = 0; dia < 7; dia++)
            {
                for (int hora = 0; hora < 24; hora++)
                {
                    heatmapData.Add(new { x = diasSemana[dia], y = hora.ToString("00") + "h", value = matriz[dia, hora] });
                }
            }

            return Ok(new
            {
                xLabels = diasSemana,
                yLabels = Enumerable.Range(0, 24).Select(h => h.ToString("00") + "h").ToArray(),
                data = heatmapData
            });
        }

        /// <summary>
        /// Retorna dados para o Mapa de Calor: Categoria x Mês
        /// </summary>
        [Route("DashboardHeatmapCategoria")]
        [HttpGet]
        public IActionResult DashboardHeatmapCategoria(int ano)
        {
            try
            {
                // Tentar usar dados estatísticos
                var estatCat = _context.EstatisticaAbastecimentoCategoria
                    .Where(e => e.Ano == ano)
                    .ToList();

                if (estatCat.Any())
                {
                    var categorias = estatCat.Select(e => e.Categoria).Distinct().OrderBy(c => c).ToList();
                    var meses = new[] { "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" };

                    var heatmapData = new List<object>();
                    foreach (var cat in categorias)
                    {
                        for (int mes = 1; mes <= 12; mes++)
                        {
                            var item = estatCat.FirstOrDefault(e => e.Categoria == cat && e.Mes == mes);
                            heatmapData.Add(new { x = cat, y = meses[mes - 1], value = item?.ValorTotal ?? 0 });
                        }
                    }

                    return Ok(new
                    {
                        xLabels = categorias.ToArray(),
                        yLabels = meses,
                        data = heatmapData
                    });
                }

                // Fallback
                return DashboardHeatmapCategoriaFallback(ano);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "DashboardHeatmapCategoria", error);
                return StatusCode(500, new { message = "Erro ao carregar mapa de calor" });
            }
        }

        private IActionResult DashboardHeatmapCategoriaFallback(int ano)
        {
            var dados = _unitOfWork.ViewAbastecimentos.GetAll()
                .Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano)
                .ToList();

            var veiculosCategorias = _unitOfWork.ViewVeiculos.GetAll()
                .Where(v => !string.IsNullOrEmpty(v.Categoria))
                .ToDictionary(v => v.VeiculoId, v => v.Categoria ?? "Sem Categoria");

            var agrupado = dados
                .Where(a => veiculosCategorias.ContainsKey(a.VeiculoId))
                .GroupBy(a => new { Categoria = veiculosCategorias[a.VeiculoId], Mes = a.DataHora.Value.Month })
                .Select(g => new
                {
                    categoria = g.Key.Categoria,
                    mes = g.Key.Mes,
                    valor = g.Sum(a => ParseDecimal(a.ValorTotal))
                })
                .ToList();

            var categorias = agrupado.Select(a => a.categoria).Distinct().OrderBy(c => c).ToList();
            var meses = new[] { "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" };

            var heatmapData = new List<object>();
            foreach (var cat in categorias)
            {
                for (int mes = 1; mes <= 12; mes++)
                {
                    var item = agrupado.FirstOrDefault(a => a.categoria == cat && a.mes == mes);
                    heatmapData.Add(new { x = cat, y = meses[mes - 1], value = item?.valor ?? 0 });
                }
            }

            return Ok(new
            {
                xLabels = categorias.ToArray(),
                yLabels = meses,
                data = heatmapData
            });
        }

        /// <summary>
        /// Retorna dados para o Mapa de Calor: Dia da Semana x Hora de um veículo ou modelo específico
        /// </summary>
        [Route("DashboardHeatmapVeiculo")]
        [HttpGet]
        public IActionResult DashboardHeatmapVeiculo(int? ano, string? placa, string? tipoVeiculo)
        {
            try
            {
                // Se não tem placa nem modelo, retorna vazio
                if (string.IsNullOrEmpty(placa) && string.IsNullOrEmpty(tipoVeiculo))
                {
                    return Ok(new { xLabels = new string[0], yLabels = new string[0], data = new object[0] });
                }

                // Este endpoint sempre usa a view original (granularidade de heatmap por veículo específico)
                var query = _unitOfWork.ViewAbastecimentos.GetAll()
                    .Where(a => a.DataHora.HasValue);

                if (!string.IsNullOrEmpty(placa))
                    query = query.Where(a => a.Placa == placa);
                else if (!string.IsNullOrEmpty(tipoVeiculo))
                    query = query.Where(a => a.TipoVeiculo == tipoVeiculo);

                if (ano.HasValue && ano > 0)
                    query = query.Where(a => a.DataHora.Value.Year == ano.Value);

                var dados = query.ToList();

                if (!dados.Any())
                {
                    return Ok(new { xLabels = new string[0], yLabels = new string[0], data = new object[0] });
                }

                var agrupado = dados
                    .GroupBy(a => new { DiaSemana = (int)a.DataHora.Value.DayOfWeek, Hora = a.DataHora.Value.Hour })
                    .Select(g => new
                    {
                        diaSemana = g.Key.DiaSemana,
                        hora = g.Key.Hora,
                        valor = g.Sum(a => ParseDecimal(a.ValorTotal)),
                        quantidade = g.Count()
                    })
                    .ToList();

                var diasSemana = new[] { "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb" };

                var matriz = new decimal[7, 24];
                foreach (var item in agrupado)
                {
                    matriz[item.diaSemana, item.hora] = item.valor;
                }

                var heatmapData = new List<object>();
                for (int dia = 0; dia < 7; dia++)
                {
                    for (int hora = 0; hora < 24; hora++)
                    {
                        heatmapData.Add(new { x = diasSemana[dia], y = hora.ToString("00") + "h", value = matriz[dia, hora] });
                    }
                }

                return Ok(new
                {
                    xLabels = diasSemana,
                    yLabels = Enumerable.Range(0, 24).Select(h => h.ToString("00") + "h").ToArray(),
                    data = heatmapData
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "DashboardHeatmapVeiculo", error);
                return StatusCode(500, new { message = "Erro ao carregar mapa de calor do veículo" });
            }
        }

        /// <summary>
        /// Retorna os meses disponíveis para um ano específico
        /// Usado para popular dropdown de mês quando o usuário seleciona um ano
        /// </summary>
        [Route("DashboardMesesDisponiveis")]
        [HttpGet]
        public IActionResult DashboardMesesDisponiveis(int ano)
        {
            try
            {
                // Tentar usar dados estatísticos primeiro
                var mesesEstatisticos = _context.EstatisticaAbastecimentoMensal
                    .Where(e => e.Ano == ano)
                    .Select(e => e.Mes)
                    .Distinct()
                    .OrderBy(m => m)
                    .ToList();

                if (mesesEstatisticos.Any())
                {
                    return Ok(new { meses = mesesEstatisticos });
                }

                // Fallback: buscar da view original
                var mesesView = _unitOfWork.ViewAbastecimentos.GetAll()
                    .Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano)
                    .Select(a => a.DataHora.Value.Month)
                    .Distinct()
                    .OrderBy(m => m)
                    .ToList();

                return Ok(new { meses = mesesView });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "DashboardMesesDisponiveis", error);
                return StatusCode(500, new { message = "Erro ao carregar meses disponíveis" });
            }
        }

        #endregion

        #region Helpers

        private static decimal ParseDecimal(string? valor)
        {
            if (string.IsNullOrEmpty(valor))
                return 0;

            var valorLimpo = valor
                .Replace("R$", "")
                .Replace(" ", "")
                .Trim();

            if (string.IsNullOrEmpty(valorLimpo))
                return 0;

            bool temVirgula = valorLimpo.Contains(',');

            if (temVirgula)
            {
                valorLimpo = valorLimpo.Replace(".", "").Replace(",", ".");
            }

            if (decimal.TryParse(valorLimpo, System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out decimal result))
            {
                return result;
            }

            return 0;
        }

        #endregion
    }
}
