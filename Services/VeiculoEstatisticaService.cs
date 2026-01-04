using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Data;
using FrotiX.Models.DTO;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace FrotiX.Services
{
    /// <summary>
    /// Serviço para calcular estatísticas de viagens por veículo
    /// Usado pela IA evolutiva para calibrar alertas de validação
    /// </summary>
    public class VeiculoEstatisticaService
    {
        private readonly FrotiXDbContext _context;
        private readonly IMemoryCache _cache;

        // Quantidade de viagens a considerar no histórico
        private const int QUANTIDADE_VIAGENS_HISTORICO = 100;

        // Tempo de cache das estatísticas (10 minutos)
        private static readonly TimeSpan CACHE_DURATION = TimeSpan.FromMinutes(10);

        public VeiculoEstatisticaService(FrotiXDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        /// <summary>
        /// Obtém estatísticas de um veículo (com cache)
        /// </summary>
        public async Task<EstatisticaVeiculoDto> ObterEstatisticasAsync(Guid veiculoId)
        {
            try
            {
                var cacheKey = $"VeiculoEstatistica_{veiculoId}";

                // Tenta buscar do cache
                if (_cache.TryGetValue(cacheKey, out EstatisticaVeiculoDto cached))
                {
                    return cached;
                }

                // Calcula estatísticas
                var estatisticas = await CalcularEstatisticasAsync(veiculoId);

                // Armazena no cache
                if (estatisticas != null)
                {
                    _cache.Set(cacheKey, estatisticas, CACHE_DURATION);
                }

                return estatisticas;
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("VeiculoEstatisticaService.cs", "ObterEstatisticasAsync", ex);
                return CriarEstatisticasVazias(veiculoId);
            }
        }

        /// <summary>
        /// Calcula estatísticas baseadas no histórico de viagens finalizadas
        /// </summary>
        private async Task<EstatisticaVeiculoDto> CalcularEstatisticasAsync(Guid veiculoId)
        {
            // Buscar informações do veículo (simplificado para evitar problemas com EF Core)
            var veiculoBase = await _context.Veiculo
                .AsNoTracking()
                .Where(v => v.VeiculoId == veiculoId)
                .FirstOrDefaultAsync();

            if (veiculoBase == null)
            {
                return CriarEstatisticasVazias(veiculoId);
            }

            // Montar descrição a partir de Marca e Modelo (se disponíveis)
            string descricao = "";
            if (veiculoBase.MarcaId.HasValue)
            {
                var marca = await _context.MarcaVeiculo.FindAsync(veiculoBase.MarcaId.Value);
                if (marca != null) descricao = marca.DescricaoMarca ?? "";
            }
            if (veiculoBase.ModeloId.HasValue)
            {
                var modelo = await _context.ModeloVeiculo.FindAsync(veiculoBase.ModeloId.Value);
                if (modelo != null) descricao += " " + (modelo.DescricaoModelo ?? "");
            }
            descricao = descricao.Trim();

            var veiculo = new { veiculoBase.VeiculoId, veiculoBase.Placa, Descricao = descricao };

            // Buscar últimas N viagens finalizadas com km válido
            var viagens = await _context.Viagem
                .AsNoTracking()
                .Where(v =>
                    v.VeiculoId == veiculoId &&
                    v.Status == "Realizada" &&
                    v.KmInicial.HasValue && v.KmInicial > 0 &&
                    v.KmFinal.HasValue && v.KmFinal > 0 &&
                    v.KmFinal > v.KmInicial &&
                    v.DataInicial.HasValue &&
                    v.DataFinal.HasValue)
                .OrderByDescending(v => v.DataFinal)
                .Take(QUANTIDADE_VIAGENS_HISTORICO)
                .Select(v => new ViagemDados
                {
                    KmRodado = v.KmFinal.Value - v.KmInicial.Value,
                    DuracaoMinutos = CalcularDuracaoMinutos(v.DataInicial, v.HoraInicio, v.DataFinal, v.HoraFim),
                    DataFinal = v.DataFinal.Value
                })
                .ToListAsync();

            // Filtrar viagens com duração válida (entre 1 minuto e 24 horas)
            viagens = viagens
                .Where(v => v.DuracaoMinutos >= 1 && v.DuracaoMinutos <= 1440)
                .ToList();

            if (!viagens.Any())
            {
                return new EstatisticaVeiculoDto
                {
                    VeiculoId = veiculoId,
                    Placa = veiculo.Placa,
                    Descricao = veiculo.Descricao,
                    TotalViagens = 0
                };
            }

            // Calcular estatísticas de quilometragem
            var kms = viagens.Select(v => (double)v.KmRodado).OrderBy(k => k).ToList();
            var duracoes = viagens.Select(v => (double)v.DuracaoMinutos).OrderBy(d => d).ToList();

            var estatisticas = new EstatisticaVeiculoDto
            {
                VeiculoId = veiculoId,
                Placa = veiculo.Placa,
                Descricao = veiculo.Descricao,
                TotalViagens = viagens.Count,

                // Estatísticas de KM
                KmMedio = kms.Average(),
                KmMediano = CalcularMediana(kms),
                KmDesvioPadrao = CalcularDesvioPadrao(kms),
                KmMinimo = (int)kms.Min(),
                KmMaximo = (int)kms.Max(),
                KmPercentil95 = CalcularPercentil(kms, 0.95),
                KmPercentil99 = CalcularPercentil(kms, 0.99),

                // Estatísticas de duração
                DuracaoMediaMinutos = duracoes.Average(),
                DuracaoMedianaMinutos = CalcularMediana(duracoes),
                DuracaoDesvioPadraoMinutos = CalcularDesvioPadrao(duracoes),
                DuracaoMinimaMinutos = (int)duracoes.Min(),
                DuracaoMaximaMinutos = (int)duracoes.Max(),
                DuracaoPercentil95Minutos = CalcularPercentil(duracoes, 0.95),

                // Metadados
                DataViagemMaisAntiga = viagens.Min(v => v.DataFinal),
                DataViagemMaisRecente = viagens.Max(v => v.DataFinal)
            };

            return estatisticas;
        }

        /// <summary>
        /// Calcula a duração em minutos entre data/hora inicial e final
        /// </summary>
        private static int CalcularDuracaoMinutos(DateTime? dataInicial, DateTime? horaInicio, DateTime? dataFinal, DateTime? horaFim)
        {
            if (!dataInicial.HasValue || !dataFinal.HasValue)
                return 0;

            var inicio = dataInicial.Value.Date;
            var fim = dataFinal.Value.Date;

            // Adicionar hora se disponível
            if (horaInicio.HasValue)
            {
                inicio = inicio.Add(horaInicio.Value.TimeOfDay);
            }
            if (horaFim.HasValue)
            {
                fim = fim.Add(horaFim.Value.TimeOfDay);
            }

            var diferenca = fim - inicio;
            return (int)diferenca.TotalMinutes;
        }

        /// <summary>
        /// Calcula a mediana de uma lista ordenada
        /// </summary>
        private static double CalcularMediana(List<double> valores)
        {
            if (!valores.Any()) return 0;

            int count = valores.Count;
            if (count % 2 == 0)
            {
                return (valores[count / 2 - 1] + valores[count / 2]) / 2.0;
            }
            return valores[count / 2];
        }

        /// <summary>
        /// Calcula o desvio padrão
        /// </summary>
        private static double CalcularDesvioPadrao(List<double> valores)
        {
            if (valores.Count < 2) return 0;

            double media = valores.Average();
            double somaQuadrados = valores.Sum(v => Math.Pow(v - media, 2));
            return Math.Sqrt(somaQuadrados / (valores.Count - 1));
        }

        /// <summary>
        /// Calcula um percentil específico
        /// </summary>
        private static double CalcularPercentil(List<double> valores, double percentil)
        {
            if (!valores.Any()) return 0;

            int index = (int)Math.Ceiling(percentil * valores.Count) - 1;
            index = Math.Max(0, Math.Min(index, valores.Count - 1));
            return valores[index];
        }

        /// <summary>
        /// Cria objeto de estatísticas vazio para veículos sem histórico
        /// </summary>
        private EstatisticaVeiculoDto CriarEstatisticasVazias(Guid veiculoId)
        {
            return new EstatisticaVeiculoDto
            {
                VeiculoId = veiculoId,
                TotalViagens = 0
            };
        }

        /// <summary>
        /// Invalida o cache de um veículo (chamar após finalizar viagem)
        /// </summary>
        public void InvalidarCache(Guid veiculoId)
        {
            var cacheKey = $"VeiculoEstatistica_{veiculoId}";
            _cache.Remove(cacheKey);
        }

        /// <summary>
        /// Classe interna para armazenar dados de viagem
        /// </summary>
        private class ViagemDados
        {
            public int KmRodado { get; set; }
            public int DuracaoMinutos { get; set; }
            public DateTime DataFinal { get; set; }
        }
    }
}
