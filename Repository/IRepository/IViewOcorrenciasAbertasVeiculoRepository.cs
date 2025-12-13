using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using FrotiX.Models;

namespace FrotiX.Repository.IRepository
{
    public interface IViewOcorrenciasAbertasVeiculoRepository
    {
        IEnumerable<ViewOcorrenciasAbertasVeiculo> GetAll(Expression<Func<ViewOcorrenciasAbertasVeiculo, bool>>? filter = null, string? includeProperties = null);
        ViewOcorrenciasAbertasVeiculo? GetFirstOrDefault(Expression<Func<ViewOcorrenciasAbertasVeiculo, bool>> filter, string? includeProperties = null);
    }
}
