using System;
using System.Collections.Generic;
using System.Linq;
using FrotiX.Repository.IRepository;

namespace FrotiX.Services
    {
    /// <summary>
    /// Serviço de Glosa (v2):
    /// - Resumo consolidado por NumItem/Descricao, COM cálculo correto do contrato (Qtd * VlrUnit) independente de O.S.
    /// - Glosa somada por item (somatório de todas as O.S.)
    /// - Ordenação por NumItem
    /// - Detalhes exibem DataDevolucao como "Retorno"
    /// </summary>
    public class GlosaService : IGlosaService
        {
        private readonly IUnitOfWork _uow;

        // classe de trabalho para agregação
        private class ResumoWork
            {
            public int? NumItem { get; set; }
            public string Descricao { get; set; }
            public int Quantidade { get; set; }
            public decimal ValorUnitario { get; set; }
            public decimal ValorGlosa { get; set; }
            }

        public GlosaService(IUnitOfWork uow)
            {
            _uow = uow;
            }

        public IEnumerable<GlosaResumoItemDto> ListarResumo(Guid contratoId, int mes, int ano)
            {
            // Base: uma linha por O.S. -> vamos consolidar por item mantendo Qtd/VlrUnit do contrato e SOMANDO apenas a Glosa
            var baseQuery = _uow.ViewGlosa.GetAllReducedIQueryable(
                selector: x => new ResumoWork
                    {
                    NumItem = x.NumItem,
                    Descricao = x.Descricao,
                    Quantidade = x.Quantidade ?? 0, // do item do contrato
                    ValorUnitario = (decimal)(x.ValorUnitario ?? 0d), // do item do contrato
                    ValorGlosa = x.ValorGlosa, // por O.S.
                    },
                filter: x =>
                    x.ContratoId == contratoId
                    && x.DataSolicitacaoRaw.Month == mes
                    && x.DataSolicitacaoRaw.Year == ano,
                asNoTracking: true
            );

            var query = baseQuery
                .GroupBy(g => new { g.NumItem, g.Descricao })
                .Select(s => new GlosaResumoItemDto
                    {
                    NumItem = s.Key.NumItem,
                    Descricao = s.Key.Descricao,
                    Quantidade = s.Max(i => (int?)i.Quantidade),
                    ValorUnitario = s.Max(i => i.ValorUnitario),
                    // Preço Total do contrato = Qtd * VlrUnit (não depende da qtde de O.S.)
                    PrecoTotalMensal = (s.Max(i => i.Quantidade) * s.Max(i => i.ValorUnitario)),
                    PrecoDiario = (s.Max(i => i.ValorUnitario) / 30m),
                    Glosa = s.Sum(i => i.ValorGlosa),
                    ValorParaAteste =
                        (s.Max(i => i.Quantidade) * s.Max(i => i.ValorUnitario))
                        - s.Sum(i => i.ValorGlosa),
                    })
                .OrderBy(x => x.NumItem);

            return query.ToList();
            }

        public IEnumerable<GlosaDetalheItemDto> ListarDetalhes(Guid contratoId, int mes, int ano)
            {
            var query = _uow.ViewGlosa.GetAllReducedIQueryable(
                selector: x => new GlosaDetalheItemDto
                    {
                    NumItem = x.NumItem,
                    Descricao = x.Descricao,
                    Placa = x.Placa,
                    DataSolicitacao = x.DataSolicitacao,
                    DataDisponibilidade = x.DataDisponibilidade,
                    DataRecolhimento = x.DataRecolhimento,
                    DataDevolucao = x.DataDevolucao,
                    DiasGlosa = x.DiasGlosa,
                    },
                filter: x =>
                    x.ContratoId == contratoId
                    && x.DataSolicitacaoRaw.Month == mes
                    && x.DataSolicitacaoRaw.Year == ano,
                asNoTracking: true
            );

            return query.ToList();
            }

        // Implementação explícita (protege contra ambiguidades de namespace)
        IEnumerable<GlosaDetalheItemDto> IGlosaService.ListarDetalhes(
            Guid contratoId,
            int mes,
            int ano
        ) => ListarDetalhes(contratoId, mes, ano);
        }
    }


