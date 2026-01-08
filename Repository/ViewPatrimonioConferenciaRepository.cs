using FrotiX.Data;
using FrotiX.Models.Views;
using FrotiX.Repository.IRepository;

namespace FrotiX.Repository
{
    public class ViewPatrimonioConferenciaRepository :Repository<ViewPatrimonioConferencia>, IViewPatrimonioConferenciaRepository
    {
        private new readonly FrotiXDbContext _db;

        public ViewPatrimonioConferenciaRepository(FrotiXDbContext db) : base(db)
        {
            _db = db;
        }

        // GetAll e GetFirstOrDefault já estão implementados na classe base Repository<T>
        // Métodos adicionais específicos podem ser implementados aqui se necessário
    }
}
