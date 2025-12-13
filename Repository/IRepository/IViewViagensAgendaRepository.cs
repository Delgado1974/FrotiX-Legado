using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;
using NPOI.SS.Formula.Functions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FrotiX.Repository.IRepository
    {
    public interface IViewViagensAgendaRepository : IRepository<ViewViagensAgenda>
        {

        IEnumerable<SelectListItem> GetViewViagensAgendaListForDropDown();

        void Update(ViewViagensAgenda viewViagensAgenda);

        }
    }


