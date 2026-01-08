using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;

namespace FrotiX.Repository
{
    public class ViewOcorrenciasAbertasVeiculoRepository : IViewOcorrenciasAbertasVeiculoRepository
    {
        private new readonly FrotiXDbContext _db;

        public ViewOcorrenciasAbertasVeiculoRepository(FrotiXDbContext db)
        {
            _db = db;
        }

        public IEnumerable<ViewOcorrenciasAbertasVeiculo> GetAll(Expression<Func<ViewOcorrenciasAbertasVeiculo , bool>>? filter = null , string? includeProperties = null)
        {
            IQueryable<ViewOcorrenciasAbertasVeiculo> query = _db.ViewOcorrenciasAbertasVeiculo;

            if (filter != null)
                query = query.Where(filter);

            return query.ToList();
        }

        public ViewOcorrenciasAbertasVeiculo? GetFirstOrDefault(Expression<Func<ViewOcorrenciasAbertasVeiculo , bool>> filter , string? includeProperties = null)
        {
            return _db.ViewOcorrenciasAbertasVeiculo.Where(filter).FirstOrDefault();
        }
    }
}
