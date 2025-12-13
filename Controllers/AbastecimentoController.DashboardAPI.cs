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

                // Filtros opcionais
                if (ano.HasValue && ano > 0)
                {
                    query = query.Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano.Value);
                }

                if (mes.HasValue && mes > 0)
                {
                    query = query.Where(a => a.DataHora.HasValue && a.DataHora.Value.Month == mes.Value);
                }

                var dados = query.ToList();

                // Processar dados para o dashboard
                var resultado = new
                {
                    // Anos disponíveis (para filtros)
                    anosDisponiveis = _unitOfWork.ViewAbastecimentos.GetAll()
                        .Where(a => a.DataHora.HasValue)
                        .Select(a => a.DataHora.Value.Year)
                        .Distinct()
                        .OrderByDescending(a => a)
                        .ToList(),

                    // Resumo por ano
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

                    // Média do litro por combustível
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

                    // Valor por categoria de veículo
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

                    // Valor do litro por mês (para gráfico de linha)
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

                    // Litros por mês (para gráfico de área)
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

                    // Consumo (valor R$) por mês
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

                    // Totais gerais
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

                    // Valor por veículo (Top 30)
                    valorPorVeiculo = dados
                        .Where(a => !string.IsNullOrEmpty(a.TipoVeiculo))
                        .GroupBy(a => a.TipoVeiculo)
                        .Select(g => new
                        {
                            veiculo = g.Key,
                            valor = g.Sum(a => ParseDecimal(a.ValorTotal))
                        })
                        .OrderByDescending(v => v.valor)
                        .Take(30)
                        .ToList(),

                    // Consumo por categoria
                    consumoPorCategoria = dados
                        .Where(a => !string.IsNullOrEmpty(a.TipoVeiculo))
                        .GroupBy(a => a.TipoVeiculo)
                        .Select(g => new
                        {
                            categoria = g.Key,
                            valor = g.Sum(a => ParseDecimal(a.ValorTotal))
                        })
                        .OrderByDescending(c => c.valor)
                        .Take(10)
                        .ToList()
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

                if (veiculoId.HasValue && veiculoId != Guid.Empty)
                {
                    query = query.Where(a => a.VeiculoId == veiculoId.Value);
                }

                if (!string.IsNullOrEmpty(tipoVeiculo))
                {
                    query = query.Where(a => a.TipoVeiculo == tipoVeiculo);
                }

                var dados = query.ToList();

                // Buscar info do veículo selecionado
                string descricaoVeiculo = "Todos os veículos";
                string categoriaVeiculo = "-";

                if (veiculoId.HasValue && veiculoId != Guid.Empty)
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
                    // Totais
                    valorTotal = dados.Sum(a => ParseDecimal(a.ValorTotal)),
                    litrosTotal = dados.Sum(a => ParseDecimal(a.Litros)),

                    // Info do veículo
                    descricaoVeiculo = descricaoVeiculo,
                    categoriaVeiculo = categoriaVeiculo,

                    // Consumo mensal de litros por combustível
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

                    // Valor mensal
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

                    // Lista de veículos com valores
                    veiculosComValor = _unitOfWork.ViewAbastecimentos.GetAll()
                        .Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano)
                        .Where(a => !mes.HasValue || mes <= 0 || a.DataHora.Value.Month == mes.Value)
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

                    // Lista de modelos disponíveis (para filtro)
                    modelosDisponiveis = _unitOfWork.ViewAbastecimentos.GetAll()
                        .Where(a => a.DataHora.HasValue && a.DataHora.Value.Year == ano)
                        .Where(a => !string.IsNullOrEmpty(a.TipoVeiculo))
                        .Select(a => a.TipoVeiculo)
                        .Distinct()
                        .OrderBy(m => m)
                        .ToList(),

                    // Lista de placas disponíveis (para filtro)
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

        /// <summary>
        /// Converte string para decimal de forma segura
        /// Detecta automaticamente o formato (brasileiro ou americano)
        /// </summary>
        private static decimal ParseDecimal(string? valor)
        {
            if (string.IsNullOrEmpty(valor))
                return 0;

            // Remove R$, espaços
            var valorLimpo = valor
                .Replace("R$", "")
                .Replace(" ", "")
                .Trim();

            if (string.IsNullOrEmpty(valorLimpo))
                return 0;

            // Detecta o formato:
            // - Se tem vírgula, é formato brasileiro (ponto = milhar, vírgula = decimal)
            // - Se não tem vírgula e tem ponto, o ponto é decimal (formato americano/banco)
            bool temVirgula = valorLimpo.Contains(',');
            bool temPonto = valorLimpo.Contains('.');

            if (temVirgula)
            {
                // Formato brasileiro: 1.234,56 -> 1234.56
                valorLimpo = valorLimpo.Replace(".", "").Replace(",", ".");
            }
            // Se só tem ponto, mantém como está (já é formato decimal)

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
