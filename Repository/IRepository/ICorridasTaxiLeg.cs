using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository.IRepository
    {
    public interface ICorridasTaxiLegRepository : IRepository<CorridasTaxiLeg>
        {
        IEnumerable<SelectListItem> GetCorridasTaxiLegListForDropDown();

        void Update(CorridasTaxiLeg corridasTaxiLeg);

        bool ExisteCorridaNoMesAno(int ano, int mes);
        }
    }


