using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    /// <summary>
    /// ViagemController - Partial Class para API ObterCustosViagem
    /// </summary>
    public partial class ViagemController
    {
        /// <summary>
        /// Obtém os custos detalhados de uma viagem específica
        /// Retorna: custos individuais, duração, km percorrido, consumo estimado
        /// Rota: /api/Viagem/ObterCustosViagem?viagemId={guid}
        /// </summary>
        [Route("ObterCustosViagem")]
        [HttpGet]
        public async Task<IActionResult> ObterCustosViagem(Guid viagemId)
        {
            try
            {
                if (viagemId == Guid.Empty)
                {
                    return Json(new
                    {
                        success = false,
                        message = "ID da viagem inválido"
                    });
                }

                // Busca a viagem com relacionamentos
                var viagem = await _unitOfWork.Viagem.GetFirstOrDefaultAsync(
                    filter: v => v.ViagemId == viagemId,
                    includeProperties: "Veiculo,Veiculo.Combustivel,Motorista,Requisitante,SetorSolicitante"
                );

                if (viagem == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Viagem não encontrada"
                    });
                }

                // ========== CÁLCULO DE DURAÇÃO ==========
                double duracaoMinutos = 0;
                string duracaoFormatada = "-";
                if (viagem.DataInicial.HasValue && viagem.HoraInicio.HasValue &&
                    viagem.DataFinal.HasValue && viagem.HoraFim.HasValue)
                {
                    var dataHoraInicio = viagem.DataInicial.Value.Date + viagem.HoraInicio.Value.TimeOfDay;
                    var dataHoraFim = viagem.DataFinal.Value.Date + viagem.HoraFim.Value.TimeOfDay;
                    var diferenca = dataHoraFim - dataHoraInicio;
                    duracaoMinutos = diferenca.TotalMinutes;

                    if (duracaoMinutos > 0)
                    {
                        int horas = (int)(duracaoMinutos / 60);
                        int mins = (int)(duracaoMinutos % 60);
                        duracaoFormatada = horas > 0 ? $"{horas}h {mins}min" : $"{mins}min";
                    }
                }

                // ========== CÁLCULO DE KM PERCORRIDO ==========
                int kmPercorrido = 0;
                if (viagem.KmFinal.HasValue && viagem.KmInicial.HasValue)
                {
                    kmPercorrido = viagem.KmFinal.Value - viagem.KmInicial.Value;
                    if (kmPercorrido < 0) kmPercorrido = 0;
                }

                // ========== TIPO DE COMBUSTÍVEL ==========
                string tipoCombustivel = "-";
                Guid? combustivelId = null;
                if (viagem.Veiculo != null && viagem.Veiculo.Combustivel != null)
                {
                    tipoCombustivel = viagem.Veiculo.Combustivel.Descricao ?? "-";
                    combustivelId = viagem.Veiculo.CombustivelId;
                }

                // ========== LÓGICA INTELIGENTE PARA LITROS GASTOS ==========
                double litrosGastos = 0;
                double consumoVeiculo = 0;

                // 1. TENTA USAR O CONSUMO MÉDIO DO VEÍCULO
                if (viagem.Veiculo != null && viagem.Veiculo.Consumo.HasValue && viagem.Veiculo.Consumo.Value > 0)
                {
                    consumoVeiculo = viagem.Veiculo.Consumo.Value;
                }
                else
                {
                    // 2. SE NÃO TEM CONSUMO NO VEÍCULO, BUSCA MÉDIA DE CONSUMO BASEADO EM ABASTECIMENTOS HISTÓRICOS
                    if (viagem.VeiculoId.HasValue)
                    {
                        var abastecimentosHistorico = _unitOfWork.Abastecimento
                            .GetAll()
                            .Where(a => a.VeiculoId == viagem.VeiculoId.Value
                                        && a.Litros.HasValue && a.Litros.Value > 0
                                        && a.KmRodado.HasValue && a.KmRodado.Value > 0)
                            .ToList();

                        if (abastecimentosHistorico.Any())
                        {
                            // Calcula média de consumo: soma(km) / soma(litros)
                            double totalKm = abastecimentosHistorico.Sum(a => a.KmRodado.Value);
                            double totalLitros = abastecimentosHistorico.Sum(a => a.Litros.Value);
                            if (totalLitros > 0)
                            {
                                consumoVeiculo = totalKm / totalLitros;
                            }
                        }
                    }
                }

                // 3. CALCULA LITROS GASTOS BASEADO NO KM PERCORRIDO E CONSUMO
                if (kmPercorrido > 0 && consumoVeiculo > 0)
                {
                    litrosGastos = kmPercorrido / consumoVeiculo;
                }

                // 4. VALIDA COM ABASTECIMENTOS REAIS DO PERÍODO (SE HOUVER)
                if (viagem.VeiculoId.HasValue && viagem.DataInicial.HasValue && viagem.DataFinal.HasValue)
                {
                    var abastecimentosPeriodo = _unitOfWork.Abastecimento
                        .GetAll()
                        .Where(a => a.VeiculoId == viagem.VeiculoId.Value
                                    && a.DataHora.HasValue
                                    && a.DataHora.Value >= viagem.DataInicial.Value
                                    && a.DataHora.Value <= viagem.DataFinal.Value.AddDays(1))
                        .ToList();

                    if (abastecimentosPeriodo.Any())
                    {
                        double litrosReais = abastecimentosPeriodo.Sum(a => a.Litros ?? 0);
                        // Se encontrou abastecimentos reais no período, usa esse valor
                        if (litrosReais > 0)
                        {
                            litrosGastos = litrosReais;
                        }
                    }
                }

                // ========== BUSCA PREÇO DO COMBUSTÍVEL ==========
                double precoCombustivel = 0;

                // 1. BUSCA ABASTECIMENTO MAIS PRÓXIMO DA DATA DA VIAGEM
                if (combustivelId.HasValue && viagem.DataInicial.HasValue)
                {
                    var dataViagem = viagem.DataInicial.Value;

                    // Busca abastecimentos do mesmo tipo de combustível ordenados por proximidade de data
                    var abastecimentoProximo = _unitOfWork.Abastecimento
                        .GetAll()
                        .Where(a => a.CombustivelId == combustivelId.Value
                                    && a.ValorUnitario.HasValue
                                    && a.ValorUnitario.Value > 0
                                    && a.DataHora.HasValue)
                        .OrderBy(a => Math.Abs((a.DataHora.Value - dataViagem).TotalDays))
                        .FirstOrDefault();

                    if (abastecimentoProximo != null && abastecimentoProximo.ValorUnitario.HasValue)
                    {
                        precoCombustivel = abastecimentoProximo.ValorUnitario.Value;
                    }
                }

                // 2. SE NÃO ENCONTROU, BUSCA MÉDIA DE COMBUSTÍVEL
                if (precoCombustivel == 0 && combustivelId.HasValue)
                {
                    var mediaCombustivel = _unitOfWork.MediaCombustivel
                        .GetAll()
                        .Where(m => m.CombustivelId == combustivelId.Value)
                        .OrderByDescending(m => m.Ano)
                        .ThenByDescending(m => m.Mes)
                        .FirstOrDefault();

                    if (mediaCombustivel != null)
                    {
                        precoCombustivel = mediaCombustivel.PrecoMedio;
                    }
                }

                // ========== CÁLCULO DE CUSTOS ==========
                double custoCombustivelCalculado = 0;
                if (litrosGastos > 0 && precoCombustivel > 0)
                {
                    custoCombustivelCalculado = litrosGastos * precoCombustivel;
                }

                // Custos individuais (usa valor da tabela se estiver preenchido, senão usa calculado)
                double custoMotorista = viagem.CustoMotorista ?? 0;
                double custoVeiculo = viagem.CustoVeiculo ?? 0;
                double custoCombustivel = viagem.CustoCombustivel ?? custoCombustivelCalculado;
                double custoOperador = viagem.CustoOperador ?? 0;
                double custoLavador = viagem.CustoLavador ?? 0;

                // Se o custo de combustível da viagem for 0 mas temos um valor calculado, usa o calculado
                if ((viagem.CustoCombustivel ?? 0) == 0 && custoCombustivelCalculado > 0)
                {
                    custoCombustivel = custoCombustivelCalculado;
                }

                // Ajusta litros gastos se tiver custo real de combustível mas litros calculados
                if ((viagem.CustoCombustivel ?? 0) > 0 && precoCombustivel > 0 && litrosGastos == 0)
                {
                    litrosGastos = viagem.CustoCombustivel.Value / precoCombustivel;
                }

                // Custo total
                double custoTotal = custoMotorista + custoVeiculo + custoCombustivel + custoOperador + custoLavador;

                // ========== CÁLCULO DE CONSUMO (KM/L) ==========
                double consumo = 0;
                string consumoFormatado = "-";
                if (kmPercorrido > 0 && litrosGastos > 0)
                {
                    consumo = kmPercorrido / litrosGastos;
                    consumoFormatado = $"{consumo:F2} km/l";
                }
                else if (consumoVeiculo > 0)
                {
                    // Se não conseguiu calcular, usa o consumo médio do veículo
                    consumo = consumoVeiculo;
                    consumoFormatado = $"{consumo:F2} km/l (média)";
                }

                // ========== INFORMAÇÕES DA VIAGEM ==========
                string infoViagem = "";
                if (viagem.DataInicial.HasValue)
                {
                    infoViagem = viagem.DataInicial.Value.ToString("dd/MM/yyyy");
                    if (viagem.HoraInicio.HasValue)
                    {
                        infoViagem += $" às {viagem.HoraInicio.Value:HH:mm}";
                    }
                }
                if (!string.IsNullOrEmpty(viagem.Origem) || !string.IsNullOrEmpty(viagem.Destino))
                {
                    infoViagem += $" • {viagem.Origem ?? ""} → {viagem.Destino ?? ""}";
                }

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        ViagemId = viagem.ViagemId,
                        NoFichaVistoria = viagem.NoFichaVistoria ?? 0,
                        InfoViagem = infoViagem,

                        // Estatísticas
                        DuracaoMinutos = duracaoMinutos,
                        DuracaoFormatada = duracaoFormatada,
                        KmPercorrido = kmPercorrido,
                        LitrosGastos = Math.Round(litrosGastos, 2),
                        Consumo = Math.Round(consumo, 2),
                        ConsumoFormatado = consumoFormatado,
                        TipoCombustivel = tipoCombustivel,
                        PrecoCombustivel = Math.Round(precoCombustivel, 2),

                        // Custos
                        CustoMotorista = Math.Round(custoMotorista, 2),
                        CustoVeiculo = Math.Round(custoVeiculo, 2),
                        CustoCombustivel = Math.Round(custoCombustivel, 2),
                        CustoOperador = Math.Round(custoOperador, 2),
                        CustoLavador = Math.Round(custoLavador, 2),
                        CustoTotal = Math.Round(custoTotal, 2)
                    }
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemController.cs", "ObterCustosViagem", error);
                return Json(new
                {
                    success = false,
                    message = $"Erro ao obter custos da viagem: {error.Message}"
                });
            }
        }
    }
}
