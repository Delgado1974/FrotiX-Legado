using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.EntityFrameworkCore;

namespace FrotiX.Services
{
    public class ViagemEstatisticaService
    {
        private readonly FrotiXDbContext _context;
        private readonly IViagemEstatisticaRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public ViagemEstatisticaService(
            FrotiXDbContext context ,
            IViagemEstatisticaRepository repository ,
            IUnitOfWork unitOfWork)
        {
            _context = context;
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// Obtém ou calcula estatísticas para a data especificada
        /// SEMPRE recalcula e atualiza se o registro já existe
        /// </summary>
        public async Task<ViagemEstatistica> ObterEstatisticasAsync(DateTime data)
        {
            try
            {
                var dataReferencia = data.Date;

                // Tenta buscar estatísticas já calculadas
                var estatisticaExistente = await _repository.ObterPorDataAsync(dataReferencia);

                // Calcula novas estatísticas
                var novaEstatistica = await CalcularEstatisticasAsync(dataReferencia);

                // Se existe, SEMPRE faz UPDATE
                if (estatisticaExistente != null)
                {
                    AtualizarEstatistica(estatisticaExistente , novaEstatistica);
                    await _context.SaveChangesAsync();
                    return estatisticaExistente;
                }
                else
                {
                    // Se não existe, insere novo registro
                    novaEstatistica.DataCriacao = DateTime.Now;
                    await _repository.AddAsync(novaEstatistica);
                    await _context.SaveChangesAsync();
                    return novaEstatistica;
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Erro ao obter estatísticas: {ex.Message}" , ex);
            }
        }

        /// <summary>
        /// ✅ CORREÇÃO CRÍTICA: Obtém estatísticas de um período APENAS LENDO DO CACHE
        /// Não recalcula, apenas lê da tabela ViagemEstatistica
        /// </summary>
        public async Task<List<ViagemEstatistica>> ObterEstatisticasPeriodoAsync(DateTime dataInicio , DateTime dataFim)
        {
            try
            {
                // ✅ LEITURA DIRETA DO CACHE - NÃO RECALCULA
                var estatisticas = await _context.ViagemEstatistica
                    .Where(e => e.DataReferencia >= dataInicio.Date && e.DataReferencia <= dataFim.Date)
                    .OrderBy(e => e.DataReferencia)
                    .AsNoTracking()
                    .ToListAsync();

                return estatisticas;
            }
            catch (Exception ex)
            {
                throw new Exception($"Erro ao obter estatísticas do período: {ex.Message}" , ex);
            }
        }

        /// <summary>
        /// Calcula estatísticas em tempo real
        /// </summary>
        private async Task<ViagemEstatistica> CalcularEstatisticasAsync(DateTime dataReferencia)
        {
            var estatistica = new ViagemEstatistica
            {
                DataReferencia = dataReferencia
            };

            // Busca todas as viagens do dia com dados relacionados
            var viagens = await _context.Viagem
                .Include(v => v.Motorista)
                .Include(v => v.Veiculo)
                .Include(v => v.Requisitante)
                .Include(v => v.SetorSolicitante)
                .Where(v => v.DataInicial.HasValue && v.DataInicial.Value.Date == dataReferencia)
                .ToListAsync();

            // ========================================
            // ESTATÍSTICAS GERAIS
            // ========================================
            estatistica.TotalViagens = viagens.Count;
            estatistica.ViagensFinalizadas = viagens.Count(v => v.Status == "Realizada");
            estatistica.ViagensEmAndamento = viagens.Count(v => v.Status == "Aberta");
            estatistica.ViagensAgendadas = viagens.Count(v => v.Status == "Agendada");
            estatistica.ViagensCanceladas = viagens.Count(v => v.Status == "Cancelada");

            // ========================================
            // CUSTOS GERAIS
            // ========================================
            estatistica.CustoTotal = (decimal)viagens.Sum(v =>
                (v.CustoVeiculo ?? 0) +
                (v.CustoMotorista ?? 0) +
                (v.CustoOperador ?? 0) +
                (v.CustoLavador ?? 0) +
                (v.CustoCombustivel ?? 0));

            estatistica.CustoMedioPorViagem = estatistica.TotalViagens > 0
                ? estatistica.CustoTotal / estatistica.TotalViagens
                : 0;

            estatistica.CustoVeiculo = (decimal)viagens.Sum(v => v.CustoVeiculo ?? 0);
            estatistica.CustoMotorista = (decimal)viagens.Sum(v => v.CustoMotorista ?? 0);
            estatistica.CustoOperador = (decimal)viagens.Sum(v => v.CustoOperador ?? 0);
            estatistica.CustoLavador = (decimal)viagens.Sum(v => v.CustoLavador ?? 0);
            estatistica.CustoCombustivel = (decimal)viagens.Sum(v => v.CustoCombustivel ?? 0);

            // ========================================
            // QUILOMETRAGEM
            // ========================================
            var viagensComKm = viagens
                .Where(v => v.KmFinal.HasValue &&
                           v.KmInicial.HasValue &&
                           v.Status == "Realizada" &&
                           v.KmFinal > 0)
                .ToList();

            if (viagensComKm.Any())
            {
                estatistica.QuilometragemTotal = viagensComKm.Sum(v =>
                    (v.KmFinal ?? 0) - (v.KmInicial ?? 0));
                estatistica.QuilometragemMedia = estatistica.QuilometragemTotal / viagensComKm.Count;
            }

            // ========================================
            // VIAGENS POR STATUS (JSON)
            // ========================================
            var viagensPorStatus = viagens
                .GroupBy(v => v.Status)
                .Select(g => new { status = g.Key , quantidade = g.Count() })
                .ToList();
            estatistica.ViagensPorStatusJson = JsonSerializer.Serialize(viagensPorStatus);

            // ========================================
            // VIAGENS POR MOTORISTA - TOP 10 (JSON)
            // ========================================
            var viagensPorMotorista = viagens
                .Where(v => v.Motorista != null)
                .GroupBy(v => v.Motorista.Nome)
                .Select(g => new { motorista = g.Key , quantidade = g.Count() })
                .OrderByDescending(x => x.quantidade)
                .Take(10)
                .ToList();
            estatistica.ViagensPorMotoristaJson = JsonSerializer.Serialize(viagensPorMotorista);

            // ========================================
            // VIAGENS POR VEÍCULO - TOP 10 (JSON)
            // ========================================
            var viagensPorVeiculo = viagens
                .Where(v => v.Veiculo != null)
                .GroupBy(v => v.Veiculo.Placa)
                .Select(g => new { veiculo = g.Key , quantidade = g.Count() })
                .OrderByDescending(x => x.quantidade)
                .Take(10)
                .ToList();
            estatistica.ViagensPorVeiculoJson = JsonSerializer.Serialize(viagensPorVeiculo);

            // ========================================
            // VIAGENS POR FINALIDADE (JSON)
            // ========================================
            var viagensPorFinalidade = viagens
                .Where(v => !string.IsNullOrEmpty(v.Finalidade))
                .GroupBy(v => v.Finalidade)
                .Select(g => new { finalidade = g.Key , quantidade = g.Count() })
                .OrderByDescending(x => x.quantidade)
                .ToList();
            estatistica.ViagensPorFinalidadeJson = JsonSerializer.Serialize(viagensPorFinalidade);

            // ========================================
            // VIAGENS POR REQUISITANTE - TOP 10 (JSON)
            // ========================================
            var viagensPorRequisitante = viagens
                .Where(v => v.Requisitante != null)
                .GroupBy(v => v.Requisitante.Nome)
                .Select(g => new { requisitante = g.Key , quantidade = g.Count() })
                .OrderByDescending(x => x.quantidade)
                .Take(10)
                .ToList();
            estatistica.ViagensPorRequisitanteJson = JsonSerializer.Serialize(viagensPorRequisitante);

            // ========================================
            // VIAGENS POR SETOR - TOP 10 (JSON)
            // ========================================
            var viagensPorSetor = viagens
                .Where(v => v.SetorSolicitante != null)
                .GroupBy(v => v.SetorSolicitante.Nome)
                .Select(g => new { setor = g.Key , quantidade = g.Count() })
                .OrderByDescending(x => x.quantidade)
                .Take(10)
                .ToList();
            estatistica.ViagensPorSetorJson = JsonSerializer.Serialize(viagensPorSetor);

            // ========================================
            // CUSTOS POR MOTORISTA - TOP 10 (JSON)
            // ========================================
            var custosPorMotorista = viagens
                .Where(v => v.Motorista != null)
                .GroupBy(v => v.Motorista.Nome)
                .Select(g => new
                {
                    motorista = g.Key ,
                    custoTotal = g.Sum(v => (v.CustoMotorista ?? 0))
                })
                .OrderByDescending(x => x.custoTotal)
                .Take(10)
                .ToList();
            estatistica.CustosPorMotoristaJson = JsonSerializer.Serialize(custosPorMotorista);

            // ========================================
            // CUSTOS POR VEÍCULO - TOP 10 (JSON)
            // ========================================
            var custosPorVeiculo = viagens
                .Where(v => v.Veiculo != null)
                .GroupBy(v => v.Veiculo.Placa)
                .Select(g => new
                {
                    veiculo = g.Key ,
                    custoTotal = g.Sum(v => (v.CustoVeiculo ?? 0))
                })
                .OrderByDescending(x => x.custoTotal)
                .Take(10)
                .ToList();
            estatistica.CustosPorVeiculoJson = JsonSerializer.Serialize(custosPorVeiculo);

            // ========================================
            // KM POR VEÍCULO - TOP 10 (JSON)
            // ========================================
            var kmPorVeiculo = viagens
                .Where(v => v.Veiculo != null &&
                           v.KmFinal.HasValue &&
                           v.KmInicial.HasValue &&
                           v.Status == "Realizada" &&
                           v.KmFinal > 0)
                .GroupBy(v => v.Veiculo.Placa)
                .Select(g => new
                {
                    veiculo = g.Key ,
                    kmTotal = g.Sum(v => (v.KmFinal ?? 0) - (v.KmInicial ?? 0))
                })
                .OrderByDescending(x => x.kmTotal)
                .Take(10)
                .ToList();
            estatistica.KmPorVeiculoJson = JsonSerializer.Serialize(kmPorVeiculo);

            // ========================================
            // CUSTOS POR TIPO (JSON)
            // ========================================
            var custosPorTipo = new List<object>
            {
                new { tipo = "Veículo", custo = estatistica.CustoVeiculo },
                new { tipo = "Motorista", custo = estatistica.CustoMotorista },
                new { tipo = "Operador", custo = estatistica.CustoOperador },
                new { tipo = "Lavador", custo = estatistica.CustoLavador },
                new { tipo = "Combustível", custo = estatistica.CustoCombustivel }
            };
            estatistica.CustosPorTipoJson = JsonSerializer.Serialize(custosPorTipo);

            return estatistica;
        }

        /// <summary>
        /// Atualiza estatística existente com novos dados
        /// </summary>
        private void AtualizarEstatistica(ViagemEstatistica existente , ViagemEstatistica nova)
        {
            existente.TotalViagens = nova.TotalViagens;
            existente.ViagensFinalizadas = nova.ViagensFinalizadas;
            existente.ViagensEmAndamento = nova.ViagensEmAndamento;
            existente.ViagensAgendadas = nova.ViagensAgendadas;
            existente.ViagensCanceladas = nova.ViagensCanceladas;
            existente.CustoTotal = nova.CustoTotal;
            existente.CustoMedioPorViagem = nova.CustoMedioPorViagem;
            existente.CustoVeiculo = nova.CustoVeiculo;
            existente.CustoMotorista = nova.CustoMotorista;
            existente.CustoOperador = nova.CustoOperador;
            existente.CustoLavador = nova.CustoLavador;
            existente.CustoCombustivel = nova.CustoCombustivel;
            existente.QuilometragemTotal = nova.QuilometragemTotal;
            existente.QuilometragemMedia = nova.QuilometragemMedia;
            existente.ViagensPorStatusJson = nova.ViagensPorStatusJson;
            existente.ViagensPorMotoristaJson = nova.ViagensPorMotoristaJson;
            existente.ViagensPorVeiculoJson = nova.ViagensPorVeiculoJson;
            existente.ViagensPorFinalidadeJson = nova.ViagensPorFinalidadeJson;
            existente.ViagensPorRequisitanteJson = nova.ViagensPorRequisitanteJson;
            existente.ViagensPorSetorJson = nova.ViagensPorSetorJson;
            existente.CustosPorMotoristaJson = nova.CustosPorMotoristaJson;
            existente.CustosPorVeiculoJson = nova.CustosPorVeiculoJson;
            existente.KmPorVeiculoJson = nova.KmPorVeiculoJson;
            existente.CustosPorTipoJson = nova.CustosPorTipoJson;
            existente.DataAtualizacao = DateTime.Now;
        }

        /// <summary>
        /// Força recálculo das estatísticas (ignora cache)
        /// </summary>
        public async Task<ViagemEstatistica> RecalcularEstatisticasAsync(DateTime data)
        {
            try
            {
                var dataReferencia = data.Date;

                // Calcula novas estatísticas
                var novaEstatistica = await CalcularEstatisticasAsync(dataReferencia);

                // Busca estatística existente
                var estatisticaExistente = await _repository.ObterPorDataAsync(dataReferencia);

                if (estatisticaExistente != null)
                {
                    AtualizarEstatistica(estatisticaExistente , novaEstatistica);
                    await _context.SaveChangesAsync();
                    return estatisticaExistente;
                }
                else
                {
                    novaEstatistica.DataCriacao = DateTime.Now;
                    await _repository.AddAsync(novaEstatistica);
                    await _context.SaveChangesAsync();
                    return novaEstatistica;
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Erro ao recalcular estatísticas: {ex.Message}" , ex);
            }
        }

        /// <summary>
        /// Atualiza estatísticas de um dia específico (usado após criar/editar/deletar viagem)
        /// </summary>
        public async Task AtualizarEstatisticasDiaAsync(DateTime data)
        {
            try
            {
                await RecalcularEstatisticasAsync(data);
            }
            catch (Exception ex)
            {
                throw new Exception($"Erro ao atualizar estatísticas do dia: {ex.Message}" , ex);
            }
        }
    }
}
