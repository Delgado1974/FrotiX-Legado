using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;

namespace FrotiX.Repository.IRepository
    {
    public interface IViewVeiculosManutencaoRepository : IRepository<ViewVeiculosManutencao>
        {
        IEnumerable<SelectListItem> GetViewVeiculosManutencaoListForDropDown();

        void Update(ViewVeiculosManutencao viewVeiculosManutencao);
        }
    }

