using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository.IRepository
    {
    public interface IOperadorContratoRepository : IRepository<OperadorContrato>
        {

        IEnumerable<SelectListItem> GetOperadorContratoListForDropDown();

        void Update(OperadorContrato OperadorContrato);

        }
    }


