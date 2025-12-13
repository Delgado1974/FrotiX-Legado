using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository.IRepository
    {
    public interface IMarcaVeiculoRepository : IRepository<MarcaVeiculo>
        {

        IEnumerable<SelectListItem> GetMarcaVeiculoListForDropDown();

        void Update(MarcaVeiculo marcaVeiculo);

        }
    }


