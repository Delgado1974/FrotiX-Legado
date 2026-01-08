using FrotiX.Models;

namespace FrotiX.Repository.IRepository
{
    public interface IEncarregadoContratoRepository : IRepository<EncarregadoContrato>
    {
        new void Update(EncarregadoContrato encarregadoContrato);
    }
}
