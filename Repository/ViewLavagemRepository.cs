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
    public class ViewLavagemRepository : Repository<ViewLavagem>, IViewLavagemRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewLavagemRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewLavagemListForDropDown()
            {
            return _db.ViewLavagem
            .OrderBy(o => o.Data)
            .Select(i => new SelectListItem()
                {
                Text = i.Data.ToString(),
                Value = i.Lavadores.ToString()
                }); ; ;
            }

        public new void Update(ViewLavagem viewLavagem)
            {
            var objFromDb = _db.ViewLavagem.FirstOrDefault(s => s.LavagemId == viewLavagem.LavagemId);

            _db.Update(viewLavagem);
            _db.SaveChanges();

            }


        }
    }


