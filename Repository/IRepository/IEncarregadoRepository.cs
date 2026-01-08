using FrotiX.Models;

namespace FrotiX.Repository.IRepository
{
    public interface IEncarregadoRepository : IRepository<Encarregado>
    {
        new void Update(Encarregado encarregado);
    }
}
