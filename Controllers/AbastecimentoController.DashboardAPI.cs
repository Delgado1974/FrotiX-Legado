using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Controllers
{
    /// <summary>
    /// Partial class com endpoints da API para o Dashboard de Abastecimentos
    /// </summary>
    public partial class AbastecimentoController
    {
        #region Dashboard - Dados Gerais

        /// <summary>
        /// Retorna todos os dados agregados para o Dashboard de Abastecimentos
        /// </summary>
        [Route("DashboardDados")]
        [HttpGet]
        public IActionResult DashboardDados(int? ano, int? mes)
        {
            try
            {
                var query = _unitOfWork.ViewAbastecimentos.GetAll().AsQueryable();

                if (ano.HasValue && ano > 0)
                {
                    query = query.Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano.Value);
                }

                if (mes.HasValue && mes > 0)
                {
                    query = query.Where(a => a.DataHora.HasValue && a.DataHora.Value.Month == mes.Value);
                }

                var dados = query.ToList();

                var resultado = new
                {
                    anosDisponiveis = _unitOfWork.ViewAbastecimentos.GetAll()
                        .Where(a => a.DataHora.HasValue)
                        .Select(a => a.DataHora.Value.Year)
                        .Distinct()
                        .OrderByDescending(a => a)
                        .ToList(),

                    resumoPorAno = _unitOfWork.ViewAbastecimentos.GetAll()
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
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "DashboardDados", error);
                return StatusCode(500, new { message = "Erro ao carregar dados do dashboard" });
            }
        }

        #endregion

        #region Dashboard - Consumo Mensal

        /// <summary>
        /// Retorna dados específicos para a aba Consumo Mensal
        /// </summary>
        [Route("DashboardMensal")]
        [HttpGet]
        public IActionResult DashboardMensal(int ano, int? mes)
        {
            try
            {
                var query = _unitOfWork.ViewAbastecimentos.GetAll()
                    .Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano);

                if (mes.HasValue && mes > 0)
                {
                    query = query.Where(a => a.DataHora.Value.Month == mes.Value);
                }

                var dados = query.ToList();

                // Buscar TODAS as categorias dos veículos (campo Categoria) usando ViewVeiculos
                // Categorias: Ambulância, Carga Leve, Carga Pesada, Coletivos Pequenos, Depol, Mesa, Ônibus/Microônibus, Passeio
                var todosVeiculos = _unitOfWork.ViewVeiculos.GetAll()
                    .Where(v => !string.IsNullOrEmpty(v.Categoria))
                    .ToList();
                
                var veiculosCategorias = todosVeiculos.ToDictionary(
                    v => v.VeiculoId, 
                    v => v.Categoria ?? "Sem Categoria"
                );

                // Agrupar abastecimentos por CATEGORIA real do veículo
                // VeiculoId na ViewAbastecimentos é Guid (não nullable)
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

                // Se não encontrou categorias, adicionar os sem categoria
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
                    // Totais
                    valorTotal = dados.Sum(a => ParseDecimal(a.ValorTotal)),
                    litrosTotal = dados.Sum(a => ParseDecimal(a.Litros)),

                    // Breakdown por combustível
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

                    // Média do litro
                    mediaLitro = dados
                        .Where(a => !string.IsNullOrEmpty(a.TipoCombustivel))
                        .GroupBy(a => a.TipoCombustivel)
                        .Select(g => new
                        {
                            combustivel = g.Key,
                            media = g.Average(a => ParseDecimal(a.ValorUnitario))
                        })
                        .ToList(),

                    // Litros por dia
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

                    // Valor por TIPO/MODELO de Veículo (TipoVeiculo da View) - TOP 15
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

                    // Valor por PLACA individual - TOP 15
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

                    // Consumo por CATEGORIA REAL do veículo (Ambulância, Carga Leve, etc)
                    consumoPorCategoria = consumoPorCategoriaReal
                };

                return Ok(resultado);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "DashboardMensal", error);
                return StatusCode(500, new { message = "Erro ao carregar dados mensais" });
            }
        }

        #endregion

        #region Dashboard - Consumo por Veículo

        /// <summary>
        /// Retorna dados específicos para a aba Consumo por Veículo
        /// </summary>
        [Route("DashboardVeiculo")]
        [HttpGet]
        public IActionResult DashboardVeiculo(int ano, int? mes, Guid? veiculoId, string? tipoVeiculo)
        {
            try
            {
                var query = _unitOfWork.ViewAbastecimentos.GetAll()
                    .Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano);

                if (mes.HasValue && mes > 0)
                {
                    query = query.Where(a => a.DataHora.Value.Month == mes.Value);
                }

                if (veiculoId.HasValue && veiculoId.Value != Guid.Empty)
                {
                    query = query.Where(a => a.VeiculoId == veiculoId.Value);
                }

                if (!string.IsNullOrEmpty(tipoVeiculo))
                {
                    query = query.Where(a => a.TipoVeiculo == tipoVeiculo);
                }

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

                    descricaoVeiculo = descricaoVeiculo,
                    categoriaVeiculo = categoriaVeiculo,

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
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "DashboardVeiculo", error);
                return StatusCode(500, new { message = "Erro ao carregar dados por veículo" });
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
