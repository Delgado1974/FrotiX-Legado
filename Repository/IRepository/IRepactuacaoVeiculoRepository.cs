using System;
using System.Collections.Generic;
using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository.IRepository
{
    public interface IRepactuacaoVeiculoRepository : IRepository<RepactuacaoVeiculo>
    {
        IEnumerable<SelectListItem> GetRepactuacaoVeiculoListForDropDown();

        void Update(RepactuacaoVeiculo repactuacaoVeiculo);
    }
}
