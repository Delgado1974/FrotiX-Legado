using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository.IRepository
    {
    public interface IViewPendenciasManutencaoRepository : IRepository<ViewPendenciasManutencao>
        {

        IEnumerable<SelectListItem> GetViewPendenciasManutencaoListForDropDown();

        void Update(ViewPendenciasManutencao viewPendenciasManutencao);

        }
    }


