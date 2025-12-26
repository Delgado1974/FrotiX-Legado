using FrotiX.Models;

namespace FrotiX.Repository.IRepository
{
    public interface IEncarregadoRepository : IRepository<Encarregado>
    {
        void Update(Encarregado encarregado);
    }
}
