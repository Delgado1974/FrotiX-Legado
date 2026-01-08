using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository
    {
    public class ViewRequisitantesRepository : Repository<ViewRequisitantes>, IViewRequisitantesRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewRequisitantesRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewRequisitantesListForDropDown()
            {
            return _db.ViewRequisitantes
            .OrderBy(o => o.Requisitante)
            .Select(i => new SelectListItem()
                {
                Text = i.Requisitante,
                Value = i.RequisitanteId.ToString()
                }); ; ;
            }

        public new void Update(ViewRequisitantes viewRequisitantes)
            {
            var objFromDb = _db.ViewRequisitantes.FirstOrDefault(s => s.RequisitanteId == viewRequisitantes.RequisitanteId);

            _db.Update(viewRequisitantes);
            _db.SaveChanges();

            }


        }
    }


