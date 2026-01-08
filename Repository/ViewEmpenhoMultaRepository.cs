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
    public class ViewEmpenhoMultaRepository : Repository<ViewEmpenhoMulta>, IViewEmpenhoMultaRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewEmpenhoMultaRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewEmpenhoMultaListForDropDown()
            {
            return _db.ViewEmpenhoMulta
            .OrderBy(o => o.NotaEmpenho)
            .Select(i => new SelectListItem()
                {
                Text = i.NotaEmpenho,
                Value = i.EmpenhoMultaId.ToString()
                });
            }

        public new void Update(ViewEmpenhoMulta viewEmpenhoMulta)
            {
            var objFromDb = _db.ViewEmpenhoMulta.FirstOrDefault(s => s.EmpenhoMultaId == viewEmpenhoMulta.EmpenhoMultaId);

            _db.Update(viewEmpenhoMulta);
            _db.SaveChanges();

            }
        }
    }


