using FrotiX.Models;

namespace FrotiX.Repository.IRepository
{
    public interface IEncarregadoContratoRepository : IRepository<EncarregadoContrato>
    {
        void Update(EncarregadoContrato encarregadoContrato);
    }
}
