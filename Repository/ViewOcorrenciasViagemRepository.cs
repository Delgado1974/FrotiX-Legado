using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;

namespace FrotiX.Repository
{
    public class ViewOcorrenciasViagemRepository : IViewOcorrenciasViagemRepository
    {
        private new readonly FrotiXDbContext _db;

        public ViewOcorrenciasViagemRepository(FrotiXDbContext db)
        {
            _db = db;
        }

        public IEnumerable<ViewOcorrenciasViagem> GetAll(Expression<Func<ViewOcorrenciasViagem , bool>>? filter = null , string? includeProperties = null)
        {
            IQueryable<ViewOcorrenciasViagem> query = _db.ViewOcorrenciasViagem;

            if (filter != null)
                query = query.Where(filter);

            return query.ToList();
        }

        public ViewOcorrenciasViagem? GetFirstOrDefault(Expression<Func<ViewOcorrenciasViagem , bool>> filter , string? includeProperties = null)
        {
            return _db.ViewOcorrenciasViagem.Where(filter).FirstOrDefault();
        }
    }
}
