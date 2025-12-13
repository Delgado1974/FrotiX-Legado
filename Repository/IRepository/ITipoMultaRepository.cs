using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository.IRepository
    {
    public interface ITipoMultaRepository : IRepository<TipoMulta>
        {

        IEnumerable<SelectListItem> GetTipoMultaListForDropDown();

        void Update(TipoMulta tipomulta);

        }
    }


