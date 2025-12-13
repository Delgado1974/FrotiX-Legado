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

                // Calcula duração em horas e minutos
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

                // Calcula km percorrido
                int kmPercorrido = 0;
                if (viagem.KmFinal.HasValue && viagem.KmInicial.HasValue)
                {
                    kmPercorrido = viagem.KmFinal.Value - viagem.KmInicial.Value;
                    if (kmPercorrido < 0) kmPercorrido = 0;
                }

                // Busca abastecimentos do VEÍCULO no período da viagem para estimar litros gastos
                double litrosGastos = 0;
                string tipoCombustivel = "-";

                // Pega o tipo de combustível do veículo
                if (viagem.Veiculo != null && viagem.Veiculo.Combustivel != null)
                {
                    tipoCombustivel = viagem.Veiculo.Combustivel.Descricao ?? "-";
                }

                // Tenta buscar abastecimentos do veículo no período
                if (viagem.VeiculoId.HasValue && viagem.DataInicial.HasValue && viagem.DataFinal.HasValue)
                {
                    var abastecimentos = _unitOfWork.Abastecimento
                        .GetAll()
                        .Where(a => a.VeiculoId == viagem.VeiculoId.Value
                                    && a.DataHora.HasValue
                                    && a.DataHora.Value >= viagem.DataInicial.Value
                                    && a.DataHora.Value <= viagem.DataFinal.Value.AddDays(1))
                        .ToList();

                    if (abastecimentos.Any())
                    {
                        litrosGastos = abastecimentos.Sum(a => a.Litros ?? 0);
                    }
                }

                // Se não encontrou abastecimentos, estima baseado no custo de combustível
                // Usa preço médio do combustível se disponível
                if (litrosGastos == 0 && (viagem.CustoCombustivel ?? 0) > 0)
                {
                    // Busca preço médio do combustível do veículo
                    double precoMedioCombustivel = 0;

                    if (viagem.Veiculo != null && viagem.Veiculo.CombustivelId.HasValue)
                    {
                        var mediaCombustivel = _unitOfWork.MediaCombustivel
                            .GetAll()
                            .Where(m => m.CombustivelId == viagem.Veiculo.CombustivelId.Value)
                            .OrderByDescending(m => m.Ano)
                            .ThenByDescending(m => m.Mes)
                            .FirstOrDefault();

                        if (mediaCombustivel != null)
                        {
                            precoMedioCombustivel = mediaCombustivel.PrecoMedio;
                        }
                    }

                    // Se tem preço médio, calcula litros estimados
                    if (precoMedioCombustivel > 0)
                    {
                        litrosGastos = (viagem.CustoCombustivel ?? 0) / precoMedioCombustivel;
                    }
                }

                // Calcula consumo (km/l)
                double consumo = 0;
                string consumoFormatado = "-";
                if (kmPercorrido > 0 && litrosGastos > 0)
                {
                    consumo = kmPercorrido / litrosGastos;
                    consumoFormatado = $"{consumo:F2} km/l";
                }

                // Custos individuais
                double custoMotorista = viagem.CustoMotorista ?? 0;
                double custoVeiculo = viagem.CustoVeiculo ?? 0;
                double custoCombustivel = viagem.CustoCombustivel ?? 0;
                double custoOperador = viagem.CustoOperador ?? 0;
                double custoLavador = viagem.CustoLavador ?? 0;

                // Custo total
                double custoTotal = custoMotorista + custoVeiculo + custoCombustivel + custoOperador + custoLavador;

                // Informações da viagem
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
                        LitrosGastos = litrosGastos,
                        Consumo = consumo,
                        ConsumoFormatado = consumoFormatado,
                        TipoCombustivel = tipoCombustivel,

                        // Custos
                        CustoMotorista = custoMotorista,
                        CustoVeiculo = custoVeiculo,
                        CustoCombustivel = custoCombustivel,
                        CustoOperador = custoOperador,
                        CustoLavador = custoLavador,
                        CustoTotal = custoTotal
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
