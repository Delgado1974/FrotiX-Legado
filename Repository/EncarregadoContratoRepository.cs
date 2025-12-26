using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;

namespace FrotiX.Repository
{
    public class EncarregadoContratoRepository : Repository<EncarregadoContrato>, IEncarregadoContratoRepository
    {
        private readonly FrotiXDbContext _db;

        public EncarregadoContratoRepository(FrotiXDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(EncarregadoContrato encarregadoContrato)
        {
            _db.EncarregadoContrato.Update(encarregadoContrato);
            _db.SaveChanges();
        }
    }
}
