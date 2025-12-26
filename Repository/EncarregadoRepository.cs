using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;

namespace FrotiX.Repository
{
    public class EncarregadoRepository : Repository<Encarregado>, IEncarregadoRepository
    {
        private readonly FrotiXDbContext _db;

        public EncarregadoRepository(FrotiXDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(Encarregado encarregado)
        {
            _db.Encarregado.Update(encarregado);
            _db.SaveChanges();
        }
    }
}
