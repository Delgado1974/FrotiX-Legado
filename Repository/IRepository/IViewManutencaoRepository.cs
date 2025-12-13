using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository.IRepository
    {
    public interface IViewManutencaoRepository : IRepository<ViewManutencao>
        {

        IEnumerable<SelectListItem> GetViewManutencaoListForDropDown();

        void Update(ViewManutencao viewManutencao);

        }
    }


