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
    public class ViewSetoresRepository : Repository<ViewSetores>, IViewSetoresRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewSetoresRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewSetoresListForDropDown()
            {
            return _db.ViewSetores
            .OrderBy(o => o.Nome)
            .Select(i => new SelectListItem()
                {
                Text = i.Nome.ToString(),
                Value = i.SetorSolicitanteId.ToString()
                }); ; ;
            }

        public new void Update(ViewSetores viewSetores)
            {
            var objFromDb = _db.ViewSetores.FirstOrDefault(s => s.SetorSolicitanteId == viewSetores.SetorSolicitanteId);

            _db.Update(viewSetores);
            _db.SaveChanges();

            }


        }
    }


