using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;

namespace FrotiX.Repository.IRepository
    {
    public interface IViewVeiculosManutencaoReservaRepository : IRepository<ViewVeiculosManutencaoReserva>
        {
        IEnumerable<SelectListItem> GetViewVeiculosManutencaoReservaListForDropDown();

        void Update(ViewVeiculosManutencaoReserva viewVeiculosManutencaoReserva);
        }
    }

