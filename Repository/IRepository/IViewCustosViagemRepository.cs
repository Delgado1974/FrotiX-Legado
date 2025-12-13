using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository.IRepository
    {
    public interface IViewCustosViagemRepository : IRepository<ViewCustosViagem>
        {

        IEnumerable<SelectListItem> GetViewCustosViagemListForDropDown();

        void Update(ViewCustosViagem ViewCustosViagem);

        }
    }


