using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Models.Views;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository.IRepository
    {
    public interface IViewMotoristasViagemRepository : IRepository<ViewMotoristasViagem>
        {

        IEnumerable<SelectListItem> GetViewMotoristasViagemListForDropDown();

        void Update(ViewMotoristasViagem viewMotoristasViagem);

        }
    }


