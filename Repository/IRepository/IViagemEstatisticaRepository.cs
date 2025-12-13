using FrotiX.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FrotiX.Repository.IRepository
{
    public interface IViagemEstatisticaRepository : IRepository<ViagemEstatistica>
    {
        Task<ViagemEstatistica> ObterPorDataAsync(DateTime dataReferencia);

        Task<List<ViagemEstatistica>> ObterPorPeriodoAsync(DateTime dataInicio , DateTime dataFim);

        Task<bool> ExisteParaDataAsync(DateTime dataReferencia);

        Task<int> RemoverEstatisticasAntigasAsync(int diasParaManter = 365);

        Task<List<ViagemEstatistica>> ObterEstatisticasDesatualizadasAsync();
    }
}
